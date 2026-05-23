import React, { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import toast from 'react-hot-toast';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

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
    progress_status: string;
    admin_notes: string | null;
    done_at: string | null;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: Order;
    showAd?: boolean;
}

// ─── Progress Steps ───────────────────────────────────────────────────────────

const STEPS = [
    {
        key: 'menunggu_pembayaran',
        label: 'Menunggu Pembayaran',
        desc: 'Silakan selesaikan pembayaran di kasir.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
        ),
    },
    {
        key: 'ready_pickup',
        label: 'Pesanan Bisa Diambil',
        desc: 'Tunjukkan ID Pesanan ini ke Kasir untuk mengambil barang Anda.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
    },
    {
        key: 'completed',
        label: 'Selesai!',
        desc: 'Terima kasih telah berbelanja di Venus Vape Store.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
    },
];

// ─── Status helpers ──────────────────────────────────────────────────────────

function statusColor(status: string): string {
    switch (status) {
        case 'menunggu_pembayaran': return 'text-amber-500 bg-amber-50 border-amber-200';
        case 'pending':
        case 'processing':
        case 'ready':               return 'text-primary bg-primary/10 border-primary/30';
        case 'completed':           return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        case 'cancelled':           return 'text-red-600 bg-red-50 border-red-200';
        default:                    return 'text-foreground/50 bg-surface border-border';
    }
}

function statusDotColor(status: string): string {
    switch (status) {
        case 'menunggu_pembayaran': return 'bg-amber-400';
        case 'pending':
        case 'processing':
        case 'ready':               return 'bg-primary animate-pulse';
        case 'completed':           return 'bg-emerald-500';
        case 'cancelled':           return 'bg-red-500';
        default:                    return 'bg-foreground/30';
    }
}

function getStepIndex(status: string): number {
    switch (status) {
        case 'menunggu_pembayaran': return 0;
        case 'pending':
        case 'processing':
        case 'ready':               return 1;
        case 'completed':           return 2;
        case 'cancelled':           return -1;
        default:                    return 0;
    }
}

function getProgressLabel(status: string): string {
    switch (status) {
        case 'menunggu_pembayaran': return 'Menunggu Pembayaran';
        case 'pending':
        case 'processing':
        case 'ready':               return 'Bisa Diambil';
        case 'completed':           return 'Selesai';
        case 'cancelled':           return 'Dibatalkan';
        default:                    return 'Unknown';
    }
}

// ─── Component: Vertical Step ─────────────────────────────────────────────────

