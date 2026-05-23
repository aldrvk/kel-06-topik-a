import React, { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Booking {
    id: number;
    booking_code: string;
    service_name: string;
    service_subtitle: string;
    service_price: number;
    service_duration: string;
    status: string;
    progress_label: string;
    progress_step: number;
    stall: string | null;
    queue_position: number | null;
    admin_notes: string | null;
    verified_at: string | null;
    TV_assigned_at: string | null;
    done_at: string | null;
    created_at: string;
}

interface Props {
    booking: Booking;
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
        description: 'Sambil nunggu giliran, cek koleksi pod system & liquid terbaru di Venus Vape Store.',
        cta: 'Kunjungi Vape Store',
        href: '/vape-store',
        bgGradient: 'from-violet-600 via-purple-700 to-indigo-800',
        accentColor: 'bg-violet-400 hover:bg-violet-300',
    },
    {
        id: 'coffee',
        emoji: '☕',
        badge: 'COFFEE SHOP',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
        title: 'Ngopi Dulu?',
        highlight: 'Venus Coffee',
        description: 'Nikmati segelas espresso artisan sambil menunggu giliran bermain.',
        cta: 'Lihat Menu Coffee',
        href: '#',
        bgGradient: 'from-amber-700 via-orange-800 to-red-900',
        accentColor: 'bg-amber-400 hover:bg-amber-300',
    },
    {
        id: 'bengkel',
        emoji: '🔧',
        badge: 'BENGKEL',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
        title: 'Service Berkala',
        highlight: 'Venus Bengkel',
        description: 'Kendaraan perlu perawatan? Yuk lanjut cek kondisi mesin & ganti oli di bengkel kami.',
        cta: 'Booking Service',
        href: '#',
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
        description: 'Ajak teman main PS5 di sesi berikutnya! Tersedia ruangan privat ber-AC.',
        cta: 'Booking PS Sekarang',
        href: '#',
        bgGradient: 'from-emerald-600 via-teal-700 to-cyan-800',
        accentColor: 'bg-emerald-400 hover:bg-emerald-300',
    },
    {
        id: 'membership',
        emoji: '⭐',
        badge: 'MEMBERSHIP',
        badgeColor: 'bg-primary/20 text-primary border-primary/30',
        title: 'Cuci ke-5',
        highlight: 'GRATIS!',
        description: 'Daftar Venus Membership & dapatkan bonus spesial + diskon 15% semua layanan.',
        cta: 'Daftar Membership',
        href: '#',
        bgGradient: 'from-secondary via-teal-800 to-emerald-900',
        accentColor: 'bg-primary hover:bg-primary/80',
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
                    {/* Top row: badge + close */}
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

                    {/* Emoji */}
                    <div className="text-7xl mb-6 transform hover:scale-110 transition-transform duration-300 drop-shadow-lg">{ad.emoji}</div>

                    {/* Title */}
                    <h3 className="text-white text-3xl md:text-4xl font-extrabold leading-tight">
                        {ad.title}{' '}
                        <span className="text-primary">{ad.highlight}</span>
                    </h3>
                    <p className="text-white/80 text-base md:text-lg mt-4 leading-relaxed max-w-md">
                        {ad.description}
                    </p>

                    {/* CTA */}
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
        key: 'pending',
        label: 'Menunggu Verifikasi',
        desc: 'Booking Anda sedang ditinjau oleh admin.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    {
        key: 'in_queue',
        label: 'Dalam Antrian',
        desc: 'Menunggu ruang TV tersedia.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
        ),
    },
    {
        key: 'playing',
        label: 'Sedang Bermain',
        desc: 'Sesi bermain Anda sedang berlangsung.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
    },
    {
        key: 'done',
        label: 'Selesai!',
        desc: 'Sesi bermain Anda telah selesai.',
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
        case 'pending':   return 'text-amber-500 bg-amber-50 border-amber-200';
        case 'verified':  return 'text-primary bg-primary/10 border-primary/30';
        case 'in_queue':  return 'text-purple-500 bg-purple-50 border-purple-200';
        case 'playing':   return 'text-primary bg-primary/10 border-primary/30';
        case 'done':      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
        default:          return 'text-foreground/50 bg-surface border-border';
    }
}

