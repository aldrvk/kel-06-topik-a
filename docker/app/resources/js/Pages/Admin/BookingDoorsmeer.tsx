import React, { useState } from "react";
import { Head, router, Link } from "@inertiajs/react";
import AdminLayout from "../../Layouts/AdminLayout";
import {
    PageHeader,
    Badge,
    FilterTabs,
} from "../../Components/AdminUI";

// ── Types ────────────────────────────────────────────────────────────────────
type BookingStatus =
    | "pending"
    | "verified"
    | "in_queue"
    | "washing"
    | "done"
    | "cancelled";

type FilterTab = "Semua" | "Menunggu" | "Antrian" | "Dicuci" | "Selesai" | "Dibatalkan";

interface Booking {
    id: number;
    booking_code: string;
    service_name: string;
    service_subtitle: string;
    service_price: number;
    service_duration: string;
    vehicle_class: string;
    license_plate: string;
    status: BookingStatus;
    progress_label: string;
    progress_step: number;
    stall: string | null;
    queue_position: number | null;
    admin_notes: string | null;
    verified_at: string | null;
    bay_assigned_at: string | null;
    done_at: string | null;
    created_at: string;
    customer_name: string;
    customer_email: string;
}

interface Stall {
    id: string;
    label: string;
    status: "terisi" | "tersedia";
    plate?: string;
    vehicle?: string;
    progress?: string;
}

