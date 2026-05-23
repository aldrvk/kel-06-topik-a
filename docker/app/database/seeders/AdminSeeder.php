<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buat admin default
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin Venus Hub',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Optional: Buat beberapa admin tambahan
        User::updateOrCreate(
            ['email' => 'owner@gmail.com'],
            [
                'name' => 'Owner Venus Hub',
                'password' => Hash::make('owner123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
    }
}
