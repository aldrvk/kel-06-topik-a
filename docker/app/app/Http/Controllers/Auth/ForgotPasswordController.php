<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Otp;
use App\Models\User;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    public function index()
    {
        return Inertia::render('auth/ForgotPassword');
    }

    public function sendOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required|email',
        ], [
            'identifier.required' => 'Email harus diisi.',
            'identifier.email'    => 'Format email tidak valid.',
        ]);

        $identifier = $request->identifier;
        
        $user = User::where('email', $identifier)->first();

        if (!$user) {
            return response()->json(
                ['message' => 'Akun dengan email tersebut tidak ditemukan.'],
                422
            );
        }

        $identifierToUse = $identifier;

        // Generate 6 digit OTP
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        \Log::info("==== OTP REQUEST START ====");
        \Log::info("Identifier: {$identifier}");
        \Log::info("OTP Code: {$otpCode}");

        try {
            // Save OTP
            $otpRecord = Otp::updateOrCreate(
                ['identifier' => $identifierToUse],
                [
                    'otp' => $otpCode,
                    'expires_at' => now()->addMinutes(10)
                ]
            );
            
            \Log::info("✓ OTP SAVED - ID: {$otpRecord->id}");
            
            // Immediate verification
            $verify = Otp::where('identifier', $identifierToUse)->where('otp', $otpCode)->first();
            if ($verify) {
                \Log::info("✓ VERIFICATION OK - Data found immediately after save");
            } else {
                \Log::warning("⚠ VERIFICATION FAILED - Data not found after save!");
            }
        } catch (\Exception $e) {
            \Log::error("✗ ERROR SAVING OTP: " . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Error saving OTP to database'], 500);
        }

        try {
            // Kirim email secara asynchronous via queue
            \Log::info("📧 Queuing email to {$identifier}...");
            Mail::to($identifier)->queue(new OtpMail($otpCode));
            \Log::info("✓ EMAIL QUEUED FOR SENDING");
        } catch (\Exception $e) {
            \Log::error("✗ EMAIL QUEUE ERROR: " . $e->getMessage());
            \Illuminate\Support\Facades\Log::info("OTP untuk {$identifier}: {$otpCode}");
        }
        // Return JSON response immediately
        \Log::info("→ SENDING SUCCESS RESPONSE (EMAIL QUEUED IN BACKGROUND)");
        \Log::info("==== OTP REQUEST END (SUCCESS) ====\n");
        return response()->json(['success' => true, 'message' => 'Kode OTP telah berhasil dikirim']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'identifier' => 'required|email',
            'otp'        => 'required|string|size:6',
            'password'   => [
                'required',
                'confirmed',
                Password::min(8)->letters()->mixedCase()->numbers()->symbols(),
            ],
        ], [
            'identifier.required' => 'Email harus diisi.',
            'identifier.email'    => 'Format email tidak valid.',
            'otp.required' => 'Kode OTP harus diisi.',
            'otp.size'     => 'Kode OTP harus 6 digit.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
        ]);

        $identifier = $request->identifier;
        $identifierToUse = $identifier;

        $otpRecord = Otp::where('identifier', $identifierToUse)
                        ->where('otp', $request->otp)
                        ->first();
        
        if (!$otpRecord) {
            return back()->withErrors(['otp' => 'Kode OTP tidak valid atau salah.']);
        }

        if ($otpRecord->expires_at < now()) {
            return back()->withErrors(['otp' => 'Kode OTP sudah kedaluwarsa. Silakan minta ulang.']);
        }

        $user = User::where('email', $identifier)->first();

        if (!$user) {
            return back()->withErrors(['identifier' => 'Pengguna tidak ditemukan.']);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        $otpRecord->delete();

        return redirect('/login')->with('success', 'Kata sandi berhasil direset! Silakan masuk dengan kata sandi baru Anda.');
    }
}
