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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
        <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

const MapPinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const HomeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

// ─── QR Code Placeholder ─────────────────────────────────────────────────────

function QRCodePlaceholder({ bookingId }: { bookingId: string }) {
    return (
        <div className="w-24 h-24 bg-secondary rounded-venus flex flex-col items-center justify-center gap-1 shrink-0 border border-border">
            {/* Simulated QR pattern */}
            <div className="grid grid-cols-5 gap-0.5 p-2">
                {Array.from({ length: 25 }).map((_, i) => {
                    const pattern = [1,1,1,0,1,1,0,1,0,1,1,1,1,0,0,1,0,0,0,1,1,1,1,1,1];
                    return (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-[1px] ${pattern[i] ? 'bg-secondary-foreground' : 'bg-secondary'}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ─── Success Confetti Dots ────────────────────────────────────────────────────

function SuccessIcon() {
    return (
        <div className="relative inline-flex items-center justify-center">
            {/* Pulse rings */}
            <span className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '1.5s' }} />
            <span className="absolute w-20 h-20 rounded-full bg-primary/15" />
            {/* Main icon */}
            <div className="relative w-16 h-16 rounded-full bg-secondary flex items-center justify-center shadow-lg shadow-secondary/30">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingReceipt() {
    const [booking, setBooking] = useState<BookingData | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem('rentalps_booking');
        if (raw) {
            const data = JSON.parse(raw);
            // If not confirmed, redirect back to detail
            if (!data.confirmed) {
                router.visit('/rental-ps/booking-detail');
                return;
            }
            setBooking(data);
        } else {
            router.visit('/rental-ps');
        }
    }, []);

    const handleDownload = () => {
        setIsPrinting(true);
        window.print();
        setTimeout(() => setIsPrinting(false), 1000);
    };

    const handleReturnHome = () => {
        localStorage.removeItem('rentalps_booking');
        router.visit('/rental-ps');
    };

    if (!booking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const SERVICE_FEE = 5000;
    const total = booking.servicePrice + SERVICE_FEE;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Head title="Booking Dikonfirmasi – rental-ps" />
            <Navbar />

            <main className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">

                {/* ── Success Header ─────────────────────────────────────── */}
                <div className="flex flex-col items-center text-center mb-10">
                    <SuccessIcon />
                    <h1 className="text-h2 text-super-black mt-6">
                        Booking Dikonfirmasi!
                    </h1>
                    <p className="text-body-l text-foreground/60 mt-2">
                        Janji temu Anda telah terjadwal. Kami siap menyambut Anda!
                    </p>
                </div>

                {/* ── Receipt Card ───────────────────────────────────────── */}
                <div className="bg-card border border-border rounded-venus overflow-hidden shadow-xl shadow-border/30">

                    {/* Card Top: Booking ID + Badge */}
                    <div className="px-6 pt-6 pb-5 border-b border-border flex items-center justify-between">
                        <div>
                            <p className="text-label-sm text-foreground/50 uppercase">ID Booking</p>
                            <p className="text-h3 text-super-black mt-0.5">{booking.bookingId}</p>
                        </div>
                        <span className="bg-primary/15 text-primary text-label-sm font-bold px-4 py-1.5 rounded-full uppercase">
                            Terkonfirmasi
                        </span>
                    </div>

                    {/* Card Middle: Service details grid */}
                    <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 border-b border-border">

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <CarIcon />
                                <p className="text-label-sm text-foreground/50 uppercase">Layanan</p>
                            </div>
                            <p className="text-h4 text-super-black">{booking.serviceName}</p>
                            <p className="text-body-reg text-foreground/60">{booking.serviceSubtitle}</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <p className="text-label-sm text-foreground/50 uppercase">Kendaraan</p>
                            </div>
                            <p className="text-h4 text-super-black">{booking.licensePlate}</p>
                            <p className="text-body-reg text-foreground/60">{booking.vehicleClass}</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <CalendarIcon />
                                <p className="text-label-sm text-foreground/50 uppercase">Tanggal</p>
                            </div>
                            <p className="text-h4 text-super-black leading-snug">{booking.appointmentDate}</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <ClockIcon />
                                <p className="text-label-sm text-foreground/50 uppercase">Waktu</p>
                            </div>
                            <p className="text-h4 text-super-black">{booking.timeSlot} WIB</p>
                            <p className="text-body-reg text-foreground/60">Durasi {booking.serviceDuration}</p>
                        </div>
                    </div>

                    {/* Card Bottom: Location + QR */}
                    <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-surface/50">
                        <QRCodePlaceholder bookingId={booking.bookingId} />
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <MapPinIcon />
                                <p className="text-label-sm text-foreground/50 uppercase">Lokasi</p>
                            </div>
                            <p className="text-h4 text-super-black">Venus Hub – rental-ps</p>
                            <p className="text-body-reg text-foreground/60">Jl. Setia Budi No.435, Medan Selayang</p>
                            <Link href="#" className="inline-flex items-center gap-1 text-primary text-label-sm mt-2 hover:opacity-80 transition-opacity">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                                Petunjuk Arah
                            </Link>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="px-6 py-5 bg-surface/30">
                        <p className="text-label-sm text-foreground/50 uppercase mb-3">Rincian Biaya</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-body-reg">
                                <span className="text-foreground/70">{booking.serviceName}</span>
                                <span className="font-semibold text-foreground">Rp{booking.servicePrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-body-reg">
                                <span className="text-foreground/70">Biaya Layanan</span>
                                <span className="font-semibold text-foreground">Rp{SERVICE_FEE.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                            <span className="text-h4 text-super-black">Total</span>
                            <span className="text-card-title text-secondary">Rp{total.toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-body-reg text-foreground/50 mt-1.5">
                            💡 Pembayaran dilakukan langsung di lokasi setelah layanan selesai.
                        </p>
                    </div>
                </div>

                {/* ── Action Buttons ─────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                        onClick={handleDownload}
                        disabled={isPrinting}
                        className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 rounded-full text-label-sm font-bold tracking-widest transition-all shadow-lg"
                    >
                        <DownloadIcon />
                        Unduh Struk
                    </button>
                    <button
                        onClick={handleReturnHome}
                        className="flex-1 flex items-center justify-center gap-2 bg-surface border border-border hover:bg-border text-foreground h-14 rounded-full text-label-sm font-bold tracking-widest transition-all"
                    >
                        <HomeIcon />
                        Kembali ke Beranda
                    </button>
                </div>

                {/* Support */}
                <p className="text-center text-body-reg text-foreground/50 mt-6">
                    Butuh bantuan?{' '}
                    <Link href="#" className="text-primary hover:opacity-80 transition-opacity font-semibold">
                        Hubungi Support
                    </Link>
                </p>
            </main>

            <Footer />
        </div>
    );
}
