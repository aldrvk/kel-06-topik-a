<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function updateOperational(Request $request)
    {
        $validated = $request->validate([
            'operational_settings' => 'required|array',
        ]);

        Setting::set('operational_settings', $validated['operational_settings']);

        return redirect()->back()->with('success', 'Pengaturan operasional berhasil disimpan.');
    }

    public function updatePayment(Request $request)
    {
        $validated = $request->validate([
            'payment_settings' => 'required|array',
        ]);

        Setting::set('payment_settings', $validated['payment_settings']);

        return redirect()->back()->with('success', 'Pengaturan pembayaran berhasil disimpan.');
    }
}
