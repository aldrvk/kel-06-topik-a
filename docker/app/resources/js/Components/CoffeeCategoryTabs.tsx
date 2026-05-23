import React from 'react';
import { Link } from '@inertiajs/react';

interface CoffeeCategoryTabsProps {
    activeCategory: string;
    categories: string[];
}

export default function CoffeeCategoryTabs({ activeCategory, categories }: CoffeeCategoryTabsProps) {
    const tabs = [
        { id: 'all', name: 'Semua Menu', href: '/coffee-shop' },
        ...(categories || []).map(cat => ({
            id: cat,
            name: cat,
            href: `/coffee-shop?category=${encodeURIComponent(cat)}`
        }))
    ];

    return (
        <div className="flex flex-wrap items-center gap-3 mb-10">
            {tabs.map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        preserveState
                        preserveScroll
                        className={`px-6 py-2 rounded-full text-btn transition-all duration-300 ${isActive
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-surface text-foreground hover:bg-card'
                            }`}
                    >
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
