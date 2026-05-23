import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { 
    PageHeader, 
    Badge, 
    FilterTabs,
    Modal,
    SecondaryButton
} from '../../Components/AdminUI';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    order_code: string;
    customer_name: string;
    unit: 'VAPE STORE' | 'COFFEE SHOP';
    items: OrderItem[];
    total: number;
    payment_method: 'cash' | 'qris';
    status: 'MENUNGGU PEMBAYARAN' | 'BERHASIL';
    progress_status: 'menunggu_pembayaran' | 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
    created_at: string;
}

interface PaginatedData {
    data: Order[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    orders: PaginatedData;
    filters?: { search?: string };
}

type FilterTab = 'Semua' | 'Vape Store' | 'Coffee Shop';

// ── Action Button (context-aware, forward-only) ───────────────────────────────
function ActionButton({
    order,
    onConfirm,
    onProcess,
    onReady,
    onDone,
    onCancel,
}: {
    order: Order;
    onConfirm: () => void;
    onProcess: () => void;
    onReady: () => void;
    onDone: () => void;
    onCancel: () => void;
}) {
    if (order.progress_status === 'completed' || order.progress_status === 'cancelled') {
        return (
            <div className="flex flex-col gap-1">
                <span className={`text-xs font-bold ${order.progress_status === 'completed' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {order.progress_status === 'completed' ? '✓ SELESAI' : '✘ BATAL'}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {order.status === 'MENUNGGU PEMBAYARAN' && order.progress_status === 'menunggu_pembayaran' && (
                <button 
                    onClick={onConfirm}
                    className="flex items-center gap-1.5 bg-secondary text-white px-3 py-1.5 rounded-venus text-xs font-semibold hover:bg-secondary/90 active:scale-95 transition-all"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Terima Bayar
                </button>
            )}

            {/* ── COFFEE SHOP FLOW ── */}
            {order.unit === 'COFFEE SHOP' && (
                <>
                    {order.progress_status === 'pending' && (
                        <button 
                            onClick={onProcess}
                            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-venus text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
                            </svg>
                            Siapkan Minuman
                        </button>
                    )}

                    {order.progress_status === 'processing' && (
                        <button 
                            onClick={onReady}
                            className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-venus text-xs font-semibold hover:bg-amber-600 active:scale-95 transition-all"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            Panggil / Siap
                        </button>
                    )}

                    {order.progress_status === 'ready' && (
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
                </>
            )}

            {/* ── VAPE STORE FLOW ── */}
            {order.unit === 'VAPE STORE' && (
                <>
                    {/* For Vape Store, once paid (pending), it is ready to be handed over. */}
                    {['pending', 'processing', 'ready'].includes(order.progress_status) && (
                        <button 
                            onClick={onDone}
                            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-venus text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" />
                            </svg>
                            Serahkan Barang
                        </button>
                    )}
                </>
            )}

            <button
                onClick={onCancel}
                title="Tolak/Batalkan Pesanan"
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
export default function PesananStore({ orders, filters: searchFilters }: Props) {
    const [activeFilter, setActiveFilter] = useState<FilterTab>('Semua');
    
    // Modal states
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState<number | string | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    const orderData = Array.isArray(orders) ? orders : (orders?.data || []);

    const filterTabsList: FilterTab[] = ['Semua', 'Vape Store', 'Coffee Shop'];

    const filteredOrders = orderData.filter((o) => {
        if (activeFilter === 'Semua') return true;
        if (activeFilter === 'Vape Store') return o.unit === 'VAPE STORE';
        if (activeFilter === 'Coffee Shop') return o.unit === 'COFFEE SHOP';
        return true;
    });

    const handleConfirmPayment = (orderId: number | string) => {
        router.post(`/admin/pesanan-store/${orderId}/confirm`, {}, {
            preserveScroll: true
        });
    };

    const handleUpdateProgress = (orderId: number | string, newStatus: string) => {
        router.post(`/admin/pesanan-store/${orderId}/progress`, { progress_status: newStatus }, {
            preserveScroll: true
        });
    };

    const openCancelModal = (orderId: number | string) => {
        setCancelOrderId(orderId);
        setCancelReason('');
        setIsCancelModalOpen(true);
    };

    const handleCancelSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cancelReason.trim()) {
            toast.error('Alasan pembatalan wajib diisi');
            return;
        }
        
        router.post(`/admin/pesanan-store/${cancelOrderId}/cancel`, { reason: cancelReason }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCancelModalOpen(false);
            }
        });
    };

    const formatPrice = (price: number) => {
        return 'Rp' + price.toLocaleString('id-ID');
    };

    const getProgressBadge = (progress: string) => {
        switch (progress) {
            case 'menunggu_pembayaran': return <Badge text="Menunggu Bayar" variant="warning" />;
            case 'pending':             return <Badge text="Diterima" variant="default" />;
            case 'processing':          return <Badge text="Disiapkan" variant="default" />;
            case 'ready':               return <Badge text="Siap Diambil" variant="success" />;
            case 'completed':           return <Badge text="Selesai" variant="success" />;
            case 'cancelled':           return <Badge text="Dibatalkan" variant="danger" />;
            default:                    return <Badge text={progress || 'Unknown'} variant="default" />;
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Pesanan Store – Admin Venus Hub" />

            <PageHeader 
                title="Daftar Pesanan Store" 
                subtitle="Kelola pesanan dari Vape Store dan Coffee Shop Anda."
            />

            <div className="bg-card border border-border rounded-venus overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-border">
                    <h2 className="text-lg md:text-h4 text-super-black font-bold">
                        Semua Pesanan
                        <span className="ml-2 text-label-sm text-foreground/40 font-normal">({filteredOrders.length})</span>
                    </h2>
                    <FilterTabs
                        tabs={filterTabsList}
                        active={activeFilter}
                        onChange={(tab) => setActiveFilter(tab as FilterTab)}
                    />
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="px-6 py-12 text-center text-foreground/40 text-body-reg">
                        Tidak ada pesanan yang cocok dengan filter ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs md:text-body-reg">
                            <thead className="hidden md:table-header-group">
                                <tr className="border-b border-border">
                                    {["ID PESANAN", "PELANGGAN", "UNIT", "METODE", "TOTAL", "STATUS", "AKSI"].map((h) => (
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
                                {filteredOrders.map((order) => (
                                    <tr 
                                        key={order.id} 
                                        className={`border-b border-border/50 hover:bg-background/40 transition-colors ${
                                            order.progress_status === "menunggu_pembayaran" ? "bg-amber-50/40" : 
                                            order.progress_status === "cancelled" ? "bg-red-50/30" : ""
                                        }`}
                                    >
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <p className="text-super-black font-bold uppercase">{order.order_code || order.id}</p>
                                            <p className="text-foreground/40 text-[10px]">
                                                {new Date(order.created_at).toLocaleString('id-ID', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <p className="text-super-black font-semibold">{order.customer_name}</p>
                                            <p className="text-foreground/50 text-[10px] truncate max-w-[150px]">
                                                {order.items?.length || 0} items
                                            </p>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <Badge 
                                                text={order.unit} 
                                                variant={order.unit === 'VAPE STORE' ? 'warning' : 'default'} 
                                            />
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <span className="text-label-sm font-bold uppercase tracking-widest text-foreground/50">
                                                {order.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <p className="text-primary font-bold">{formatPrice(order.total)}</p>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            {getProgressBadge(order.progress_status)}
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-4">
                                            <ActionButton
                                                order={order}
                                                onConfirm={() => handleConfirmPayment(order.id)}
                                                onProcess={() => handleUpdateProgress(order.id, 'processing')}
                                                onReady={() => handleUpdateProgress(order.id, 'ready')}
                                                onDone={() => handleUpdateProgress(order.id, 'completed')}
                                                onCancel={() => openCancelModal(order.id)}
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
                        Menampilkan {filteredOrders.length} dari {(orders as any).total || orderData.length} pesanan
                    </p>
                    
                    {/* Pagination */}
                    {!Array.isArray(orders) && orders.links && orders.links.length > 3 && (
                        <div className="flex items-center justify-center gap-1">
                            {orders.links.map((link, idx) => (
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

            {/* Cancel Modal */}
            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title="Tolak / Batalkan Pesanan"
            >
                <form onSubmit={handleCancelSubmit}>
                    <div className="space-y-4">
                        <p className="text-body-reg text-foreground/70">
                            Anda yakin ingin menolak atau membatalkan pesanan ini? Silakan berikan alasan pembatalan agar pembeli mengerti (mis. "Stok biji kopi habis").
                        </p>
                        <div>
                            <label className="block text-label-sm font-bold text-super-black mb-2">Alasan Penolakan</label>
                            <textarea
                                required
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full bg-background border border-border rounded-venus p-3 text-body-reg text-foreground focus:outline-none focus:border-red-500 transition-colors resize-none min-h-[100px]"
                                placeholder="Tulis alasan di sini..."
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsCancelModalOpen(false)}>Batal</SecondaryButton>
                        <button 
                            type="submit"
                            disabled={!cancelReason.trim()}
                            className="bg-red-600 text-white px-5 py-2.5 rounded-full text-label-sm font-bold hover:bg-red-700 active:scale-95 transition-all shadow-md disabled:opacity-70"
                        >
                            Konfirmasi Penolakan
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
