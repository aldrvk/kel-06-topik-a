<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FavoriteController extends Controller
{
    /**
     * Get all favorite product IDs for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $favoriteIds = Favorite::where('user_id', $request->user()->id)
            ->pluck('product_id')
            ->toArray();

        return response()->json(['favorites' => $favoriteIds]);
    }

    /**
     * Toggle a product favorite (add/remove).
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        $userId = $request->user()->id;
        $productId = $request->input('product_id');

        $existing = Favorite::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['status' => 'removed', 'product_id' => $productId]);
        }

        Favorite::create([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);

        return response()->json(['status' => 'added', 'product_id' => $productId]);
    }

    /**
     * Merge guest localStorage favorites into the authenticated user's DB favorites.
     */
    public function merge(Request $request): JsonResponse
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'integer|exists:products,id',
        ]);

        $userId = $request->user()->id;
        $productIds = $request->input('product_ids');

        foreach ($productIds as $productId) {
            Favorite::firstOrCreate([
                'user_id' => $userId,
                'product_id' => $productId,
            ]);
        }

        // Return the full updated list
        $favoriteIds = Favorite::where('user_id', $userId)
            ->pluck('product_id')
            ->toArray();

        return response()->json(['favorites' => $favoriteIds]);
    }
}
