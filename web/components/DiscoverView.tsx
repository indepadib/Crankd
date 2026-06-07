'use client';

import { ArrowRight, Flame, TrendingUp, Compass } from 'lucide-react';

const HERO_ITEMS = [
    {
        id: '1',
        title: 'The Art of the Restomod',
        subtitle: 'How Singer reimagined the 911',
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2670&auto=format&fit=crop',
        tag: 'Featured Story'
    },
    {
        id: '2',
        title: 'Tokyo Nights',
        subtitle: 'Exploring the underground R34 meets',
        image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2670&auto=format&fit=crop',
        tag: 'Editorial'
    }
];

const TRENDING_TAGS = [
    { id: '1', label: '#JDM', count: '12.4k' },
    { id: '2', label: '#Porsche911', count: '8.2k' },
    { id: '3', label: '#TrackDay', count: '5.1k' },
    { id: '4', label: '#Restomod', count: '3.9k' },
    { id: '5', label: '#Drift', count: '15.2k' },
];

export function DiscoverView() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Hero Section */}
            <section className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden group cursor-pointer">
                <img
                    src={HERO_ITEMS[0].image}
                    alt={HERO_ITEMS[0].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                    <span className="inline-block px-3 py-1 bg-signal-orange text-black text-xs font-black uppercase tracking-wider mb-4 rounded">
                        {HERO_ITEMS[0].tag}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-2 leading-none">
                        {HERO_ITEMS[0].title}
                    </h2>
                    <p className="text-xl text-white/80 max-w-2xl font-light">
                        {HERO_ITEMS[0].subtitle}
                    </p>
                </div>
            </section>

            {/* Trending Tags */}
            <section>
                <div className="flex items-center gap-2 mb-4 text-signal-orange">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-bold uppercase tracking-wider text-sm">Trending Now</span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {TRENDING_TAGS.map(tag => (
                        <div key={tag.id} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center gap-2 group">
                            <span className="font-bold group-hover:text-signal-orange transition-colors">{tag.label}</span>
                            <span className="text-xs text-text-dim">{tag.count}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories / Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-steel border border-white/5 cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Cars" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-6 left-6">
                        <h3 className="text-2xl font-black text-white uppercase italic">Fresh Builds</h3>
                        <p className="text-text-dim text-sm">Newest garage updates</p>
                    </div>
                    <div className="absolute top-6 right-6 h-10 w-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight className="h-5 w-5" />
                    </div>
                </div>

                <div className="group relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-steel border border-white/5 cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Track" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-6 left-6">
                        <h3 className="text-2xl font-black text-white uppercase italic">Track & Meets</h3>
                        <p className="text-text-dim text-sm">Upcoming events near you</p>
                    </div>
                    <div className="absolute top-6 right-6 h-10 w-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight className="h-5 w-5" />
                    </div>
                </div>
            </section>

        </div>
    );
}
