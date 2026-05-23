import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AdminLayout from "../../Layouts/AdminLayout";
import {
    PageHeader,
    Badge,
    FilterTabs,
    PrimaryButton,
    SearchInput,
} from "../../Components/AdminUI";

interface ProductOption {
    group: string;
    choices: string;
}

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: "Tersedia" | "Habis" | "Terbatas";
    sold: number;
    description?: string;
    image?: string;
    options?: Record<string, string[]>;
}

type FilterTab = "Semua" | "Device" | "Liquid" | "Accessories";

const statusBadge: Record<Product["stock"], string> = {
    Tersedia: "bg-primary/15 text-secondary border border-primary/30",
    Terbatas: "bg-orange-100 text-orange-600 border border-orange-200",
    Habis: "bg-red-100 text-red-600 border border-red-200",
};

interface PaginatedProducts {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    products: PaginatedProducts;
    categories: string[];
    filters?: { search?: string; category?: string };
    stats: {
        total_products: number;
        total_sold: number;
        out_of_stock: number;
        est_revenue: number;
    };
}

import { Link } from "@inertiajs/react";

export default function KatalogVapeStore({ products, categories = [], filters: urlFilters, stats }: Props) {
    const [activeFilter, setActiveFilter] = useState<FilterTab>((urlFilters?.category as FilterTab) || "Semua");
    const [search, setSearch] = useState(urlFilters?.search || "");
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    
    // Form for product
    const [optionsList, setOptionsList] = useState<ProductOption[]>([]);
    
    // Form for categories
    const { data: catData, setData: setCatData, post: postCat, processing: processingCat } = useForm({
        unit: 'VAPE STORE',
        categories: categories
    });

    const { data, setData, post, put, reset, processing, errors } = useForm({
        unit: "VAPE STORE",
        name: "",
        category: categories.length > 0 ? categories[0] : "",
        price: 0 as number | string,
        stock: "Tersedia",
        description: "",
        image: null as File | null,
        options: null as Record<string, string[]> | null,
    });

    const openAddModal = () => {
        reset();
        setData("unit", "VAPE STORE");
        setOptionsList([]);
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        
        let initialOptions: ProductOption[] = [];
        if (product.options) {
            initialOptions = Object.entries(product.options).map(([k, v]) => ({
                group: k,
                choices: v.join(', ')
            }));
        }

        setOptionsList(initialOptions);

        setData({
            unit: "VAPE STORE",
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            description: product.description || "",
            image: null,
            options: product.options || null,
        });
        setIsProductModalOpen(true);
    };

    const submitProduct = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Process optionsList into an object before submit
        let finalOptions: Record<string, string[]> | null = null;
        if (optionsList.length > 0) {
            finalOptions = {};
            optionsList.forEach(opt => {
                if (opt.group.trim()) {
                    finalOptions![opt.group.trim()] = opt.choices.split(',').map(s => s.trim()).filter(s => s);
                }
            });
        }

        const formData = {
            ...data,
            options: finalOptions
        };

        if (editingProduct) {
            router.post(`/admin/store/product/${editingProduct.id}`, {
                _method: 'put',
                ...formData
            }, {
                onSuccess: () => setIsProductModalOpen(false),
            });
        } else {
            router.post(`/admin/store/product`, formData, {
                onSuccess: () => setIsProductModalOpen(false),
            });
        }
    };

    const openDeleteModal = (product: Product) => {
        setDeletingProduct(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingProduct) {
            router.delete(`/admin/store/product/${deletingProduct.id}`, {
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    const saveCategories = (e: React.FormEvent) => {
        e.preventDefault();
        postCat('/admin/store/categories', {
            onSuccess: () => setIsCategoryModalOpen(false)
        });
    };

    const filters = ["Semua", ...categories];

    const productData: Product[] = Array.isArray(products) ? products : (products?.data || []);
    const filtered = productData;

    return (
        <AdminLayout>
            <Head title="Katalog Vape Store – Venus Hub Admin" />

            <PageHeader
                title="Katalog Vape Store"
                subtitle="Kelola produk, stok, dan harga item di Vape Store."
                action={
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                setCatData('categories', categories);
                                setIsCategoryModalOpen(true);
                            }}
                            className="bg-surface border border-border text-foreground hover:bg-card px-4 py-2 rounded-venus text-label-sm font-semibold transition-all flex items-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Kelola Kategori
                        </button>
                        <PrimaryButton onClick={openAddModal}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Tambah Produk
                        </PrimaryButton>
                    </div>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {[
                    {
                        label: "Total Produk",
                        value: stats.total_products,
                        emoji: "🛒",
                        color: "bg-secondary/10 text-secondary",
                    },
                    {
                        label: "Total Terjual",
                        value: `${stats.total_sold} pcs`,
                        emoji: "📦",
                        color: "bg-primary/10 text-primary",
                    },
                    {
                        label: "Produk Habis",
                        value: stats.out_of_stock,
                        emoji: "⚠️",
                        color: "bg-red-50 text-red-500",
                    },
                    {
                        label: "Est. Nilai Terjual",
                        value: `Rp ${(stats.est_revenue / 1000000).toFixed(1)}jt`,
                        emoji: "💎",
                        color: "bg-emerald-50 text-emerald-600",
                    },
                ].map((s, i) => (
                    <div
                        key={i}
                        className="bg-card border border-border rounded-venus p-4 md:p-5"
                    >
                        <div
                            className={`w-10 h-10 rounded-venus flex items-center justify-center text-lg mb-3 ${s.color}`}
                        >
                            {s.emoji}
                        </div>
                        <p className="text-xs md:text-body-reg text-foreground/50">
                            {s.label}
                        </p>
                        <p className="text-lg md:text-h3 text-super-black mt-1 font-bold">
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-border">
                <FilterTabs
                    tabs={filters}
                    active={activeFilter}
                    onChange={(tab) => {
                        setActiveFilter(tab as FilterTab);
                        router.get(
                            window.location.pathname,
                            { search: search, category: tab !== 'Semua' ? tab : undefined },
                            { preserveState: true }
                        );
                    }}
                />
                <div className="flex-1 md:max-w-xs">
                    <SearchInput
                        placeholder="Cari produk atau brand..."
                        value={search}
                        onChange={(val) => {
                            setSearch(val);
                            router.get(
                                window.location.pathname,
                                { search: val, category: activeFilter !== 'Semua' ? activeFilter : undefined },
                                { preserveState: true, replace: true }
                            );
                        }}
                    />
                </div>
            </div>

            <div className="bg-card border border-border rounded-venus overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-body-m">
                        <thead className="hidden md:table-header-group">
                            <tr className="border-b border-border">
                                {[
                                    "NO",
                                    "NAMA PRODUK",
                                    "KATEGORI",
                                    "HARGA",
                                    "TERJUAL",
                                    "STOK",
                                    "AKSI",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-4 md:px-6 py-3 text-xs md:text-label-sm text-foreground/40 font-semibold"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, i) => (
                                <tr
                                    key={p.id}
                                    className="flex md:table-row flex-col md:flex-row gap-2 md:gap-0 p-4 md:p-0 md:border-b md:border-border/50 md:hover:bg-background/60 md:transition-colors border-b md:border-b border-border/50 last:border-b-0"
                                >
                                    <td
                                        className="md:px-4 md:px-6 md:py-4 before:content-attr(data-label) before:font-bold before:text-foreground/40 before:mr-2 md:before:content-none"
                                        data-label="NO"
                                    >
                                        <span className="text-xs md:text-body-m text-foreground/50">
                                            {i + 1}
                                        </span>
                                    </td>
                                    <td
                                        className="md:px-6 md:py-4 before:content-attr(data-label) before:font-bold before:text-foreground/40 before:mr-2 md:before:content-none"
                                        data-label="NAMA"
                                    >
                                        <span className="text-xs md:text-body-m text-super-black font-semibold">
                                            {p.name}
                                        </span>
                                    </td>
                                    <td
                                        className="md:px-6 md:py-4 before:content-attr(data-label) before:font-bold before:text-foreground/40 before:mr-2 md:before:content-none"
                                        data-label="KATEGORI"
                                    >
                                        <Badge text={p.category} />
                                    </td>
                                    <td className="px-6 py-4 text-body-m text-foreground/80">
                                        Rp {p.price.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-6 py-4 text-body-m text-foreground/70">
                                        {p.sold} pcs
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest ${statusBadge[p.stock]}`}
                                        >
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => openEditModal(p)}
                                                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
                                            >
                                                <svg
                                                    width="13"
                                                    height="13"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(p)}
                                                className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-all"
                                            >
                                                <svg
                                                    width="13"
                                                    height="13"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-body-reg text-foreground/40 text-center md:text-left">
                        Menampilkan {filtered.length} dari {(products as any).total ?? productData.length} produk
                    </p>

                    {/* Pagination */}
                    {!Array.isArray(products) && products.links && products.links.length > 3 && (
                        <div className="flex items-center justify-center gap-1">
                            {products.links.map((link, idx) => (
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

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
                    <div className="relative bg-card border border-border rounded-venus p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-h4 text-super-black mb-5">{editingProduct ? "Edit Produk" : "Tambah Produk"}</h3>
                        <form onSubmit={submitProduct} className="space-y-4">
                            <div>
                                <label className="text-label-sm text-foreground/60 uppercase">Nama Produk</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-2 mt-1 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-label-sm text-foreground/60 uppercase">Kategori</label>
                                <select
                                    required
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-2 mt-1 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="" disabled>Pilih Kategori...</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-label-sm text-foreground/60 uppercase">Harga (Rp)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={data.price}
                                    onChange={e => {
                                        let val = e.target.value.replace(/[^0-9]/g, '');
                                        val = val.replace(/^0+/, '');
                                        setData('price', val ? parseInt(val) : 0);
                                    }}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-2 mt-1 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-label-sm text-foreground/60 uppercase">Stok</label>
                                <select
                                    required
                                    value={data.stock}
                                    onChange={e => setData('stock', e.target.value)}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-2 mt-1 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="Tersedia">Tersedia</option>
                                    <option value="Terbatas">Terbatas</option>
                                    <option value="Habis">Habis</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-label-sm text-foreground/60 uppercase">Gambar Produk (Opsional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setData('image', e.target.files ? e.target.files[0] : null)}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-2 mt-1 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                            </div>
                            <div>
                                <label className="text-label-sm text-foreground/60 uppercase">Deskripsi (Opsional)</label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full bg-background border border-border rounded-venus px-4 py-2 mt-1 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Masukkan deskripsi produk..."
                                ></textarea>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-label-sm text-foreground/60 uppercase">Jenis / Varian (Opsional)</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setOptionsList([...optionsList, { group: '', choices: '' }])}
                                        className="text-xs text-primary font-semibold hover:underline"
                                    >
                                        + Tambah Jenis
                                    </button>
                                </div>
                                {optionsList.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2 mt-2 items-start">
                                        <div className="flex-1 space-y-2">
                                            <input 
                                                type="text" 
                                                placeholder="Nama Jenis (misal: Color)" 
                                                value={opt.group}
                                                onChange={e => {
                                                    const newList = [...optionsList];
                                                    newList[idx].group = e.target.value;
                                                    setOptionsList(newList);
                                                }}
                                                className="w-full bg-background border border-border rounded-venus px-3 py-1.5 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Pilihan (pisahkan dengan koma, misal: Hitam, Putih)" 
                                                value={opt.choices}
                                                onChange={e => {
                                                    const newList = [...optionsList];
                                                    newList[idx].choices = e.target.value;
                                                    setOptionsList(newList);
                                                }}
                                                className="w-full bg-background border border-border rounded-venus px-3 py-1.5 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setOptionsList(optionsList.filter((_, i) => i !== idx))}
                                            className="w-8 h-8 flex-shrink-0 bg-red-100 text-red-500 rounded-venus flex items-center justify-center hover:bg-red-200 transition-colors"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="flex-1 border border-border rounded-venus py-2.5 text-label-sm font-semibold text-foreground/70 hover:bg-surface transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-primary text-white rounded-venus py-2.5 text-label-sm font-semibold hover:bg-primary/90 disabled:opacity-70 transition-all"
                                >
                                    {processing ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && deletingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="relative bg-card border border-border rounded-venus p-6 w-full max-w-md shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                            </svg>
                        </div>
                        <h3 className="text-h4 text-super-black mb-2">Hapus Produk?</h3>
                        <p className="text-body-reg text-foreground/60 mb-6">
                            Apakah Anda yakin ingin menghapus <strong>{deletingProduct.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 border border-border rounded-venus py-2.5 text-label-sm font-semibold text-foreground/70 hover:bg-surface transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 bg-red-500 text-white rounded-venus py-2.5 text-label-sm font-semibold hover:bg-red-600 transition-all"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
                    <div className="relative bg-card border border-border rounded-venus p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-h4 text-super-black mb-5">Kelola Kategori</h3>
                        <form onSubmit={saveCategories} className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-label-sm text-foreground/60 uppercase">Daftar Kategori</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setCatData('categories', [...catData.categories, ''])}
                                        className="text-xs text-primary font-semibold hover:underline"
                                    >
                                        + Tambah Kategori
                                    </button>
                                </div>
                                {catData.categories.map((cat, idx) => (
                                    <div key={idx} className="flex gap-2 mt-2 items-center">
                                        <input 
                                            type="text" 
                                            required
                                            value={cat}
                                            onChange={e => {
                                                const newCats = [...catData.categories];
                                                newCats[idx] = e.target.value;
                                                setCatData('categories', newCats);
                                            }}
                                            className="flex-1 bg-background border border-border rounded-venus px-3 py-2 text-body-m text-foreground focus:outline-none focus:border-primary transition-colors"
                                            placeholder="Nama Kategori"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const newCats = catData.categories.filter((_, i) => i !== idx);
                                                setCatData('categories', newCats);
                                            }}
                                            className="w-10 h-10 flex-shrink-0 bg-red-100 text-red-500 rounded-venus flex items-center justify-center hover:bg-red-200 transition-colors"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                                {catData.categories.length === 0 && (
                                    <p className="text-sm text-foreground/40 text-center py-4">Belum ada kategori.</p>
                                )}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="flex-1 border border-border rounded-venus py-2.5 text-label-sm font-semibold text-foreground/70 hover:bg-surface transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingCat || catData.categories.some(c => !c.trim())}
                                    className="flex-1 bg-primary text-white rounded-venus py-2.5 text-label-sm font-semibold hover:bg-primary/90 disabled:opacity-70 transition-all"
                                >
                                    {processingCat ? "Menyimpan..." : "Simpan Kategori"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
