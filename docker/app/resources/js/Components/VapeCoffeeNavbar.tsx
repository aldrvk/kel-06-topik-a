import React from 'react';

export default function VapeCoffeeNavbar() {
    return (
        <nav className="flex items-center justify-between py-6 px-12 bg-background border-b border-border">
            {/* Logo */}
            <div className="flex-shrink-0">
                <span className="text-h3 text-primary">Venus</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
                {['Home', 'Doorsmeer', 'Coffee Shop'].map((item) => (
                    <a key={item} href="#" className="text-body-m text-foreground hover:text-primary transition-colors">
                        {item}
                    </a>
                ))}
                
                {/* Active Link */}
                <a href="#" className="text-body-m text-primary border-b-2 border-primary pb-1">
                    Vape Store
                </a>

                {['Bengkel', 'Rental PS', 'Contact'].map((item) => (
                    <a key={item} href="#" className="text-body-m text-foreground hover:text-primary transition-colors">
                        {item}
                    </a>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 text-foreground">
                <button aria-label="Search" className="hover:text-primary transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
                <button aria-label="Cart" className="relative hover:text-primary transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span className="absolute -top-1 -right-2 w-3 h-3 bg-primary rounded-full"></span>
                </button>
            </div>
        </nav>
    );
}
