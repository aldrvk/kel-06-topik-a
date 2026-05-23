<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Str;

class TestOtpFlow extends Command
{
    protected $signature = 'test:otp {email?}';
    protected $description = 'Test OTP flow with detailed debugging';

    public function handle()
    {
        $email = $this->argument('email') ?? 'admiralpurba2109@gmail.com';
        
        $this->info("=== OTP FLOW TEST ===\n");
        $this->line("Email: $email");
        
        // Check user
        $this->line("\n1. Checking if user exists...");
        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User not found!");
            return;
        }
        $this->info("✓ User found: {$user->name}");
        
        // Generate OTP
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->line("\n2. Generated OTP: $otpCode");
        
        // Count before
        $countBefore = Otp::count();
        $this->line("\n3. Total OTP records before save: $countBefore");
        
        // Save OTP
        $this->line("\n4. Saving OTP...");
        try {
            $otpRecord = Otp::updateOrCreate(
                ['identifier' => $email],
                [
                    'otp' => $otpCode,
                    'expires_at' => now()->addMinutes(10)
                ]
            );
            $this->info("✓ OTP saved with ID: {$otpRecord->id}");
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
            return;
        }
        
        // Count after
        $countAfter = Otp::count();
        $this->line("Total OTP records after save: $countAfter");
        
        // Verify
        $this->line("\n5. Verifying OTP in database...");
        $verify = Otp::where('identifier', $email)->where('otp', $otpCode)->first();
        if ($verify) {
            $this->info("✓ OTP found in database");
            $this->line("  ID: {$verify->id}");
            $this->line("  Identifier: {$verify->identifier}");
            $this->line("  OTP: {$verify->otp}");
            $this->line("  Expires: {$verify->expires_at}");
        } else {
            $this->error("✗ OTP NOT found in database!");
            
            $this->line("\n  Checking all OTP records:");
            Otp::all()->each(function ($otp) use ($email) {
                $match = $otp->identifier === $email ? " ← MATCHES" : "";
                $this->line("    ID: {$otp->id}, Email: {$otp->identifier}, OTP: {$otp->otp}$match");
            });
        }
        
        $this->info("\n=== TEST COMPLETED ===");
    }
}
