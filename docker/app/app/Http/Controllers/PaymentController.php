<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\StoreOrder;
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        $settings = Setting::get('payment_settings', []);
        
        Config::$serverKey = $settings['midtrans_server_key'] ?? '';
        Config::$isProduction = !($settings['midtrans_is_sandbox'] ?? true);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Generate Midtrans Snap Token for an order
     */
    public function createSnapToken(StoreOrder $order)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $order->order_code,
                'gross_amount' => (int) $order->total,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name,
            ],
            // Enable only QRIS if desired, or all methods
            // 'enabled_payments' => ['qris'],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            return response()->json(['snap_token' => $snapToken]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle Midtrans Webhook Notification
     */
    public function handleNotification(Request $request)
    {
        try {
            $notif = new Notification();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid notification'], 400);
        }

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $orderId = $notif->order_id;
        $fraud = $notif->fraud_status;

        $order = StoreOrder::where('order_code', $orderId)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $order->update(['status' => 'PENDING', 'progress_status' => 'menunggu_pembayaran']);
                } else {
                    $order->update(['status' => 'BERHASIL', 'progress_status' => 'pending']);
                }
            }
        } else if ($transaction == 'settlement') {
            $order->update(['status' => 'BERHASIL', 'progress_status' => 'pending']);
        } else if ($transaction == 'pending') {
            $order->update(['status' => 'MENUNGGU PEMBAYARAN', 'progress_status' => 'menunggu_pembayaran']);
        } else if ($transaction == 'deny') {
            $order->update(['status' => 'BATAL', 'progress_status' => 'batal']);
        } else if ($transaction == 'expire') {
            $order->update(['status' => 'BATAL', 'progress_status' => 'batal']);
        } else if ($transaction == 'cancel') {
            $order->update(['status' => 'BATAL', 'progress_status' => 'batal']);
        }

        return response()->json(['message' => 'Notification processed']);
    }

    /**
     * Update order status to successful locally (fallback for sandbox/localhost testing)
     */
    public function localSuccess(string $orderCode)
    {
        $order = StoreOrder::where('order_code', $orderCode)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $order->update([
            'status' => 'BERHASIL',
            'progress_status' => 'pending'
        ]);

        return response()->json(['message' => 'Status updated locally']);
    }
}
