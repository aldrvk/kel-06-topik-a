<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'email'        => [
                'required', 'string', 'email', 'max:255', 'unique:users',
                'regex:/@gmail\.com$/',
            ],
            'password'     => [
                'required', 'confirmed',
                Password::min(8)->letters()->mixedCase()->numbers()->symbols(),
            ],
        ], [
            'email.regex'        => 'Email harus menggunakan alamat @gmail.com.',
            'password.min'       => 'Kata sandi minimal 8 karakter.',
        ]);

        $user = User::create([
            'name'              => $request->name,
            'email'             => $request->email,
            'password'          => Hash::make($request->password),
            'email_verified_at' => now(),
        ]);

        Auth::login($user, true);

        return redirect('/')->with('success', 'Pendaftaran berhasil! Selamat datang di Venus.');
    }
}
