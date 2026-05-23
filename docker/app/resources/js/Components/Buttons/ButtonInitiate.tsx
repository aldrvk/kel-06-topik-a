import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
    className?: string;
}

export default function ButtonInitiate({ 
    children, 
    variant = 'secondary', 
    className = '', 
    ...props 
}: ButtonProps) {
    
    const variants = {
        primary: 'bg-primary text-primary-foreground hover:opacity-90',
        secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
        tertiary: 'bg-tertiary text-tertiary-foreground hover:opacity-90',
        danger: 'bg-surface text-foreground border border-border hover:bg-error hover:text-error-foreground hover:border-error',
    };

    return (
        <button
            {...props}
            className={`
                relative flex items-center justify-center
                px-8 py-3 rounded-full /* Pill-shaped tetap dipertahankan untuk tombol aksi */
                
                /* Menggunakan Typography Label dari Design System */
                text-bodyM font-bold
                
                /* Efek Interaksi */
                transition-all duration-300 
                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm
                
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </button>
    );
}
