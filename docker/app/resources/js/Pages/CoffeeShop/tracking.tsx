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

// ─── Venus Hub Cross-Promo Ads ────────────────────────────────────────────────

interface PromoAd {
    id: string;
    emoji: string;
    badge: string;
    badgeColor: string;
    title: string;
    highlight: string;
    description: string;
    cta: string;
    href: string;
    bgGradient: string;
    accentColor: string;
}

const VENUS_ADS: PromoAd[] = [
    {
        id: 'vape',
        emoji: '💨',
        badge: 'VAPE STORE',
        badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
        title: 'Koleksi Premium',
        highlight: 'Vape & Liquid',
        description: 'Sambil nunggu kopi, cek koleksi pod system & liquid terbaru di Venus Vape Store.',
        cta: 'Kunjungi Vape Store',
        href: '/vape-store',
        bgGradient: 'from-violet-600 via-purple-700 to-indigo-800',
        accentColor: 'bg-violet-400 hover:bg-violet-300',
    },
    {
        id: 'doorsmeer',
        emoji: '🚗',
        badge: 'DOORSMEER',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        title: 'Cuci Mobil',
        highlight: 'Premium',
        description: 'Ngopi santai sambil nunggu mobil dicuci bersih. Yuk booking doorsmeer sekarang.',
        cta: 'Booking Doorsmeer',
        href: '/doorsmeer',
        bgGradient: 'from-blue-600 via-cyan-700 to-teal-800',
        accentColor: 'bg-blue-400 hover:bg-blue-300',
    },
    {
        id: 'bengkel',
        emoji: '🔧',
        badge: 'BENGKEL',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
        title: 'Service Berkala',
        highlight: 'Venus Bengkel',
        description: 'Pastikan kondisi mesin aman untuk perjalanan jauh. Cek di bengkel kami.',
        cta: 'Booking Service',
        href: '/bengkel',
        bgGradient: 'from-sky-600 via-blue-700 to-indigo-800',
        accentColor: 'bg-sky-400 hover:bg-sky-300',
    },
    {
        id: 'rental-ps',
        emoji: '🎮',
        badge: 'RENTAL PS',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
        title: 'Main PS5 Yuk!',
        highlight: 'Venus Gaming',
        description: 'Ajak teman main PS5 di ruangan privat ber-AC.',
        cta: 'Booking PS Sekarang',
        href: '/rental-ps',
        bgGradient: 'from-emerald-600 via-teal-700 to-cyan-800',
        accentColor: 'bg-emerald-400 hover:bg-emerald-300',
    },
];

function getRandomAd(): PromoAd {
    return VENUS_ADS[Math.floor(Math.random() * VENUS_ADS.length)];
}