interface PaginatedBookings {
    data: Booking[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    bookings: PaginatedBookings;
    stalls: Stall[];
    queueCount: number;
    pendingCount: number;
    filters?: { search?: string; status?: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<BookingStatus, "default" | "warning" | "success" | "danger"> = {
    pending:   "warning",
    verified:  "default",
    in_queue:  "warning",
    washing:   "default",
    done:      "success",
    cancelled: "danger",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
    pending:   "Menunggu",
    verified:  "Dikonfirmasi",
    in_queue:  "Di Antrian",
    washing:   "Dicuci",
    done:      "Selesai",
    cancelled: "Batal",
};

// ── Car Silhouette ────────────────────────────────────────────────────────────
const CarSilhouette = () => (
    <svg
        style={{ opacity: 0.07 }}
        width="100"
        height="50"
        viewBox="0 0 100 50"
        fill="currentColor"
    >
        <path d="M10 35 L15 20 Q20 12 30 12 L70 12 Q80 12 85 20 L90 35 Q92 38 90 40 L10 40 Q8 38 10 35Z" />
        <rect x="20" y="38" width="15" height="5" rx="2.5" />
        <rect x="65" y="38" width="15" height="5" rx="2.5" />
    </svg>
);

// ── Modal: Confirm Arrival ────────────────────────────────────────────────────
function ConfirmArrivalModal({
    booking,
    onClose,
}: {
    booking: Booking;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);

    const handle = () => {
        setLoading(true);
        router.post(
            `/admin/doorsmeer/verify/${booking.id}`,
            {},
            {
                onFinish: () => { setLoading(false); onClose(); },
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-venus p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-h4 text-super-black mb-1">Konfirmasi Kedatangan</h3>
                <p className="text-body-reg text-foreground/60 mb-5">
                    <span className="font-semibold text-foreground">{booking.booking_code}</span> –{" "}
                    {booking.customer_name} · {booking.license_plate}
                </p>

                <div className="bg-background border border-border rounded-venus p-4 mb-6">
                    <p className="text-body-reg text-foreground/60">
                        Sistem akan <span className="font-semibold text-foreground">otomatis</span> memeriksa bay yang tersedia:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-body-reg text-foreground/70">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            Bay kosong → langsung masuk pencucian
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                            Bay penuh → masuk antrian otomatis
                        </li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-border rounded-venus py-2.5 text-label-sm font-semibold text-foreground/70 hover:bg-surface transition-all"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handle}
                        disabled={loading}
                        className="flex-1 bg-secondary text-secondary-foreground rounded-venus py-2.5 text-label-sm font-semibold hover:bg-secondary/90 disabled:opacity-70 transition-all"
                    >
                        {loading ? "Memproses…" : "✓ Konfirmasi Kedatangan"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Modal: Mark Done ──────────────────────────────────────────────────────────
function MarkDoneModal({
    booking,
    onClose,
}: {
    booking: Booking;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);

    const handle = () => {
        setLoading(true);
        router.post(
            `/admin/doorsmeer/progress/${booking.id}`,
            { status: 'done' },
            {
                onFinish: () => { setLoading(false); onClose(); },
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-venus p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-h4 text-super-black mb-1">Tandai Selesai</h3>
                <p className="text-body-reg text-foreground/60 mb-5">
                    <span className="font-semibold text-foreground">{booking.booking_code}</span> –{" "}
                    {booking.customer_name} · {booking.license_plate}
                    {booking.stall && <span className="text-primary font-semibold"> · {booking.stall}</span>}
                </p>

                <div className="bg-background border border-border rounded-venus p-4 mb-6">
                    <p className="text-body-reg text-foreground/60">
                        Bay <span className="font-semibold text-foreground">{booking.stall}</span> akan dibebaskan dan antrian berikutnya akan otomatis masuk.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-border rounded-venus py-2.5 text-label-sm font-semibold text-foreground/70 hover:bg-surface transition-all"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handle}
                        disabled={loading}
                        className="flex-1 bg-emerald-600 text-white rounded-venus py-2.5 text-label-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 transition-all"
                    >
                        {loading ? "Memproses…" : "✓ Tandai Selesai"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Modal: Cancel Booking ─────────────────────────────────────────────────────
function CancelBookingModal({
    booking,
    onClose,
}: {
    booking: Booking;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");

    const handle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;
        
        setLoading(true);
        router.post(
            `/admin/doorsmeer/cancel/${booking.id}`,
            { reason: reason.trim() },
            {
                onFinish: () => { setLoading(false); onClose(); },
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-venus p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-h4 text-super-black mb-1">Batalkan Booking</h3>
                <p className="text-body-reg text-foreground/60 mb-5">
                    <span className="font-semibold text-foreground">{booking.booking_code}</span> –{" "}
                    {booking.customer_name} · {booking.license_plate}
                </p>

                <form onSubmit={handle}>
                    <div className="space-y-2 mb-6">
                        <label className="text-label-sm text-foreground/60 uppercase">Alasan Pembatalan</label>
                        <textarea
                            required
                            placeholder="Contoh: Order fiktif, Pelanggan tidak datang, dll."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-background border border-border rounded-venus px-4 py-3 text-body-m text-foreground focus:outline-none focus:border-red-500 transition-colors min-h-[100px]"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-border rounded-venus py-2.5 text-label-sm font-semibold text-foreground/70 hover:bg-surface transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !reason.trim()}
                            className="flex-1 bg-red-600 text-white rounded-venus py-2.5 text-label-sm font-semibold hover:bg-red-700 disabled:opacity-70 transition-all"
                        >
                            {loading ? "Memproses…" : "✘ Batalkan Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Action Button (context-aware, forward-only) ───────────────────────────────
function ActionButton({
    booking,
    onConfirm,
    onDone,
    onCancel,
}: {
    booking: Booking;
    onConfirm: () => void;
    onDone: () => void;
    onCancel: () => void;
}) {
    if (booking.status === 'done' || booking.status === 'cancelled') {
        return (
            <div className="flex flex-col gap-1">
                <span className={`text-xs font-bold ${booking.status === 'done' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {booking.status === 'done' ? '✓ SELESAI' : '✘ BATAL'}
                </span>
                {booking.admin_notes && (
                    <span className="text-[9px] text-foreground/40 italic truncate max-w-[100px]">
                        {booking.admin_notes}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {booking.status === 'pending' && (
                <button
                    onClick={onConfirm}
                    className="flex items-center gap-1.5 bg-secondary text-white px-3 py-1.5 rounded-venus text-xs font-semibold hover:bg-secondary/90 active:scale-95 transition-all"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Konfirmasi
                </button>
            )}

            {booking.status === 'washing' && (
                <button
                    onClick={onDone}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-venus text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Selesai
                </button>
            )}

            <button
                onClick={onCancel}
                title="Batalkan Booking"
                className="w-8 h-8 flex items-center justify-center rounded-venus border border-red-200 text-red-500 hover:bg-red-50 active:scale-90 transition-all"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BookingDoorsmeer({ bookings, stalls, queueCount, pendingCount, filters: urlFilters }: Props) {
    const [activeFilter, setActiveFilter] = useState<FilterTab>((urlFilters?.status as FilterTab) || "Semua");
    const [confirmTarget, setConfirmTarget] = useState<Booking | null>(null);
    const [doneTarget, setDoneTarget] = useState<Booking | null>(null);
    const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
    
    const filters: FilterTab[] = ["Semua", "Menunggu", "Antrian", "Dicuci", "Selesai", "Dibatalkan"];

    const bookingData: Booking[] = Array.isArray(bookings) ? bookings : (bookings?.data || []);

    const filteredBookings = bookingData;

    return (
        <AdminLayout>
            <Head title="Booking Doorsmeer – Venus Hub Admin" />

            {/* Header */}
            <PageHeader
                title="Booking Doorsmeer"
                subtitle={
                    pendingCount > 0
                        ? `⚠ ${pendingCount} booking menunggu konfirmasi kedatangan.`
                        : "Kelola antrean dan bay pencucian kendaraan."
                }
                action={
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/doorsmeer/walk-in"
                            className="bg-primary text-white text-label-sm font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 shadow-md flex items-center gap-2 transition-all active:scale-95"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Registrasi Walk-in
                        </Link>
                        {pendingCount > 0 && (
                            <span className="bg-amber-100 text-amber-600 border border-amber-200 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                {pendingCount} Menunggu
                            </span>
                        )}
                    </div>
                }
            />

            {/* Stall Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                {stalls.map((stall) =>
                    stall.status === "terisi" ? (
                        <div
                            key={stall.id}
                            className="bg-secondary rounded-venus p-4 md:p-5 relative overflow-hidden text-white"
                        >
                            <div className="absolute bottom-0 right-0 text-white">
                                <CarSilhouette />
                            </div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-white/60">{stall.label}</span>
                                <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase">
                                    Terisi
                                </span>
                            </div>
                            <p className="text-xl md:text-h3 text-white font-extrabold mb-0.5 uppercase">
                                {stall.plate}
                            </p>
                            <p className="text-xs text-white/70 mb-2">{stall.vehicle}</p>
                            <span className="inline-block bg-white/15 text-white/90 text-[10px] px-2.5 py-1 rounded-full font-semibold">
                                {stall.progress}
                            </span>
                        </div>
                    ) : (
                        <div
                            key={stall.id}
                            className="bg-card border-2 border-dashed border-border rounded-venus p-4 md:p-5 flex flex-col items-center justify-center gap-3 min-h-[130px]"
                        >
                            <span className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-foreground/30">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </span>
                            <div className="text-center">
                                <p className="text-xs text-foreground/40">{stall.label}</p>
                                <p className="text-base md:text-h4 text-super-black font-bold mt-1">Tersedia</p>
                            </div>
                        </div>
                    )
                )}

                {/* Queue count card */}
                <div className="bg-card border border-border rounded-venus p-4 md:p-5 flex flex-col items-center justify-center gap-2 min-h-[130px]">
                    <span className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </span>
                    <div className="text-center">
                        <p className="text-xs text-foreground/40">Antrian</p>
                        <p className="text-h3 text-super-black font-bold">{queueCount}</p>
                        <p className="text-[10px] text-foreground/40">kendaraan menunggu</p>
                    </div>
                </div>
            </div>

            {/* Queue Table */}
            <div className="bg-card border border-border rounded-venus overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-border">
                    <h2 className="text-lg md:text-h4 text-super-black font-bold">
                        Semua Booking
                        <span className="ml-2 text-label-sm text-foreground/40 font-normal">({(bookings as any).total ?? bookingData.length})</span>
                    </h2>
                    <FilterTabs
                        tabs={filters}
                        active={activeFilter}
                        onChange={(tab) => {
                            setActiveFilter(tab as FilterTab);
                            router.get(
                                window.location.pathname,
                                { search: urlFilters?.search || "", status: tab !== "Semua" ? tab : undefined },
                                { preserveState: true }
                            );
                        }}
                    />
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="px-6 py-12 text-center text-foreground/40 text-body-reg">
                        Tidak ada booking yang cocok dengan filter ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs md:text-body-reg">
                            <thead className="hidden md:table-header-group">
                                <tr className="border-b border-border">
                                    {["KODE", "PELANGGAN", "KENDARAAN", "LAYANAN", "BAY", "STATUS", "AKSI"].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left px-4 md:px-5 py-3 text-[10px] text-foreground/40 font-bold"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((b) => (
                                    <tr
                                        key={b.id}
                                        className={`border-b border-border/50 hover:bg-background/40 transition-colors ${
                                            b.status === "pending" ? "bg-amber-50/40" : 
                                            b.status === "cancelled" ? "bg-red-50/30" : ""
                                        }`}
                                    >
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <p className="text-super-black font-bold uppercase">{b.booking_code}</p>
                                            <p className="text-foreground/40 text-[10px]">{b.created_at}</p>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <p className="text-super-black font-semibold">{b.customer_name}</p>
                                            <p className="text-foreground/50 text-[10px] truncate max-w-[150px]">{b.customer_email}</p>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <p className="text-super-black font-semibold uppercase">{b.license_plate}</p>
                                            <p className="text-foreground/50 text-[10px]">{b.vehicle_class}</p>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <p className="text-foreground">{b.service_name}</p>
                                            <p className="text-foreground/40 text-[10px]">{b.service_duration}</p>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            {b.stall ? (
                                                <p className="text-primary text-xs font-bold uppercase">{b.stall}</p>
                                            ) : b.status === 'in_queue' ? (
                                                <p className="text-purple-500 text-[10px] font-semibold">DI ANTRIAN</p>
                                            ) : (
                                                <span className="text-foreground/30 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <Badge
                                                text={STATUS_LABEL[b.status]}
                                                variant={STATUS_BADGE[b.status]}
                                            />
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <ActionButton
                                                booking={b}
                                                onConfirm={() => setConfirmTarget(b)}
                                                onDone={() => setDoneTarget(b)}
                                                onCancel={() => setCancelTarget(b)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="px-4 md:px-6 py-3 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-xs text-foreground/40 text-center md:text-left">
                        Menampilkan {filteredBookings.length} dari {(bookings as any).total ?? bookingData.length} booking
                    </p>

                    {/* Pagination */}
                    {!Array.isArray(bookings) && bookings.links && bookings.links.length > 3 && (
                        <div className="flex items-center justify-center gap-1">
                            {bookings.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 text-xs md:text-sm rounded-md transition-colors ${
                                        link.active 
                                            ? 'bg-primary text-white font-bold' 
                                            : link.url 
                                                ? 'text-foreground/60 hover:bg-border' 
                                                : 'text-foreground/30 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {confirmTarget && (
                <ConfirmArrivalModal booking={confirmTarget} onClose={() => setConfirmTarget(null)} />
            )}
            {doneTarget && (
                <MarkDoneModal booking={doneTarget} onClose={() => setDoneTarget(null)} />
            )}
            {cancelTarget && (
                <CancelBookingModal booking={cancelTarget} onClose={() => setCancelTarget(null)} />
            )}
        </AdminLayout>
    );
}
