import React from 'react';
import { Link } from '@inertiajs/react';

interface ProductDetailButtonProps {
    href: string;
    text?: string;
}

export default function ProductDetailButton({ href, text = 'Detail' }: ProductDetailButtonProps) {
    return (
        <span 
            className="mt-auto inline-flex items-center gap-1 text-secondary text-body-m font-bold self-start hover:text-secondary/80 hover:underline transition-all cursor-pointer"
        >
            {text}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </span>
    );
}
