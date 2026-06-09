'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Car, Heart, Share2, Shield, ChevronRight, LogOut, MessageSquare, Flame, Sparkles, Award } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { DetailModal } from '@/components/ui/DetailModal';

interface FlameParticle {
    id: number;
    x: number;
    y: number;
}

interface RevState {
    count: number;
    isRevving: boolean;
    flames: FlameParticle[];
}

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Profile states
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('Car enthusiast • Builder • Explorer');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    // Detail Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [modalType, setModalType] = useState<'post' | 'listing' | 'convoy'>('post');

    // Interactive Rev Telemetry for vehicles
    const [revRegistry, setRevRegistry] = useState<Record<string, RevState>>({});

    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Driver';

    useEffect(() => {
        if (!user) return;

        const loadProfileData = async () => {
            setLoading(true);

            // 1. Fetch Profile Preferences
            let dbProfile: any = null;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();
                if (!error && data) {
                    dbProfile = data;
                }
            } catch (e) {}

            // Merging with localStorage user-profile
            const localProfileKey = `user-profile-${user.id}`;
            const localSaved = localStorage.getItem(localProfileKey);
            if (localSaved) {
                try {
                    const parsed = JSON.parse(localSaved);
                    dbProfile = { ...dbProfile, ...parsed };
                } catch (e) {}
            }

            setFullName(dbProfile?.full_name || user.user_metadata?.full_name || username);
            setBio(dbProfile?.bio || 'Car enthusiast • Builder • Explorer');
            setAvatarUrl(dbProfile?.avatar_url || '');
            setCoverUrl(dbProfile?.cover_url || '');

            // 2. Fetch User Vehicles
            let dbVehicles: any[] = [];
            try {
                const { data, error } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('owner_id', user.id);
                if (!error && data) {
                    dbVehicles = data;
                }
            } catch (e) {}

            // Merge with local vehicles
            const localVehiclesSaved = localStorage.getItem('local-vehicles');
            const localVehiclesList = localVehiclesSaved ? JSON.parse(localVehiclesSaved) : [];
            const userLocalVehicles = localVehiclesList.filter((v: any) => v.owner_id === user.id);
            const mergedVehicles = [
                ...userLocalVehicles,
                ...dbVehicles
            ].reduce((acc: any[], current) => {
                const exists = acc.find(item => item.id === current.id);
                if (!exists) return acc.concat([current]);
                return acc;
            }, []);

            // Attach specifications from local registry for details
            const detailedVehicles = mergedVehicles.map(v => {
                const specSaved = localStorage.getItem(`vehicle-specs-${v.id}`);
                let specs: any = null;
                if (specSaved) {
                    try { specs = JSON.parse(specSaved); } catch (e) {}
                }
                return {
                    ...v,
                    hp: specs?.dynoHp || specs?.hp || 'Stock',
                    modsCount: specs?.mods ? specs.mods.split(',').length : 0,
                    engine: specs?.engine || 'Inline-4'
                };
            });

            setVehicles(detailedVehicles);

            // Initialize Rev states
            const initialRevs: Record<string, RevState> = {};
            detailedVehicles.forEach(v => {
                const savedRevCount = localStorage.getItem(`vehicle-revs-${v.id}`);
                initialRevs[v.id] = {
                    count: savedRevCount ? parseInt(savedRevCount) : 0,
                    isRevving: false,
                    flames: []
                };
            });
            setRevRegistry(initialRevs);

            // 3. Fetch User Posts
            let dbPosts: any[] = [];
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('author_id', user.id)
                    .order('created_at', { ascending: false });
                if (!error && data) {
                    dbPosts = data.map((p: any) => ({
                        ...p,
                        author: {
                            id: user.id,
                            username: username,
                            avatar_url: dbProfile?.avatar_url || ''
                        }
                    }));
                }
            } catch (e) {}

            // Merge with local posts
            const localPostsSaved = localStorage.getItem('local-posts');
            const localPostsList = localPostsSaved ? JSON.parse(localPostsSaved) : [];
            const userLocalPosts = localPostsList.filter((p: any) => p.author_id === user.id);
            const mergedPosts = [
                ...userLocalPosts,
                ...dbPosts
            ].reduce((acc: any[], current) => {
                const exists = acc.find(item => item.id === current.id);
                if (!exists) return acc.concat([current]);
                return acc;
            }, []);

            setPosts(mergedPosts);
            setLoading(false);
        };

        loadProfileData();
    }, [user, username]);

    const handleOpenPostDetails = (post: any) => {
        setSelectedPost(post);
        setModalType(post.content_type === 'convoy' ? 'convoy' : 'post');
        setIsModalOpen(true);
    };

    // Card shaking and exhaust flame animation triggers
    const handleRevEngine = (vehicleId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        
        const current = revRegistry[vehicleId] || { count: 0, isRevving: false, flames: [] };
        const newCount = current.count + 1;
        
        // Save count locally
        localStorage.setItem(`vehicle-revs-${vehicleId}`, newCount.toString());

        // Spawn 3 exhaust flame particles
        const newFlames: FlameParticle[] = Array.from({ length: 3 }).map((_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 40 - 20, // drift sideways
            y: -(Math.random() * 60 + 40) // fly up
        }));

        setRevRegistry(prev => ({
            ...prev,
            [vehicleId]: {
                count: newCount,
                isRevving: true,
                flames: [...(prev[vehicleId]?.flames || []), ...newFlames]
            }
        }));

        // Reset shaking trigger
        setTimeout(() => {
            setRevRegistry(prev => ({
                ...prev,
                [vehicleId]: {
                    ...(prev[vehicleId] || { count: newCount, flames: [] }),
                    isRevving: false
                }
            }));
        }, 300);

        // Remove flames after animation finishes
        setTimeout(() => {
            setRevRegistry(prev => ({
                ...prev,
                [vehicleId]: {
                    ...(prev[vehicleId] || { count: newCount, isRevving: false, flames: [] }),
                    flames: (prev[vehicleId]?.flames || []).filter(f => !newFlames.includes(f))
                }
            }));
        }, 800);
    };

    const getDriverRank = () => {
        const vCount = vehicles.length;
        const pCount = posts.length;
        if (vCount >= 3 && pCount >= 5) {
            return { title: 'Apex Predator', color: 'text-red-400 border-red-500/20 bg-red-500/10', desc: 'Garage Overlord' };
        }
        if (vCount >= 2) {
            return { title: 'Street Tuner', color: 'text-signal-orange border-signal-orange/20 bg-signal-orange/10', desc: 'Active Garage' };
        }
        if (vCount === 1) {
            return { title: 'Rookie Driver', color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10', desc: 'First Build' };
        }
        return { title: 'Prospect', color: 'text-zinc-500 border-white/5 bg-white/2', desc: 'Enthusiast Spectator' };
    };

    if (loading) {
        return <div className="py-40 text-center text-zinc-500 font-mono uppercase tracking-widest animate-pulse">Retrieving Profile Matrix...</div>;
    }

    const isAdmin = username.toLowerCase().includes('adib') || user?.email?.toLowerCase().includes('adib');
    const rank = getDriverRank();
    const stats = [
        { label: 'Vehicles', value: vehicles.length.toString() },
        { label: 'Posts', value: posts.length.toString() },
        { label: 'Followers', value: isAdmin ? '1.2K' : '0' },
        { label: 'Following', value: isAdmin ? '389' : '0' },
    ];

    const defaultCover = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2670&auto=format&fit=crop';

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32">

            {/* Profile Premium Parallax Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative"
            >
                {/* Cover Photo Banner */}
                <div className="h-48 md:h-64 w-full relative overflow-hidden bg-zinc-950">
                    <img 
                        src={coverUrl || defaultCover} 
                        alt="Profile Banner" 
                        className="w-full h-full object-cover opacity-80 filter blur-[1px] hover:blur-none transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent" />
                </div>

                {/* Profile Details Area */}
                <div className="p-6 md:p-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            {avatarUrl ? (
                                <img 
                                    src={avatarUrl} 
                                    alt={username} 
                                    className="w-28 h-28 rounded-3xl object-cover border-4 border-[#09090b] shadow-xl bg-zinc-900"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-signal-orange to-orange-700 flex items-center justify-center text-5xl font-black text-white border-4 border-[#09090b] shadow-xl">
                                    {username[0]?.toUpperCase()}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full border-4 border-[#09090b] flex items-center justify-center">
                                <Shield className="h-3.5 w-3.5 text-white" />
                            </div>
                        </div>

                        {/* Text Metadata */}
                        <div className="space-y-1.5 md:mb-2">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">@{username}</h1>
                                
                                {/* Dynamic Achievement Badge */}
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${rank.color}`}>
                                    <Award className="h-3.5 w-3.5" />
                                    {rank.title}
                                </div>
                            </div>
                            <p className="text-zinc-400 font-bold text-sm leading-none">{fullName}</p>
                            <p className="text-text-dim text-sm max-w-md leading-relaxed">{bio}</p>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex gap-2 items-center md:mb-2">
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/driver/${username}`);
                                alert('Driver profile link copied!');
                            }}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-text-dim hover:text-white"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                        <Link href="/settings" className="p-3 rounded-xl bg-white/5 border border-signal-orange/20 hover:border-signal-orange transition-all text-signal-orange flex items-center justify-center glow-orange-sm">
                            <Settings className="h-4 w-4 animate-spin-slow" />
                        </Link>
                    </div>
                </div>

                {/* Separator */}
                <div className="h-[1px] bg-white/5 mx-8" />

                {/* Stats Row */}
                <div className="p-6 md:px-8 flex items-center justify-around md:justify-start md:gap-16">
                    {stats.map(s => (
                        <div key={s.label} className="text-center md:text-left">
                            <p className="text-2xl font-black text-white font-mono">{s.value}</p>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono font-black">{s.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Virtual Garage Showcase Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase italic tracking-tighter font-mono">
                        <Car className="h-5 w-5 text-signal-orange animate-pulse" /> Virtual Garage
                    </h2>
                    <Link href="/garage" className="text-xs text-signal-orange font-bold uppercase tracking-wider hover:text-orange-400 transition-colors flex items-center gap-1 font-mono">
                        Deploy Machine <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                {vehicles.length === 0 ? (
                    <div className="p-12 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center bg-white/1">
                        <Car className="h-12 w-12 text-white/5 mb-4 animate-pulse" />
                        <h3 className="text-base font-bold text-white mb-2 uppercase italic tracking-tight font-mono">Garage empty</h3>
                        <p className="text-text-dim text-xs max-w-sm leading-relaxed">
                            Document service logs and track modifications by introducing your first machine to the virtual garage.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {vehicles.map((v) => {
                            const vehicleImg = v.image_url || v.image || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80';
                            const revState = revRegistry[v.id] || { count: 0, isRevving: false, flames: [] };
                            
                            return (
                                <motion.div
                                    key={v.id}
                                    animate={revState.isRevving ? { x: [0, -4, 4, -4, 4, 0], scale: 1.01 } : {}}
                                    transition={{ duration: 0.3 }}
                                    className="glass-panel rounded-3xl overflow-hidden border border-white/5 hover:border-white/15 hover:shadow-2xl transition-all duration-300 relative group flex flex-col bg-[#0b0b0d]"
                                >
                                    {/* Cover Image */}
                                    <div className="h-48 w-full relative overflow-hidden bg-zinc-950 shrink-0">
                                        <img src={vehicleImg} alt={v.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-transparent to-transparent" />
                                        
                                        {/* Floating HP Tag */}
                                        <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/60 border border-white/10 backdrop-blur rounded-lg text-[9px] font-mono font-bold text-cyan-400">
                                            ⚡ {v.hp} WHP
                                        </div>
                                    </div>

                                    {/* Content Card Body */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <span className="text-[9px] font-mono font-bold uppercase text-signal-orange">{v.make}</span>
                                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{v.year} {v.model}</h3>
                                            
                                            {/* Micro-blueprint Specs */}
                                            <div className="grid grid-cols-3 gap-2 mt-3 text-[9px] font-mono font-bold">
                                                <div className="p-2 bg-white/2 border border-white/5 rounded-lg text-text-dim">
                                                    Engine: <span className="text-white block mt-0.5">{v.engine}</span>
                                                </div>
                                                <div className="p-2 bg-white/2 border border-white/5 rounded-lg text-text-dim">
                                                    Mods: <span className="text-white block mt-0.5">{v.modsCount} items</span>
                                                </div>
                                                <div className="p-2 bg-white/2 border border-white/5 rounded-lg text-text-dim">
                                                    Revs: <span className="text-signal-orange block mt-0.5">{revState.count} times</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button and Flames Particle zone */}
                                        <div className="flex gap-2 items-center justify-between relative pt-2 border-t border-white/5">
                                            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Interactive telemetry</span>
                                            
                                            {/* Exhaust Flame Particle Overlay */}
                                            <div className="absolute right-28 top-0 pointer-events-none z-30">
                                                <AnimatePresence>
                                                    {revState.flames.map(f => (
                                                        <motion.span
                                                            key={f.id}
                                                            initial={{ opacity: 1, scale: 0.8, y: 0, x: 0 }}
                                                            animate={{ opacity: 0, scale: 2.2, y: f.y, x: f.x, rotate: f.x * 2 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                            className="absolute text-xl pointer-events-none"
                                                        >
                                                            🔥
                                                        </motion.span>
                                                    ))}
                                                </AnimatePresence>
                                            </div>

                                            {/* Vroom Sound Text indicator */}
                                            {revState.isRevving && (
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                                    animate={{ opacity: 1, scale: [0.5, 1.3, 1], y: -30 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute right-4 top-[-20px] text-xs font-mono font-black italic text-signal-orange pointer-events-none"
                                                >
                                                    VROOOOOOM!
                                                </motion.span>
                                            )}

                                            <button
                                                onClick={(e) => handleRevEngine(v.id, e)}
                                                className="px-4 py-2 rounded-xl bg-signal-orange hover:bg-orange-600 text-white font-mono font-bold text-[10px] uppercase tracking-wider transition-all active:scale-[0.96] flex items-center gap-1.5 glow-orange-sm select-none"
                                            >
                                                <Flame className="h-3.5 w-3.5 animate-pulse" /> Rev Engine
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Timeline Posts Section */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter font-mono">Driver Timeline Posts</h2>
                
                {posts.length === 0 ? (
                    <div className="p-12 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center bg-white/1 min-h-[220px]">
                        <MessageSquare className="h-12 w-12 text-white/5 mb-4 animate-pulse" />
                        <h3 className="text-sm font-bold text-white mb-2 uppercase italic tracking-tight font-mono">Timeline Empty</h3>
                        <p className="text-text-dim max-w-sm text-xs leading-relaxed">
                            You haven't posted any build updates or convoy events yet. Go to the creation panel to publish your first post!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {posts.map((post, i) => {
                            const postImg = post.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80';
                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    onClick={() => handleOpenPostDetails(post)}
                                    className="aspect-square rounded-2xl overflow-hidden group relative cursor-pointer border border-white/5 hover:border-white/20 transition-all bg-steel/30"
                                >
                                    {post.content_type === 'video' || postImg.includes('.mp4') || postImg.startsWith('data:video') ? (
                                        <video src={postImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted playsInline />
                                    ) : (
                                        <img src={postImg} alt={post.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                                            <Heart className="h-4.5 w-4.5 fill-white text-signal-orange drop-shadow-[0_0_8px_#f97316]" /> {post.like_count || 0}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sign Out Action */}
            <button
                onClick={signOut}
                className="w-full py-4 rounded-2xl border border-white/8 hover:border-red-500/30 hover:bg-red-500/5 text-text-dim hover:text-red-400 font-black text-xs transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-widest"
            >
                <LogOut className="h-4 w-4" />
                Sign Out
            </button>

            {/* Global Overlay Detail Modal */}
            <DetailModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                type={modalType} 
                data={selectedPost} 
            />
        </div>
    );
}
