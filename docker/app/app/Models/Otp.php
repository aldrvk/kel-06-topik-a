<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    /** @use HasFactory<\Database\Factories\OtpFactory> */
    use HasFactory;

    protected $table = 'otps';

    protected $fillable = [
        'identifier',
        'otp',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Cek apakah OTP masih berlaku (tidak expired)
     */
    public function isValid(): bool
    {
        return $this->expires_at && $this->expires_at->isFuture();
    }
}
