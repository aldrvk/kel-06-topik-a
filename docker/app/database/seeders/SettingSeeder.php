<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultSchedule = [
            'Senin' => ['open' => '08:00', 'close' => '23:00', 'is_open' => true],
            'Selasa' => ['open' => '08:00', 'close' => '23:00', 'is_open' => true],
            'Rabu' => ['open' => '08:00', 'close' => '23:00', 'is_open' => true],
            'Kamis' => ['open' => '08:00', 'close' => '23:00', 'is_open' => true],
            'Jumat' => ['open' => '08:00', 'close' => '23:00', 'is_open' => true],
            'Sabtu' => ['open' => '08:00', 'close' => '23:00', 'is_open' => true],
            'Minggu' => ['open' => '08:00', 'close' => '23:00', 'is_open' => true],
        ];

        $automotiveSchedule = [
            'Senin' => ['open' => '08:00', 'close' => '17:00', 'is_open' => true],
            'Selasa' => ['open' => '08:00', 'close' => '17:00', 'is_open' => true],
            'Rabu' => ['open' => '08:00', 'close' => '17:00', 'is_open' => true],
            'Kamis' => ['open' => '08:00', 'close' => '17:00', 'is_open' => true],
            'Jumat' => ['open' => '08:00', 'close' => '17:00', 'is_open' => true],
            'Sabtu' => ['open' => '08:00', 'close' => '17:00', 'is_open' => true],
            'Minggu' => ['open' => '08:00', 'close' => '17:00', 'is_open' => true],
        ];

        $units = [
            'Doorsmeer' => [
                'is_active' => true,
                'schedule' => $automotiveSchedule
            ],
            'Bengkel' => [
                'is_active' => true,
                'schedule' => $automotiveSchedule
            ],
            'Rental PS' => [
                'is_active' => true,
                'schedule' => $defaultSchedule
            ],
            'Coffee Shop' => [
                'is_active' => true,
                'schedule' => $defaultSchedule
            ],
            'Vape Store' => [
                'is_active' => true,
                'schedule' => $defaultSchedule
            ],
        ];

        Setting::set('operational_settings', $units);
    }
}
