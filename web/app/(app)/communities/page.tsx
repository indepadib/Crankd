'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CommunityCard } from '@/components/CommunityCard';
import { Search, Compass, Plus, X, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_COMMUNITIES } from '@/lib/constants';

export default function CommunitiesPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Tribes');
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Form inputs
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('JDM');
    const [customImage, setCustomImage] = useState('');

    const loadCommunities = useCallback(async () => {
        setLoading(true);
        let dbCommunities: any[] = [];
        try {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                dbCommunities = data;
            }
        } catch (e) {
            console.warn('[Communities] Failed to fetch communities from DB:', e);
        }

        // Fetch local communities
        const savedLocal = localStorage.getItem('local-communities');
        const localList = savedLocal ? JSON.parse(savedLocal) : [];

        // Combine DB, local storage, and static mock communities
        const combined = [...localList, ...dbCommunities, ...MOCK_COMMUNITIES];

        // Filter duplicates by name or ID
        const unique = combined.reduce((acc: any[], current) => {
            const exists = acc.find(item => item.name.toLowerCase() === current.name.toLowerCase() || item.id === current.id);
            if (!exists) {
                return acc.concat([current]);
            }
            return acc;
        }, []);

        // Format communities appropriately
        const formatted = unique.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description || 'No description provided.',
            image: c.image_url || c.banner || c.image || 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=2600&auto=format&fit=crop',
            members: c.member_count !== undefined ? `${c.member_count}` : (c.members ? `${c.members}` : '1'),
            active: Math.floor(Math.random() * 20 + 2).toString(),
            category: c.category || 'General'
        }));

        setCommunities(formatted);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadCommunities();
    }, [loadCommunities]);

    const handleCreateTribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (wizardStep === 1) {
            setWizardStep(2);
            return;
        }

        setModalLoading(true);
        setModalError(null);

        const newId = `local-c-${Date.now()}`;
        const finalImage = customImage.trim() || 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=2600&auto=format&fit=crop';

        const localCommunity = {
            id: newId,
            creator_id: user.id,
            name,
            description,
            image_url: finalImage,
            category,
            member_count: 1,
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('communities').insert({
                name,
                description,
                image_url: finalImage,
                category,
                creator_id: user.id
            }).select();

            if (error) throw error;

            if (data && data[0]) {
                // Join the newly created community in DB
                await supabase.from('community_members').insert({
                    community_id: data[0].id,
                    user_id: user.id
                });
            }
        } catch (err: any) {
            console.warn('[Communities] DB write failed, fallback to local storage:', err.message);
            
            // Save to local storage registry
            const savedLocal = localStorage.getItem('local-communities');
            const localList = savedLocal ? JSON.parse(savedLocal) : [];
            localStorage.setItem('local-communities', JSON.stringify([localCommunity, ...localList]));

            // Register user membership locally
            const localJoinedKey = 'joined-communities';
            const savedJoined = localStorage.getItem(localJoinedKey);
            const joinedList = savedJoined ? JSON.parse(savedJoined) : [];
            localStorage.setItem(localJoinedKey, JSON.stringify([...joinedList, newId]));
        }

        // Reset & Close
        setShowModal(false);
        setWizardStep(1);
        setName('');
        setDescription('');
        setCategory('JDM');
        setCustomImage('');
        setModalLoading(false);

        loadCommunities();
    };

    // Filter by category and search
    const filtered = communities.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                              c.description.toLowerCase().includes(search.toLowerCase());
        const matchesCat = selectedCategory === 'All Tribes' || c.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-32 relative">

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

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find a tribe..."
                            className="bg-steel border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-text-dim focus:outline-none focus:border-signal-orange/50 transition-colors w-full sm:w-64"
                        />
                    </div>
                    {user && (
                        <button
                            onClick={() => {
                                setWizardStep(1);
                                setShowModal(true);
                            }}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-signal-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-orange-600/15"
                        >
                            <Plus className="h-4 w-4" />
                            Create Tribe
                        </button>
                    )}
                </div>
            </div>

            {/* Featured Categories */}
            <div className="flex gap-4 overflow-x-auto pb-8 mb-4 scrollbar-hide select-none">
                {['All Tribes', 'JDM', 'Euro', 'Muscle', 'Off-Road', 'Track', 'Classic'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-signal-orange text-white' : 'bg-steel text-text-dim hover:text-white hover:bg-white/10'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="py-20 text-center text-zinc-500 font-mono uppercase tracking-widest animate-pulse">Scanning frequencies...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(community => (
                        <CommunityCard key={community.id} community={community} />
                    ))}
                </div>
            )}

            {/* ── CREATE TRIBE MODAL (2-Step Wizard) ── */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <div>
                                    <span className="text-signal-orange text-[9px] font-mono uppercase tracking-widest block mb-0.5">Step {wizardStep} of 2</span>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Establish Tribe Ledger</h3>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleCreateTribe} className="space-y-4">
                                {wizardStep === 1 ? (
                                    /* ── STEP 1: GENERALS ── */
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Tribe Name</label>
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                                placeholder="e.g. Porsche Purists / JDM Drifters"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Category</label>
                                            <select
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                                className="w-full px-3 py-3 bg-[#0a0a0c] border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                                            >
                                                {['JDM', 'Euro', 'Muscle', 'Off-Road', 'Track', 'Classic'].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <ImageUpload 
                                                value={customImage} 
                                                onChange={setCustomImage} 
                                                label="Upload Tribe Cover Banner" 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* ── STEP 2: STORY ── */
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Manifesto & description</label>
                                            <textarea 
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                required
                                                rows={6}
                                                placeholder="State the purpose of this tribe, acceptable cars, and rules for meeting setups..."
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 resize-none font-semibold leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                )}

                                {modalError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-mono">{modalError}</div>}

                                {/* Buttons */}
                                <div className="flex gap-3 pt-3 border-t border-white/5">
                                    {wizardStep === 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setWizardStep(1)}
                                            className="px-5 py-3 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all font-mono"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={modalLoading}
                                        className="flex-1 py-3 bg-signal-orange text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-orange-600 transition-all active:scale-[0.98] font-mono"
                                    >
                                        {modalLoading 
                                            ? 'Processing...' 
                                            : wizardStep === 1 
                                                ? 'Next: Manifesto →' 
                                                : 'Establish Tribe'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
