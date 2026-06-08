'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Shield, MapPin, Gauge } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DetailModal } from '@/components/ui/DetailModal';

const MOCK_LISTINGS = [
    { id: 'mock-1', make: 'Nissan', model: 'GT-R R35', year: 2012, price: 85000, mileage: 28000, location: 'Dubai, UAE', image_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80', verified: true, seller_username: '@NightRacerJP' },
    { id: 'mock-2', make: 'BMW', model: 'M4 CSL', year: 2023, price: 135000, mileage: 4200, location: 'London, UK', image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80', verified: true, seller_username: '@UKSpeed' },
    { id: 'mock-3', make: 'Porsche', model: '911 GT2 RS', year: 2019, price: 310000, mileage: 1800, location: 'Monaco', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80', verified: true, seller_username: '@MonacoMoves' },
    { id: 'mock-4', make: 'Toyota', model: 'Supra GR', year: 2021, price: 58000, mileage: 12000, location: 'Tokyo, JP', image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&q=80', verified: false, seller_username: '@JDMKing' },
    { id: 'mock-5', make: 'Ferrari', model: '488 Pista', year: 2019, price: 380000, mileage: 5500, location: 'Milan, IT', image_url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80', verified: true, seller_username: '@FerrariLife' },
    { id: 'mock-6', make: 'McLaren', model: '720S', year: 2020, price: 245000, mileage: 7800, location: 'LA, USA', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', verified: true, seller_username: '@LACars' },
];

export default function MarketplacePage() {
    const [search, setSearch] = useState('');
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal details
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                // Fetch listings and join profiles to get the seller's username
                const { data, error } = await supabase
                    .from('listings')
                    .select('*, profiles:seller_id(username)')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    const parsed = data.map(l => ({
                        ...l,
                        image_url: l.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80',
                        seller_username: l.profiles?.username ? `@${l.profiles.username}` : '@Anonymous',
                        verified: false
                    }));
                    setListings(parsed);
                } else {
                    setListings(MOCK_LISTINGS);
                }
            } catch (err) {
                console.warn('[Marketplace] Fetch failed, using mock listings:', err);
                setListings(MOCK_LISTINGS);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const filtered = listings.filter(l =>
        `${l.make} ${l.model} ${l.year}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1">Buy & Sell</p>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Marketplace</h1>
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
                        className="w-full pl-11 pr-4 py-3 bg-steel border border-white/8 rounded-2xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/50 transition-all font-semibold"
                    />
                </div>
                <button className="px-4 py-3 glass-panel rounded-2xl text-text-dim hover:text-white transition-colors flex items-center gap-2 border border-white/8">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="text-sm font-bold hidden sm:block">Filter</span>
                </button>
            </div>

            {/* Content Display */}
            {loading ? (
                <div className="py-20 text-center text-zinc-500 font-bold">Scanning Marketplace...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((listing, i) => (
                        <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.4 }}
                            onClick={() => {
                                setSelectedListing(listing);
                                setIsModalOpen(true);
                            }}
                            className="rounded-3xl bg-steel border border-white/8 overflow-hidden group hover:border-white/15 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                <div className="aspect-[16/10] relative overflow-hidden">
                                    <img
                                        src={listing.image_url || listing.image}
                                        alt={listing.model}
                                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-steel/80 via-transparent to-transparent" />
                                    {listing.verified && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-[10px] font-bold backdrop-blur-sm">
                                            <Shield className="h-3 w-3" /> Verified
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-4 text-2xl font-black text-white italic">
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
                                </div>
                            </div>

                            <div className="p-4 pt-0">
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <span className="text-xs text-text-dim font-semibold">{listing.seller_username || listing.seller}</span>
                                    <button className="px-3 py-1.5 bg-signal-orange/10 border border-signal-orange/20 text-signal-orange text-xs font-bold rounded-lg hover:bg-signal-orange hover:text-white transition-all">
                                        View Deal
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Dynamic Details Modal Overlay */}
            <DetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type="listing"
                data={selectedListing}
            />
        </div>
    );
}
