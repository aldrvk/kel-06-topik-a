import React from 'react';

interface Props {
    message: string;
}

export default function StoreClosedBanner({ message }: Props) {
    return (
        <div className="bg-red-100 border-b border-red-200 px-4 py-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-red-800">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-label-sm font-bold text-center tracking-wide">
                    Toko Sedang Tutup. {message}
                </p>
            </div>
        </div>
    );
}
