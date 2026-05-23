import React from 'react';
import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: PaginationLink[];
}

export default function Pagination({ links }: Props) {
    if (links.length <= 3) return null; // Only prev, 1, next means no pagination needed

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 mb-4">
            {links.map((link, index) => {
                // Determine label (handle Next & Previous HTML entities)
                let label = link.label;
                if (label.includes('Next')) label = '»';
                if (label.includes('Previous')) label = '«';

                const isActive = link.active;
                const isUrl = link.url;

                if (!isUrl) {
                    return (
                        <span
                            key={index}
                            className="px-4 py-2 text-sm text-foreground/40 bg-surface rounded-venus border border-border cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url!}
                        className={`px-4 py-2 text-sm rounded-venus border transition-colors ${
                            isActive
                                ? 'bg-primary text-white border-primary font-bold shadow-md'
                                : 'bg-card text-foreground hover:bg-surface border-border'
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
}
