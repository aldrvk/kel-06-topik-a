<?php

namespace App\Http\Controllers;

use App\Models\BengkelBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BengkelBookingController extends Controller
{
    public function index()
    {
        $stalls = $this->getStallSummary();
        $queueCount = BengkelBooking::whereIn('status', ['pending', 'verified', 'in_queue'])->count();
        $occupiedBays = BengkelBooking::whereIn('status', ['servicing'])->whereNotNull('stall')->count();
        $totalBays = 3;
        $availableBays = $totalBays - $occupiedBays;
        $servicingCount = BengkelBooking::where('status', 'servicing')->count();

        return Inertia::render('Bengkel/index', [
            'stalls'        => $stalls,
            'queueCount'    => $queueCount,
            'availableBays' => $availableBays,
            'totalBays'     => $totalBays,
            'servicingCount'=> $servicingCount,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'service_id'       => 'required|string',
            'service_name'     => 'required|string',
            'service_subtitle' => 'required|string',
            'service_price'    => 'required|integer|min:0',
            'service_duration' => 'required|string',
            'vehicle_class'    => 'required|string',
            'license_plate'    => ['required', 'string', 'max:15', 'regex:/^[A-Za-z]{1,2}\s?\d{1,4}\s?[A-Za-z]{1,3}$/'],
        ], [
            'license_plate.regex' => 'Format plat nomor tidak valid (contoh: BK 1234 ABC).'
        ]);

        $booking = BengkelBooking::create([
            'booking_code'     => 'BK-' . strtoupper(Str::random(5)),
            'user_id'          => auth()->id(),
            'booking_type'     => 'online',
            'service_id'       => $request->service_id,
            'service_name'     => $request->service_name,
            'service_subtitle' => $request->service_subtitle,
            'service_price'    => $request->service_price,
            'service_duration' => $request->service_duration,
            'vehicle_class'    => $request->vehicle_class,
            'license_plate'    => strtoupper(trim($request->license_plate)),
            'status'           => 'pending',
        ]);

        return redirect()->route('bengkel.tracking', ['code' => $booking->booking_code, 'new' => 1]);
    }

    public function tracking(string $code)
    {
        $booking = BengkelBooking::where('booking_code', $code)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return Inertia::render('Bengkel/tracking', [
            'booking' => $this->formatBooking($booking),
            'showAd'  => request()->query('new') == 1,
        ]);
    }

    public function myBookings()
    {
        $bookings = BengkelBooking::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($b) => $this->formatBooking($b));

        return Inertia::render('Bengkel/my_bookings', [
            'bookings' => $bookings,
        ]);
    }

    public function adminIndex(Request $request)
    {
        $query = BengkelBooking::with('user');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                  ->orWhere('license_plate', 'like', "%{$search}%")
                  ->orWhere('vehicle_class', 'like', "%{$search}%")
                  ->orWhere('service_name', 'like', "%{$search}%")
                  ->orWhere('walkin_name', 'like', "%{$search}%")
                  ->orWhere('admin_notes', 'like', "%{$search}%")
                  ->orWhereHas('user', function($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status != '' && $request->status != 'Semua') {
            $status = $request->status;
            if ($status === 'Menunggu') {
                $query->where('status', 'pending');
            } elseif ($status === 'Antrian') {
                $query->whereIn('status', ['verified', 'in_queue']);
            } elseif ($status === 'Diservis') {
                $query->where('status', 'servicing');
            } elseif ($status === 'Selesai') {
                $query->where('status', 'done');
            } elseif ($status === 'Dibatalkan') {
                $query->where('status', 'cancelled');
            }
        }

        $bookings = $query->orderByRaw("FIELD(status, 'pending', 'verified', 'in_queue', 'servicing', 'done', 'cancelled')")
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $bookings->getCollection()->transform(fn ($b) => $this->formatBookingAdmin($b));

        $stalls = $this->getStallSummary();
        $queueCount = BengkelBooking::where('status', 'in_queue')->count();
        $pendingCount = BengkelBooking::where('status', 'pending')->count();

        return Inertia::render('Admin/BookingBengkel', [
            'bookings'     => $bookings,
            'stalls'       => $stalls,
            'queueCount'   => $queueCount,
            'pendingCount' => $pendingCount,
            'filters'      => $request->only('search', 'status')
        ]);
    }

    public function verify(Request $request, BengkelBooking $booking)
    {
        abort_if(!$booking->canTransitionTo('verified'), 422, 'Booking sudah diproses sebelumnya.');

        $booking->update([
            'status'      => 'verified',
            'verified_at' => now(),
        ]);

        $availableBay = BengkelBooking::getAvailableBay();

        if ($availableBay) {
            $booking->update([
                'status'          => 'servicing',
                'stall'           => $availableBay,
                'bay_assigned_at' => now(),
            ]);
            return back()->with('success', "Booking {$booking->booking_code} dikonfirmasi → langsung masuk {$availableBay}.");
        }

        $booking->update([
            'status' => 'in_queue',
        ]);

        return back()->with('success', "Booking {$booking->booking_code} dikonfirmasi → masuk antrian.");
    }

    public function updateProgress(Request $request, BengkelBooking $booking)
    {
        $request->validate([
            'status' => 'required|in:done',
        ]);

        abort_if(!$booking->canTransitionTo('done'), 422, 'Status tidak dapat diperbarui.');

        $booking->update([
            'status'  => 'done',
            'done_at' => now(),
            'stall'   => null,
        ]);

        BengkelBooking::assignNextInQueue();

        return back()->with('success', "Booking {$booking->booking_code} selesai.");
    }

    public function cancel(Request $request, BengkelBooking $booking)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        abort_if(!$booking->canTransitionTo('cancelled'), 422, 'Booking tidak dapat dibatalkan.');

        $wasServicing = $booking->status === 'servicing';

        $booking->update([
            'status'      => 'cancelled',
            'admin_notes' => $request->reason,
            'stall'       => null,
        ]);

        if ($wasServicing) {
            BengkelBooking::assignNextInQueue();
        }

        return back()->with('success', "Booking {$booking->booking_code} telah dibatalkan.");
    }

    public function walkIn()
    {
        return Inertia::render('Admin/BengkelWalkIn', [
            'stalls' => $this->getStallSummary(),
        ]);
    }

    public function storeWalkIn(Request $request)
    {
        $request->validate([
            'service_id'       => 'required|string',
            'service_name'     => 'required|string',
            'service_subtitle' => 'required|string',
            'service_price'    => 'required|integer|min:0',
            'service_duration' => 'required|string',
            'vehicle_class'    => 'required|string',
            'license_plate'    => ['required', 'string', 'max:15', 'regex:/^[A-Za-z]{1,2}\s?\d{1,4}\s?[A-Za-z]{1,3}$/'],
            'customer_name'    => 'required|string|max:50',
            'customer_email'   => 'nullable|email|max:50',
        ], [
            'license_plate.regex' => 'Format plat nomor tidak valid (contoh: BK 1234 ABC).'
        ]);

        $booking = BengkelBooking::create([
            'booking_code'     => 'WK-BK-' . strtoupper(Str::random(4)),
            'user_id'          => auth()->id(),
            'booking_type'     => 'walk_in',
            'walkin_name'      => $request->customer_name,
            'service_id'       => $request->service_id,
            'service_name'     => $request->service_name,
            'service_subtitle' => $request->service_subtitle,
            'service_price'    => $request->service_price,
            'service_duration' => $request->service_duration,
            'vehicle_class'    => $request->vehicle_class,
            'license_plate'    => strtoupper(trim($request->license_plate)),
            'status'           => 'pending',
            'admin_notes'      => "Walk-in Customer: {$request->customer_name}" . ($request->customer_email ? " ({$request->customer_email})" : ""),
        ]);

        $this->verify(new Request(), $booking);

        return redirect()->route('admin.bengkel')->with('success', "Walk-in booking {$booking->booking_code} berhasil dibuat.");
    }

    public function statusPoll(string $code)
    {
        $booking = BengkelBooking::where('booking_code', $code)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return response()->json([
            'status'         => $booking->status,
            'progressLabel'  => $booking->progressLabel(),
            'progressStep'   => $booking->progressStep(),
            'stall'          => $booking->stall,
            'queue_position' => $booking->queue_position,
            'admin_notes'    => $booking->admin_notes,
        ]);
    }

    private function formatBooking(BengkelBooking $b): array
    {
        return [
            'id'              => $b->id,
            'booking_code'    => $b->booking_code,
            'booking_type'    => $b->booking_type ?? 'online',
            'walkin_name'     => $b->walkin_name,
            'service_name'    => $b->service_name,
            'service_subtitle'=> $b->service_subtitle,
            'service_price'   => $b->service_price,
            'service_duration'=> $b->service_duration,
            'vehicle_class'   => $b->vehicle_class,
            'license_plate'   => $b->license_plate,
            'status'          => $b->status,
            'progress_label'  => $b->progressLabel(),
            'progress_step'   => $b->progressStep(),
            'stall'           => $b->stall,
            'queue_position'  => $b->queue_position,
            'admin_notes'     => $b->admin_notes,
            'verified_at'     => $b->verified_at?->format('d M Y H:i'),
            'bay_assigned_at' => $b->bay_assigned_at?->format('d M Y H:i'),
            'done_at'         => $b->done_at?->format('d M Y H:i'),
            'created_at'      => $b->created_at->format('d M Y H:i'),
        ];
    }

    private function formatBookingAdmin(BengkelBooking $b): array
    {
        return array_merge($this->formatBooking($b), [
            'customer_name'  => $b->booking_type === 'walk_in' ? $b->walkin_name : ($b->user?->name ?? 'GUEST'),
            'customer_email' => $b->user?->email ?? '-',
        ]);
    }

    private function getStallSummary(): array
    {
        $stallNames = ['Pit 1', 'Pit 2', 'Pit 3'];

        $occupied = BengkelBooking::where('status', 'servicing')
            ->whereNotNull('stall')
            ->get()
            ->keyBy('stall');

        return array_map(function ($name) use ($occupied) {
            if ($occupied->has($name)) {
                $b = $occupied[$name];
                return [
                    'id'       => $name,
                    'label'    => strtoupper($name),
                    'status'   => 'terisi',
                    'plate'    => $b->license_plate,
                    'vehicle'  => $b->vehicle_class,
                    'progress' => $b->progressLabel(),
                ];
            }
            return [
                'id'    => $name,
                'label' => strtoupper($name),
                'status'=> 'tersedia',
            ];
        }, $stallNames);
    }
}
