<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DoorsmeerBooking;
use App\Models\BengkelBooking;
use App\Models\RentalPsBooking;
use App\Models\StoreOrder;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function dashboard()
    {
        $todayStart = Carbon::now()->startOfDay();
        $todayEnd = Carbon::now()->endOfDay();

        // 1. Fetch Doorsmeer
        $doorsmeer = DoorsmeerBooking::with('user')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->get();
            
        // 2. Fetch Bengkel
        $bengkel = BengkelBooking::with('user')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->get();
            
        // 3. Fetch Rental PS
        $rental = RentalPsBooking::with('user')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->get();
            
        // 4. Fetch Store Orders
        $storeOrders = StoreOrder::with('items')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->get();

        // Calculate Stats
        $allBookings = collect()
            ->concat($doorsmeer)
            ->concat($bengkel)
            ->concat($rental)
            ->concat($storeOrders);

        $totalBooking = $allBookings->count();
        
        $pendingCount = collect()
            ->concat($doorsmeer->whereNotIn('status', ['done', 'cancelled']))
            ->concat($bengkel->whereNotIn('status', ['done', 'cancelled']))
            ->concat($rental->whereNotIn('status', ['done', 'cancelled']))
            ->concat($storeOrders->whereNotIn('status', ['BERHASIL', 'BATAL']))
            ->count();
            
        $completedCount = collect()
            ->concat($doorsmeer->where('status', 'done'))
            ->concat($bengkel->where('status', 'done'))
            ->concat($rental->where('status', 'done'))
            ->concat($storeOrders->where('status', 'BERHASIL'))
            ->count();

        $revenueToday = collect()
            ->concat($doorsmeer->where('status', 'done')->map(fn($i) => $i->service_price))
            ->concat($bengkel->where('status', 'done')->map(fn($i) => $i->service_price))
            ->concat($rental->where('status', 'done')->map(fn($i) => $i->service_price))
            ->concat($storeOrders->where('status', 'BERHASIL')->map(fn($i) => $i->total))
            ->sum();

        // 5. Overall Totals (All Time)
        $totalAllTime = DoorsmeerBooking::count() + BengkelBooking::count() + RentalPsBooking::count() + StoreOrder::count();
        $revenueAllTime = DoorsmeerBooking::where('status', 'done')->sum('service_price') + 
                         BengkelBooking::where('status', 'done')->sum('service_price') + 
                         RentalPsBooking::where('status', 'done')->sum('service_price') + 
                         StoreOrder::where('status', 'BERHASIL')->sum('total');

        // Recent Bookings (All time)
        $recentDoorsmeer = DoorsmeerBooking::with('user')->latest()->limit(10)->get();
        $recentBengkel = BengkelBooking::with('user')->latest()->limit(10)->get();
        $recentRental = RentalPsBooking::with('user')->latest()->limit(10)->get();
        $recentStore = StoreOrder::with('items')->latest()->limit(10)->get();

        $recent = collect()
            ->concat($recentDoorsmeer->map(function($item) {
                return [
                    'id' => $item->id,
                    'customer' => $item->booking_type === 'walkin' ? $item->walkin_name : ($item->user ? $item->user->name : 'Unknown'),
                    'service' => $item->service_name,
                    'unit' => 'DOORSMEER',
                    'time' => $item->created_at->format('H:i'),
                    'status' => $item->status === 'done' ? 'SELESAI' : ($item->status === 'cancelled' ? 'BATAL' : 'PENDING'),
                    'created_at' => $item->created_at,
                ];
            }))
            ->concat($recentBengkel->map(function($item) {
                return [
                    'id' => $item->id,
                    'customer' => $item->booking_type === 'walkin' ? $item->walkin_name : ($item->user ? $item->user->name : 'Unknown'),
                    'service' => $item->service_name,
                    'unit' => 'BENGKEL',
                    'time' => $item->created_at->format('H:i'),
                    'status' => $item->status === 'done' ? 'SELESAI' : ($item->status === 'cancelled' ? 'BATAL' : 'PENDING'),
                    'created_at' => $item->created_at,
                ];
            }))
            ->concat($recentRental->map(function($item) {
                return [
                    'id' => $item->id,
                    'customer' => $item->booking_type === 'walkin' ? $item->walkin_name : ($item->user ? $item->user->name : 'Unknown'),
                    'service' => $item->service_name,
                    'unit' => 'RENTAL PS',
                    'time' => $item->created_at->format('H:i'),
                    'status' => $item->status === 'done' ? 'SELESAI' : ($item->status === 'cancelled' ? 'BATAL' : 'PENDING'),
                    'created_at' => $item->created_at,
                ];
            }))
            ->concat($recentStore->map(function($item) {
                $serviceName = 'Pesanan';
                if ($item->items && $item->items->count() > 0) {
                    $firstItem = $item->items->first();
                    $serviceName = $firstItem->product_name . ($item->items->count() > 1 ? ' + lainnya' : ' x ' . $firstItem->quantity);
                }
                return [
                    'id' => $item->id,
                    'customer' => $item->customer_name ?? 'Unknown',
                    'service' => $serviceName,
                    'unit' => $item->unit ?? 'COFFEE SHOP',
                    'time' => $item->created_at->format('H:i'),
                    'status' => $item->progress_status === 'cancelled' ? 'BATAL' : ($item->progress_status === 'completed' ? 'SELESAI' : (in_array($item->progress_status, ['pending', 'processing', 'ready']) ? 'IN PROGRESS' : 'PENDING')),
                    'created_at' => $item->created_at,
                ];
            }))
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalToday' => $totalBooking,
                'pendingToday' => $pendingCount,
                'completedToday' => $completedCount,
                'revenueToday' => $revenueToday,
                'totalAllTime' => $totalAllTime,
                'revenueAllTime' => $revenueAllTime,
            ],
            'recentBookings' => $recent
        ]);
    }
}
