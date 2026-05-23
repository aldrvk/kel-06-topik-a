<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite doesn't support changing enums easily, but we'll try for generic SQL or handle via DB raw if needed.
        // For MariaDB/MySQL/PostgreSQL:
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE doorsmeer_bookings MODIFY COLUMN status ENUM('pending', 'verified', 'in_queue', 'washing', 'done', 'cancelled') DEFAULT 'pending'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE doorsmeer_bookings MODIFY COLUMN status ENUM('pending', 'verified', 'in_queue', 'washing', 'done') DEFAULT 'pending'");
        }
    }
};
