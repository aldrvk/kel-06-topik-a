<?php

namespace App\Http\Controllers;

use App\Models\DoorsmeerBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DoorsmeerBookingController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // USER: halaman booking doorsmeer (customer-facing)
    // GET /doorsmeer
    // ─────────────────────────────────────────────────────────────────────────
    public function index()
    {
        $stalls = $this->getStallSummary();

        // Hitung antrian aktif (menunggu verifikasi + dikonfirmasi + dalam antrian)
        $queueCount = DoorsmeerBooking::whereIn('status', ['pending', 'verified', 'in_queue'])->count();

        // Hitung bay tersedia
        $occupiedBays = DoorsmeerBooking::whereIn('status', ['washing'])
            ->whereNotNull('stall')
            ->count();
        $totalBays = 3;
        $availableBays = $totalBays - $occupiedBays;

        // Sedang dicuci count
        $washingCount = DoorsmeerBooking::where('status', 'washing')->count();

        return Inertia::render('Doorsmeer/index', [
            'stalls'        => $stalls,
            'queueCount'    => $queueCount,
            'availableBays' => $availableBays,
            'totalBays'     => $totalBays,
            'washingCount'  => $washingCount,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER: submit booking baru (realtime queue, no appointment)
    // POST /doorsmeer/booking
    // ─────────────────────────────────────────────────────────────────────────
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

        $booking = DoorsmeerBooking::create([
            'booking_code'     => 'DS-' . strtoupper(Str::random(5)),
            'user_id'          => auth()->id(),
            'service_id'       => $request->service_id,
            'service_name'     => $request->service_name,
            'service_subtitle' => $request->service_subtitle,
            'service_price'    => $request->service_price,
            'service_duration' => $request->service_duration,
            'vehicle_class'    => $request->vehicle_class,
            'license_plate'    => strtoupper(trim($request->license_plate)),
            'status'           => 'pending',
        ]);

        return redirect()->route('doorsmeer.tracking', ['code' => $booking->booking_code, 'new' => 1]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER: halaman tracking progress booking
    // GET /doorsmeer/tracking/{code}
    // ─────────────────────────────────────────────────────────────────────────
    public function tracking(string $code)
    {
        $booking = DoorsmeerBooking::where('booking_code', $code)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return Inertia::render('Doorsmeer/tracking', [
            'booking' => $this->formatBooking($booking),
            'showAd'  => request()->query('new') == 1,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER: daftar semua booking milik user yang login
    // GET /doorsmeer/my-bookings
    // ─────────────────────────────────────────────────────────────────────────
    public function myBookings()
    {
        $bookings = DoorsmeerBooking::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($b) => $this->formatBooking($b));

        return Inertia::render('Doorsmeer/my_bookings', [
            'bookings' => $bookings,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: daftar semua booking (untuk halaman BookingDoorsmeer)
    // GET /admin/booking-doorsmeer  (return JSON via props)
    // ─────────────────────────────────────────────────────────────────────────
    public function adminIndex(Request $request)
    {
        $query = DoorsmeerBooking::with('user');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                  ->orWhere('license_plate', 'like', "%{$search}%")
                  ->orWhere('vehicle_class', 'like', "%{$search}%")
                  ->orWhere('service_name', 'like', "%{$search}%")
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
            } elseif ($status === 'Dicuci') {
                $query->where('status', 'washing');
            } elseif ($status === 'Selesai') {
                $query->where('status', 'done');
            } elseif ($status === 'Dibatalkan') {
                $query->where('status', 'cancelled');
            }
        }

        $bookings = $query->orderByRaw("FIELD(status, 'pending', 'verified', 'in_queue', 'washing', 'done', 'cancelled')")
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $bookings->getCollection()->transform(fn ($b) => $this->formatBookingAdmin($b));

        // Stall summary
        $stalls = $this->getStallSummary();

        // Queue count
        $queueCount = DoorsmeerBooking::where('status', 'in_queue')->count();

        // Pending count
        $pendingCount = DoorsmeerBooking::where('status', 'pending')->count();

        return Inertia::render('Admin/BookingDoorsmeer', [
            'bookings'     => $bookings,
            'stalls'       => $stalls,
            'queueCount'   => $queueCount,
            'pendingCount' => $pendingCount,
            'filters'      => $request->only('search', 'status')
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: konfirmasi kedatangan pelanggan
    // POST /admin/doorsmeer/verify/{id}
    // ─────────────────────────────────────────────────────────────────────────
    public function verify(Request $request, DoorsmeerBooking $booking)
    {
        abort_if(!$booking->canTransitionTo('verified'), 422, 'Booking sudah diproses sebelumnya.');

        $booking->update([
            'status'      => 'verified',
            'verified_at' => now(),
        ]);

        // Auto bay assignment: cek bay kosong
        $availableBay = DoorsmeerBooking::getAvailableBay();

        if ($availableBay) {
            // Bay tersedia → langsung masuk washing
            $booking->update([
                'status'          => 'washing',
                'stall'           => $availableBay,
                'bay_assigned_at' => now(),
            ]);
            return back()->with('success', "Booking {$booking->booking_code} dikonfirmasi → langsung masuk {$availableBay}.");
        }

        // Semua bay penuh → masuk antrian
        $booking->update([
            'status' => 'in_queue',
        ]);

        return back()->with('success', "Booking {$booking->booking_code} dikonfirmasi → masuk antrian.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: update progress pengerjaan (forward-only)
    // POST /admin/doorsmeer/progress/{id}
    // ─────────────────────────────────────────────────────────────────────────
    public function updateProgress(Request $request, DoorsmeerBooking $booking)
    {
        $request->validate([
            'status' => 'required|in:done',
        ]);

        abort_if(!$booking->canTransitionTo('done'), 422, 'Status tidak dapat diperbarui.');

        // Tandai selesai & release bay
        $booking->update([
            'status'  => 'done',
            'done_at' => now(),
            'stall'   => null,
        ]);

        // Auto-assign: pindahkan antrian berikutnya ke bay yang baru kosong
        DoorsmeerBooking::assignNextInQueue();

        return back()->with('success', "Booking {$booking->booking_code} selesai.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: Batalkan booking
    // POST /admin/doorsmeer/cancel/{id}
    // ─────────────────────────────────────────────────────────────────────────
    public function cancel(Request $request, DoorsmeerBooking $booking)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        abort_if(!$booking->canTransitionTo('cancelled'), 422, 'Booking tidak dapat dibatalkan.');

        // If it was washing, release the stall
        $wasWashing = $booking->status === 'washing';

        $booking->update([
            'status'      => 'cancelled',
            'admin_notes' => $request->reason,
            'stall'       => null,
        ]);

        if ($wasWashing) {
            DoorsmeerBooking::assignNextInQueue();
        }

        return back()->with('success', "Booking {$booking->booking_code} telah dibatalkan.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: Halaman Walk-in
    // GET /admin/doorsmeer/walk-in
    // ─────────────────────────────────────────────────────────────────────────
    public function walkIn()
    {
        return Inertia::render('Admin/DoorsmeerWalkIn', [
            'stalls' => $this->getStallSummary(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: Submit Walk-in
    // POST /admin/doorsmeer/walk-in
    // ─────────────────────────────────────────────────────────────────────────
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

        // Walk-in users are usually "guest" or a specific "Walk-in" user account.
        // For simplicity, we'll assign to the current admin user but we could also create a guest user.
        // Let's assume we use the current admin user as owner but store name in notes or something.
        // Better: create a "Walk-in" booking that might not have a user_id or use a placeholder.
        // Since the system relies on user_id for tracking, let's create it with user_id null or admin.
        // However, the model has user_id. Let's see if we can make it nullable or use the admin's ID.

        $booking = DoorsmeerBooking::create([
            'booking_code'     => 'WK-' . strtoupper(Str::random(5)),
            'user_id'          => auth()->id(), // Admin is the creator
            'service_id'       => $request->service_id,
            'service_name'     => $request->service_name,
            'service_subtitle' => $request->service_subtitle,
            'service_price'    => $request->service_price,
            'service_duration' => $request->service_duration,
            'vehicle_class'    => $request->vehicle_class,
            'license_plate'    => strtoupper(trim($request->license_plate)),
            'status'           => 'pending', // Will be verified immediately
            'admin_notes'      => "Walk-in Customer: {$request->customer_name}" . ($request->customer_email ? " ({$request->customer_email})" : ""),
        ]);

        // Auto verify walk-in
        $this->verify(new Request(), $booking);

        return redirect()->route('admin.doorsmeer')->with('success', "Walk-in booking {$booking->booking_code} berhasil dibuat.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: polling endpoint untuk real-time update status
    // GET /api/doorsmeer/status/{code}
    // ─────────────────────────────────────────────────────────────────────────
    public function statusPoll(string $code)
    {
        $booking = DoorsmeerBooking::where('booking_code', $code)
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

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function formatBooking(DoorsmeerBooking $b): array
    {
        return [
            'id'              => $b->id,
            'booking_code'    => $b->booking_code,
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

    private function formatBookingAdmin(DoorsmeerBooking $b): array
    {
        return array_merge($this->formatBooking($b), [
            'customer_name'  => $b->user?->name ?? 'GUEST',
            'customer_email' => $b->user?->email ?? '-',
        ]);
    }

    private function getStallSummary(): array
    {
        $stallNames = ['Stall 1', 'Stall 2', 'Stall 3'];

        $occupied = DoorsmeerBooking::where('status', 'washing')
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
