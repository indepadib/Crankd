'use client';

import { Home, Car, ShoppingBag, Users, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Dock() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-carbon/80 backdrop-blur-xl border-t border-white/5" />

            <div className="relative flex items-center justify-around px-4 py-2 pb-safe">
                <DockItem href="/feed" icon={Home} label="Feed" isActive={pathname === '/feed'} />
                <DockItem href="/garage" icon={Car} label="Garage" isActive={pathname === '/garage'} />

                {/* Center Action */}
                <div className="relative -top-5">
                    <Link
                        href="/create"
                        className="flex items-center justify-center h-14 w-14 rounded-full bg-signal-orange text-white shadow-[0_0_24px_rgba(249,115,22,0.6)] hover:bg-signal-orange-dim transition-all active:scale-95"
                    >
                        <Plus className="h-7 w-7" strokeWidth={2.5} />
                    </Link>
                </div>

                <DockItem href="/marketplace" icon={ShoppingBag} label="Market" isActive={pathname.startsWith('/marketplace')} />
                <DockItem href="/profile" icon={User} label="Profile" isActive={pathname === '/profile'} />
            </div>
        </div>
    );
}

function DockItem({
    href,
    icon: Icon,
    label,
    isActive,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
}) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${isActive ? 'text-white' : 'text-text-muted hover:text-text-dim'}`}
        >
            <Icon className={`h-6 w-6 ${isActive ? 'fill-white' : ''}`} strokeWidth={isActive ? 2 : 1.8} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-text-muted'}`}>
                {label}
            </span>
            {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-signal-orange" />
            )}
        </Link>
    );
}
