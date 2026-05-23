<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\StoreOrder;
use App\Models\StoreOrderItem;

class StoreSeeder extends Seeder
{
    public function run()
    {
        // Jangan hapus produk di sini agar tidak menimpa ProductSeeder
        // Product::truncate(); 

        StoreOrderItem::query()->delete();
        StoreOrder::query()->delete();
    }
}
