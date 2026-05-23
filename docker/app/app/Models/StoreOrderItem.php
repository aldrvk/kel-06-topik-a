<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreOrderItem extends Model
{
    protected $guarded = [];

    public function order()
    {
        return $this->belongsTo(StoreOrder::class, 'store_order_id');
    }
}
