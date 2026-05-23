<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('doorsmeer_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique(); // e.g. DS-XXXXX
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Service info
            $table->string('service_id');
            $table->string('service_name');
            $table->string('service_subtitle');
            $table->unsignedInteger('service_price');
            $table->string('service_duration');

            // Vehicle info
            $table->string('vehicle_class');
            $table->string('license_plate');

            // Schedule
            $table->date('appointment_date');
            $table->string('time_slot');

            // Status flow:
            // pending  → menunggu verifikasi admin
            // verified → admin setujui, user dapat notif
            // rejected → admin tolak
            // in_queue → masuk antrian stall
            // washing  → sedang dicuci
            // rinsing  → dibilas / finishing
            // done     → selesai
            $table->enum('status', [
                'pending', 'verified', 'rejected',
                'in_queue', 'washing', 'rinsing', 'done',
            ])->default('pending');

            // Assigned stall (diisi saat admin verify)
            $table->string('stall')->nullable();

            // Admin notes (alasan tolak, dll)
            $table->text('admin_notes')->nullable();

            $table->timestamp('verified_at')->nullable();
            $table->timestamp('done_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doorsmeer_bookings');
    }
};
