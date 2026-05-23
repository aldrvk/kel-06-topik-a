import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageHeader } from '../../Components/AdminUI';

// ── Data ─────────────────────────────────────────────────────────────────────

const services = [
    {
        id: 'basic',
        name: 'Basic Wash',
        subtitle: 'Exterior & Foam Wash',
        price: 35000,
        duration: '20 menit',
    },
    {
        id: 'premium',
        name: 'Premium Wash',
        subtitle: 'Interior & Vacuum Included',
        price: 65000,
        duration: '45 menit',
    },
    {
        id: 'detailing',
        name: 'Full Detailing',
        subtitle: 'Engine & Coating',
        price: 150000,
        duration: '2 Jam',
    },
];

const vehicleClasses = [
    'City Car / Sedan',
    'SUV / MPV',
    'Pickup / Double Cabin',
    'Motor',
    'Minibus',
];

export default function DoorsmeerWalkIn() {
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('premium');
    const [vehicleClass, setVehicleClass] = useState('City Car / Sedan');
    const [licensePlate, setLicensePlate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const service = services.find(s => s.id === selectedServiceId)!;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!licensePlate.trim() || !customerName.trim()) return;

        setIsSubmitting(true);
        router.post('/admin/doorsmeer/walk-in', {
            customer_name:    customerName,
            customer_email:   customerEmail,
            service_id:       service.id,
            service_name:     service.name,
            service_subtitle: service.subtitle,
            service_price:    service.price,
            service_duration: service.duration,
            vehicle_class:    vehicleClass,
            license_plate:    licensePlate.trim().toUpperCase(),
        }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AdminLayout>
            <Head title="Registrasi Walk-in – Doorsmeer Admin" />

            <PageHeader
                title="Registrasi Walk-in"
                subtitle="Masukkan data pelanggan yang datang langsung ke lokasi."
            />

            <div className="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Customer Info */}
                    <div className="bg-card border border-border rounded-venus p-6 space-y-6">
                        <h3 className="text-h4 text-super-black border-b border-border pb-3">Data Pelanggan</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-label-sm text-foreground/60 uppercase">Nama Lengkap *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Nama Pelanggan"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-label-sm text-foreground/60 uppercase">Email (Opsional)</label>
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={customerEmail}
                                    onChange={e => setCustomerEmail(e.target.value)}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle & Service Info */}
                    <div className="bg-card border border-border rounded-venus p-6 space-y-6">
                        <h3 className="text-h4 text-super-black border-b border-border pb-3">Layanan & Kendaraan</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-label-sm text-foreground/60 uppercase">Pilih Layanan</label>
                                <select
                                    value={selectedServiceId}
                                    onChange={e => setSelectedServiceId(e.target.value)}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                >
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} (Rp{s.price.toLocaleString('id-ID')})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-label-sm text-foreground/60 uppercase">Klasifikasi Kendaraan</label>
                                <select
                                    value={vehicleClass}
                                    onChange={e => setVehicleClass(e.target.value)}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                >
                                    {vehicleClasses.map(vc => (
                                        <option key={vc} value={vc}>{vc}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-label-sm text-foreground/60 uppercase">Nomor Plat *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Contoh: B 1234 ABC"
                                    value={licensePlate}
                                    onChange={e => setLicensePlate(e.target.value.toUpperCase())}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors font-bold tracking-wider"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer / CTA */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                        <Link
                            href="/admin/booking-doorsmeer"
                            className="text-label-sm font-bold text-foreground/40 hover:text-foreground/60 transition-colors"
                        >
                            ← Kembali ke Dashboard
                        </Link>
                        
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-secondary text-secondary-foreground px-8 py-3.5 rounded-full text-label-sm font-bold hover:bg-secondary/90 shadow-lg transition-all active:scale-95 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Memproses...' : '✓ Daftarkan & Masuk Antrian'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
