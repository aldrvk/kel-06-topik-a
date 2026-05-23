<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\DoorsmeerBookingController;
use App\Http\Controllers\BengkelBookingController;
use App\Http\Controllers\RentalPsBookingController;
use App\Http\Controllers\StoreAdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FavoriteController;

// ── Halaman Utama ──────────────────────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('Welcome');
})->middleware('redirectAdmin');

Route::group([], function () {
    // ── Doorsmeer ─────────────────────────────────────────────────────────────────
    Route::get('/doorsmeer', [DoorsmeerBookingController::class, 'index'])->name('doorsmeer.index');

    // ── Bengkel ───────────────────────────────────────────────────────────────────
    Route::get('/bengkel', [BengkelBookingController::class, 'index'])->name('bengkel.index');

    // ── Rental PS ─────────────────────────────────────────────────────────────────
    Route::get('/rental-ps', [RentalPsBookingController::class, 'index'])->name('rental-ps.index');

    // Index pages are public, but detail/receipt are protected
    // (Moving them down to the auth group)

    Route::get('/vape-store', function () {
        $query = \App\Models\Product::where('unit', 'VAPE STORE');
        
        $categories = \App\Models\Setting::get('vape_categories', ['Device', 'Liquid', 'Accessories']);
        
        if (request('search')) $query->where('name', 'like', '%' . request('search') . '%');
        
        $categoryFilter = request('category');
        if ($categoryFilter && $categoryFilter !== 'all') {
            $query->where('category', $categoryFilter);
        }
        
        return Inertia::render('VapeStore/all_items', [
            'products' => $query->paginate(8)->withQueryString(), 
            'filters' => request()->only(['search', 'category']),
            'categories' => $categories
        ]);
    })->name('vape.all');

    Route::get('/vape-store/product/{id}', function ($id) {
        $product = \App\Models\Product::findOrFail($id);
        $recommendations = \App\Models\Product::where('unit', 'VAPE STORE')->where('id', '!=', $id)->inRandomOrder()->take(3)->get();
        return Inertia::render('VapeStore/product_detail', [
            'product' => $product,
            'recommendations' => $recommendations
        ]);
    })->name('vape.product');

    // Catalog is public, but cart/checkout/receipt/tracking are protected below

    // ── Store Order Submission ───────────────────────────────────────────────────
    // Order creation is protected below


    // ── Coffee Shop ───────────────────────────────────────────────────────────────
    Route::get('/coffee-shop', function () {
        $query = \App\Models\Product::where('unit', 'COFFEE SHOP');
        
        $categories = \App\Models\Setting::get('coffee_categories', ['Kopi', 'Non-Kopi', 'Makanan', 'Cemilan']);
        
        if (request('search')) $query->where('name', 'like', '%' . request('search') . '%');
        
        $categoryFilter = request('category');
        if ($categoryFilter && $categoryFilter !== 'all') {
            $query->where('category', $categoryFilter);
        }
        
        return Inertia::render('CoffeeShop/all_items', [
            'products' => $query->paginate(8)->withQueryString(), 
            'filters' => request()->only(['search', 'category']),
            'categories' => $categories
        ]);
    })->name('coffee.all');

    Route::get('/coffee-shop/product/{id}', function ($id) {
        $product = \App\Models\Product::findOrFail($id);
        $recommendations = \App\Models\Product::where('unit', 'COFFEE SHOP')->where('id', '!=', $id)->inRandomOrder()->take(3)->get();
        return Inertia::render('CoffeeShop/product_detail', [
            'product' => $product,
            'recommendations' => $recommendations
        ]);
    })->name('coffee.product');

    // Cart/Checkout/Receipt/Tracking are protected below
});

// ── Auth: Guest only (belum login) ────────────────────────────────────────────
Route::middleware('guest')->group(function () {

    // Login
    Route::get('/login', fn () => Inertia::render('auth/Login'))->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    // Register
    Route::get('/register', fn () => Inertia::render('auth/Register'))->name('register');
    Route::post('/register', [RegisterController::class, 'store']);

    // Lupa Kata Sandi
    Route::get('/forgot-password', [ForgotPasswordController::class, 'index'])->name('password.request');
    Route::post('/forgot-password/otp', [ForgotPasswordController::class, 'sendOtp'])->name('password.otp');
    Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword'])->name('password.reset');

});

