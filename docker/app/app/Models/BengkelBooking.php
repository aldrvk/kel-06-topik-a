<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BengkelBooking extends Model
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

    const STATUS_PENDING   = 'pending';
    const STATUS_VERIFIED  = 'verified';
    const STATUS_IN_QUEUE  = 'in_queue';
    const STATUS_SERVICING = 'servicing';
    const STATUS_DONE      = 'done';
    const STATUS_CANCELLED = 'cancelled';

    public function progressLabel(): string
    {
        return match ($this->status) {
            'pending'   => 'Menunggu Verifikasi',
            'verified'  => 'Booking Dikonfirmasi',
            'in_queue'  => 'Dalam Antrian',
            'servicing' => 'Sedang Diservis',
            'done'      => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default     => 'Tidak Diketahui',
        };
    }

    public function progressStep(): int
    {
        return match ($this->status) {
            'pending'   => 0,
            'verified'  => 1,
            'in_queue'  => 2,
            'servicing' => 3,
            'done'      => 4,
            'cancelled' => -1,
            default     => 0,
        };
    }

    public function allowedNextStatuses(): array
    {
        if ($this->status === self::STATUS_CANCELLED) return [];

        return match ($this->status) {
            'pending'  => ['verified', 'cancelled'],
            'verified' => ['in_queue', 'servicing', 'cancelled'],
            'in_queue' => ['servicing', 'cancelled'],
            'servicing'=> ['done', 'cancelled'],
            'done'     => [],
            default    => [],
        };
    }

    public function canTransitionTo(string $status): bool
    {
        return in_array($status, $this->allowedNextStatuses());
    }

    public static function getAvailableBay(): ?string
    {
        $stallNames = ['Pit 1', 'Pit 2', 'Pit 3'];

        $occupied = self::where('status', 'servicing')
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
            'status'         => 'servicing',
            'stall'          => $bay,
            'bay_assigned_at'=> now(),
        ]);

        return $next;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
