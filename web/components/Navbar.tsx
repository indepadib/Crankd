'use client';

import Link from "next/link";
import React from 'react';
import { useAuth } from '@/context/AuthProvider';

export const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px)' }}>
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl font-black tracking-tighter text-white group-hover:text-signal-orange transition-colors">
                        VROOQ
                    </span>
                    <span className="text-[10px] font-bold text-signal-orange bg-signal-orange/10 border border-signal-orange/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Beta
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link
                        href="/dashboard"
                        className="text-sm font-bold text-text-dim hover:text-white transition-colors hidden md:block"
                    >
                        Dealer Access
                    </Link>
                    <AuthButton />
                </div>
            </div>
        </nav>
    );
};

function AuthButton() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="h-8 w-24 rounded-full bg-white/5 animate-pulse" />;
    }

    if (user) {
        return (
            <Link
                href="/feed"
                className="bg-signal-orange text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-signal-orange-dim transition-colors"
            >
                Launch App →
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <Link
                href="/login"
                className="text-white text-sm font-bold hover:text-text-dim transition-colors"
            >
                Log In
            </Link>
            <Link
                href="/signup"
                className="bg-signal-orange text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-signal-orange-dim transition-colors"
            >
                Join Now
            </Link>
        </div>
    );
}
