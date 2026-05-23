import { Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import ButtonInitiate from "./Buttons/ButtonInitiate";
import UserProfileDropdown from "./UserProfileDropdown";
import { useFlashToast } from "../hooks/useFlashToast";
import { useFavorites } from "../hooks/useFavorites";

interface NavbarProps {
    onOpenAuthModal?: (type: "login" | "register") => void;
}

export default function Navbar({ onOpenAuthModal }: NavbarProps = {}) {
    useFlashToast();
    const { auth } = usePage<any>().props;
    const { url = '' } = usePage();
    const isVapeStore = url.startsWith('/vape-store');
    const isCoffeeShop = url.startsWith('/coffee-shop');
    const isDoorsmeer = url.startsWith('/doorsmeer');
    const isBengkel = url.startsWith('/bengkel');
    const isRentalPs = url.startsWith('/rental-ps');
    
    // Extract search query from URL
    const searchParams = new URLSearchParams(window.location.search);
    const initialSearch = searchParams.get('search') || '';

    const [cartCount, setCartCount] = useState(0);
    const { favoriteIds, favoriteMeta, toggleFavorite } = useFavorites();
    const [favOpen, setFavOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    
    const favRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Sync searchQuery with URL changes
    useEffect(() => {
        setSearchQuery(initialSearch);
    }, [initialSearch]);

    // Handle Search Submission
    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const path = isVapeStore ? '/vape-store' : '/coffee-shop';
        router.get(path, { search: searchQuery }, { preserveState: true });
        setSearchOpen(false);
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (favRef.current && !favRef.current.contains(e.target as Node)) {
                setFavOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [url]);

    useEffect(() => {
        if (!isVapeStore && !isCoffeeShop) return;
        
        const updateCartCount = () => {
            try {
                const storageKey = isVapeStore ? 'venus_cart' : 'venus_cart_coffee';
                const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
                setCartCount(Array.isArray(cart) ? cart.length : 0);
            } catch (e) {
                setCartCount(0);
            }
        };
        
        updateCartCount();
        window.addEventListener('cart_updated', updateCartCount);
        return () => window.removeEventListener('cart_updated', updateCartCount);
    }, [isVapeStore, isCoffeeShop]);

    const navItems = [
        { name: 'Home', href: '/', active: url === '/' },
        { name: 'Doorsmeer', href: '/doorsmeer', active: isDoorsmeer },
        { name: 'Coffee Shop', href: '/coffee-shop', active: isCoffeeShop },
        { name: 'Vape Store', href: '/vape-store', active: isVapeStore },
        { name: 'Bengkel', href: '/bengkel', active: isBengkel },
        { name: 'Rental PS', href: '/rental-ps', active: isRentalPs },
    ];

    const formatPrice = (p: number) => 'Rp' + p.toLocaleString('id-ID');

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    
                    {/* LOGO */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-h3 text-primary tracking-tighter flex items-center gap-1 group">
                            <span className="font-extrabold group-hover:scale-105 transition-transform duration-300">VENUS</span>
                            <span className="text-super-black dark:text-foreground font-light">HUB</span>
                        </Link>
                    </div>

                    {/* NAV LINKS — Desktop */}
                    <div className="hidden lg:flex space-x-6 xl:space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-bodyM transition-all relative py-2 group ${
                                    item.active ? 'text-primary font-bold' : 'text-foreground/70 hover:text-primary'
                                }`}
                            >
                                {item.name}
                                <span className={`absolute bottom-0 left-0 h-[2px] bg-primary rounded-full transition-all duration-300 ${
                                    item.active ? 'w-full' : 'w-0 group-hover:w-full opacity-50'
                                }`} />
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
                        
                        {/* Search Bar — Desktop (Only Store)
                        {(isVapeStore || isCoffeeShop) && (
                            <div ref={searchRef} className="hidden md:block relative">
                                {searchOpen ? (
                                    <form onSubmit={handleSearch} className="flex items-center animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="relative">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Cari produk..."
                                                className="w-48 lg:w-64 bg-surface border border-primary/30 rounded-full py-1.5 pl-9 pr-4 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-70" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                            </svg>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setSearchOpen(false)}
                                            className="ml-2 text-foreground/40 hover:text-foreground transition-colors"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </form>
                                ) : (
                                    <button 
                                        onClick={() => setSearchOpen(true)}
                                        className="p-2 text-foreground/60 hover:text-primary transition-all hover:bg-primary/5 rounded-full"
                                        aria-label="Cari"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )} */}

                        {/* Favorites Icon */}
                        {(isVapeStore || isCoffeeShop) && (
                            <div ref={favRef} className="relative">
                                <button
                                    onClick={() => setFavOpen(prev => !prev)}
                                    aria-label="Favorites"
                                    className="p-2 text-foreground/60 hover:text-error transition-all hover:bg-error/5 rounded-full flex items-center relative"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill={favoriteIds.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={favoriteIds.length > 0 ? 'text-error' : ''}>
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    {favoriteIds.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-background animate-pulse"></span>
                                    )}
                                </button>

                                {/* Favorites Dropdown */}
                                {favOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-72 sm:w-80 bg-card rounded-venus border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-border flex items-center justify-between bg-surface/30">
                                            <h3 className="text-h4 text-super-black">Favorit Saya</h3>
                                            <span className="text-label-sm px-2 py-0.5 bg-primary/10 text-primary rounded-full">{favoriteIds.length}</span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                            {favoriteIds.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <div className="w-12 h-12 mx-auto bg-surface rounded-full flex items-center justify-center mb-3">
                                                        <svg className="w-6 h-6 text-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                                        </svg>
                                                    </div>
                                                    <p className="text-body text-foreground/40 font-medium">Belum ada produk favorit</p>
                                                </div>
                                            ) : (
                                                favoriteIds.map(id => {
                                                    const meta = favoriteMeta[id];
                                                    return (
                                                        <div key={id} className="group flex items-center justify-between px-4 py-3 hover:bg-surface/50 transition-colors border-b border-border/30 last:border-0">
                                                            <Link
                                                                href={`${isVapeStore ? '/vape-store' : '/coffee-shop'}/product/${id}`}
                                                                className="flex-1 mr-3 min-w-0"
                                                                onClick={() => setFavOpen(false)}
                                                            >
                                                                <p className="text-body-m font-bold text-super-black group-hover:text-primary transition-colors truncate">
                                                                    {meta?.name || `Produk #${id}`}
                                                                </p>
                                                                {meta?.price ? (
                                                                    <p className="text-label-sm text-foreground/40 mt-0.5 font-medium">{formatPrice(meta.price)}</p>
                                                                ) : null}
                                                            </Link>
                                                            <button
                                                                onClick={() => toggleFavorite(id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-foreground/30 hover:text-error hover:bg-error/10 rounded-full transition-all"
                                                                aria-label="Hapus dari favorit"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                        {favoriteIds.length > 0 && (
                                            <div className="p-3 border-t border-border bg-surface/50">
                                                <Link
                                                    href={isVapeStore ? '/vape-store' : '/coffee-shop'}
                                                    className="flex items-center justify-center gap-2 py-2 text-label-sm text-primary font-extrabold hover:bg-primary/5 rounded-venus transition-colors"
                                                    onClick={() => setFavOpen(false)}
                                                >
                                                    LIHAT KATALOG
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cart Icon */}
                        {(isVapeStore || isCoffeeShop) && (
                            <Link 
                                href={auth?.user ? (isVapeStore ? "/vape-store/cart" : "/coffee-shop/cart") : "/login"} 
                                onClick={(e) => {
                                    if (!auth?.user) {
                                        if (onOpenAuthModal) {
                                            e.preventDefault();
                                            onOpenAuthModal("login");
                                        }
                                    }
                                }}
                                aria-label="Cart" 
                                className="p-2 text-foreground/60 hover:text-primary transition-all hover:bg-primary/5 rounded-full relative flex items-center"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-black rounded-full flex items-center justify-center border border-background">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Context-specific links — Desktop only */}
                        <div className="hidden xl:flex items-center gap-2 border-l border-border pl-5 ml-2">
                            {(isDoorsmeer || isBengkel || isRentalPs) && auth?.user && (
                                <Link
                                    href={`/${isDoorsmeer ? 'doorsmeer' : isBengkel ? 'bengkel' : 'rental-ps'}/my-bookings`}
                                    className="flex items-center gap-2 px-3 py-1.5 text-label-sm font-extrabold text-foreground/60 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    BOOKING SAYA
                                </Link>
                            )}

                            {(isCoffeeShop || isVapeStore) && auth?.user && (
                                <Link
                                    href={`/${isCoffeeShop ? 'coffee-shop' : 'vape-store'}/my-orders`}
                                    className="flex items-center gap-2 px-3 py-1.5 text-label-sm font-extrabold text-foreground/60 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    PESANAN SAYA
                                </Link>
                            )}
                        </div>
                        
                        {/* Auth — Desktop only */}
                        <div className="hidden lg:flex items-center gap-4">
                            {auth?.user ? (
                                <UserProfileDropdown user={auth.user} />
                            ) : onOpenAuthModal ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => onOpenAuthModal("login")}
                                        className="text-body font-bold text-foreground/70 hover:text-primary transition-colors px-4"
                                    >
                                        Masuk
                                    </button>
                                    <ButtonInitiate
                                        variant="primary"
                                        onClick={() => onOpenAuthModal("register")}
                                        className="!px-6 !py-2 !text-body"
                                    >
                                        Mulai
                                    </ButtonInitiate>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/login"
                                        className="text-body font-bold text-foreground/70 hover:text-primary transition-colors px-4"
                                    >
                                        Masuk
                                    </Link>
                                    <Link href="/register">
                                        <ButtonInitiate
                                            variant="primary"
                                            className="!px-6 !py-2 !text-body"
                                        >
                                            Mulai
                                        </ButtonInitiate>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Hamburger Button — Mobile/Tablet */}
                        <button 
                            onClick={() => setMobileOpen(prev => !prev)}
                            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-venus text-foreground hover:bg-surface transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            ) : (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            )}
                        </button>
                    </div>
                    
                </div>
            </div>

            {/* MOBILE DRAWER */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                        
                        {/* Nav Links */}
                        <div className="grid grid-cols-2 gap-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`px-4 py-3 rounded-venus text-body transition-all ${
                                        item.active 
                                            ? 'bg-primary/10 text-primary font-bold border border-primary/20' 
                                            : 'text-foreground/70 hover:bg-surface border border-transparent'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Context Links */}
                        {auth?.user && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-4">Menu Pribadi</p>
                                <div className="grid grid-cols-1 gap-1">
                                    {(isDoorsmeer || isBengkel || isRentalPs) && (
                                        <Link href={`/${isDoorsmeer ? 'doorsmeer' : isBengkel ? 'bengkel' : 'rental-ps'}/my-bookings`} className="flex items-center gap-3 px-4 py-3 text-body text-foreground/80 hover:bg-surface rounded-venus transition-colors">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            Booking Saya
                                        </Link>
                                    )}
                                    {(isCoffeeShop || isVapeStore) && (
                                        <Link href={`/${isCoffeeShop ? 'coffee-shop' : 'vape-store'}/my-orders`} className="flex items-center gap-3 px-4 py-3 text-body text-foreground/80 hover:bg-surface rounded-venus transition-colors">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                            Pesanan Saya
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Auth Section */}
                        <div className="border-t border-border pt-6">
                            {auth?.user ? (
                                <div className="flex items-center gap-4 bg-surface/50 p-4 rounded-venus">
                                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-h4 shadow-sm">
                                        {auth.user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-body font-black text-super-black truncate">{auth.user.name}</p>
                                        <p className="text-label-sm text-foreground/40 truncate mt-0.5">{auth.user.email}</p>
                                    </div>
                                    <Link href="/logout" method="post" as="button" className="p-2 text-foreground/30 hover:text-error transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { onOpenAuthModal?.("login"); setMobileOpen(false); }}
                                        className="flex-1 py-3.5 text-center text-body font-bold border border-border rounded-venus hover:bg-surface transition-all active:scale-95"
                                    >
                                        Masuk
                                    </button>
                                    <button
                                        onClick={() => { onOpenAuthModal?.("register"); setMobileOpen(false); }}
                                        className="flex-1 py-3.5 text-center text-body font-bold bg-primary text-primary-foreground rounded-venus hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                                    >
                                        Daftar
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </nav>
    );
}
