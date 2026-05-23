import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import ProfileModal from './ProfileModal';

interface UserProfileDropdownProps {
    user: {
        name: string;
        email?: string;
        [key: string]: any;
    };
}

const ExitIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3 opacity-50 group-hover:opacity-100 group-hover:text-error transition-all">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

export default function UserProfileDropdown({ user }: UserProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close the dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Create initials from the user's name
    const initials = user?.name 
        ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() 
        : 'U';

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center hover:opacity-90 transition-all focus:outline-none group"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {/* User Profile Avatar only (no username text) */}
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-labelSm font-black shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                    {initials}
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-venus shadow-2xl py-2 z-50 transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    {/* Header: User Full Name */}
                    <div className="px-5 py-4 border-b border-border mb-2 bg-surface/20">
                        <p className="text-body font-black text-super-black truncate leading-tight">{user?.name}</p>
                        {user?.email && (
                            <p className="text-[10px] text-foreground/40 font-bold truncate mt-1 tracking-wider uppercase">{user.email}</p>
                        )}
                    </div>
                    
                    <button 
                        className="group flex items-center w-full text-left px-5 py-3 text-body font-bold text-foreground/70 hover:bg-surface hover:text-primary transition-all"
                        onClick={() => {
                            setIsOpen(false);
                            setIsProfileModalOpen(true);
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-3 opacity-50 group-hover:opacity-100 transition-all"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Edit Profile
                    </button>
                    
                    <Link 
                        href="/logout" 
                        method="post" 
                        as="button"
                        className="group w-full text-left flex items-center px-5 py-3 text-body font-bold text-foreground/70 hover:bg-error/5 hover:text-error transition-all mt-1"
                        onClick={() => setIsOpen(false)}
                    >
                        <ExitIcon />
                        Logout
                    </Link>
                </div>
            )}

            {/* Modal Edit Profile */}
            {user && (
                <ProfileModal 
                    isOpen={isProfileModalOpen} 
                    onClose={() => setIsProfileModalOpen(false)} 
                    user={user as any} 
                />
            )}
        </div>
    );
}
