import React, { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AdminLayout from "../../Layouts/AdminLayout";
import { PageHeader } from "../../Components/AdminUI";

type SettingTab = "Profil" | "Operasional" | "Pembayaran" | "Notifikasi" | "Keamanan";

interface DaySchedule {
    open: string;
    close: string;
    is_open: boolean;
}

interface UnitSettings {
    is_active: boolean;
    schedule: Record<string, DaySchedule>;
}

type OperationalSettings = Record<string, UnitSettings>;

const UNIT_NAMES = ["Doorsmeer", "Bengkel", "Rental PS", "Coffee Shop", "Vape Store"];
const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const UNIT_DESCRIPTIONS: Record<string, string> = {
    "Doorsmeer": "Layanan cuci kendaraan",
    "Bengkel": "Layanan service kendaraan",
    "Rental PS": "Rental PlayStation & Gaming",
    "Coffee Shop": "Minuman & makanan ringan",
    "Vape Store": "Penjualan produk vape",
};

function getDefaultSchedule(unit: string): Record<string, DaySchedule> {
    const closeTime = (unit === "Doorsmeer" || unit === "Bengkel") ? "17:00" : "23:00";
    const schedule: Record<string, DaySchedule> = {};
    DAY_NAMES.forEach((day) => {
        schedule[day] = { open: "08:00", close: closeTime, is_open: true };
    });
    return schedule;
}

function getDefaultSettings(): OperationalSettings {
    const settings: OperationalSettings = {};
    UNIT_NAMES.forEach((unit) => {
        settings[unit] = {
            is_active: true,
            schedule: getDefaultSchedule(unit),
        };
    });
    return settings;
}

export default function Pengaturan() {
    const { settings: sharedSettings, payment_settings: sharedPayment } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<SettingTab>("Profil");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<string>("Doorsmeer");

    // Initialize payment settings
    const [paymentSettings, setPaymentSettings] = useState(() => ({
        qris_merchant_name: sharedPayment?.qris_merchant_name || "Venus Hub Store",
        qris_payload: sharedPayment?.qris_payload || "00020101021226660011ID.CO.GPN.WWW011893600522000001234502150001020345678900303ID51440014ID1234567890123520459995303360540505802ID5916VenusHub6006Jakarta6304ABCD",
        // Midtrans Keys
        midtrans_client_key: sharedPayment?.midtrans_client_key || "",
        midtrans_server_key: sharedPayment?.midtrans_server_key || "",
        midtrans_is_sandbox: sharedPayment?.midtrans_is_sandbox ?? true,
    }));

    // Initialize operational settings from shared props or defaults
    const [operationalSettings, setOperationalSettings] = useState<OperationalSettings>(() => {
        if (sharedSettings && typeof sharedSettings === 'object' && Object.keys(sharedSettings).length > 0) {
            return sharedSettings as OperationalSettings;
        }
        return getDefaultSettings();
    });

    const tabs: SettingTab[] = ["Profil", "Operasional", "Pembayaran", "Notifikasi", "Keamanan"];

    const currentUnit = operationalSettings[selectedUnit];

    // Toggle the master is_active for the selected unit
    const toggleUnitActive = () => {
        setOperationalSettings((prev) => ({
            ...prev,
            [selectedUnit]: {
                ...prev[selectedUnit],
                is_active: !prev[selectedUnit].is_active,
            },
        }));
    };

    // Toggle a specific day's is_open
    const toggleDayOpen = (day: string) => {
        setOperationalSettings((prev) => {
            if (!prev[selectedUnit] || !prev[selectedUnit].schedule[day]) return prev;
            return {
                ...prev,
                [selectedUnit]: {
                    ...prev[selectedUnit],
                    schedule: {
                        ...prev[selectedUnit].schedule,
                        [day]: {
                            ...prev[selectedUnit].schedule[day],
                            is_open: !prev[selectedUnit].schedule[day].is_open,
                        },
                    },
                },
            };
        });
    };

    // Update a specific day's open or close time
    const updateDayTime = (day: string, field: "open" | "close", value: string) => {
        setOperationalSettings((prev) => {
            if (!prev[selectedUnit] || !prev[selectedUnit].schedule[day]) return prev;
            return {
                ...prev,
                [selectedUnit]: {
                    ...prev[selectedUnit],
                    schedule: {
                        ...prev[selectedUnit].schedule,
                        [day]: {
                            ...prev[selectedUnit].schedule[day],
                            [field]: value,
                        },
                    },
                },
            };
        });
    };

    const handleSaveOperational = () => {
        setSaving(true);
        router.post("/admin/settings/operational", {
            operational_settings: operationalSettings as any,
        }, {
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            },
            onFinish: () => setSaving(false)
        });
    };

    const handleSavePayment = () => {
        setSaving(true);
        router.post("/admin/settings/payment", {
            payment_settings: paymentSettings as any,
        }, {
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            },
            onFinish: () => setSaving(false)
        });
    };

    const handleSave = () => {
        if (activeTab === "Operasional") {
            handleSaveOperational();
            return;
        }
        if (activeTab === "Pembayaran") {
            handleSavePayment();
            return;
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan – Venus Hub Admin" />

            <PageHeader
                title="Pengaturan"
                subtitle="Konfigurasi sistem, profil bisnis, dan preferensi operasional."
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                {/* Sidebar Tabs */}
                <div className="md:col-span-1">
                    <div className="flex md:flex-col gap-2 md:gap-1 bg-card border border-border rounded-venus p-3 md:p-4 md:space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none text-center md:text-left px-3 md:px-4 py-2 md:py-3 rounded-venus text-xs md:text-body-m transition-all ${
                                    activeTab === tab
                                        ? "bg-secondary text-white font-semibold shadow"
                                        : "text-foreground/70 hover:bg-surface hover:text-foreground"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="col-span-3 space-y-5">
                    {activeTab === "Profil" && (
                        <div className="bg-card border border-border rounded-venus p-6">
                            <h2 className="text-h4 text-super-black mb-5">
                                Informasi Bisnis
                            </h2>
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-white font-heading font-bold text-2xl">
                                    V
                                </div>
                                <div>
                                    <p className="text-h4 text-super-black">
                                        Venus Hub
                                    </p>
                                    <p className="text-body-reg text-foreground/50 mt-0.5">
                                        Multi-unit business admin
                                    </p>
                                    <button className="mt-2 text-label-sm text-primary hover:underline">
                                        Ganti Logo
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Nama Bisnis", value: "Venus Hub", type: "text" },
                                    { label: "Email Admin", value: "admin@venushub.id", type: "email" },
                                    { label: "Nomor WhatsApp", value: "+62 812-3456-7890", type: "tel" },
                                    { label: "Alamat", value: "Jl. Venus No. 12, Medan", type: "text" },
                                ].map((f) => (
                                    <div key={f.label} className="space-y-1.5">
                                        <label className="text-label-sm text-foreground/50">
                                            {f.label.toUpperCase()}
                                        </label>
                                        <input
                                            type={f.type}
                                            defaultValue={f.value}
                                            className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "Operasional" && (
                        <div className="space-y-5">
                            {/* Unit Selector */}
                            <div className="bg-card border border-border rounded-venus p-4">
                                <p className="text-label-sm text-foreground/50 uppercase tracking-widest mb-3">Pilih Unit Usaha</p>
                                <div className="flex flex-wrap gap-2">
                                    {UNIT_NAMES.map((unit) => {
                                        const isSelected = selectedUnit === unit;
                                        const unitData = operationalSettings[unit];
                                        const isActive = unitData?.is_active ?? true;
                                        return (
                                            <button
                                                key={unit}
                                                onClick={() => setSelectedUnit(unit)}
                                                className={`px-4 py-2.5 rounded-venus text-body-m font-semibold transition-all relative ${
                                                    isSelected
                                                        ? "bg-secondary text-white shadow-lg"
                                                        : "bg-surface text-foreground hover:bg-border"
                                                }`}
                                            >
                                                {unit}
                                                {/* Active indicator dot */}
                                                <span
                                                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                                                        isActive ? "bg-primary" : "bg-foreground/30"
                                                    }`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Master Toggle + Unit Info */}
                            <div className="bg-card border border-border rounded-venus p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-h4 text-super-black">{selectedUnit}</h2>
                                        <p className="text-body-reg text-foreground/50 mt-0.5">
                                            {UNIT_DESCRIPTIONS[selectedUnit]}
                                        </p>
                                    </div>

                                    {/* Master Toggle */}
                                    <button
                                        onClick={toggleUnitActive}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-venus font-bold text-label-sm tracking-widest transition-all shadow-lg ${
                                            currentUnit?.is_active
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                        }`}
                                    >
                                        {/* Toggle knob icon */}
                                        <div className={`w-10 h-5 rounded-full relative transition-all ${
                                            currentUnit?.is_active ? "bg-white/30" : "bg-red-300"
                                        }`}>
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow ${
                                                currentUnit?.is_active ? "right-0.5" : "left-0.5"
                                            }`} />
                                        </div>
                                        {currentUnit?.is_active ? "UNIT AKTIF" : "UNIT NONAKTIF"}
                                    </button>
                                </div>

                                {/* Status info */}
                                {!currentUnit?.is_active && (
                                    <div className="flex items-center gap-3 bg-red-100 border border-red-200 rounded-venus px-5 py-4 mb-6">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-800 shrink-0">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <p className="text-body-reg text-red-800">
                                            Unit {selectedUnit} sedang dinonaktifkan. Pelanggan tidak bisa melakukan pemesanan namun tetap bisa melihat katalog.
                                        </p>
                                    </div>
                                )}

                                {/* Daily Schedule */}
                                <div>
                                    <p className="text-label-sm text-foreground/50 uppercase tracking-widest mb-3">Jadwal Harian</p>
                                    <div className="space-y-3">
                                        {DAY_NAMES.map((day) => {
                                            const daySchedule = currentUnit?.schedule?.[day];
                                            const isDayOpen = daySchedule?.is_open ?? true;
                                            return (
                                                <div
                                                    key={day}
                                                    className={`flex items-center justify-between p-4 border rounded-venus transition-all ${
                                                        isDayOpen 
                                                            ? "border-border bg-background" 
                                                            : "border-border/50 bg-surface/50"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {/* Day toggle */}
                                                        <button
                                                            onClick={() => toggleDayOpen(day)}
                                                            className={`w-10 h-6 rounded-full relative cursor-pointer transition-all ${
                                                                isDayOpen ? "bg-secondary" : "bg-surface border border-border"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow ${
                                                                    isDayOpen ? "right-0.5" : "left-0.5"
                                                                }`}
                                                            />
                                                        </button>
                                                        <p className={`text-body-m font-semibold w-20 ${
                                                            isDayOpen ? "text-foreground" : "text-foreground/30"
                                                        }`}>
                                                            {day}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="time"
                                                            value={daySchedule?.open ?? "08:00"}
                                                            onChange={(e) => updateDayTime(day, "open", e.target.value)}
                                                            disabled={!isDayOpen}
                                                            className={`bg-background border border-border rounded-venus px-3 py-2 text-body-m focus:outline-none focus:border-primary transition-colors ${
                                                                !isDayOpen ? "text-foreground/30 cursor-not-allowed" : "text-foreground"
                                                            }`}
                                                        />
                                                        <span className={`text-body-reg ${isDayOpen ? "text-foreground/40" : "text-foreground/20"}`}>
                                                            –
                                                        </span>
                                                        <input
                                                            type="time"
                                                            value={daySchedule?.close ?? "23:00"}
                                                            onChange={(e) => updateDayTime(day, "close", e.target.value)}
                                                            disabled={!isDayOpen}
                                                            className={`bg-background border border-border rounded-venus px-3 py-2 text-body-m focus:outline-none focus:border-primary transition-colors ${
                                                                !isDayOpen ? "text-foreground/30 cursor-not-allowed" : "text-foreground"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Pembayaran" && (
                        <div className="bg-card border border-border rounded-venus p-6">
                            <h2 className="text-h4 text-super-black mb-5">
                                Pengaturan Pembayaran (QRIS & Bank)
                            </h2>
                            <div className="space-y-6">
                                <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-venus">
                                    <p className="text-body-m text-secondary font-semibold mb-1">Integrasi Midtrans (Otomatis)</p>
                                    <p className="text-body-reg text-foreground/60 text-xs">
                                        Gunakan Midtrans untuk menerima pembayaran dari semua Bank & E-Wallet (QRIS) secara otomatis. Status pesanan akan berubah menjadi 'Berhasil' secara real-time.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-label-sm text-foreground/50 uppercase">Midtrans Client Key</label>
                                        <input 
                                            type="text"
                                            value={paymentSettings.midtrans_client_key}
                                            onChange={(e) => setPaymentSettings({...paymentSettings, midtrans_client_key: e.target.value})}
                                            className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m"
                                            placeholder="SB-Mid-client-..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-label-sm text-foreground/50 uppercase">Midtrans Server Key</label>
                                        <input 
                                            type="password"
                                            value={paymentSettings.midtrans_server_key}
                                            onChange={(e) => setPaymentSettings({...paymentSettings, midtrans_server_key: e.target.value})}
                                            className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m"
                                            placeholder="SB-Mid-server-..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-surface rounded-venus border border-border">
                                    <div className="flex-1">
                                        <p className="text-body-m font-bold text-super-black">Mode Sandbox (Testing)</p>
                                        <p className="text-body-reg text-foreground/50 text-xs">Aktifkan untuk mencoba pembayaran tanpa uang sungguhan.</p>
                                    </div>
                                    <button
                                        onClick={() => setPaymentSettings({...paymentSettings, midtrans_is_sandbox: !paymentSettings.midtrans_is_sandbox})}
                                        className={`w-12 h-6 rounded-full relative transition-all ${paymentSettings.midtrans_is_sandbox ? "bg-primary" : "bg-foreground/20"}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow ${paymentSettings.midtrans_is_sandbox ? "right-0.5" : "left-0.5"}`} />
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <h3 className="text-body-m font-bold text-super-black mb-4">Metode QRIS Manual (Cadangan)</h3>
                                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-venus mb-6">
                                        <p className="text-body-reg text-foreground/60 text-xs">
                                            Jika Midtrans tidak aktif, sistem akan menggunakan kode QRIS manual ini.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-label-sm text-foreground/50 uppercase">Payload QRIS String (EMVCo)</label>
                                        <textarea 
                                            value={paymentSettings.qris_payload}
                                            onChange={(e) => setPaymentSettings({...paymentSettings, qris_payload: e.target.value})}
                                            className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m font-mono text-xs h-32"
                                            placeholder="00020101021226660011ID.CO.GPN.WWW0118..."
                                        />
                                        <p className="text-[10px] text-foreground/40 italic">*Dapatkan string ini dari dashboard merchant bank atau gateway Anda.</p>
                                    </div>
                                </div>


                            </div>
                        </div>
                    )}

                    {activeTab === "Notifikasi" && (
                        <div className="bg-card border border-border rounded-venus p-6">
                            <h2 className="text-h4 text-super-black mb-5">
                                Preferensi Notifikasi
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { label: "Booking baru masuk", desc: "Notifikasi saat ada booking baru dari pelanggan", on: true },
                                    { label: "Pembayaran diterima", desc: "Notifikasi konfirmasi pembayaran", on: true },
                                    { label: "Antrean menumpuk", desc: "Peringatan saat antrean > 5 orang", on: true },
                                    { label: "Stok produk hampir habis", desc: "Peringatan stok di bawah 5 unit", on: false },
                                    { label: "Laporan harian otomatis", desc: "Kirim ringkasan pendapatan setiap pukul 21:00", on: true },
                                    { label: "WhatsApp Notifikasi", desc: "Kirim notifikasi via WhatsApp ke admin", on: false },
                                ].map((n) => (
                                    <div
                                        key={n.label}
                                        className="flex items-center justify-between p-4 border border-border rounded-venus"
                                    >
                                        <div>
                                            <p className="text-body-m text-super-black font-semibold">
                                                {n.label}
                                            </p>
                                            <p className="text-body-reg text-foreground/50">
                                                {n.desc}
                                            </p>
                                        </div>
                                        <div
                                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${n.on ? "bg-secondary" : "bg-surface border border-border"}`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow ${n.on ? "right-0.5" : "left-0.5"}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "Keamanan" && (
                        <div className="space-y-5">
                            <div className="bg-card border border-border rounded-venus p-6">
                                <h2 className="text-h4 text-super-black mb-5">
                                    Ganti Password
                                </h2>
                                <div className="space-y-4 max-w-md">
                                    {[
                                        "Password Saat Ini",
                                        "Password Baru",
                                        "Konfirmasi Password Baru",
                                    ].map((f) => (
                                        <div key={f} className="space-y-1.5">
                                            <label className="text-label-sm text-foreground/50">
                                                {f.toUpperCase()}
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>
                                    ))}
                                    <button className="bg-secondary text-white px-6 py-3 rounded-venus text-label-sm font-semibold hover:bg-secondary/90 transition-all">
                                        Perbarui Password
                                    </button>
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-venus p-6">
                                <h2 className="text-h4 text-super-black mb-2">
                                    Sesi Login Aktif
                                </h2>
                                <p className="text-body-reg text-foreground/50 mb-5">
                                    Berikut adalah perangkat yang sedang login ke akun admin.
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { device: "Chrome – Windows 11", ip: "192.168.1.5", time: "Aktif sekarang", current: true },
                                        { device: "Safari – iPhone 14", ip: "192.168.1.12", time: "2 jam yang lalu", current: false },
                                    ].map((s, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-4 border border-border rounded-venus"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${s.current ? "bg-primary animate-pulse" : "bg-surface border border-border"}`}
                                                />
                                                <div>
                                                    <p className="text-body-m text-foreground font-semibold">
                                                        {s.device}
                                                    </p>
                                                    <p className="text-body-reg text-foreground/40">
                                                        {s.ip} · {s.time}
                                                    </p>
                                                </div>
                                            </div>
                                            {!s.current && (
                                                <button className="text-label-sm text-red-500 hover:underline">
                                                    Logout
                                                </button>
                                            )}
                                            {s.current && (
                                                <span className="text-label-sm text-primary">
                                                    Perangkat ini
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    {activeTab !== "Keamanan" && (
                        <div className="flex items-center gap-3 justify-end">
                            {saved && (
                                <span className="text-body-m text-primary font-semibold">
                                    ✓ Tersimpan!
                                </span>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-secondary text-white px-8 py-3 rounded-venus text-label-sm font-semibold hover:bg-secondary/90 transition-all shadow-lg disabled:opacity-70"
                            >
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
