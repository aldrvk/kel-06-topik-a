import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import Card from '../../Components/Card/Card';
import { useFavorites } from '../../hooks/useFavorites';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
    tag: string;
    options?: Record<string, string[]>;
}

interface Props {
    product: Product;
    recommendations: Product[];
}

export default function ProductDetail({ product, recommendations }: Props) {

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const { isFavorited, toggleFavorite } = useFavorites();
    const [favAnimating, setFavAnimating] = useState(false);

    useEffect(() => {
        if (product.options && Object.keys(product.options).length > 0) {
            const initialOptions: Record<string, string> = {};
            Object.keys(product.options).forEach(key => {
                initialOptions[key] = (product.options as any)[key][0];
            });
            setSelectedOptions(initialOptions);
        } else {
            setSelectedOptions({});
        }
        setSelectedImageIndex(0);
        setQuantity(1);
    }, [product]);

    const formatPrice = (price: number) => {
        return 'Rp' + price.toLocaleString('id-ID');
    };

    const handleOptionSelect = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    };

    const handleAddToCart = () => {
        const cart = JSON.parse(localStorage.getItem('venus_cart_coffee') || '[]');
        const optionsStr = Object.keys(selectedOptions).length > 0 
            ? Object.values(selectedOptions).join(' / ') 
            : 'Default';
        const cartItemId = `${product.id}-${optionsStr}`;
        
        const existingItemIndex = cart.findIndex((item: any) => item.cartItemId === cartItemId);
        
        if (existingItemIndex >= 0) {
            toast.error("Menu ini sudah ada di keranjang Anda!");
            return;
        } else {
            cart.push({
                cartItemId,
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity,
                optionsStr
            });
        }
        
        localStorage.setItem('venus_cart_coffee', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart_updated'));
        
        router.visit('/coffee-shop', {
            onSuccess: () => toast.success("Menu berhasil masuk keranjang")
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Head title={`Coffee Shop - ${product.name}`} />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-8 text-label-sm text-foreground/60 uppercase">
                    <Link href="/coffee-shop" className="hover:text-primary transition-colors">{product.category}</Link>
                    <span>&rsaquo;</span>
                    <span className="text-foreground font-bold">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12 lg:mb-24">
                    {/* Left Column: Images */}
                    <div className="space-y-6">
                        <div className="bg-surface rounded-venus aspect-[4/5] relative flex items-center justify-center overflow-hidden border border-border shadow-2xl">
                            {product.id === 301 && (
                                <div className="absolute top-6 left-6 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-label-sm z-10">
                                    TERLARIS
                                </div>
                            )}
                            <img 
                                src={product.image || 'https://via.placeholder.com/600x800'} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-6">
                            <span className="inline-block bg-surface px-3 py-1 rounded-full text-label-sm text-foreground mb-4">
                                {product.category}
                            </span>
                            <h1 className="text-h1 mb-6 text-super-black uppercase tracking-tight">{product.name}</h1>
                            <p className="text-body-l text-foreground/80 mb-8 max-w-lg">
                                {product.description}
                            </p>
                            <div className="flex items-baseline gap-3 mb-10">
                                <span className="text-h2 text-super-black">{formatPrice(product.price)}</span>
                                <span className="text-label-sm text-foreground/60">/ DIBUAT SEGAR</span>
                            </div>
                        </div>

                        {/* Options */}
                        {product.options && Object.keys(product.options).length > 0 && Object.entries(product.options).map(([optionName, values]) => (
                            <div key={optionName} className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-label-sm text-super-black uppercase tracking-widest">{optionName}</h4>
                                    <span className="text-label-sm text-foreground/40 italic">PILIH SATU</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {(values as string[]).map(val => {
                                        const isSelected = selectedOptions[optionName] === val;
                                        return (
                                            <button
                                                key={val}
                                                onClick={() => handleOptionSelect(optionName, val)}
                                                className={`px-6 py-3 rounded-full text-label-sm transition-all border ${
                                                    isSelected 
                                                    ? 'bg-secondary text-secondary-foreground border-secondary shadow-md' 
                                                    : 'bg-background text-foreground border-border hover:bg-surface'
                                                }`}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Quantity and Actions */}
                        <div className="mb-8">
                            <h4 className="text-label-sm text-super-black uppercase tracking-widest mb-4">JUMLAH</h4>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-surface rounded-full border border-border h-14">
                                    <button 
                                        className="w-14 h-full flex items-center justify-center text-super-black hover:text-primary transition-colors text-h4"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center text-card-title">{quantity}</span>
                                    <button 
                                        className="w-14 h-full flex items-center justify-center text-super-black hover:text-primary transition-colors text-h4"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 mt-4">
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 bg-secondary hover:bg-secondary/90 !text-white h-12 sm:h-14 rounded-full flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-lg text-[10px] sm:text-label-sm tracking-widest font-bold group"
                            >
                                <span className="hidden sm:inline">TAMBAHKAN KE PESANAN — {formatPrice(product.price * quantity)}</span>
                                <span className="sm:hidden">TAMBAH — {formatPrice(product.price * quantity)}</span>
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                            <button 
                                onClick={() => {
                                    const { action } = toggleFavorite(product.id, {
                                        name: product.name,
                                        price: product.price,
                                        image: product.image,
                                    });
                                    setFavAnimating(true);
                                    setTimeout(() => setFavAnimating(false), 400);
                                    toast.success(action === 'added' ? 'Ditambahkan ke Favorit' : 'Dihapus dari Favorit');
                                }}
                                className={`w-14 h-14 flex items-center justify-center border rounded-full transition-all duration-300 ${
                                    isFavorited(product.id)
                                        ? 'bg-error/10 border-error/30 text-error'
                                        : 'border-border text-foreground hover:bg-surface hover:text-error'
                                }`}
                            >
                                <svg 
                                    className={`w-6 h-6 transition-transform duration-300 ${favAnimating ? 'scale-125' : 'scale-100'}`} 
                                    fill={isFavorited(product.id) ? 'currentColor' : 'none'} 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Recommendations Section */}
            <section className="bg-surface py-20 border-t border-border mt-auto">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-h2 text-super-black tracking-tight">Produk Lainnya</h2>
                        </div>
                        <Link href="/coffee-shop" className="text-label-sm text-super-black hover:text-primary border-b-2 border-super-black pb-1 uppercase tracking-widest transition-colors">
                            LIHAT SEMUA MENU
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendations.map((rec) => (
                            <Card 
                                key={rec.id}
                                id={rec.id}
                                name={rec.name}
                                price={rec.price}
                                description={rec.description}
                                image={rec.image}
                                href={`/coffee-shop/product/${rec.id}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
