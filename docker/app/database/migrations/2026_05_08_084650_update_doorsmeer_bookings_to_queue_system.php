<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Migrate doorsmeer_bookings dari sistem appointment ke realtime queue.
     *
     * Perubahan:
     *  - Hapus kolom appointment_date & time_slot (tidak ada lagi janji temu)
     *  - Hapus status 'rinsing' & 'rejected' dari enum
     *  - Tambah kolom queue_position & bay_assigned_at
     */
    public function up(): void
    {
        // 1. Migrasi data: rinsing → done, rejected → done
        DB::table('doorsmeer_bookings')
            ->where('status', 'rinsing')
            ->update(['status' => 'done', 'done_at' => now()]);

        DB::table('doorsmeer_bookings')
            ->where('status', 'rejected')
            ->update(['status' => 'done', 'done_at' => now()]);

        // 2. Ubah enum status (hapus rinsing & rejected)
        DB::statement("ALTER TABLE doorsmeer_bookings MODIFY COLUMN status ENUM('pending', 'verified', 'in_queue', 'washing', 'done') DEFAULT 'pending'");

        // 3. Hapus kolom appointment & tambah kolom queue
        Schema::table('doorsmeer_bookings', function (Blueprint $table) {
            $table->dropColumn(['appointment_date', 'time_slot']);
            $table->unsignedInteger('queue_position')->nullable()->after('stall');
            $table->timestamp('bay_assigned_at')->nullable()->after('verified_at');
        });
    }

    /**
     * Rollback: kembalikan ke sistem appointment.
     */
    public function down(): void
    {
        Schema::table('doorsmeer_bookings', function (Blueprint $table) {
            $table->date('appointment_date')->nullable()->after('license_plate');
            $table->string('time_slot')->nullable()->after('appointment_date');
            $table->dropColumn(['queue_position', 'bay_assigned_at']);
        });

        DB::statement("ALTER TABLE doorsmeer_bookings MODIFY COLUMN status ENUM('pending', 'verified', 'rejected', 'in_queue', 'washing', 'rinsing', 'done') DEFAULT 'pending'");
    }
};
