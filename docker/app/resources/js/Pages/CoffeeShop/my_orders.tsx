import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: string;
}

interface Order {
    id: number;
    order_code: string;
    customer_name: string;
    payment_method: string;
    total: string;
    status: string;
    progress_status: string;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    orders: Order[];
}

function statusColor(status: string) {
    switch (status) {
        case 'menunggu_pembayaran': return 'text-amber-600 bg-amber-50 border-amber-200';
        case 'pending':             return 'text-blue-500 bg-blue-50 border-blue-200';
        case 'processing':          return 'text-purple-500 bg-purple-50 border-purple-200';
        case 'ready':               return 'text-primary bg-primary/10 border-primary/30';
        case 'completed':           return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        case 'cancelled':           return 'text-red-600 bg-red-50 border-red-200';
        default:                    return 'text-foreground/50 bg-surface border-border';
    }
}

function statusDot(status: string) {
    switch (status) {
        case 'menunggu_pembayaran': return 'bg-amber-500 animate-pulse';
        case 'pending':             return 'bg-blue-400';
        case 'processing':          return 'bg-purple-500 animate-pulse';
        case 'ready':               return 'bg-primary animate-pulse';
        case 'completed':           return 'bg-emerald-500';
        case 'cancelled':           return 'bg-red-500';
        default:                    return 'bg-foreground/30';
    }
}

function formatStatus(status: string) {
    switch (status) {
        case 'menunggu_pembayaran': return 'Menunggu Pembayaran';
        case 'pending':             return 'Pesanan Diterima';
        case 'processing':          return 'Sedang Disiapkan';
        case 'ready':               return 'Siap Diambil';
        case 'completed':           return 'Selesai';
        case 'cancelled':           return 'Dibatalkan';
        default:                    return 'Unknown';
    }
}

export default function MyOrdersPage({ orders }: Props) {
    const active = orders.filter(o => o.progress_status !== 'completed' && o.progress_status !== 'cancelled');
    const history = orders.filter(o => o.progress_status === 'completed' || o.progress_status === 'cancelled');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Head title="Riwayat Pesanan - Coffee Shop" />
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-label-sm text-foreground/50 uppercase">
                    <Link href="/coffee-shop" className="hover:text-primary transition-colors">
                        ← Coffee Shop
                    </Link>
                    <span>›</span>
                    <span className="text-foreground font-semibold">Riwayat Pesanan</span>
                </div>

                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-h2 text-super-black">Riwayat Pesanan</h1>
                        <p className="text-body-l text-foreground/60 mt-1">Lihat semua pesanan Anda di Venus Coffee.</p>
                    </div>
                    <Link
                        href="/coffee-shop"
                        className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-full text-label-sm font-bold hover:bg-secondary/90 transition-all shadow-md"
                        >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                            Tambah Pesanan
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-card border border-border rounded-venus p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4 text-foreground/30">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                        <p className="text-h4 text-super-black">Belum Ada Pesanan</p>
                        <p className="text-body-reg text-foreground/50 mt-2">Yuk, cobain kopi dan cemilan terbaik kami!</p>
                        <Link href="/coffee-shop" className="mt-5 inline-block bg-super-black text-white px-6 py-3 rounded-full text-label-sm font-bold hover:bg-super-black/80 transition-all">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Active Orders */}
                        {active.length > 0 && (
                            <div>
                                <h2 className="text-h4 text-super-black mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    Pesanan Aktif
                                </h2>
                                <div className="space-y-3">
                                    {active.map(o => (
                                        <OrderCard key={o.id} order={o} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* History */}
                        {history.length > 0 && (
                            <div>
                                <h2 className="text-h4 text-super-black mb-4 text-foreground/50">Riwayat</h2>
                                <div className="space-y-3 opacity-80">
                                    {history.map(o => (
                                        <OrderCard key={o.id} order={o} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

function OrderCard({ order }: { order: Order }) {
    const isActive = order.progress_status !== 'completed' && order.progress_status !== 'cancelled';
    const dateStr = new Date(order.created_at).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return 'Rp' + numPrice.toLocaleString('id-ID');
    };

    const topItem = order.items[0];
    const itemDesc = order.items.length > 1 
        ? `${topItem?.name} & ${order.items.length - 1} item lainnya`
        : topItem?.name || 'Pesanan';

    return (
        <Link
            href={`/coffee-shop/tracking/${order.order_code}`}
            className="block bg-card border border-border rounded-venus p-5 hover:border-primary/40 hover:shadow-md transition-all group"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        order.progress_status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        order.progress_status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-primary/10 text-primary'
                    }`}>
                        {order.progress_status === 'completed' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : order.progress_status === 'cancelled' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-h4 text-super-black group-hover:text-primary transition-colors">{order.order_code}</p>
                            {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </div>
                        <p className="text-body-reg text-foreground/60 mt-0.5">{itemDesc}</p>
                        <p className="text-body-reg text-foreground/40 text-sm">{dateStr}</p>
                    </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm font-semibold ${statusColor(order.progress_status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(order.progress_status)}`} />
                        {formatStatus(order.progress_status)}
                    </span>
                    <span className="text-body-m font-semibold text-foreground/60">
                        {formatPrice(order.total)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
