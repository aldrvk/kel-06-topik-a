import React, { ReactNode, useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import { useFlashToast } from '../hooks/useFlashToast';

// ── Icons ────────────────────────────────────────────────────────────────────
const IconDashboard = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
);
const IconDoorsmeer = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    </svg>
);
const IconBengkel = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
);
const IconPS = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h4M8 10v4M15 11h2M18 11h2" />
    </svg>
);
const IconCoffee = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 010 8h-1" /><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4z" />
        <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
    </svg>
);
const IconVape = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="6" height="16" rx="1" /><rect x="14" y="6" width="6" height="16" rx="1" />
        <path d="M7 6V4a1 1 0 011-1h0a1 1 0 011 1v2M17 6V4a1 1 0 011-1h0a1 1 0 011 1v2" />
    </svg>
);
const IconJadwal = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IconLaporan = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
);
const IconSettings = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);
const IconLogout = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const IconSearch = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconBell = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);
const IconCalendar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

// ── Nav Items Definition ──────────────────────────────────────────────────────
const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { href: '/admin/booking-doorsmeer', label: 'Booking Doorsmeer', icon: <IconDoorsmeer /> },
    { href: '/admin/booking-bengkel', label: 'Booking Bengkel', icon: <IconBengkel /> },
    { href: '/admin/booking-rental-ps', label: 'Booking Rental PS', icon: <IconPS /> },
    { href: '/admin/katalog-coffee', label: 'Katalog Coffee Shop', icon: <IconCoffee /> },
    { href: '/admin/katalog-vape', label: 'Katalog Vape Store', icon: <IconVape /> },
    { href: '/admin/pesanan-store', label: 'Daftar Pesanan', icon: <IconLaporan /> },
    // { href: '/admin/jadwal', label: 'Jadwal', icon: <IconJadwal /> },
    { href: '/admin/laporan', label: 'Laporan', icon: <IconLaporan /> },
];

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    useFlashToast();
    const { url } = usePage();
    const currentPath = url.split('?')[0];
    
    // Controlled search input
    const initialSearch = new URLSearchParams(url.split('?')[1] || '').get('search') || '';
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setSearchTerm(new URLSearchParams(url.split('?')[1] || '').get('search') || '');
        setIsMobileMenuOpen(false); // Close menu on route change
    }, [url]);

    const isActive = (href: string) => url.startsWith(href);

    const showSearch = !['/admin/dashboard', '/admin/laporan', '/admin/pengaturan'].includes(currentPath);

    // Contextual placeholders
    let searchPlaceholder = "Ketik untuk mencari (tekan Enter)...";
    if (currentPath === '/admin/pesanan-store') {
        searchPlaceholder = "Cari ID Pesanan / Nama Pelanggan...";
    } else if (currentPath.startsWith('/admin/booking')) {
        searchPlaceholder = "Cari ID Booking / Nama / Nopol...";
    } else if (currentPath.startsWith('/admin/katalog')) {
        searchPlaceholder = "Cari Nama Produk / Kategori...";
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity" 
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className={`fixed inset-y-0 left-0 w-36 bg-secondary flex flex-col shrink-0 z-40 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <p className="font-heading font-bold text-white text-[15px] leading-tight">Venus Hub</p>
                        <p className="text-white/50 text-[10px] mt-0.5 leading-tight">Admin Dashboard</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto hide-scrollbar relative" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                    <div className="pt-3">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            const notifications = (usePage().props.notifications as any) || {};
                            let count = 0;
                            if (item.href === '/admin/booking-doorsmeer') count = notifications.doorsmeerCount || 0;
                            else if (item.href === '/admin/booking-bengkel') count = notifications.bengkelCount || 0;
                            else if (item.href === '/admin/booking-rental-ps') count = notifications.rentalCount || 0;
                            else if (item.href === '/admin/pesanan-store') count = notifications.storeCount || 0;
                            
                            const displayCount = count >= 10 ? '9+' : count;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-1.5 px-2 py-3 mx-2 my-0.5 rounded-venus transition-all text-center ${
                                        active
                                            ? 'bg-white/15 text-white'
                                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <div className="relative">
                                        <span className={active ? 'text-white' : 'text-white/60'}>{item.icon}</span>
                                        {count > 0 && (
                                            <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full px-0.5 border border-[#1b434d] shadow-sm">
                                                {displayCount}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '10px', lineHeight: '13px', fontWeight: 500 }} className="leading-tight">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                        {/* Spacer at the bottom to guarantee no clipping on scroll limit */}
                        <div className="h-6" />
                    </div>
                </nav>

                {/* Bottom */}
                <div className="pb-4 border-t border-white/10 pt-3">
                    <Link
                        href="/admin/pengaturan"
                        className="flex flex-col items-center gap-1.5 px-2 py-2.5 mx-2 rounded-venus text-white/60 hover:bg-white/10 hover:text-white transition-all text-center"
                    >
                        <IconSettings />
                        <span style={{ fontSize: '10px', fontWeight: 500 }}>Pengaturan</span>
                    </Link>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full flex flex-col items-center gap-1.5 px-2 py-2.5 mx-0 rounded-venus text-red-400 hover:bg-red-500/10 transition-all text-center"
                    >
                        <IconLogout />
                        <span style={{ fontSize: '10px', fontWeight: 500 }}>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* ── Main Area ───────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Top Bar */}
                <header className="h-14 bg-background border-b border-border flex items-center px-4 md:px-6 gap-3 shrink-0">
                    
                    {/* Hamburger Mobile Toggle */}
                    <button 
                        className="md:hidden p-2 -ml-2 text-foreground/60 hover:text-foreground transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    {/* Search */}
                    {showSearch ? (
                        <div className="flex-1 max-w-md relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30">
                                <IconSearch />
                            </span>
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="w-full bg-card border border-border rounded-venus pl-9 pr-4 py-2 text-body-reg text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.get(currentPath, { search: searchTerm }, { preserveState: true, preserveScroll: true });
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}

                    <div className="flex items-center gap-3 ml-auto">
                        <Link 
                            href="/admin/dashboard" 
                            className="w-9 h-9 flex items-center justify-center rounded-venus text-foreground/60 hover:bg-card hover:text-foreground transition-all border border-border relative"
                        >
                            <IconBell />
                            {((usePage().props.notifications as any)?.pendingCount > 0) && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
                                    {(usePage().props.notifications as any).pendingCount}
                                </span>
                            )}
                        </Link>
                        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-border">
                            <span className="text-body-m text-foreground font-semibold">Venus Hub</span>
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xs">V</div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
