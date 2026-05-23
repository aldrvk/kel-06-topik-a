import React, { useEffect, useState } from 'react';
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
    unit: string;
    payment_method: string;
    total: string;
    status: string;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: Order | null;
}

export default function Receipt({ order }: Props) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        const params = new URLSearchParams(window.location.search);
        if (params.get('print') === 'true') {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, []);

    if (!isLoaded) return null;

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <p className="text-h4 text-foreground/50 mb-4">Pesanan tidak ditemukan</p>
                <Link href="/vape-store" className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold">Kembali Belanja</Link>
            </div>
        );
    }

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return 'Rp' + numPrice.toLocaleString('id-ID');
    };

    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const urlStatus = params.get('status');
    const isSelesai = order.status === 'BERHASIL' || urlStatus === 'success' || urlStatus === 'settlement';
    const date = new Date(order.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Head title="Vape Store - Bukti Pesanan" />
            <Navbar />

            <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16 w-full">
                <div className="bg-card rounded-venus border border-border shadow-2xl overflow-hidden">
                    {/* Receipt Header */}
                    <div className="bg-primary p-5 sm:p-8 text-center text-primary-foreground">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 no-print">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h1 className="text-h2 uppercase tracking-widest font-bold">
                            {isSelesai ? 'PESANAN SELESAI' : 'PESANAN DITERIMA'}
                        </h1>
                        <p className="text-primary-foreground/80 mt-2">
                            {isSelesai 
                                ? 'Pembayaran berhasil. Terima kasih atas pembelian Anda.' 
                                : 'Silakan lakukan pembayaran di kasir untuk menyelesaikan pesanan.'}
                        </p>
                    </div>

                    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                        {/* Order Info */}
                        <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-border pb-8">
                            <div>
                                <p className="text-label-sm text-foreground/40 uppercase tracking-widest mb-1">Nomor Pesanan</p>
                                <p className="text-h3 text-super-black">{order.order_code}</p>
                            </div>
                            <div className="md:text-right">
                                <p className="text-label-sm text-foreground/40 uppercase tracking-widest mb-1">Tanggal</p>
                                <p className="text-body-m font-bold text-super-black">{date}</p>
                            </div>
                        </div>

                        {/* Customer & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-border pb-8">
                            <div>
                                <p className="text-label-sm text-foreground/40 uppercase tracking-widest mb-1">Pelanggan</p>
                                <p className="text-body-m font-bold text-super-black">{order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-label-sm text-foreground/40 uppercase tracking-widest mb-1">Pembayaran</p>
                                <p className="text-body-m font-bold text-super-black uppercase">{order.payment_method}</p>
                            </div>
                            <div>
                                <p className="text-label-sm text-foreground/40 uppercase tracking-widest mb-1">Unit</p>
                                <p className="text-body-m font-bold text-super-black">Vape Store</p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-4">
                            <p className="text-label-sm text-foreground/40 uppercase tracking-widest">Rincian Produk</p>
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0 text-primary font-bold">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            <p className="text-body-m font-bold text-super-black">{item.name}</p>
                                            <p className="text-label-sm text-foreground/50">@ {formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                    <span className="text-body-m font-bold text-super-black">{formatPrice(parseFloat(item.price) * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Subtotal & Total */}
                        <div className="border-t-2 border-dashed border-border pt-6 mt-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-body-m text-foreground/60">Subtotal ({order.items.reduce((sum, i) => sum + i.quantity, 0)} item)</span>
                                <span className="text-body-m text-super-black">{formatPrice(order.total)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-border">
                                <span className="text-h3 text-super-black uppercase tracking-widest font-bold">Total Pembayaran</span>
                                <span className="text-h2 text-secondary">{formatPrice(order.total)}</span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="text-center py-2">
                            <span className={`inline-block px-6 py-2 rounded-full text-label-sm font-bold uppercase tracking-widest ${
                                isSelesai 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                                {isSelesai ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}
                            </span>
                        </div>

                        {/* Footer Info */}
                        <div className="bg-surface p-6 rounded-2xl border border-border text-center space-y-2">
                            <p className="text-body-reg text-foreground/60">
                                {isSelesai 
                                    ? 'Tunjukkan bukti pesanan ini kepada petugas kami di toko saat pengambilan.' 
                                    : 'Tunjukkan nomor pesanan ini kepada kasir untuk memproses pesanan dan melakukan pembayaran.'}
                            </p>
                            <div className="pt-4 flex flex-wrap justify-center gap-4 no-print">
                                <button onClick={() => window.print()} className="px-6 py-2 border border-border rounded-full text-label-sm hover:bg-white transition-colors uppercase font-bold text-super-black">Cetak</button>
                                <Link href={`/vape-store/tracking/${order.order_code}`} className="px-6 py-2 bg-secondary text-white rounded-full text-label-sm hover:bg-secondary/90 transition-colors uppercase font-bold">Lacak Pesanan</Link>
                                <Link href="/vape-store" className="px-6 py-2 bg-super-black text-white rounded-full text-label-sm hover:bg-super-black/80 transition-colors uppercase font-bold">Kembali Belanja</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
