import React, { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

interface SearchBarProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                window.location.pathname, 
                { search: value }, 
                { preserveState: true, preserveScroll: true }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [value]);

    return (
        <div className="w-full md:w-80 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-foreground opacity-50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>
            <input 
                type="text" 
                value={value}
                onChange={onChange}
                placeholder="Cari Produk" 
                className="w-full bg-surface border border-border rounded-venus py-3 pl-12 pr-4 text-body-reg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    );
}
