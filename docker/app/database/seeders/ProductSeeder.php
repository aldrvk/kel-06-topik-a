<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Product::truncate();

        $vapeProducts = [
            [
                'unit' => 'VAPE STORE',
                'name' => 'XMax V3 Pro',
                'category' => 'Device',
                'price' => 260000,
                'description' => 'Vaporizer konveksi ini memiliki waktu pemanasan yang cepat dan layar OLED yang jernih yang menampilkan suhu dan pemantauan baterai.',
                'image' => '/images/Vape Store/xmax v3 pro.jpg',
                'tag' => 'KUALITAS TINGGI',
                'tag_icon' => 'StarIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'VAPE STORE',
                'name' => 'Arctic Menthol',
                'category' => 'Liquid',
                'price' => 100000,
                'description' => 'Cairan vape yang menyegarkan, dirancang untuk menghasilkan uap yang halus dan konsisten, menghadirkan sensasi menthol yang segar dengan intensitas rasa yang seimbang.',
                'image' => '/images/Vape Store/arctic menthol.jpg',
                'tag' => 'RASA MENYEGARKAN',
                'tag_icon' => 'DropIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'VAPE STORE',
                'name' => 'Blueberry Ice',
                'category' => 'Liquid',
                'price' => 100000,
                'description' => 'Perpaduan rasa yang lezat, menggabungkan aroma blueberry manis dengan sensasi dingin di akhir, dirancang untuk memberikan sensasi lembut di tenggorokan dengan uap yang memuaskan.',
                'image' => '/images/Vape Store/blueberry ice.jpg',
                'tag' => 'RASA MANIS',
                'tag_icon' => 'StarIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'VAPE STORE',
                'name' => 'Nitecore Battery',
                'category' => 'Accessories',
                'price' => 136000,
                'description' => 'Baterai andal berperforma tinggi yang dirancang untuk memberikan daya stabil dan penggunaan tahan lama. Dibuat dengan mengutamakan keamanan dan efisiensi.',
                'image' => '/images/Vape Store/nitecore battery.png',
                'tag' => 'KAPASITAS TINGGI',
                'tag_icon' => 'BatteryIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'VAPE STORE',
                'name' => 'Apex Titanium',
                'category' => 'Device',
                'price' => 400000,
                'description' => 'Sasis titanium kelas kedirgantaraan dengan Omni-Chip 4.0 revolusioner untuk presisi yang tak tertandingi.',
                'image' => '/images/Vape Store/apex titanium.jpg',
                'tag' => 'KONSTRUKSI PREMIUM',
                'tag_icon' => 'ShieldIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'VAPE STORE',
                'name' => 'Nano Pod S II',
                'category' => 'Device',
                'price' => 350000,
                'description' => 'Puncak dari teknologi penguapan kompak, menawarkan daya tahan baterai 12 jam dalam bentuk yang seukuran saku dengan sistem pengisian atas yang anti bocor.',
                'image' => '/images/Vape Store/nano pod s ii.jpg',
                'tag' => 'PORTABLE POWER',
                'tag_icon' => 'BatteryIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ]
        ];

        $coffeeProducts = [
            [
                'unit' => 'COFFEE SHOP',
                'name' => 'Caramel Macchiato',
                'category' => 'Kopi',
                'price' => 45000,
                'description' => 'Perpaduan sempurna antara espresso kuat, susu murni yang di-steam, dan sirup karamel manis yang lembut.',
                'image' => 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=600&auto=format&fit=crop',
                'tag' => 'BEST SELLER',
                'tag_icon' => 'StarIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'COFFEE SHOP',
                'name' => 'V60 Pour Over',
                'category' => 'Kopi',
                'price' => 35000,
                'description' => 'Kopi hitam manual brew menggunakan biji kopi pilihan dengan metode V60 untuk mengeluarkan aroma dan rasa yang bersih dan tajam.',
                'image' => 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop',
                'tag' => 'PREMIUM BEANS',
                'tag_icon' => 'BeanIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'COFFEE SHOP',
                'name' => 'Matcha Latte',
                'category' => 'Non-Kopi',
                'price' => 400000,
                'description' => 'Bubuk matcha premium dari Jepang dipadukan dengan susu segar, menghasilkan tekstur creamy dan rasa manis yang seimbang.',
                'image' => 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=600&auto=format&fit=crop',
                'tag' => 'FAVORITE',
                'tag_icon' => 'CupIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'COFFEE SHOP',
                'name' => 'Croissant Butter',
                'category' => 'Makanan',
                'price' => 25000,
                'description' => 'Croissant klasik dengan tekstur renyah di luar dan lembut di dalam, dibuat dengan mentega premium.',
                'image' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop',
                'tag' => 'FRESH BAKED',
                'tag_icon' => 'FoodIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'COFFEE SHOP',
                'name' => 'Beef Sandwich',
                'category' => 'Makanan',
                'price' => 55000,
                'description' => 'Sandwich daging sapi pilihan dengan sayuran segar dan saus spesial, disajikan dengan roti yang dipanggang sempurna.',
                'image' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop',
                'tag' => 'HEARTY MEAL',
                'tag_icon' => 'StarIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ],
            [
                'unit' => 'COFFEE SHOP',
                'name' => 'French Fries',
                'category' => 'Makanan',
                'price' => 30000,
                'description' => 'Kentang goreng renyah yang dibumbui dengan garam dan herbs pilihan, cocok untuk teman nongkrong.',
                'image' => 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=600&auto=format&fit=crop',
                'tag' => 'SNACK',
                'tag_icon' => 'FoodIcon',
                'stock' => 'Tersedia',
                'sold' => 0,
            ]
        ];

        foreach (array_merge($vapeProducts, $coffeeProducts) as $product) {
            \App\Models\Product::create($product);
        }
    }
}
