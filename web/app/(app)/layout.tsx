'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dock } from '@/components/Dock';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-carbon text-text-main">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Bottom Dock */}
            <Dock />

            {/* Main Content */}
            <main className="md:pl-24 pb-24 md:pb-0 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
