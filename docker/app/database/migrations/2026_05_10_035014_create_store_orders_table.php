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
        Schema::create('store_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->string('customer_name');
            $table->string('unit'); // 'VAPE STORE' or 'COFFEE SHOP'
            $table->enum('payment_method', ['cash', 'qris']);
            $table->decimal('total', 12, 2);
            $table->enum('status', ['MENUNGGU PEMBAYARAN', 'BERHASIL'])->default('MENUNGGU PEMBAYARAN');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_orders');
    }
};
