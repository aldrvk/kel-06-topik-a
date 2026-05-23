<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DoorsmeerBooking;
use App\Models\BengkelBooking;
use App\Models\RentalPsBooking;
use App\Models\StoreOrder;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->query('period', 'Hari Ini');
        $data = $this->getReportData($period);

        return Inertia::render('Admin/Laporan', [
            'initialTransactions'  => $data['allTransactions'],
            'initialRevenueByUnit' => $data['revenueByUnit'],
            'initialPeriod'        => $period,
            'kpi'                  => $data['kpi'],
            'chartData'            => $data['chartData']
        ]);
    }

    public function exportPdf(Request $request)
    {
        $period = $request->query('period', 'Hari Ini');
        $data = $this->getReportData($period);
        $data['period'] = $period;
        $data['date_generated'] = now()->format('d F Y H:i');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('admin.reports.pdf', $data);
        return $pdf->download('Laporan_Venus_Space_' . str_replace(' ', '_', $period) . '.pdf');
    }

    private function getReportData($period)
    {
        $startDate = match ($period) {
            'Minggu Ini' => Carbon::now()->startOfWeek(),
            'Bulan Ini'  => Carbon::now()->startOfMonth(),
            default      => Carbon::now()->startOfDay(),
        };

        $endDate = Carbon::now()->endOfDay();

        // 1. Fetch Doorsmeer
        $doorsmeer = DoorsmeerBooking::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()->map(function($item) {
                return [
                    'id' => $item->booking_code,
                    'time' => $item->created_at->format('H:i'),
                    'customer' => $item->booking_type === 'walkin' ? $item->walkin_name : ($item->user ? $item->user->name : 'Unknown'),
                    'unit' => 'Doorsmeer',
                    'service' => $item->service_name,
                    'amount' => $item->service_price,
                    'status' => $item->status === 'done' ? 'Lunas' : ($item->status === 'cancelled' ? 'Batal' : 'Pending'),
                    'created_at' => $item->created_at,
                ];
            });

        // 2. Fetch Bengkel
        $bengkel = BengkelBooking::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()->map(function($item) {
                return [
                    'id' => $item->booking_code,
                    'time' => $item->created_at->format('H:i'),
                    'customer' => $item->booking_type === 'walkin' ? $item->walkin_name : ($item->user ? $item->user->name : 'Unknown'),
                    'unit' => 'Bengkel',
                    'service' => $item->service_name,
                    'amount' => $item->service_price,
                    'status' => $item->status === 'done' ? 'Lunas' : ($item->status === 'cancelled' ? 'Batal' : 'Pending'),
                    'created_at' => $item->created_at,
                ];
            });

        // 3. Fetch Rental PS
        $rental = RentalPsBooking::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()->map(function($item) {
                return [
                    'id' => $item->booking_code,
                    'time' => $item->created_at->format('H:i'),
                    'customer' => $item->booking_type === 'walkin' ? $item->walkin_name : ($item->user ? $item->user->name : 'Unknown'),
                    'unit' => 'Rental PS',
                    'service' => $item->service_name,
                    'amount' => $item->service_price,
                    'status' => $item->status === 'done' ? 'Lunas' : ($item->status === 'cancelled' ? 'Batal' : 'Pending'),
                    'created_at' => $item->created_at,
                ];
            });

        // 4. Fetch Store Orders (Coffee Shop & Vape Store)
        $storeOrders = StoreOrder::with('items')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()->map(function($item) {
                $serviceName = 'Pesanan';
                if ($item->items && $item->items->count() > 0) {
                    $firstItem = $item->items->first();
                    $serviceName = $firstItem->product_name . ($item->items->count() > 1 ? ' + lainnya' : ' x ' . $firstItem->quantity);
                }
                
                return [
                    'id' => $item->order_code,
                    'time' => $item->created_at->format('H:i'),
                    'customer' => $item->customer_name ?? 'Unknown',
                    'unit' => $item->unit === 'VAPE STORE' ? 'Vape Store' : 'Coffee Shop',
                    'service' => $serviceName,
                    'amount' => $item->total,
                    'status' => ($item->status === 'BERHASIL' || $item->progress_status === 'completed') ? 'Lunas' : ($item->status === 'BATAL' || $item->progress_status === 'cancelled' ? 'Batal' : 'Pending'),
                    'created_at' => $item->created_at,
                ];
            });

        $allTransactions = collect()
            ->concat($doorsmeer)
            ->concat($bengkel)
            ->concat($rental)
            ->concat($storeOrders)
            ->sortByDesc('created_at')
            ->values()
            ->map(function($item) {
                unset($item['created_at']);
                return $item;
            });

        // Aggregate Revenue by Unit
        $lunasTransactions = collect()
            ->concat($doorsmeer)
            ->concat($bengkel)
            ->concat($rental)
            ->concat($storeOrders)
            ->filter(fn($item) => $item['status'] === 'Lunas');

        $totalRevenue = $lunasTransactions->sum('amount');
        
        $revenueByUnit = [];
        $units = ['Doorsmeer', 'Bengkel', 'Coffee Shop', 'Rental PS', 'Vape Store'];
        $colors = [
            'Doorsmeer' => 'bg-primary',
            'Bengkel' => 'bg-orange-400',
            'Coffee Shop' => 'bg-amber-400',
            'Rental PS' => 'bg-purple-400',
            'Vape Store' => 'bg-indigo-400'
        ];

        foreach ($units as $u) {
            $unitTx = $lunasTransactions->where('unit', $u);
            $amount = $unitTx->sum('amount');
            
            $unitAllTx = collect()
                ->concat($doorsmeer)
                ->concat($bengkel)
                ->concat($rental)
                ->concat($storeOrders)
                ->where('unit', $u);
                
            $bookings = $unitAllTx->count();
            
            if ($bookings > 0 || in_array($u, ['Doorsmeer', 'Bengkel', 'Coffee Shop', 'Rental PS'])) {
                $revenueByUnit[] = [
                    'unit' => $u,
                    'amount' => $amount,
                    'bookings' => $bookings,
                    'pct' => $totalRevenue > 0 ? round(($amount / $totalRevenue) * 100) : 0,
                    'color' => $colors[$u] ?? 'bg-gray-400'
                ];
            }
        }
        
        $pendingTransactions = collect()
            ->concat($doorsmeer)
            ->concat($bengkel)
            ->concat($rental)
            ->concat($storeOrders)
            ->filter(fn($item) => $item['status'] === 'Pending');
            
        $kpi = [
            'totalRevenue' => $totalRevenue,
            'totalBookings' => collect()
                ->concat($doorsmeer)
                ->concat($bengkel)
                ->concat($rental)
                ->concat($storeOrders)
                ->count(),
            'pendingAmount' => $pendingTransactions->sum('amount'),
            'pendingCount' => $pendingTransactions->count(),
        ];

        $chartData = [];
        if ($period === 'Hari Ini') {
            for ($i = 8; $i <= 22; $i++) {
                $hour = str_pad($i, 2, '0', STR_PAD_LEFT);
                $count = collect()
                    ->concat($doorsmeer)->concat($bengkel)->concat($rental)->concat($storeOrders)
                    ->filter(function($item) use ($hour) {
                        return Carbon::parse($item['created_at'])->format('H') == $hour;
                    })->count();
                $chartData[] = ['label' => $hour . ':00', 'value' => $count];
            }
        } else {
            $current = $startDate->copy();
            while ($current <= $endDate) {
                $dateStr = $current->format('d/m');
                $dayStr = $current->format('Y-m-d');
                $count = collect()
                    ->concat($doorsmeer)->concat($bengkel)->concat($rental)->concat($storeOrders)
                    ->filter(function($item) use ($dayStr) {
                        return Carbon::parse($item['created_at'])->format('Y-m-d') == $dayStr;
                    })->count();
                $chartData[] = ['label' => $dateStr, 'value' => $count];
                $current->addDay();
            }
        }

        return [
            'allTransactions' => $allTransactions,
            'revenueByUnit'   => array_values($revenueByUnit),
            'kpi'             => $kpi,
            'chartData'       => $chartData
        ];
    }
}
