'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Car, ShoppingBag, Users, User, Settings, Plus, MapPin, Search, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-4">

            {/* Brand Icon */}
            <Link
                href="/start"
                aria-label="VROOQ — Mon espace"
                className="h-12 w-12 bg-signal-orange rounded-2xl flex items-center justify-center shadow-lg shadow-signal-orange/30 hover:scale-105 hover:shadow-signal-orange/50 transition-all duration-200 group relative"
            >
                <span className="text-white font-black text-2xl italic tracking-tighter select-none">V</span>
                <Tooltip label="Vrooq" />
            </Link>

            {/* Main Nav */}
            <nav className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-2xl">
                <DockItem href="/feed" icon={Home} label="Fil d’actualité" isActive={pathname === '/feed'} />
                <DockItem href="/start" icon={Compass} label="Mon espace" isActive={pathname === '/start'} />
                <DockItem href="/garage" icon={Car} label="Garage" isActive={pathname === '/garage'} />
                <DockItem href="/voitures-neuves" icon={BadgeCheck} label="Voitures neuves" isActive={pathname.startsWith("/voitures-neuves")} />
                <DockItem href="/registry" icon={Search} label="Registre" isActive={pathname === '/registry'} />
                <DockItem href="/marketplace" icon={ShoppingBag} label="Marché" isActive={pathname.startsWith('/marketplace')} />
                <DockItem href="/communities" icon={Users} label="Clubs" isActive={pathname.startsWith('/communities')} />
                <DockItem href="/convoys" icon={MapPin} label="Sorties" isActive={pathname.startsWith('/convoys')} />

                <div className="h-px bg-white/10 mx-2 my-1" />

                <DockItem href="/create" icon={Plus} label="Créer" highlight />
            </nav>

            {/* User Nav */}
            <nav className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-2xl">
                <DockItem
                    href="/profile"
                    icon={User}
                    label={user?.user_metadata?.username || 'Profil'}
                    isActive={pathname === '/profile'}
                />
                <DockItem href="/settings" icon={Settings} label="Réglages" isActive={pathname.startsWith('/settings')} />
            </nav>
        </aside>
    );
}

function Tooltip({ label }: { label: string }) {
    return (
        <span className="absolute left-full ml-4 px-3 py-1.5 glass-panel rounded-lg text-xs font-bold text-white opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all whitespace-nowrap z-50 shadow-xl">
            {label}
        </span>
    );
}

function DockItem({
    href,
    icon: Icon,
    label,
    isActive,
    highlight,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    highlight?: boolean;
}) {
    return (
        <Link
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={`
                relative group flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange
                ${isActive
                    ? 'bg-white text-carbon shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                    : 'text-text-dim hover:text-white hover:bg-white/10'
                }
                ${highlight && !isActive ? 'text-signal-orange hover:bg-signal-orange/10' : ''}
            `}
        >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />

            {/* Tooltip */}
            <span className="absolute left-full ml-4 px-3 py-1.5 glass-panel rounded-lg text-xs font-bold text-white opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all whitespace-nowrap z-50 shadow-xl">
                {label}
            </span>

            {/* Active Glow */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 h-8 w-1 bg-signal-orange rounded-full blur-[1px] shadow-[0_0_8px_#f97316]" />
            )}
        </Link>
    );
}
