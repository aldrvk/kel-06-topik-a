<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doorsmeer_bookings', function (Blueprint $table) {
            // Walk-in tidak punya akun user
            $table->foreignId('user_id')->nullable()->change();

            // Tipe booking
            $table->enum('booking_type', ['online', 'walk_in'])->default('online')->after('booking_code');

            // Nama pelanggan walk-in (tidak punya akun)
            $table->string('walkin_name')->nullable()->after('booking_type');
        });
    }

    public function down(): void
    {
        Schema::table('doorsmeer_bookings', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->dropColumn(['booking_type', 'walkin_name']);
        });
    }
};
