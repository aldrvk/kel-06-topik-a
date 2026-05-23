<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\ForgotPasswordController;

class TestOtpRequest extends Command
{
    protected $signature = 'test:otp-request {email?}';
    protected $description = 'Test OTP request flow';

    public function handle()
    {
        $email = $this->argument('email') ?? 'admiralpurba2109@gmail.com';
        
        $this->line("\n=== SIMULATING HTTP REQUEST ===\n");
        $this->line("Email: $email");
        
        // Create request
        $request = Request::create('/forgot-password/otp', 'POST', [
            'identifier' => $email,
        ]);
        
        // Create controller
        $controller = app(ForgotPasswordController::class);
        
        $this->line("\n→ Calling sendOtp()...\n");
        
        try {
            $response = $controller->sendOtp($request);
            
            $this->info("Response Status: " . $response->status());
            $this->line("Response Content:\n" . $response->getContent());
            
            // Check if OTP saved
            $this->line("\n→ Checking if OTP was saved...");
            $otpRecord = \App\Models\Otp::where('identifier', $email)->latest()->first();
            if ($otpRecord) {
                $this->info("✓ OTP found in database!");
                $this->line("  ID: {$otpRecord->id}");
                $this->line("  OTP: {$otpRecord->otp}");
            } else {
                $this->error("✗ OTP NOT found in database!");
            }
        } catch (\Exception $e) {
            $this->error("Exception: " . $e->getMessage());
            $this->line($e->getTraceAsString());
        }
        
        $this->line("\n=== END ===\n");
    }
}
