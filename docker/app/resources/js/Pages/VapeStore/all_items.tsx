import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import CategoryTabs from '../../Components/CategoryTabs';
import SearchBar from '../../Components/SearchBar';
import ProductDetailButton from '../../Components/ProductDetailButton';
import ProductNotFound from '../../Components/ProductNotFound';
import Card from '../../Components/Card/Card';
import Pagination from '../../Components/Pagination';
import StoreClosedBanner from '../../Components/StoreClosedBanner';
import { useOperationalStatus } from '../../hooks/useOperationalStatus';

// Importing images
import xmaxImg from '../../../images/Vape Store/xmax v3 pro.jpg';
import arcticImg from '../../../images/Vape Store/arctic menthol.jpg';
import blueberryImg from '../../../images/Vape Store/blueberry ice.jpg';
import nitecoreImg from '../../../images/Vape Store/nitecore battery.png';
import apexImg from '../../../images/Vape Store/apex titanium.jpg';
import nanoImg from '../../../images/Vape Store/nano pod s ii.jpg';

const StarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

const DropIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
);

const BatteryIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line><polygon points="11 6 7 12 11 12 10 18 14 12 10 12 11 6"></polygon></svg>
);

const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
);

const iconMap: Record<string, React.ReactNode> = {
    'StarIcon': <StarIcon />,
    'DropIcon': <DropIcon />,
    'BatteryIcon': <BatteryIcon />,
    'ShieldIcon': <ShieldIcon />,
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
    const { isOpen, message } = useOperationalStatus('Vape Store');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/vape-store', { search: searchTerm, category: filters?.category || 'all' }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-background">
            <Head title="Vape Store - Semua Produk" />
            <Navbar />
            
            {!isOpen && <StoreClosedBanner message={message} />}

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <p className="text-label-sm text-primary mb-4 uppercase">Vape Store</p>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-h1 text-super-black mb-4">
                                Redefining the Art of <span className="text-primary">Vapor</span>
                            </h1>
                            <p className="text-body-l text-foreground">
                                Temukan pilihan perangkat premium dan e-liquid buatan tangan yang dirancang khusus untuk para penggemar yang cerdas.
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
                <CategoryTabs activeCategory={filters?.category || 'all'} categories={categories} />

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
                                    href={`/vape-store/product/${product.id}`}
                                />
                            ))}
                        </div>
                        <Pagination links={products.links} />
                    </>
                ) : (
                    <ProductNotFound searchTerm={searchTerm} onClear={() => {
                        setSearchTerm('');
                        router.get('/vape-store');
                    }} />
                )}

            </main>
            <Footer />
        </div>
    );
}
