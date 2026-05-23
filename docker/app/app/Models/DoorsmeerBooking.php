<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoorsmeerBooking extends Model
{
    protected $fillable = [
        'booking_code',
        'user_id',
        'service_id',
        'service_name',
        'service_subtitle',
        'service_price',
        'service_duration',
        'vehicle_class',
        'license_plate',
        'status',
        'stall',
        'queue_position',
        'admin_notes',
        'verified_at',
        'bay_assigned_at',
        'done_at',
    ];

    protected $casts = [
        'verified_at'    => 'datetime',
        'bay_assigned_at'=> 'datetime',
        'done_at'        => 'datetime',
        'service_price'  => 'integer',
        'queue_position' => 'integer',
    ];

    // ── Status constants ──────────────────────────────────────────────────────

    const STATUS_PENDING   = 'pending';
    const STATUS_VERIFIED  = 'verified';
    const STATUS_IN_QUEUE  = 'in_queue';
    const STATUS_WASHING   = 'washing';
    const STATUS_DONE      = 'done';
    const STATUS_CANCELLED = 'cancelled';

    const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_VERIFIED,
        self::STATUS_IN_QUEUE,
        self::STATUS_WASHING,
        self::STATUS_DONE,
        self::STATUS_CANCELLED,
    ];

    // ── Status helpers ────────────────────────────────────────────────────────

    public function isPending(): bool   { return $this->status === self::STATUS_PENDING; }
    public function isVerified(): bool  { return $this->status === self::STATUS_VERIFIED; }
    public function isInQueue(): bool   { return $this->status === self::STATUS_IN_QUEUE; }
    public function isWashing(): bool   { return $this->status === self::STATUS_WASHING; }
    public function isDone(): bool      { return $this->status === self::STATUS_DONE; }
    public function isCancelled(): bool { return $this->status === self::STATUS_CANCELLED; }

    /** Label progress yang ditampilkan ke pengguna */
    public function progressLabel(): string
    {
        return match ($this->status) {
            'pending'   => 'Menunggu Verifikasi',
            'verified'  => 'Booking Dikonfirmasi',
            'in_queue'  => 'Dalam Antrian',
            'washing'   => 'Sedang Dicuci',
            'done'      => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default     => 'Tidak Diketahui',
        };
    }

    /** Urutan progress untuk tampilan stepper (0-based) */
    public function progressStep(): int
    {
        return match ($this->status) {
            'pending'   => 0,
            'verified'  => 1,
            'in_queue'  => 2,
            'washing'   => 3,
            'done'      => 4,
            'cancelled' => -1, // Dibatalkan tidak punya step progres
            default     => 0,
        };
    }

    /**
     * Allowed next status (forward-only transitions).
     */
    public function allowedNextStatuses(): array
    {
        if ($this->status === self::STATUS_CANCELLED) return [];

        return match ($this->status) {
            'pending'  => ['verified', 'cancelled'],
            'verified' => ['in_queue', 'washing', 'cancelled'],
            'in_queue' => ['washing', 'cancelled'],
            'washing'  => ['done', 'cancelled'],
            'done'     => [],
            default    => [],
        };
    }

    /**
     * Check if transition to given status is allowed.
     */
    public function canTransitionTo(string $status): bool
    {
        return in_array($status, $this->allowedNextStatuses());
    }

    // ── Bay management helpers ────────────────────────────────────────────────

    /**
     * Get the first available bay, or null if all occupied.
     */
    public static function getAvailableBay(): ?string
    {
        $stallNames = ['Stall 1', 'Stall 2', 'Stall 3'];

        $occupied = self::where('status', 'washing')
            ->whereNotNull('stall')
            ->pluck('stall')
            ->toArray();

        foreach ($stallNames as $name) {
            if (!in_array($name, $occupied)) {
                return $name;
            }
        }

        return null;
    }

    /**
     * Assign the next queued booking (FIFO) to a free bay.
     * Returns the booking that was assigned, or null.
     */
    public static function assignNextInQueue(): ?self
    {
        $bay = self::getAvailableBay();
        if (!$bay) return null;

        $next = self::where('status', 'in_queue')
            ->orderBy('verified_at')
            ->orderBy('id')
            ->first();

        if (!$next) return null;

        $next->update([
            'status'         => 'washing',
            'stall'          => $bay,
            'bay_assigned_at'=> now(),
        ]);

        return $next;
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Active bookings (belum selesai & tidak dibatalkan).
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'verified', 'in_queue', 'washing']);
    }

    public function scopePendingFirst($query)
    {
        return $query->orderByRaw("FIELD(status, 'pending', 'verified', 'in_queue', 'washing', 'done', 'cancelled')");
    }
}
