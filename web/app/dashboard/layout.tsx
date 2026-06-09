import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <h1 className="text-2xl font-black tracking-tighter text-orange-500">
                        VROOQ
                    </h1>
                    <p className="text-xs text-zinc-500 font-mono mt-1">DEALER PORTAL</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                        <span>📊</span>
                        <span className="font-medium">Overview</span>
                    </Link>
                    <Link href="/dashboard/inventory" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                        <span>🏎️</span>
                        <span className="font-medium">Inventory</span>
                    </Link>
                    <div className="pt-4 mt-4 border-t border-zinc-800">
                        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors">
                            <span>⬅️</span>
                            <span className="font-medium text-sm">Back to Site</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-xs">
                            D
                        </div>
                        <div>
                            <p className="text-sm font-bold">Drift House</p>
                            <p className="text-xs text-zinc-500">Premium Dealer</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
