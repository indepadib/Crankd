'use client';

import { CommunityCard } from '@/components/CommunityCard';
import { Search, Compass } from 'lucide-react';

// MOCK COMMUNITIES
const COMMUNITIES = [
    {
        id: '1',
        name: 'JDM Legends',
        description: 'Celebrating the Golden Era of Japanese performance. From Skylines to RX-7s, if it is from the 90s and right-hand drive, it belongs here.',
        image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=2600&auto=format&fit=crop',
        members: '12.4k',
        active: '142',
        category: 'Japanese Domestic'
    },
    {
        id: '2',
        name: 'Euro Outlaws',
        description: 'Precision engineering meets rebel spirit. BMW M, AMG, and Porsche enthusiasts pushing the limits on street and track.',
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2670&auto=format&fit=crop',
        members: '8.2k',
        active: '98',
        category: 'European'
    },
    {
        id: '3',
        name: 'Overland Syndicate',
        description: 'Go where roads do not. A community for 4x4 builds, expedition rigs, and getting lost in nature.',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2670&auto=format&fit=crop',
        members: '5.6k',
        active: '64',
        category: 'Off-Road'
    },
    {
        id: '4',
        name: 'Track Day Heroes',
        description: 'Lap times matter. Discuss setups, lines, and upcoming track events. No parking lot posers allowed.',
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop',
        members: '4.1k',
        active: '210',
        category: 'Motorsport'
    },
    {
        id: '5',
        name: 'Stance Nation',
        description: 'Low is a lifestyle. Fitment, bags, and static drops. Appreciating the art of the perfect stance.',
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2670&auto=format&fit=crop',
        members: '15k',
        active: '300+',
        category: 'Style'
    },
    {
        id: '6',
        name: 'Rotary Club',
        description: 'Brap brap brap. Dedicated to the Wankel engine. Apex seals, mixing oil, and high revs.',
        image: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?q=80&w=2672&auto=format&fit=crop',
        members: '2.8k',
        active: '45',
        category: 'Engine Specific'
    }
];

export default function CommunitiesPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-32">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                        Tribes
                    </h1>
                    <p className="text-lg text-text-dim mt-2 max-w-xl">
                        Find your people. Join specialized communities to share knowledge, organize meets, and showcase your build.
                    </p>
                </div>

                {/* Search / Filter Utility */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                        <input
                            type="text"
                            placeholder="Find a tribe..."
                            className="bg-steel border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-text-dim focus:outline-none focus:border-signal-orange/50 transition-colors w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Featured Categories (Optional, kept simple for now) */}
            <div className="flex gap-4 overflow-x-auto pb-8 mb-4 scrollbar-hide">
                {['All Tribes', 'JDM', 'Euro', 'Muscle', 'Off-Road', 'Track', 'Classic'].map((cat, i) => (
                    <button
                        key={cat}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${i === 0 ? 'bg-signal-orange text-white' : 'bg-steel text-text-dim hover:text-white hover:bg-white/10'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {COMMUNITIES.map(community => (
                    <CommunityCard key={community.id} community={community} />
                ))}
            </div>

        </div>
    );
}
