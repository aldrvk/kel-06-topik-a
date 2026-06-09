<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            // Redirect ke admin dashboard jika user adalah admin
            if ($user->role === 'admin') {
                return redirect('/admin/dashboard')->with('success', 'Masuk berhasil! Selamat datang admin.');
            }

            // Validasi email @gmail.com untuk user biasa
            if (!str_ends_with($user->email, '@gmail.com')) {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Email harus menggunakan alamat @gmail.com.',
                ])->onlyInput('email');
            }

            return redirect()->intended('/')->with('success', 'Masuk berhasil! Selamat datang kembali.');
        }

        return back()->withErrors([
            'email' => 'Email atau kata sandi yang Anda masukkan salah.',
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
