<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\RentalPsBooking;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Standarisasi durasi Rental PS dari 'menit' ke 'Jam'
        RentalPsBooking::where('service_duration', '60 menit')->update(['service_duration' => '1 Jam']);
        RentalPsBooking::where('service_duration', '120 menit')->update(['service_duration' => '2 Jam']);
        RentalPsBooking::where('service_duration', '180 menit')->update(['service_duration' => '3 Jam']);
        
        // Jaga-jaga jika ada variasi lain
        RentalPsBooking::where('service_duration', 'like', '% menit')->get()->each(function($booking) {
            $mins = (int) filter_var($booking->service_duration, FILTER_SANITIZE_NUMBER_INT);
            if ($mins > 0) {
                $hours = $mins / 60;
                $newDuration = $hours == (int)$hours ? (int)$hours . ' Jam' : number_format($hours, 1) . ' Jam';
                $booking->update(['service_duration' => $newDuration]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert (opsional, biasanya tidak perlu dibalikkan ke format lama)
        RentalPsBooking::where('service_duration', '1 Jam')->update(['service_duration' => '60 menit']);
    }
};
