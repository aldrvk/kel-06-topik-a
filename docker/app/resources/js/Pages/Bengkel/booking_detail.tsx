import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingData {
    serviceId: string;
    serviceName: string;
    serviceSubtitle: string;
    servicePrice: number;
    serviceDuration: string;
    serviceFeatures: string[];
    vehicleClass: string;
    licensePlate: string;
    appointmentDate: string;
    appointmentIso: string;
    timeSlot: string;
    bookingId: string;
    createdAt: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const CarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
        <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ClockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

const SparklesIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);

// ─── Service fee config ───────────────────────────────────────────────────────

const SERVICE_FEE = 5000;

// ─── Step Indicator ───────────────────────────────────────────────────────────

function BookingProgress({ step }: { step: number }) {
    const steps = ['DETAIL', 'RINGKASAN', 'KONFIRMASI'];
    return (
        <div className="flex items-center gap-0">
            {steps.map((label, idx) => {
                const isActive = idx === step;
                const isDone = idx < step;
                return (
                    <React.Fragment key={label}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all text-label-sm font-bold ${
                                isDone ? 'bg-secondary border-secondary text-secondary-foreground' :
                                isActive ? 'bg-primary border-primary text-primary-foreground' :
                                'bg-surface border-border text-foreground/40'
                            }`}>
                                {isDone ? <CheckIcon /> : idx + 1}
                            </div>
                            <span className={`text-label-sm whitespace-nowrap ${isActive ? 'text-primary font-bold' : isDone ? 'text-secondary' : 'text-foreground/40'}`}>
                                {label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-5 mx-2 transition-all ${isDone ? 'bg-secondary' : 'bg-border'}`} style={{ minWidth: '60px' }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingDetail() {
    const [booking, setBooking] = useState<BookingData | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem('bengkel_booking');
        if (raw) {
            setBooking(JSON.parse(raw));
        } else {
            router.visit('/bengkel');
        }
    }, []);

    if (!booking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-body-m text-foreground/60">Memuat data booking…</p>
                </div>
            </div>
        );
    }

    const total = booking.servicePrice + SERVICE_FEE;

    const handleConfirm = () => {
        setIsConfirming(true);
        // Mark as confirmed
        const confirmed = { ...booking, confirmed: true };
        localStorage.setItem('bengkel_booking', JSON.stringify(confirmed));
        setTimeout(() => {
            router.visit('/bengkel/booking-receipt');
        }, 600);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Head title="Detail Booking – bengkel" />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-label-sm text-foreground/50 uppercase">
                    <Link href="/bengkel" className="hover:text-primary transition-colors flex items-center gap-1.5">
                        <ArrowLeftIcon /> bengkel
                    </Link>
                    <span>›</span>
                    <span className="text-foreground font-semibold">Detail Booking</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <span className="inline-block bg-primary/15 text-primary text-label-sm px-3 py-1 rounded-full mb-3 uppercase font-semibold">
                        Tinjau Pesanan
                    </span>
                    <h1 className="text-h2 text-super-black">Ringkasan Booking</h1>
                    <p className="text-body-l text-foreground/60 mt-1">
                        Verifikasi detail layanan Anda sebelum kami konfirmasi jadwal.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── LEFT PANEL ─────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Selected Service */}
                        <div className="bg-card border border-border rounded-venus p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-primary"><SparklesIcon /></span>
                                <h2 className="text-h4 text-super-black">Layanan Dipilih</h2>
                            </div>

                            <div className="flex items-start gap-5">
                                {/* Icon visual */}
                                <div className="w-20 h-20 rounded-venus bg-secondary/10 border border-border flex items-center justify-center shrink-0">
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                                        <path d="M3 12l9-9 9 9" /><path d="M9 21V12h6v9" />
                                        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
                                        <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
                                    </svg>
                                </div>

                                <div className="flex-grow">
                                    <h3 className="text-h3 text-primary">{booking.serviceName}</h3>
                                    <p className="text-body-reg text-foreground/60 mt-1">{booking.serviceSubtitle}</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {booking.serviceFeatures.map(f => (
                                            <span key={f} className="bg-surface border border-border text-label-sm px-3 py-1 rounded-full text-foreground">
                                                {f}
                                            </span>
                                        ))}
                                        <span className="bg-surface border border-border text-label-sm px-3 py-1 rounded-full text-foreground">
                                            {booking.serviceDuration}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-card-title text-super-black">
                                        Rp{booking.servicePrice.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle + Schedule */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            {/* Vehicle Info */}
                            <div className="bg-card border border-border rounded-venus p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-primary"><CarIcon /></span>
                                    <h3 className="text-h4 text-super-black">Info Kendaraan</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-label-sm text-foreground/50 uppercase">Nomor Plat</p>
                                        <p className="text-h3 text-super-black mt-0.5">{booking.licensePlate}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-foreground/50 uppercase">Kelas Kendaraan</p>
                                        <p className="text-h4 text-super-black mt-0.5">{booking.vehicleClass}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="bg-card border border-border rounded-venus p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-primary"><CalendarIcon /></span>
                                    <h3 className="text-h4 text-super-black">Jadwal</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-label-sm text-foreground/50 uppercase">Tanggal Perjanjian</p>
                                        <p className="text-h4 text-super-black mt-0.5 leading-snug">{booking.appointmentDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-foreground/50 uppercase">Slot Waktu</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-primary"><ClockIcon /></span>
                                            <p className="text-h4 text-super-black">{booking.timeSlot} WIB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Progress */}
                        <div className="bg-card border border-border rounded-venus p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                <h3 className="text-h4 text-super-black">Progress Booking</h3>
                            </div>
                            <BookingProgress step={1} />
                        </div>
                    </div>

                    {/* ── RIGHT SIDEBAR ──────────────────────────────────── */}
                    <div className="lg:sticky lg:top-24 self-start space-y-5">

                        {/* Order Summary */}
                        <div className="bg-card border border-border rounded-venus p-5">
                            <h3 className="text-card-title text-super-black mb-5">Ringkasan Pesanan</h3>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-body-reg text-foreground/70">{booking.serviceName}</span>
                                    <span className="text-body-m font-semibold text-foreground">Rp{booking.servicePrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-body-reg text-foreground/70">Biaya Layanan</span>
                                    <span className="text-body-m font-semibold text-foreground">Rp{SERVICE_FEE.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-h4 text-super-black">Total</span>
                                    <span className="text-h3 text-primary">
                                        Rp{total.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <p className="text-body-reg text-foreground/50 mt-1">Tidak ada pembayaran di muka</p>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={isConfirming}
                                className="w-full bg-secondary hover:bg-secondary/90 disabled:opacity-70 text-secondary-foreground h-14 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg text-label-sm tracking-widest font-bold"
                            >
                                {isConfirming ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                                        Memproses…
                                    </>
                                ) : (
                                    <>
                                        Konfirmasi Booking
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            <p className="text-body-reg text-foreground/50 text-center mt-3">
                                Dengan mengkonfirmasi, Anda menyetujui{' '}
                                <Link href="#" className="text-primary underline">Syarat Layanan</Link>
                                {' '}kami.
                            </p>
                        </div>

                        {/* Booking ID */}
                        <div className="bg-surface border border-border rounded-venus p-4">
                            <p className="text-label-sm text-foreground/50 uppercase mb-1">ID Booking</p>
                            <p className="text-card-title text-super-black">{booking.bookingId}</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
