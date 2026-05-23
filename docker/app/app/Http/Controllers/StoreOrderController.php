<?php

namespace App\Http\Controllers;

use App\Models\StoreOrder;
use App\Models\StoreOrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StoreOrderController extends Controller
{
    /**
     * Create a new store order from customer checkout.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit'           => 'required|in:VAPE STORE,COFFEE SHOP',
            'customer_name'  => 'required|string|max:255',
            'payment_method' => 'required|in:cash,qris',
            'items'          => 'required|array|min:1',
            'items.*.name'   => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price'  => 'required|numeric|min:0',
        ]);

        $prefix = $validated['unit'] === 'VAPE STORE' ? 'VNX' : 'VNC';
        $orderCode = $prefix . '-' . strtoupper(Str::random(6));

        $total = collect($validated['items'])->sum(fn ($item) => $item['price'] * $item['quantity']);

        $order = StoreOrder::create([
            'user_id'        => auth()->id(),
            'order_code'     => $orderCode,
            'customer_name'  => $validated['customer_name'],
            'unit'           => $validated['unit'],
            'payment_method' => $validated['payment_method'],
            'total'          => $total,
            'status'         => 'MENUNGGU PEMBAYARAN',
            'progress_status'=> 'menunggu_pembayaran',
        ]);

        foreach ($validated['items'] as $item) {
            StoreOrderItem::create([
                'store_order_id' => $order->id,
                'name'           => $item['name'],
                'quantity'       => $item['quantity'],
                'price'          => $item['price'],
            ]);
        }

        return response()->json([
            'order_code' => $orderCode,
            'order_id'   => $order->id,
            'unit'       => $order->unit,
        ]);
    }

    public function tracking(string $code)
    {
        $order = StoreOrder::with('items')
            ->where('order_code', $code)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $view = $order->unit === 'COFFEE SHOP' ? 'CoffeeShop/tracking' : 'VapeStore/tracking';

        return \Inertia\Inertia::render($view, [
            'order' => $order
        ]);
    }

    public function coffeeMyOrders()
    {
        $orders = StoreOrder::with('items')
            ->where('user_id', auth()->id())
            ->where('unit', 'COFFEE SHOP')
            ->orderBy('created_at', 'desc')
            ->get();

        return \Inertia\Inertia::render('CoffeeShop/my_orders', [
            'orders' => $orders
        ]);
    }

    public function vapeMyOrders()
    {
        $orders = StoreOrder::with('items')
            ->where('user_id', auth()->id())
            ->where('unit', 'VAPE STORE')
            ->orderBy('created_at', 'desc')
            ->get();

        return \Inertia\Inertia::render('VapeStore/my_orders', [
            'orders' => $orders
        ]);
    }

    public function statusPoll(string $code)
    {
        $order = StoreOrder::where('order_code', $code)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return response()->json([
            'progress_status' => $order->progress_status,
            'admin_notes'     => $order->admin_notes,
        ]);
    }
}
