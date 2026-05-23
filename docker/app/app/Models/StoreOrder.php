<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreOrder extends Model
{
    protected $guarded = [];
    
    protected $casts = [
        'done_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(StoreOrderItem::class);
    }
}
