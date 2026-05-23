import React from 'react';

interface ProductNotFoundProps {
    searchTerm: string;
    onClear: () => void;
}

export default function ProductNotFound({ searchTerm, onClear }: ProductNotFoundProps) {
    return (
        <div className="text-center py-24 bg-card rounded-venus border border-border mb-24">
            <svg className="w-16 h-16 mx-auto text-border mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <h2 className="text-h3 text-super-black mb-4">Produk Tidak Ditemukan</h2>
            <p className="text-body-m text-foreground/60 mb-8">Produk"{searchTerm}" tidak ditemukan.</p>
            <button
                onClick={onClear}
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full text-label-sm transition-all hover:bg-secondary/90 shadow-lg"
            >
                HAPUS PENCARIAN
            </button>
        </div>
    );
}
