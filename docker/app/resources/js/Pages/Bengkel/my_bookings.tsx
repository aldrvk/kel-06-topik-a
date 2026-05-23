import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

interface Booking {
    id: number;
    booking_code: string;
    service_name: string;
    license_plate: string;
    vehicle_class: string;
    status: string;
    progress_label: string;
    progress_step: number;
    service_price: number;
    stall: string | null;
    created_at: string;
}

interface Props {
    bookings: Booking[];
}

function statusColor(status: string) {
    switch (status) {
        case 'pending':  return 'text-amber-600 bg-amber-50 border-amber-200';
        case 'verified': return 'text-primary bg-primary/10 border-primary/30';
        case 'in_queue': return 'text-purple-600 bg-purple-50 border-purple-200';
        case 'servicing':  return 'text-primary bg-primary/10 border-primary/30';
        case 'done':     return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        default:         return 'text-foreground/50 bg-surface border-border';
    }
}

function statusDot(status: string) {
    switch (status) {
        case 'servicing':  return 'bg-primary animate-pulse';
        case 'pending':  return 'bg-amber-400';
        case 'verified': return 'bg-primary animate-pulse';
        case 'in_queue': return 'bg-purple-500';
        case 'done':     return 'bg-emerald-500';
        default:         return 'bg-foreground/30';
    }
}

const SERVICE_FEE = 5000;

export default function MyBookings({ bookings }: Props) {
    const active = bookings.filter(b => b.status !== 'done' && b.status !== 'cancelled');
    const history = bookings.filter(b => b.status === 'done' || b.status === 'cancelled');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Head title="Booking Saya – Bengkel" />
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-label-sm text-foreground/50 uppercase">
                    <Link href="/bengkel" className="hover:text-primary transition-colors">
                        ← Bengkel
                    </Link>
                    <span>›</span>
                    <span className="text-foreground font-semibold">Booking Saya</span>
                </div>

                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-h2 text-super-black">Booking Saya</h1>
                        <p className="text-body-l text-foreground/60 mt-1">Pantau semua riwayat booking bengkel Anda.</p>
                    </div>
                    <Link
                        href="/bengkel"
                        className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-full text-label-sm font-bold hover:bg-secondary/90 transition-all shadow-md"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Booking Baru
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-card border border-border rounded-venus p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4 text-foreground/30">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <p className="text-h4 text-super-black">Belum Ada Booking</p>
                        <p className="text-body-reg text-foreground/50 mt-2">Mulai booking layanan bengkel pertama Anda.</p>
                        <Link href="/bengkel" className="mt-5 inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-full text-label-sm font-bold hover:bg-secondary/90 transition-all">
                            Booking Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* Active bookings */}
                        {active.length > 0 && (
                            <div>
                                <h2 className="text-h4 text-super-black mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    Booking Aktif
                                </h2>
                                <div className="space-y-3">
                                    {active.map(b => (
                                        <BookingCard key={b.id} booking={b} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* History */}
                        {history.length > 0 && (
                            <div>
                                <h2 className="text-h4 text-super-black mb-4 text-foreground/50">Riwayat</h2>
                                <div className="space-y-3 opacity-80">
                                    {history.map(b => (
                                        <BookingCard key={b.id} booking={b} />
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

function BookingCard({ booking }: { booking: Booking }) {
    const isActive = booking.status !== 'done';
    return (
        <Link
            href={`/bengkel/tracking/${booking.booking_code}`}
            className="block bg-card border border-border rounded-venus p-5 hover:border-primary/40 hover:shadow-md transition-all group"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        booking.status === 'done' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-primary/10 text-primary'
                    }`}>
                        {booking.status === 'done' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-h4 text-super-black group-hover:text-primary transition-colors">{booking.booking_code}</p>
                            {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </div>
                        <p className="text-body-reg text-foreground/60 mt-0.5">{booking.service_name} · {booking.license_plate}</p>
                        <p className="text-body-reg text-foreground/40 text-sm">
                            {booking.created_at}
                            {booking.stall && <span className="text-primary font-semibold"> · {booking.stall}</span>}
                        </p>
                    </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm font-semibold ${statusColor(booking.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(booking.status)}`} />
                        {booking.progress_label}
                    </span>
                    <span className="text-body-m font-semibold text-foreground/60">
                        Rp{(booking.service_price + 5000).toLocaleString('id-ID')}
                    </span>
                </div>
            </div>
        </Link>
    );
}
