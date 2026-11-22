'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, X, Shield, MapPin, Gauge } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DetailModal } from '@/components/ui/DetailModal';
import { usePreferences } from '@/hooks/usePreferences';
import { useAuth } from '@/context/AuthProvider';

export default function MarketplacePage() {
    const { session, loading: authLoading, recovering, authError } = useAuth();
    const [search, setSearch] = useState('');
    const [listings, setListings] = useState<any[]>([]);
    const { formatCurrency, formatDistance } = usePreferences();
    const [loading, setLoading] = useState(true);
    const [catalogError, setCatalogError] = useState('');
    const [unpublishedLocalCount, setUnpublishedLocalCount] = useState(0);

    // Modal details
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (authLoading || recovering || authError) return;
        let mounted = true;
        async function loadListings() {
            try {
                const { data, error } = await supabase.from('listings')
                    .select('*, profiles:seller_id(username)')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(100);
                if (error) throw error;
                if (!mounted) return;
                setListings((data || []).map((listing) => ({
                    ...listing,
                    image_url: listing.images?.[0] || '',
                    seller_username: listing.profiles?.username ? '@' + listing.profiles.username : 'Vendeur VROOQ',
                    verified: false,
                })));
                setCatalogError('');
            } catch (cause) {
                console.warn('[VROOQ Marketplace] Real catalog unavailable:', cause);
                if (mounted) {
                    setCatalogError('Impossible de charger les annonces actuellement. Réessaie dans un instant.');
                    setListings([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }

            // Old versions stored failed publishes locally. These were never public.
            try {
                const raw = localStorage.getItem('local-listings');
                const parsed: unknown = raw ? JSON.parse(raw) : [];
                if (mounted) setUnpublishedLocalCount(
                    Array.isArray(parsed)
                        ? parsed.filter((item) => item && typeof item === 'object' && typeof item.id === 'string' && item.id.startsWith('local-list-')).length
                        : 0
                );
            } catch {
                if (mounted) setUnpublishedLocalCount(0);
            }
        }
        void loadListings();
        return () => { mounted = false; };
    }, [authLoading, recovering, authError, session?.access_token]);

    const filtered = listings.filter(l =>
        `${l.make} ${l.model} ${l.year}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <section className="rounded-3xl border border-orange-500/25 bg-gradient-to-r from-[#312114] via-[#22201d] to-[#191a1d] px-6 py-6 md:px-8 md:py-8">
                <div className="flex flex-wrap items-center justify-between gap-5">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Nouveau · VROOQ Parts</p>
                        <h2 className="text-2xl font-black text-white md:text-3xl">Acheter & vendre des pièces auto d’occasion</h2>
                        <p className="mt-2 max-w-2xl text-sm text-zinc-300">Moteur, carrosserie, accessoires : recherchez par modèle et référence, publiez vos pièces, organisez vos commandes.</p>
                    </div>
                    <Link href="/marketplace/parts" className="inline-flex items-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400">Explorer les pièces →</Link>
                </div>
                <p className="mt-4 text-xs text-zinc-400">Marketplace pilote · Paiement et livraison automatiques en cours d’intégration.</p>
            </section>
            {/* Header */}
            <div>
                <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1">Marché automobile</p>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Marketplace</h1>
                <p className="text-text-dim mt-2">Véhicules publiés par les membres. Vérifiez les informations directement dans chaque annonce.</p>
            </div>

            {/* Search + Filter */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Marque, modèle ou année…"
                        className="w-full pl-11 pr-4 py-3 bg-steel border border-white/8 rounded-2xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/50 transition-all font-semibold"
                    />
                </div>
                <button type="button" disabled={!search} onClick={() => setSearch('')} className="px-4 py-3 glass-panel rounded-2xl text-text-dim hover:text-white transition-colors flex items-center gap-2 border border-white/8 disabled:opacity-40">
                    <X className="h-4 w-4" />
                    <span className="text-sm font-bold hidden sm:block">Effacer</span>
                </button>
            </div>

            {unpublishedLocalCount > 0 && (
                <div role="status" className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                    {unpublishedLocalCount} ancienne(s) annonce(s) stockée(s) uniquement dans ce navigateur ne sont pas visibles par les acheteurs.
                    <Link href="/create" className="ml-1 font-bold underline underline-offset-4">Publier réellement une annonce</Link>
                </div>
            )}
            {catalogError && <div role="alert" className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">{catalogError}</div>}
            {/* Content Display */}
            {loading ? (
                <div className="py-20 text-center text-zinc-500 font-bold">Chargement des annonces…</div>
            ) : filtered.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center space-y-4 max-w-xl mx-auto mt-8">
                    <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-signal-orange">
                        <Search className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic">Aucune annonce trouvée</h3>
                    <p className="text-sm text-text-dim max-w-sm mx-auto">
                        Aucun véhicule ne correspond à ta recherche pour le moment. Modifie ta recherche ou publie une annonce.
                    </p>
                </div>
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
                                    {listing.image_url ? (
                                        <img
                                            src={listing.image_url}
                                            alt={listing.model}
                                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-zinc-400">
                                            Photo non disponible
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-steel/80 via-transparent to-transparent" />
                                    {listing.verified && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-[10px] font-bold backdrop-blur-sm">
                                            <Shield className="h-3 w-3" /> Verified
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-4 text-2xl font-black text-white italic">
                                        {formatCurrency(listing.price)}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-white group-hover:text-signal-orange transition-colors">
                                        {listing.year} {listing.make} {listing.model}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-text-dim">
                                        <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{formatDistance(listing.mileage)}</span>
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
