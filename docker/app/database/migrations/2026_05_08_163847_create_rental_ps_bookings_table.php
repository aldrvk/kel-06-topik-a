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
        Schema::create('rental_ps_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique();
            $table->enum('booking_type', ['online', 'walk_in'])->default('online');
            $table->string('walkin_name')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // Service info
            $table->string('service_id');
            $table->string('service_name');
            $table->string('service_subtitle');
            $table->unsignedInteger('service_price');
            $table->string('service_duration');

            $table->string('status')->default('pending'); 

            // Assigned TV/Console
            $table->string('stall')->nullable();

            $table->unsignedInteger('queue_position')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamp('verified_at')->nullable();
            $table->timestamp('bay_assigned_at')->nullable();
            $table->timestamp('done_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_ps_bookings');
    }
};