// ── Auth: Butuh login ─────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {

    // Dashboard (legacy, redirect ke admin)
    Route::get('/dashboard', function () {
        return redirect('/admin/dashboard');
    })->name('dashboard');

    Route::middleware('redirectAdmin')->group(function () {
        // ── Profile (User) ────────────────────────────────────────────────────────
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

        // ── Favorites (User) ─────────────────────────────────────────────────────
        Route::get('/api/favorites', [FavoriteController::class, 'index'])->name('favorites.index');
        Route::post('/api/favorites/toggle', [FavoriteController::class, 'toggle'])->name('favorites.toggle');
        Route::post('/api/favorites/merge', [FavoriteController::class, 'merge'])->name('favorites.merge');

        // ── Doorsmeer Booking (user) ──────────────────────────────────────────────
        Route::post('/doorsmeer/booking', [DoorsmeerBookingController::class, 'store'])
             ->name('doorsmeer.booking.store');
        Route::get('/doorsmeer/tracking/{code}', [DoorsmeerBookingController::class, 'tracking'])
             ->name('doorsmeer.tracking');
        Route::get('/doorsmeer/my-bookings', [DoorsmeerBookingController::class, 'myBookings'])
             ->name('doorsmeer.my_bookings');

        // Polling AJAX – real-time status tanpa reload halaman
        Route::get('/api/doorsmeer/status/{code}', [DoorsmeerBookingController::class, 'statusPoll'])
             ->name('doorsmeer.status_poll');

        // ── Bengkel Booking (user) ────────────────────────────────────────────────
        Route::post('/bengkel/booking', [BengkelBookingController::class, 'store'])->name('bengkel.booking.store');
        Route::get('/bengkel/tracking/{code}', [BengkelBookingController::class, 'tracking'])->name('bengkel.tracking');
        Route::get('/bengkel/my-bookings', [BengkelBookingController::class, 'myBookings'])->name('bengkel.my_bookings');
        Route::get('/api/bengkel/status/{code}', [BengkelBookingController::class, 'statusPoll'])->name('bengkel.status_poll');

        // ── Rental PS Booking (user) ──────────────────────────────────────────────
        Route::post('/rental-ps/booking', [RentalPsBookingController::class, 'store'])->name('rental-ps.booking.store');
        Route::get('/rental-ps/tracking/{code}', [RentalPsBookingController::class, 'tracking'])->name('rental-ps.tracking');
        Route::get('/rental-ps/my-bookings', [RentalPsBookingController::class, 'myBookings'])->name('rental-ps.my_bookings');
        Route::get('/api/rental-ps/status/{code}', [RentalPsBookingController::class, 'statusPoll'])->name('rental-ps.status_poll');

        // ── Protected Booking Pages (Redirects to Login if guest) ─────────────────
        Route::get('/doorsmeer/booking-detail', fn() => Inertia::render('Doorsmeer/booking_detail'))->name('doorsmeer.booking_detail');
        Route::get('/doorsmeer/booking-receipt', fn() => Inertia::render('Doorsmeer/booking_receipt'))->name('doorsmeer.booking_receipt');
        
        Route::get('/bengkel/booking-detail', fn() => Inertia::render('Bengkel/booking_detail'))->name('bengkel.booking_detail');
        Route::get('/bengkel/booking-receipt', fn() => Inertia::render('Bengkel/booking_receipt'))->name('bengkel.booking_receipt');
        
        Route::get('/rental-ps/booking-detail', fn() => Inertia::render('RentalPs/booking_detail'))->name('rental-ps.booking_detail');
        Route::get('/rental-ps/booking-receipt', fn() => Inertia::render('RentalPs/booking_receipt'))->name('rental-ps.booking_receipt');

        // ── Protected Store Pages ────────────────────────────────────────────────
        Route::get('/vape-store/cart', fn() => Inertia::render('VapeStore/cart'))->name('vape.cart');
        Route::get('/vape-store/checkout', fn() => Inertia::render('VapeStore/checkout'))->name('vape.checkout');
        Route::get('/vape-store/receipt', function () {
            $orderCode = request('order_code');
            $order = $orderCode ? \App\Models\StoreOrder::with('items')->where('order_code', $orderCode)->first() : null;
            return Inertia::render('VapeStore/receipt', ['order' => $order]);
        })->name('vape.receipt');

        Route::get('/coffee-shop/cart', fn() => Inertia::render('CoffeeShop/cart'))->name('coffee.cart');
        Route::get('/coffee-shop/checkout', fn() => Inertia::render('CoffeeShop/checkout'))->name('coffee.checkout');
        Route::get('/coffee-shop/receipt', function () {
            $orderCode = request('order_code');
            $order = $orderCode ? \App\Models\StoreOrder::with('items')->where('order_code', $orderCode)->first() : null;
            return Inertia::render('CoffeeShop/receipt', ['order' => $order]);
        })->name('coffee.receipt');

        Route::post('/store/order', [\App\Http\Controllers\StoreOrderController::class, 'store'])->name('store.order.create');

        // ── Tracking & My Orders ──────────────────────────────────────────────────
        Route::get('/vape-store/tracking/{code}', [\App\Http\Controllers\StoreOrderController::class, 'tracking'])->name('vape.tracking');
        Route::get('/coffee-shop/tracking/{code}', [\App\Http\Controllers\StoreOrderController::class, 'tracking'])->name('coffee.tracking');
        Route::get('/api/store/status/{code}', [\App\Http\Controllers\StoreOrderController::class, 'statusPoll'])->name('store.status_poll');
        
        Route::get('/coffee-shop/my-orders', [\App\Http\Controllers\StoreOrderController::class, 'coffeeMyOrders'])->name('coffee.my_orders');
        Route::get('/vape-store/my-orders', [\App\Http\Controllers\StoreOrderController::class, 'vapeMyOrders'])->name('vape.my_orders');
    });

    // ── Admin Routes ──────────────────────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\AdminController::class, 'dashboard'])->name('dashboard');

        // Doorsmeer – data dari DB + actions
        Route::get('/booking-doorsmeer', [DoorsmeerBookingController::class, 'adminIndex'])->name('doorsmeer');
        Route::post('/doorsmeer/verify/{booking}', [DoorsmeerBookingController::class, 'verify'])->name('doorsmeer.verify');
        Route::post('/doorsmeer/progress/{booking}', [DoorsmeerBookingController::class, 'updateProgress'])->name('doorsmeer.progress');
        Route::post('/doorsmeer/cancel/{booking}', [DoorsmeerBookingController::class, 'cancel'])->name('doorsmeer.cancel');

        // Walk-in
        Route::get('/doorsmeer/walk-in', [DoorsmeerBookingController::class, 'walkIn'])->name('doorsmeer.walk-in');
        Route::post('/doorsmeer/walk-in', [DoorsmeerBookingController::class, 'storeWalkIn'])->name('doorsmeer.store-walk-in');

        // Bengkel
        Route::get('/booking-bengkel', [BengkelBookingController::class, 'adminIndex'])->name('bengkel');
        Route::post('/bengkel/verify/{booking}', [BengkelBookingController::class, 'verify'])->name('bengkel.verify');
        Route::post('/bengkel/progress/{booking}', [BengkelBookingController::class, 'updateProgress'])->name('bengkel.progress');
        Route::post('/bengkel/cancel/{booking}', [BengkelBookingController::class, 'cancel'])->name('bengkel.cancel');
        Route::get('/bengkel/walk-in', [BengkelBookingController::class, 'walkIn'])->name('bengkel.walk-in');
        Route::post('/bengkel/walk-in', [BengkelBookingController::class, 'storeWalkIn'])->name('bengkel.store-walk-in');

        // Rental PS
        Route::get('/booking-rental-ps', [RentalPsBookingController::class, 'adminIndex'])->name('rentalps');
        Route::post('/rental-ps/verify/{booking}', [RentalPsBookingController::class, 'verify'])->name('rental-ps.verify');
        Route::post('/rental-ps/progress/{booking}', [RentalPsBookingController::class, 'updateProgress'])->name('rental-ps.progress');
        Route::post('/rental-ps/cancel/{booking}', [RentalPsBookingController::class, 'cancel'])->name('rental-ps.cancel');
        Route::get('/rental-ps/walk-in', [RentalPsBookingController::class, 'walkIn'])->name('rental-ps.walk-in');
        Route::post('/rental-ps/walk-in', [RentalPsBookingController::class, 'storeWalkIn'])->name('rental-ps.store-walk-in');
        Route::get('/katalog-coffee', [StoreAdminController::class, 'katalogCoffee'])->name('coffee');
        Route::get('/katalog-vape', [StoreAdminController::class, 'katalogVape'])->name('vape');
        Route::get('/pesanan-store', [StoreAdminController::class, 'pesananStore'])->name('pesanan-store');
        
        // Store actions
        Route::post('/store/product', [StoreAdminController::class, 'storeProduct'])->name('store.product.store');
        Route::put('/store/product/{product}', [StoreAdminController::class, 'updateProduct'])->name('store.product.update');
        Route::delete('/store/product/{product}', [StoreAdminController::class, 'destroyProduct'])->name('store.product.destroy');
        Route::post('/store/categories', [StoreAdminController::class, 'updateCategories'])->name('store.categories.update');
        Route::post('/pesanan-store/{order}/confirm', [StoreAdminController::class, 'confirmPayment'])->name('store.order.confirm');
        Route::post('/pesanan-store/{order}/progress', [StoreAdminController::class, 'updateProgress'])->name('store.order.progress');
        Route::post('/pesanan-store/{order}/cancel', [StoreAdminController::class, 'cancelOrder'])->name('store.order.cancel');
        Route::get('/jadwal', fn () => Inertia::render('Admin/Jadwal'))->name('jadwal');
        Route::get('/laporan', [\App\Http\Controllers\ReportController::class, 'index'])->name('laporan');
        Route::get('/laporan/export', [\App\Http\Controllers\ReportController::class, 'exportPdf'])->name('laporan.export');
        Route::get('/pengaturan', fn () => Inertia::render('Admin/Pengaturan'))->name('pengaturan');
        Route::post('/settings/operational', [\App\Http\Controllers\SettingsController::class, 'updateOperational'])->name('settings.operational');
        Route::post('/settings/payment', [\App\Http\Controllers\SettingsController::class, 'updatePayment'])->name('settings.payment');
    });

    // Midtrans Payment
    Route::post('/payment/snap-token/{order}', [\App\Http\Controllers\PaymentController::class, 'createSnapToken'])->name('payment.snap-token');
    Route::post('/payment/local-success/{orderCode}', [\App\Http\Controllers\PaymentController::class, 'localSuccess'])->name('payment.local-success');

    // Logout
    Route::post('/logout', [\App\Http\Controllers\Auth\LoginController::class, 'destroy'])->name('logout');
});

Route::post('/payment/notification', [\App\Http\Controllers\PaymentController::class, 'handleNotification'])->name('payment.notification');
