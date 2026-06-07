'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Shield, MapPin, Fuel, Gauge } from 'lucide-react';

const listings = [
    { id: '1', make: 'Nissan', model: 'GT-R R35', year: 2012, price: 85000, mileage: 28000, location: 'Dubai, UAE', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80', verified: true, seller: '@NightRacerJP' },
    { id: '2', make: 'BMW', model: 'M4 CSL', year: 2023, price: 135000, mileage: 4200, location: 'London, UK', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80', verified: true, seller: '@UKSpeed' },
    { id: '3', make: 'Porsche', model: '911 GT2 RS', year: 2019, price: 310000, mileage: 1800, location: 'Monaco', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80', verified: true, seller: '@MonacoMoves' },
    { id: '4', make: 'Toyota', model: 'Supra GR', year: 2021, price: 58000, mileage: 12000, location: 'Tokyo, JP', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&q=80', verified: false, seller: '@JDMKing' },
    { id: '5', make: 'Ferrari', model: '488 Pista', year: 2019, price: 380000, mileage: 5500, location: 'Milan, IT', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80', verified: true, seller: '@FerrariLife' },
    { id: '6', make: 'McLaren', model: '720S', year: 2020, price: 245000, mileage: 7800, location: 'LA, USA', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', verified: true, seller: '@LACars' },
];

export default function MarketplacePage() {
    const [search, setSearch] = useState('');

    const filtered = listings.filter(l =>
        `${l.make} ${l.model} ${l.year}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1">Buy & Sell</p>
                <h1 className="text-4xl font-black tracking-tighter text-white">Marketplace</h1>
                <p className="text-text-dim mt-2">Verified builds from trusted sellers worldwide.</p>
            </div>

            {/* Search + Filter */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search make, model, year..."
                        className="w-full pl-11 pr-4 py-3 bg-steel border border-white/8 rounded-2xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/50 transition-all"
                    />
                </div>
                <button className="px-4 py-3 glass-panel rounded-2xl text-text-dim hover:text-white transition-colors flex items-center gap-2 border border-white/8">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="text-sm font-bold hidden sm:block">Filter</span>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((listing, i) => (
                    <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        className="rounded-3xl bg-steel border border-white/8 overflow-hidden group hover:border-white/15 transition-all cursor-pointer"
                    >
                        <div className="aspect-[16/10] relative overflow-hidden">
                            <img
                                src={listing.image}
                                alt={listing.model}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-steel/80 to-transparent" />
                            {listing.verified && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-[10px] font-bold backdrop-blur-sm">
                                    <Shield className="h-3 w-3" /> Verified
                                </div>
                            )}
                            <div className="absolute bottom-3 left-4 text-2xl font-black text-white">
                                ${listing.price.toLocaleString()}
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-white group-hover:text-signal-orange transition-colors">
                                {listing.year} {listing.make} {listing.model}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-xs text-text-dim">
                                <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{listing.mileage.toLocaleString()} mi</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                <span className="text-xs text-text-dim">{listing.seller}</span>
                                <button className="px-3 py-1.5 bg-signal-orange/10 border border-signal-orange/20 text-signal-orange text-xs font-bold rounded-lg hover:bg-signal-orange hover:text-white transition-all">
                                    View Deal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