function ProgressStep({
    step, currentStep, stepIndex
}: { step: typeof STEPS[number]; currentStep: number; stepIndex: number }) {
    const isDone = stepIndex < currentStep;
    const isActive = stepIndex === currentStep;

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                    isDone   ? 'bg-secondary border-secondary text-white' :
                    isActive ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' :
                               'bg-surface border-border text-foreground/30'
                }`}>
                    {isDone ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : step.icon}
                </div>
                {stepIndex < STEPS.length - 1 && (
                    <div className={`w-0.5 h-10 mt-1 transition-all ${isDone ? 'bg-secondary' : 'bg-border'}`} />
                )}
            </div>
            <div className="pb-8">
                <p className={`font-bold text-label-sm md:text-body-m ${isActive ? 'text-primary' : isDone ? 'text-super-black' : 'text-foreground/40'}`}>
                    {step.label}
                </p>
                <p className={`text-body-reg mt-0.5 ${isActive ? 'text-foreground/80' : 'text-foreground/40'}`}>
                    {step.desc}
                </p>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TrackingPage({ order: initialOrder }: Props) {
    const [order, setOrder] = useState(initialOrder);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isTerminal = order.progress_status === 'completed' || order.progress_status === 'cancelled';

    const STATUS_TOAST: Partial<Record<string, { msg: string; type: 'success' | 'error' | 'loading' | 'default' }>> = {
        pending:    { msg: 'Pembayaran diterima! Silakan ambil pesanan Anda.', type: 'success' },
        processing: { msg: 'Pesanan siap diambil di Kasir.', type: 'success' },
        ready:      { msg: 'Pesanan siap diambil di Kasir.', type: 'success' },
        completed:  { msg: 'Pesanan selesai. Terima kasih!', type: 'success' },
        cancelled:  { msg: 'Pesanan dibatalkan.', type: 'error' },
    };

    useEffect(() => {
        if (isTerminal) return;

        const poll = async () => {
            try {
                const res = await fetch(`/api/store/status/${order.order_code}`, {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (!res.ok) return;
                const data = await res.json();
                
                if (data.progress_status !== order.progress_status) {
                    setOrder(prev => ({
                        ...prev,
                        progress_status: data.progress_status,
                        admin_notes: data.admin_notes,
                    }));

                    const toastCfg = STATUS_TOAST[data.progress_status];
                    if (toastCfg) {
                        const opts = {
                            duration: 5000,
                            style: { borderRadius: '12px', background: '#1a1a2e', color: '#fff', padding: '14px 18px' },
                        };
                        if (toastCfg.type === 'success') toast.success(toastCfg.msg, opts);
                        else if (toastCfg.type === 'error') toast.error(toastCfg.msg, opts);
                        else toast(toastCfg.msg, opts);
                    }
                }
            } catch (_) { /* silent */ }
        };

        intervalRef.current = setInterval(poll, 10000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [order.order_code, order.progress_status, isTerminal]);

    const currentStepIndex = getStepIndex(order.progress_status);
    
    const handlePrintReceipt = () => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        iframe.src = `/vape-store/receipt?order_code=${order.order_code}&print=true`;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 10000);
    };
    
    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return 'Rp' + numPrice.toLocaleString('id-ID');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Head title={`Tracking ${order.order_code} – Vape Store`} />
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">

                <div className="flex items-center gap-2 mb-6 text-label-sm text-foreground/50 uppercase">
                    <Link href="/vape-store" className="hover:text-primary transition-colors">
                        ← Vape Store
                    </Link>
                    <span>›</span>
                    <span className="text-foreground font-semibold">Tracking Pesanan</span>
                </div>

                <div className={`rounded-venus p-6 mb-8 border ${
                    order.progress_status === 'completed' ? 'bg-emerald-50 border-emerald-200' :
                    order.progress_status === 'cancelled' ? 'bg-red-50 border-red-200' :
                    'bg-card border-border'
                }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-label-sm text-foreground/50 uppercase mb-1">ID Pesanan</p>
                            <h1 className="text-h2 text-super-black">{order.order_code}</h1>
                            <p className="text-body-reg text-foreground/60 mt-1">
                                {order.customer_name} · {order.items.length} Items
                            </p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-label-sm font-bold ${statusColor(order.progress_status)}`}>
                                <span className={`w-2 h-2 rounded-full ${statusDotColor(order.progress_status)}`} />
                                {getProgressLabel(order.progress_status)}
                            </span>
                            {!isTerminal && (
                                <p className="text-body-reg text-foreground/40 text-sm">
                                    Status otomatis diperbarui setiap 10 detik
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        
                        {/* Cancellation Banner */}
                        {order.progress_status === 'cancelled' ? (
                            <div className="bg-red-50 border border-red-200 rounded-venus p-8 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </div>
                                <h2 className="text-h3 text-red-700 font-bold">Pesanan Dibatalkan</h2>
                                <p className="text-body-l text-red-600/80 mt-2">Maaf, pesanan Anda telah dibatalkan.</p>
                                
                                {order.admin_notes && (
                                    <div className="mt-6 p-4 bg-white/50 border border-red-200 rounded-venus w-full max-w-md">
                                        <p className="text-label-sm text-red-500 uppercase font-bold mb-1">Catatan:</p>
                                        <p className="text-body-reg text-red-700 italic">"{order.admin_notes}"</p>
                                    </div>
                                )}
                                
                                <Link href="/vape-store" className="mt-8 bg-red-600 text-white px-6 py-3 rounded-full text-label-sm font-bold hover:bg-red-700 transition-all shadow-lg">
                                    Pesan Ulang
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="bg-card border border-border rounded-venus p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                        </svg>
                                        <h2 className="text-h4 text-super-black">Progress Pesanan</h2>
                                    </div>
                                    <div>
                                        {STEPS.map((step, idx) => (
                                            <ProgressStep
                                                key={step.key}
                                                step={step}
                                                currentStep={currentStepIndex}
                                                stepIndex={idx}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {['pending', 'processing', 'ready'].includes(order.progress_status) && (
                                    <div className="bg-primary/5 border border-primary/20 rounded-venus p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-h4 text-super-black font-bold">Yeay! Pesanan Siap Diambil</p>
                                            <p className="text-body-reg text-foreground/60 mt-0.5">Silakan tunjukkan ID Pesanan ke Kasir Vape Store.</p>
                                        </div>
                                    </div>
                                )}

                                {order.progress_status === 'completed' && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-venus p-5 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-h4 text-emerald-700 font-bold">Pesanan Telah Selesai</p>
                                            <p className="text-body-reg text-emerald-600 mt-1">Terima kasih telah berbelanja di Venus Vape Store.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-card border border-border rounded-venus p-5">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-label-sm text-foreground/50 uppercase">Detail Pesanan</p>
                                <button onClick={handlePrintReceipt} className="px-4 py-1.5 border border-border rounded-full text-label-sm hover:bg-surface transition-colors uppercase font-bold flex items-center gap-1.5 no-print">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                    Cetak
                                </button>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-start">
                                        <div className="flex gap-2 text-body-reg">
                                            <span className="font-bold text-super-black">{item.quantity}x</span>
                                            <span className="text-foreground/80">{item.name}</span>
                                        </div>
                                        <span className="text-body-reg font-semibold">
                                            {formatPrice(parseFloat(item.price) * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                                <span className="text-h4 text-super-black">Total Bayar</span>
                                <span className="text-h4 text-primary">{formatPrice(order.total)}</span>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-venus p-5">
                            <p className="text-label-sm text-foreground/50 uppercase mb-3">Informasi Pemesan</p>
                            <p className="text-h3 text-super-black mb-1">{order.customer_name}</p>
                            <p className="text-body-reg text-foreground/60 inline-flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                                Pembayaran: <span className="uppercase font-bold">{order.payment_method}</span>
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-venus p-5">
                            <p className="text-label-sm text-foreground/50 uppercase mb-3">Waktu Transaksi</p>
                            <p className="text-h4 text-super-black">
                                {new Date(order.created_at).toLocaleString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                            {order.done_at && <p className="text-body-reg text-emerald-600 mt-1">Diselesaikan: {new Date(order.done_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>}
                            {order.progress_status === 'cancelled' && <p className="text-body-reg text-red-600 mt-1">Dibatalkan</p>}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