function statusDotColor(status: string): string {
    switch (status) {
        case 'pending':   return 'bg-amber-400';
        case 'verified':  return 'bg-primary animate-pulse';
        case 'in_queue':  return 'bg-purple-500';
        case 'playing':   return 'bg-primary animate-pulse';
        case 'done':      return 'bg-emerald-500';
        case 'cancelled': return 'bg-red-500';
        default:          return 'bg-foreground/30';
    }
}

function getStepIndex(status: string): number {
    switch (status) {
        case 'pending':   return 0;
        case 'verified':  return 1;
        case 'in_queue':  return 1;
        case 'playing':   return 2;
        case 'done':      return 3;
        case 'cancelled': return -1;
        default:          return 0;
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

export default function TrackingPage({ booking: initialBooking, showAd: shouldShowAd }: Props) {
    const [booking, setBooking] = useState(initialBooking);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isTerminal = booking.status === 'done' || booking.status === 'cancelled';

    // Ad state
    const [adOpen, setAdOpen] = useState(false);
    const [currentAd, setCurrentAd] = useState<PromoAd | null>(null);
    const [adCountdown, setAdCountdown] = useState(3);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const adTriggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Optimized Ad Logic: 
    // Now fully random. NO immediate ad on reload or after booking.
    useEffect(() => {
        const scheduleFirstAd = () => {
            // First ad will appear after a random delay of 1.5 to 3 minutes
            // This prevents "ad on every reload" and "immediate ad after booking"
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

    // Handle ad closure to schedule the NEXT periodic ad
    const handleAdClose = () => {
        setAdOpen(false);
        // Next ads will appear every 2 to 4 minutes randomly while the page is open
        const nextDelay = Math.floor(Math.random() * (240000 - 120000 + 1)) + 120000;
        adTriggerTimerRef.current = setTimeout(() => {
            if (isTerminal) return;
            setCurrentAd(getRandomAd());
            setAdOpen(true);
        }, nextDelay);
    };

    // Countdown logic for the open ad
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
        verified:  { msg: 'Booking Anda dikonfirmasi! Menunggu TV tersedia...', type: 'success' },
        in_queue:  { msg: 'Anda masuk ke antrian bermain.', type: 'default' },
        playing:   { msg: 'Waktu bermain Anda sudah dimulai!', type: 'default' },
        done:      { msg: 'Sesi bermain selesai! Terima kasih.', type: 'success' },
        cancelled: { msg: 'Booking Anda dibatalkan.', type: 'error' },
    };

    useEffect(() => {
        if (isTerminal) return;

        const poll = async () => {
            try {
                const res = await fetch(`/api/rental-ps/status/${booking.booking_code}`, {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.status !== booking.status) {
                    setBooking(prev => ({
                        ...prev,
                        status: data.status,
                        progress_label: data.progressLabel,
                        progress_step: data.progressStep,
                        stall: data.stall,
                        queue_position: data.queue_position,
                        admin_notes: data.admin_notes,
                    }));

                    const toastCfg = STATUS_TOAST[data.status];
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
    }, [booking.booking_code, booking.status, isTerminal]);

    const currentStepIndex = getStepIndex(booking.status);
    const SERVICE_FEE = 5000;
    const total = booking.service_price + SERVICE_FEE;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Head title={`Tracking ${booking.booking_code} – RentalPs`} />
            
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">

                <div className="flex items-center gap-2 mb-6 text-label-sm text-foreground/50 uppercase">
                    <Link href="/rental-ps" className="hover:text-primary transition-colors">
                        ← RentalPs
                    </Link>
                    <span>›</span>
                    <span className="text-foreground font-semibold">Tracking Booking</span>
                </div>

                <div className={`rounded-venus p-6 mb-8 border ${
                    booking.status === 'done' ? 'bg-emerald-50 border-emerald-200' :
                    booking.status === 'cancelled' ? 'bg-red-50 border-red-200' :
                    'bg-card border-border'
                }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-label-sm text-foreground/50 uppercase mb-1">ID Booking</p>
                            <h1 className="text-h2 text-super-black">{booking.booking_code}</h1>
                            <p className="text-body-reg text-foreground/60 mt-1">{booking.service_name} · {booking.service_duration}</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-label-sm font-bold ${statusColor(booking.status)}`}>
                                <span className={`w-2 h-2 rounded-full ${statusDotColor(booking.status)}`} />
                                {booking.progress_label}
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
                        {booking.status === 'cancelled' ? (
                            <div className="bg-red-50 border border-red-200 rounded-venus p-8 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </div>
                                <h2 className="text-h3 text-red-700 font-bold">Booking Dibatalkan</h2>
                                <p className="text-body-l text-red-600/80 mt-2">Maaf, booking Anda telah dibatalkan oleh pihak admin.</p>
                                
                                {booking.admin_notes && (
                                    <div className="mt-6 p-4 bg-white/50 border border-red-200 rounded-venus w-full max-w-md">
                                        <p className="text-label-sm text-red-500 uppercase font-bold mb-1">Alasan Pembatalan:</p>
                                        <p className="text-body-reg text-red-700 italic">"{booking.admin_notes}"</p>
                                    </div>
                                )}
                                
                                <Link href="/rental-ps" className="mt-8 bg-red-600 text-white px-6 py-3 rounded-full text-label-sm font-bold hover:bg-red-700 transition-all shadow-lg">
                                    Booking Ulang
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="bg-card border border-border rounded-venus p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                        </svg>
                                        <h2 className="text-h4 text-super-black">Progress Pengerjaan</h2>
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

                                {booking.stall && (
                                    <div className="bg-primary/5 border border-primary/20 rounded-venus p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-label-sm text-foreground/50 uppercase">Ruang TV</p>
                                            <p className="text-h4 text-super-black">{booking.stall}</p>
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'in_queue' && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-venus p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 shrink-0">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                                                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-label-sm text-foreground/50 uppercase">Posisi Antrian</p>
                                            <p className="text-h4 text-purple-700">Menunggu TV tersedia</p>
                                            <p className="text-body-reg text-foreground/50 mt-0.5">Sesi Anda akan otomatis dipindahkan saat TV kosong.</p>
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'done' && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-venus p-5 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-h4 text-emerald-700 font-bold">Sesi Bermain Selesai!</p>
                                            <p className="text-body-reg text-emerald-600 mt-1">Terima kasih telah bermain di Venus Rental PS. Sampai jumpa lagi!</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-card border border-border rounded-venus p-5">
                            <p className="text-label-sm text-foreground/50 uppercase mb-3">Detail Layanan</p>
                            <p className="text-h4 text-super-black">{booking.service_name}</p>
                            <p className="text-body-reg text-foreground/60">{booking.service_subtitle}</p>
                            <div className="mt-3 pt-3 border-t border-border space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-body-reg text-foreground/60">Harga</span>
                                    <span className="text-body-m font-semibold">Rp{booking.service_price.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-body-reg text-foreground/60">Biaya Layanan</span>
                                    <span className="text-body-m font-semibold">Rp{SERVICE_FEE.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border">
                                    <span className="text-h4 text-super-black">Total</span>
                                    <span className="text-h4 text-primary">Rp{total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-venus p-5">
                            <p className="text-label-sm text-foreground/50 uppercase mb-3">Durasi</p>
                            <p className="text-h3 text-super-black">{booking.service_duration}</p>
                            <p className="text-body-reg text-foreground/60">{booking.service_subtitle}</p>
                        </div>

                        <div className="bg-card border border-border rounded-venus p-5">
                            <p className="text-label-sm text-foreground/50 uppercase mb-3">Waktu Booking</p>
                            <p className="text-h4 text-super-black">{booking.created_at}</p>
                            {booking.verified_at && <p className="text-body-reg text-foreground/50 mt-1">Dikonfirmasi: {booking.verified_at}</p>}
                            {booking.done_at && <p className="text-body-reg text-emerald-600 mt-1">Selesai: {booking.done_at}</p>}
                            {booking.status === 'cancelled' && <p className="text-body-reg text-red-600 mt-1">Dibatalkan</p>}
                        </div>

                        <Link href="/rental-ps/my-bookings" className="block text-center text-label-sm text-primary hover:text-primary/80 font-semibold transition-colors py-2">
                            ← Lihat Semua Booking Saya
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