function PromoPopup({
    ad,
    onClose,
    countdown,
}: {
    ad: PromoAd;
    onClose: () => void;
    countdown: number;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={countdown <= 0 ? onClose : undefined} />
            <div className={`relative w-full max-w-lg rounded-venus overflow-hidden shadow-2xl bg-gradient-to-br ${ad.bgGradient}`}
                 style={{ animation: 'fadeInScale 0.3s ease-out' }}>

                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5" />

                {/* Content */}
                <div className="relative p-8 md:p-10">
                    <div className="flex items-center justify-between mb-6">
                        <span className={`text-xs font-bold tracking-widest px-4 py-1.5 rounded-full border ${ad.badgeColor}`}>
                            {ad.badge}
                        </span>
                        <button
                            onClick={countdown <= 0 ? onClose : undefined}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white/60 transition-all ${
                                countdown > 0
                                    ? 'bg-white/10 cursor-not-allowed'
                                    : 'bg-white/10 hover:bg-white/20 cursor-pointer shadow-lg'
                            }`}
                        >
                            {countdown > 0 ? (
                                <span className="text-sm font-bold">{countdown}</span>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="text-7xl mb-6 transform hover:scale-110 transition-transform duration-300 drop-shadow-lg">{ad.emoji}</div>

                    <h3 className="text-white text-3xl md:text-4xl font-extrabold leading-tight">
                        {ad.title}{' '}
                        <span className="text-primary">{ad.highlight}</span>
                    </h3>
                    <p className="text-white/80 text-base md:text-lg mt-4 leading-relaxed max-w-md">
                        {ad.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-10">
                        <a
                            href={ad.href}
                            className={`flex-1 text-center py-4 rounded-full text-base font-bold text-super-black transition-all shadow-xl active:scale-95 ${ad.accentColor}`}
                        >
                            {ad.cta}
                        </a>
                        <button
                            onClick={countdown <= 0 ? onClose : undefined}
                            className={`flex-1 py-4 rounded-full text-base font-semibold border border-white/20 transition-all active:scale-95 ${
                                countdown > 0
                                    ? 'text-white/30 cursor-not-allowed'
                                    : 'text-white/70 hover:bg-white/10 cursor-pointer'
                            }`}
                        >
                            {countdown > 0 ? `Tunggu ${countdown}s...` : 'Tutup'}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

// ─── Progress Steps ───────────────────────────────────────────────────────────

const STEPS = [
    {
        key: 'menunggu_pembayaran',
        label: 'Menunggu Pembayaran',
        desc: 'Silakan selesaikan pembayaran pesanan Anda.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
        ),
    },
    {
        key: 'pending',
        label: 'Pesanan Diterima',
        desc: 'Pembayaran berhasil. Menunggu antrian barista.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        key: 'processing',
        label: 'Sedang Disiapkan',
        desc: 'Barista sedang meracik pesanan Anda dengan penuh cinta.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
            </svg>
        ),
    },
    {
        key: 'ready',
        label: 'Siap Diambil',
        desc: 'Pesanan sudah siap! Silakan ambil di area Pick-Up.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
    },
    {
        key: 'completed',
        label: 'Selesai!',
        desc: 'Terima kasih telah menikmati sajian Venus Coffee.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
    },
];

// ─── Status color helpers ──────────────────────────────────────────────────────

function statusColor(status: string): string {
    switch (status) {
        case 'menunggu_pembayaran': return 'text-amber-500 bg-amber-50 border-amber-200';
        case 'pending':             return 'text-blue-500 bg-blue-50 border-blue-200';
        case 'processing':          return 'text-purple-500 bg-purple-50 border-purple-200';
        case 'ready':               return 'text-primary bg-primary/10 border-primary/30';
        case 'completed':           return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        case 'cancelled':           return 'text-red-600 bg-red-50 border-red-200';
        default:                    return 'text-foreground/50 bg-surface border-border';
    }
}

function statusDotColor(status: string): string {
    switch (status) {
        case 'menunggu_pembayaran': return 'bg-amber-400';
        case 'pending':             return 'bg-blue-400';
        case 'processing':          return 'bg-purple-500 animate-pulse';
        case 'ready':               return 'bg-primary animate-pulse';
        case 'completed':           return 'bg-emerald-500';
        case 'cancelled':           return 'bg-red-500';
        default:                    return 'bg-foreground/30';
    }
}

function getStepIndex(status: string): number {
    switch (status) {
        case 'menunggu_pembayaran': return 0;
        case 'pending':             return 1;
        case 'processing':          return 2;
        case 'ready':               return 3;
        case 'completed':           return 4;
        case 'cancelled':           return -1;
        default:                    return 0;
    }
}

function getProgressLabel(status: string): string {
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

// ─── Component: Vertical Step ─────────────────────────────────────────────────

function ProgressStep({
    step, currentStep,
}: { step: typeof STEPS[number]; currentStep: number; stepIndex: number }) {
    const allKeys = STEPS.map(s => s.key);
    const thisIndex = allKeys.indexOf(step.key);
    const isDone = thisIndex < currentStep;
    const isActive = thisIndex === currentStep;

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
                {thisIndex < STEPS.length - 1 && (
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

export default function TrackingPage({ order: initialOrder, showAd: shouldShowAd }: Props) {
    const [order, setOrder] = useState(initialOrder);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isTerminal = order.progress_status === 'completed' || order.progress_status === 'cancelled';

    // Ad state
    const [adOpen, setAdOpen] = useState(false);
    const [currentAd, setCurrentAd] = useState<PromoAd | null>(null);
    const [adCountdown, setAdCountdown] = useState(3);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const adTriggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Optimized Ad Logic
    useEffect(() => {
        const scheduleFirstAd = () => {
            const initialDelay = Math.floor(Math.random() * (180000 - 90000 + 1)) + 90000;
            
            adTriggerTimerRef.current = setTimeout(() => {
                if (isTerminal) return;
                setCurrentAd(getRandomAd());
                setAdOpen(true);
            }, initialDelay);
        };

        scheduleFirstAd();

        return () => {
            if (adTriggerTimerRef.current) clearTimeout(adTriggerTimerRef.current);
        };
    }, [isTerminal]);

    const handleAdClose = () => {
        setAdOpen(false);
        const nextDelay = Math.floor(Math.random() * (240000 - 120000 + 1)) + 120000;
        adTriggerTimerRef.current = setTimeout(() => {
            if (isTerminal) return;
            setCurrentAd(getRandomAd());
            setAdOpen(true);
        }, nextDelay);
    };

    useEffect(() => {
        if (!adOpen) return;
        setAdCountdown(3);
        countdownRef.current = setInterval(() => {
            setAdCountdown(prev => {
                if (prev <= 1) {
                    if (countdownRef.current) clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }, [adOpen]);

    const STATUS_TOAST: Partial<Record<string, { msg: string; type: 'success' | 'error' | 'loading' | 'default' }>> = {
        pending:    { msg: 'Pembayaran diterima! Menunggu barista...', type: 'success' },
        processing: { msg: 'Pesanan mulai diracik!', type: 'default' },
        ready:      { msg: 'Pesanan Anda siap diambil!', type: 'success' },
        completed:  { msg: 'Pesanan selesai. Nikmati kopi Anda!', type: 'success' },
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
        iframe.src = `/coffee-shop/receipt?order_code=${order.order_code}&print=true`;
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
            <Head title={`Tracking ${order.order_code} – Coffee Shop`} />
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">

                <div className="flex items-center gap-2 mb-6 text-label-sm text-foreground/50 uppercase">
                    <Link href="/coffee-shop" className="hover:text-primary transition-colors">
                        ← Coffee Shop
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
                                <p className="text-body-l text-red-600/80 mt-2">Maaf, pesanan Anda telah dibatalkan oleh kasir/barista.</p>
                                
                                {order.admin_notes && (
                                    <div className="mt-6 p-4 bg-white/50 border border-red-200 rounded-venus w-full max-w-md">
                                        <p className="text-label-sm text-red-500 uppercase font-bold mb-1">Catatan:</p>
                                        <p className="text-body-reg text-red-700 italic">"{order.admin_notes}"</p>
                                    </div>
                                )}
                                
                                <Link href="/coffee-shop" className="mt-8 bg-red-600 text-white px-6 py-3 rounded-full text-label-sm font-bold hover:bg-red-700 transition-all shadow-lg">
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

                                {order.progress_status === 'ready' && (
                                    <div className="bg-primary/5 border border-primary/20 rounded-venus p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-h4 text-super-black font-bold">Yeay! Pesanan Siap Diambil</p>
                                            <p className="text-body-reg text-foreground/60 mt-0.5">Silakan tunjukkan ID Pesanan ke Barista atau area Pick-Up.</p>
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
                                            <p className="text-body-reg text-emerald-600 mt-1">Terima kasih telah mengunjungi Venus Coffee. Sampai jumpa kembali!</p>
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

                        <Link href="/coffee-shop/my-orders" className="block text-center text-label-sm text-primary hover:text-primary/80 font-semibold transition-colors py-2">
                            ← Lihat Semua Pesanan Saya
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Ad Popup */}
            {adOpen && currentAd && (
                <PromoPopup
                    ad={currentAd}
                    onClose={handleAdClose}
                    countdown={adCountdown}
                />
            )}
        </div>
    );
}
