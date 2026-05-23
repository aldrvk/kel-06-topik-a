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
        Schema::create('bengkel_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique();
            $table->enum('booking_type', ['online', 'walk_in'])->default('online');
            $table->string('walkin_name')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // allow null for walk-ins if needed, or keep same

            // Service info
            $table->string('service_id');
            $table->string('service_name');
            $table->string('service_subtitle');
            $table->unsignedInteger('service_price');
            $table->string('service_duration');

            // Vehicle info
            $table->string('vehicle_class');
            $table->string('license_plate');

            $table->enum('status', [
                'pending', 'verified', 'in_queue', 'servicing', 'done', 'cancelled'
            ])->default('pending');

            // Let's use 'servicing' for bengkel
            // Actually, to make the code highly reusable, let's just use 'servicing' instead of 'washing'.

            // Assigned stall
            $table->string('stall')->nullable();

            $table->unsignedInteger('queue_position')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamp('verified_at')->nullable();
            $table->timestamp('bay_assigned_at')->nullable();
            $table->timestamp('done_at')->nullable();

            $table->timestamps();
        });
        
        // Let me adjust the enum status
        // DB changes cannot be altered if enum is restrictive. I will use string to be safe, or stick to the exact same enum logic.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bengkel_bookings');
    }
};
