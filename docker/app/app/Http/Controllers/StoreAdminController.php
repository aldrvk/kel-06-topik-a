<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StoreOrder;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class StoreAdminController extends Controller
{
    public function katalogCoffee(Request $request)
    {
        $query = Product::where('unit', 'COFFEE SHOP');
        
        $totalProducts = Product::where('unit', 'COFFEE SHOP')->count();
        $totalSold = Product::where('unit', 'COFFEE SHOP')->sum('sold');
        $outOfStock = Product::where('unit', 'COFFEE SHOP')->where('stock', 'Habis')->count();
        $estRevenue = Product::where('unit', 'COFFEE SHOP')->selectRaw('SUM(price * sold) as total')->value('total') ?? 0;

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }
        if ($request->has('category') && $request->category != '' && $request->category != 'Semua') {
            $query->where('category', $request->category);
        }
        
        $products = $query->paginate(10)->withQueryString();
        $categories = Setting::get('coffee_categories', ['Kopi', 'Non-Kopi', 'Makanan', 'Cemilan']);
        
        return Inertia::render('Admin/KatalogCoffeeShop', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only('search', 'category'),
            'stats' => [
                'total_products' => $totalProducts,
                'total_sold' => $totalSold,
                'out_of_stock' => $outOfStock,
                'est_revenue' => (int)$estRevenue,
            ]
        ]);
    }

    public function katalogVape(Request $request)
    {
        $query = Product::where('unit', 'VAPE STORE');
        
        $totalProducts = Product::where('unit', 'VAPE STORE')->count();
        $totalSold = Product::where('unit', 'VAPE STORE')->sum('sold');
        $outOfStock = Product::where('unit', 'VAPE STORE')->where('stock', 'Habis')->count();
        $estRevenue = Product::where('unit', 'VAPE STORE')->selectRaw('SUM(price * sold) as total')->value('total') ?? 0;

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }
        if ($request->has('category') && $request->category != '' && $request->category != 'Semua') {
            $query->where('category', $request->category);
        }
        
        $products = $query->paginate(10)->withQueryString();
        $categories = Setting::get('vape_categories', ['Device', 'Liquid', 'Accessories']);
        
        return Inertia::render('Admin/KatalogVapeStore', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only('search', 'category'),
            'stats' => [
                'total_products' => $totalProducts,
                'total_sold' => $totalSold,
                'out_of_stock' => $outOfStock,
                'est_revenue' => (int)$estRevenue,
            ]
        ]);
    }

    public function storeProduct(Request $request)
    {
        $request->validate([
            'unit'        => 'required|in:VAPE STORE,COFFEE SHOP',
            'name'        => 'required|string|max:255',
            'category'    => 'required|string|max:255',
            'price'       => 'required|integer|min:0',
            'stock'       => 'required|in:Tersedia,Habis,Terbatas',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'description' => 'nullable|string',
            'options'     => 'nullable|array',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $folder = $request->unit === 'VAPE STORE' ? 'Vape Store' : 'Coffee Shop';
            $imageName = strtolower($request->name) . '.' . $request->file('image')->getClientOriginalExtension();
            
            // Move file directly to public directory
            $destinationPath = public_path('images/' . $folder);
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }
            
            $request->file('image')->move($destinationPath, $imageName);
            $data['image'] = '/images/' . $folder . '/' . $imageName;
        }

        Product::create($data);

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function updateProduct(Request $request, Product $product)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'required|string|max:255',
            'price'       => 'required|integer|min:0',
            'stock'       => 'required|in:Tersedia,Habis,Terbatas',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'description' => 'nullable|string',
            'options'     => 'nullable|array',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $folder = $product->unit === 'VAPE STORE' ? 'Vape Store' : 'Coffee Shop';
            $imageName = strtolower($request->name) . '.' . $request->file('image')->getClientOriginalExtension();
            
            $destinationPath = public_path('images/' . $folder);
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }
            
            // Delete old image if exists
            if ($product->image && File::exists(public_path($product->image))) {
                File::delete(public_path($product->image));
            }

            $request->file('image')->move($destinationPath, $imageName);
            $data['image'] = '/images/' . $folder . '/' . $imageName;
        }

        $product->update($data);

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroyProduct(Product $product)
    {
        $product->delete();
        return back()->with('success', 'Produk berhasil dihapus.');
    }

    public function pesananStore(Request $request)
    {
        $query = StoreOrder::with('items')->orderBy('created_at', 'desc');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_code', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/PesananStore', [
            'orders' => $orders,
            'filters' => $request->only('search')
        ]);
    }

    public function confirmPayment(StoreOrder $order)
    {
        $order->update([
            'status' => 'BERHASIL',
            'progress_status' => 'pending'
        ]);
        return back()->with('success', 'Pembayaran berhasil dikonfirmasi.');
    }

    public function updateProgress(Request $request, StoreOrder $order)
    {
        $request->validate([
            'progress_status' => 'required|in:pending,processing,ready,completed',
        ]);

        $oldStatus = $order->progress_status;
        $newStatus = $request->progress_status;

        $updateData = ['progress_status' => $request->progress_status];
        if ($request->progress_status === 'completed') {
            $updateData['done_at'] = now();
            $updateData['status'] = 'BERHASIL';
        }

        $order->update($updateData);

        // If transitioning to completed, increment sold count of products
        if ($newStatus === 'completed' && $oldStatus !== 'completed') {
            foreach ($order->items as $item) {
                $product = Product::where('name', $item->name)
                    ->where('unit', $order->unit)
                    ->first();
                if ($product) {
                    $product->increment('sold', $item->quantity);
                }
            }
        }

        return back()->with('success', 'Status pesanan berhasil diperbarui.');
    }

    public function cancelOrder(Request $request, StoreOrder $order)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $oldStatus = $order->progress_status;

        $order->update([
            'progress_status' => 'cancelled',
            'admin_notes' => $request->reason,
            'done_at' => now(),
        ]);

        // If it was completed, decrement the sold count
        if ($oldStatus === 'completed') {
            foreach ($order->items as $item) {
                $product = Product::where('name', $item->name)
                    ->where('unit', $order->unit)
                    ->first();
                if ($product) {
                    $product->decrement('sold', $item->quantity);
                }
            }
        }

        return back()->with('success', 'Pesanan berhasil dibatalkan.');
    }

    public function updateCategories(Request $request)
    {
        $request->validate([
            'unit' => 'required|in:VAPE STORE,COFFEE SHOP',
            'categories' => 'required|array',
            'categories.*' => 'string|max:255'
        ]);

        $key = $request->unit === 'VAPE STORE' ? 'vape_categories' : 'coffee_categories';
        Setting::set($key, $request->categories);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }
}
