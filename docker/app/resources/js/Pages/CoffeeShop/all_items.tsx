import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import CoffeeCategoryTabs from '../../Components/CoffeeCategoryTabs';
import SearchBar from '../../Components/SearchBar';
import ProductNotFound from '../../Components/ProductNotFound';
import Card from '../../Components/Card/Card';
import Pagination from '../../Components/Pagination';
import StoreClosedBanner from '../../Components/StoreClosedBanner';
import { useOperationalStatus } from '../../hooks/useOperationalStatus';

const StarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

const CupIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
);

const BeanIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c1.66 0 3.14-.68 4.22-1.78l-8.44-8.44C8.86 6.68 10.34 6 12 6z"></path></svg>
);

const FoodIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>
);

const iconMap: Record<string, React.ReactNode> = {
    'StarIcon': <StarIcon />,
    'CupIcon': <CupIcon />,
    'BeanIcon': <BeanIcon />,
    'FoodIcon': <FoodIcon />,
};

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: string;
    description: string;
    image: string;
    tag: string;
    tag_icon: string;
}

interface PaginatedData {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    products: PaginatedData;
    categories: string[];
    filters?: { search?: string, category?: string };
}

export default function AllItems({ products, categories, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const { isOpen, message } = useOperationalStatus('Coffee Shop');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/coffee-shop', { search: searchTerm, category: filters?.category || 'all' }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-background">
            <Head title="Coffee Shop - Semua Menu" />
            <Navbar />
            
            {!isOpen && <StoreClosedBanner message={message} />}

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <p className="text-label-sm text-primary mb-4 uppercase">Coffee Shop</p>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-h1 text-super-black mb-4">
                                Crafted for <span className="text-primary">Perfection</span>
                            </h1>
                            <p className="text-body-l text-foreground">
                                Temukan racikan kopi terbaik, minuman segar, dan hidangan pendamping yang dibuat sepenuh hati.
                            </p>
                        </div>

                        <form onSubmit={handleSearch}>
                            <SearchBar 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </form>
                    </div>
                </div>

                {/* Categories */}
                <CoffeeCategoryTabs activeCategory={filters?.category || 'all'} categories={categories} />

                {/* Product Grid */}
                {products.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {products.data.map((product) => (
                                <Card 
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={`Rp${product.price.toLocaleString('id-ID')}`}
                                    description={product.description}
                                    image={product.image}
                                    href={`/coffee-shop/product/${product.id}`}
                                />
                            ))}
                        </div>
                        <Pagination links={products.links} />
                    </>
                ) : (
                    <ProductNotFound searchTerm={searchTerm} onClear={() => {
                        setSearchTerm('');
                        router.get('/coffee-shop');
                    }} />
                )}

            </main>
            <Footer />
        </div>
    );
}
