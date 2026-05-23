import React, { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { useOperationalStatus } from '../../hooks/useOperationalStatus';

// ── Types ────────────────────────────────────────────────────────────────────

interface Stall {
    id: string;
    label: string;
    status: 'terisi' | 'tersedia';
    plate?: string;
    vehicle?: string;
    progress?: string;
}

interface Props {
    stalls: Stall[];
    queueCount: number;
    availablePits: number;
    totalPits: number;
    servicingCount: number;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const services = [
    {
        id: 'ganti_oli',
        name: 'Ganti Oli',
        subtitle: 'Penggantian Oli Mesin',
        price: 75000,
        priceLabel: '75k',
        duration: '15 menit',
        features: ['Oli standar', 'Cek filter'],
    },
    {
        id: 'servis_ringan',
        name: 'Servis Ringan',
        subtitle: 'Pengecekan Rutin',
        price: 150000,
        priceLabel: '150k',
        duration: '45 menit',
        features: ['Cek busi & aki', 'Pembersihan karburator/injeksi'],
    },
    {
        id: 'servis_berat',
        name: 'Servis Berat',
        subtitle: 'Turun Mesin / Overhaul',
        price: 500000,
        priceLabel: '500k+',
        duration: '2+ Jam',
        features: ['Cek kompresi', 'Penggantian part dalam'],
    },
];

const vehicleClasses = [
    'City Car / Sedan',
    'SUV / MPV',
    'Pickup / Double Cabin',
    'Motor',
    'Minibus',
];

// ── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const ClockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

const QueueIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

// ── Operational Hours Helper ──────────────────────────────────────────────────

const OPEN_HOUR = 8;
const CLOSE_HOUR = 17;

function isWithinOperationalHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

function getOperationalStatus(): { open: boolean; message: string } {
    const now = new Date();
    const hour = now.getHours();

    if (hour < OPEN_HOUR) {
        return { open: false, message: `Buka pukul ${String(OPEN_HOUR).padStart(2, '0')}:00 WIB` };
    }
    if (hour >= CLOSE_HOUR) {
        return { open: false, message: 'Sudah tutup hari ini. Buka besok 08:00 WIB' };
    }
    const remaining = CLOSE_HOUR - hour;
    return { open: true, message: `Tutup dalam ${remaining} jam` };
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function BengkelIndex() {
    const { auth, stalls, queueCount, availablePits, totalPits, servicingCount } = usePage<{
        auth: { user?: { id: number } };
        stalls: Stall[];
        queueCount: number;
        availablePits: number;
        totalPits: number;
        servicingCount: number;
    }>().props;

    const [selectedService, setSelectedService] = useState('servis_ringan');
    const [vehicleClass, setVehicleClass] = useState('City Car / Sedan');
    const [licensePlate, setLicensePlate] = useState('');
    const [plateError, setPlateError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const service = services.find(s => s.id === selectedService)!;
    const { isOpen, message: operationalMessage } = useOperationalStatus('Bengkel');
    const operational = { open: isOpen, message: operationalMessage };

    // Estimated wait time based on queue + servicing
    const estimatedWait = useMemo(() => {
        if (availablePits > 0 && queueCount === 0) return 'Langsung dilayani';
        const activePits = Math.max(servicingCount, 1);
        const waitMinutes = Math.ceil((queueCount / activePits) * 30);
        if (waitMinutes <= 0) return '~5 menit';
        return `~${waitMinutes} menit`;
    }, [queueCount, availablePits, servicingCount]);

    const handleConfirm = () => {
        const platRegex = /^[A-Za-z]{1,2}\s?\d{1,4}\s?[A-Za-z]{1,3}$/;
        if (!licensePlate.trim()) {
            setPlateError('Nomor plat wajib diisi.');
            return;
        }
        if (!platRegex.test(licensePlate.trim())) {
            setPlateError('Format plat tidak valid (contoh: BK 1234 ABC).');
            return;
        }

        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        if (!isOpen) {
            setPlateError('Booking hanya tersedia saat jam operasional.');
            return;
        }

        setPlateError('');
        setIsSubmitting(true);

        router.post(
            '/bengkel/booking',
            {
                service_id:       service.id,
                service_name:     service.name,
                service_subtitle: service.subtitle,
                service_price:    service.price,
                service_duration: service.duration,
                vehicle_class:    vehicleClass,
                license_plate:    licensePlate.trim().toUpperCase(),
            },
            {
                onError: () => setIsSubmitting(false),
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <Head title="Bengkel – Venus Hub" />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-8 text-label-sm text-foreground/50 uppercase">
                    <span>BERANDA</span>
                    <span>›</span>
                    <span className="text-foreground font-semibold">BENGKEL</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── LEFT CONTENT (2/3) ─────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Hero */}
                        <div>
                            <h1 className="text-h1 text-super-black mb-4">
                                Elite <span className="text-primary">Vehicle Service</span> Experience
                            </h1>
                            <p className="text-body-l text-foreground/70 mt-4 max-w-lg">
                                Manjakan kendaraan Anda dengan ritual perawatan premium. Booking sekarang dan masuk ke antrian realtime — tanpa perlu janji temu.
                            </p>
                        </div>

                        {/* Service Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {services.map(svc => {
                                const isSelected = selectedService === svc.id;
                                return (
                                    <button
                                        key={svc.id}
                                        onClick={() => setSelectedService(svc.id)}
                                        className={`relative text-left p-5 rounded-venus border-2 transition-all duration-200 flex flex-col gap-3 h-full ${
                                            isSelected
                                                ? 'border-primary bg-card shadow-lg shadow-primary/10'
                                                : 'border-border bg-card hover:border-primary/40 hover:shadow-md'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-h4 text-super-black">{svc.name}</p>
                                            <p className="text-body-reg text-foreground/60">{svc.subtitle}</p>
                                        </div>

                                        <p className="text-h3 text-super-black leading-none">
                                            {svc.priceLabel}
                                        </p>

                                        <ul className="space-y-1.5">
                                            <li className="flex items-center gap-2 text-label-sm text-foreground/80">
                                                <span className="text-primary"><CheckIcon /></span>
                                                {svc.duration} durasi
                                            </li>
                                            {svc.features.map(f => (
                                                <li key={f} className="flex items-center gap-2 text-label-sm text-foreground/80">
                                                    <span className="text-primary"><CheckIcon /></span>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedService(svc.id); }}
                                            className={`w-full mt-auto py-2.5 rounded-full text-label-sm font-semibold transition-all ${
                                                isSelected
                                                    ? 'bg-secondary text-secondary-foreground shadow-md'
                                                    : 'bg-surface text-foreground border border-border hover:bg-border'
                                            }`}
                                        >
                                            {isSelected ? 'Dipilih' : 'Pilih'}
                                        </button>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Booking Form — Realtime Queue */}
                        <div className="bg-card border border-border rounded-venus p-6 space-y-6">

                            {/* Vehicle info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-label-sm text-foreground/60 uppercase">Klasifikasi Kendaraan</label>
                                    <div className="relative">
                                        <select
                                            value={vehicleClass}
                                            onChange={e => setVehicleClass(e.target.value)}
                                            className="w-full appearance-none bg-background border border-border rounded-venus px-4 py-3 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                        >
                                            {vehicleClasses.map(vc => (
                                                <option key={vc} value={vc}>{vc}</option>
                                            ))}
                                        </select>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none">
                                            <ChevronDownIcon />
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-label-sm text-foreground/60 uppercase">Nomor Plat</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: B 1234 ABC"
                                        value={licensePlate}
                                        onChange={e => { setLicensePlate(e.target.value.toUpperCase()); setPlateError(''); }}
                                        className={`w-full bg-background border rounded-venus px-4 py-3 text-body-m text-foreground placeholder:text-foreground/30 focus:outline-none transition-colors ${
                                            plateError ? 'border-error focus:border-error' : 'border-border focus:border-primary'
                                        }`}
                                    />
                                    {plateError && (
                                        <p className="text-label-sm text-error">{plateError}</p>
                                    )}
                                </div>
                            </div>

                            {/* Realtime Queue Status */}
                            <div className="bg-background border border-border rounded-venus p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-primary"><QueueIcon /></span>
                                    <p className="text-h4 text-super-black">Status Antrian Realtime</p>
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse ml-1" />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {/* Pit Available */}
                                    <div className="bg-card border border-border rounded-venus p-4 text-center">
                                        <p className={`text-h3 font-extrabold ${availablePits > 0 ? 'text-primary' : 'text-foreground/30'}`}>
                                            {availablePits}
                                        </p>
                                        <p className="text-label-sm text-foreground/50 mt-1">Pit Tersedia</p>
                                    </div>

                                    {/* In Queue */}
                                    <div className="bg-card border border-border rounded-venus p-4 text-center">
                                        <p className="text-h3 text-super-black font-extrabold">{queueCount}</p>
                                        <p className="text-label-sm text-foreground/50 mt-1">Dalam Antrian</p>
                                    </div>

                                    {/* Wait Time */}
                                    <div className="bg-card border border-border rounded-venus p-4 text-center">
                                        <p className="text-h4 text-super-black font-extrabold leading-snug">{estimatedWait}</p>
                                        <p className="text-label-sm text-foreground/50 mt-1">Est. Tunggu</p>
                                    </div>
                                </div>

                                {availablePits > 0 && queueCount === 0 && (
                                    <div className="mt-4 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-venus px-4 py-3">
                                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
                                        <p className="text-body-reg text-foreground/80">
                                            <span className="font-semibold text-primary">Pit tersedia sekarang!</span> Booking Anda bisa langsung diproses.
                                        </p>
                                    </div>
                                )}

                                {availablePits === 0 && (
                                    <div className="mt-4 flex items-center gap-2 bg-surface border border-border rounded-venus px-4 py-3">
                                        <span className="text-foreground/40"><ClockIcon /></span>
                                        <p className="text-body-reg text-foreground/60">
                                            Semua pit sedang terisi. Anda akan masuk antrian otomatis setelah booking dikonfirmasi.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Operational Hours Notice */}
                            {!isOpen && (
                                <div className="flex items-center gap-3 bg-surface border border-border rounded-venus px-5 py-4">
                                    <span className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/40 shrink-0">
                                        <ClockIcon />
                                    </span>
                                    <div>
                                        <p className="text-h4 text-super-black">Di Luar Jam Operasional</p>
                                        <p className="text-body-reg text-foreground/60 mt-0.5">
                                            Booking hanya tersedia saat jam operasional (08:00 – 17:00 WIB). {operational.message}.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <button
                                onClick={handleConfirm}
                                disabled={isSubmitting || !isOpen}
                                className={`w-full h-14 rounded-full flex items-center justify-center gap-3 transition-all shadow-lg text-label-sm tracking-widest font-bold group ${
                                    isOpen
                                        ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                                        : 'bg-surface text-foreground/40 cursor-not-allowed shadow-none'
                                } disabled:opacity-70`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                                        Memproses…
                                    </>
                                ) : !isOpen ? (
                                    <>
                                        <ClockIcon />
                                        Booking hanya tersedia saat jam operasional
                                    </>
                                ) : (
                                    <>
                                        {!auth?.user ? 'Login untuk Booking' : 'Booking Sekarang'}
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT SIDEBAR (1/3) ────────────────────────────── */}
                    <div className="space-y-5 lg:sticky lg:top-24 self-start">

                        {/* Operational Hours Banner */}
                        <div className={`rounded-venus p-5 border ${isOpen ? 'bg-primary/10 border-primary/20' : 'bg-surface border-border'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full shrink-0 ${isOpen ? 'bg-primary animate-pulse' : 'bg-foreground/30'}`} />
                                <div>
                                    <p className="text-h4 text-super-black">
                                        {isOpen ? 'Sedang Beroperasi' : 'Tutup'}
                                    </p>
                                    <p className="text-body-reg text-foreground/60 mt-0.5">
                                        {operational.message} · 08:00 – 17:00 WIB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pit Availability */}
                        <div className="bg-card border border-border rounded-venus p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                                <p className="text-h4 text-super-black">Pit Pencucian</p>
                            </div>
                            <div className="space-y-3">
                                {stalls.map(stall => (
                                    <div key={stall.id} className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shrink-0 ml-3 mr-1 flex-none" style={{
                                            background: stall.status === 'tersedia'
                                                ? 'hsl(var(--primary))'
                                                : 'hsl(var(--secondary))',
                                            boxShadow: stall.status === 'tersedia'
                                                ? '0 0 6px hsl(var(--primary))'
                                                : 'none'
                                        }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-label-sm font-semibold text-super-black">{stall.label}</p>
                                            {stall.status === 'terisi' ? (
                                                <p className="text-body-reg text-foreground/60 truncate">
                                                    {stall.plate} · {stall.vehicle}
                                                </p>
                                            ) : (
                                                <p className="text-body-reg text-primary font-semibold">Tersedia</p>
                                            )}
                                        </div>
                                        <span className={`text-label-sm px-2.5 py-0.5 rounded-full font-semibold ${
                                            stall.status === 'tersedia'
                                                ? 'bg-primary/15 text-primary'
                                                : 'bg-secondary/15 text-secondary'
                                        }`}>
                                            {stall.status === 'tersedia' ? 'Kosong' : 'Terisi'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex justify-between items-center">
                                    <span className="text-body-reg text-foreground/60">Pit tersedia</span>
                                    <span className={`text-h4 font-extrabold ${availablePits > 0 ? 'text-primary' : 'text-foreground/40'}`}>
                                        {availablePits}/{totalPits}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Current Queue */}
                        <div className="bg-card border border-border rounded-venus p-5">
                            <p className="text-label-sm text-foreground/60 uppercase mb-4">Antrian Saat Ini</p>
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-h2 text-super-black">{queueCount}</p>
                                    <p className="text-body-reg text-foreground/50">kendaraan menunggu</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-label-sm text-foreground/40 uppercase">Est. Tunggu</p>
                                    <p className="text-h4 text-foreground">{estimatedWait}</p>
                                </div>
                            </div>
                        </div>

                        {/* Selected Service Summary */}
                        <div className="bg-card border border-border rounded-venus p-5">
                            <p className="text-label-sm text-foreground/60 uppercase mb-3">Layanan Dipilih</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-h4 text-super-black">{service.name}</p>
                                    <p className="text-body-reg text-foreground/60">{service.subtitle}</p>
                                </div>
                                <span className="text-card-title text-primary">
                                    Rp{service.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-body-reg text-foreground/60">Durasi: <span className="text-foreground font-semibold">{service.duration}</span></p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
