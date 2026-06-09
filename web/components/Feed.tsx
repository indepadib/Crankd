'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    MapPin, 
    Wrench, 
    Calendar, 
    ChevronRight, 
    Sparkles, 
    Sliders, 
    X, 
    Check, 
    Clock,
    Plus
} from 'lucide-react';
import { Post } from '@/types'; // Use shared type
import { VehicleCard } from './VehicleCard';
import { DiscoverView } from './DiscoverView';
import { DashboardSidebar } from './DashboardSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useFeed } from '@/hooks/useFeed';
import { useAuth } from '@/context/AuthProvider';
import { DetailModal } from './ui/DetailModal';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { VrooqTV } from './VrooqTV';
import { usePreferences } from '@/hooks/usePreferences';

function FeedTuner() {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="w-full bg-gradient-to-br from-carbon to-black rounded-3xl border border-white/5 p-6 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setDismissed(true)} className="text-white/30 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 text-signal-orange mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Vrooq Intelligence</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Fine-tune your feed</h3>
                    <p className="text-sm text-text-dim">Our algorithm adapts to your garage.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                    {['More Track Builds', 'Less Stance', 'Euro Parts'].map(opt => (
                        <button key={opt} className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-signal-orange/30 text-sm text-white transition-all flex items-center justify-between group/btn">
                            {opt}
                            <Sliders className="h-3 w-3 text-white/30 group-hover/btn:text-signal-orange transition-colors" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-signal-orange/10 rounded-full blur-3xl group-hover:bg-signal-orange/20 transition-colors" />
        </motion.div>
    );
}

function FeedItem({ 
    post, 
    layoutType,
    onView, 
    onOpenDetails 
}: { 
    post: Post; 
    layoutType: 'social' | 'grid';
    onView: (id: string, duration: number) => void;
    onOpenDetails: () => void;
}) {
    const { user } = useAuth();
    const { formatCurrency, formatDistance } = usePreferences();
    const isLarge = post.cohort_level >= 2 && layoutType === 'grid';
    
    // States
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [flames, setFlames] = useState<{ id: number; x: number; y: number }[]>([]);
    const [showDoubleTapFlame, setShowDoubleTapFlame] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [rsvps, setRsvps] = useState<string[]>([]);
    const [isJoined, setIsJoined] = useState(false);

    const startTime = useRef<number>(0);
    const lastTap = useRef<number>(0);

    // Load RSVPs & Comments
    useEffect(() => {
        if (post.content_type === 'convoy') {
            const localRsvpsKey = `rsvps-${post.id}`;
            const savedRsvps = localStorage.getItem(localRsvpsKey);
            const parsedRsvps = savedRsvps ? JSON.parse(savedRsvps) : ['@driver_one', '@canyon_blaster', '@m3_guy'];
            setRsvps(parsedRsvps);

            if (user?.email) {
                const username = user.email.split('@')[0];
                setIsJoined(parsedRsvps.includes(`@${username}`));
            }
        }

        const loadPostComments = async () => {
            const localCommentsKey = `comments-${post.id}`;
            const savedComments = localStorage.getItem(localCommentsKey);
            const parsedLocal = savedComments ? JSON.parse(savedComments) : [];

            let dbComments: any[] = [];
            try {
                const { data: dbData, error } = await supabase
                    .from('post_comments')
                    .select('*')
                    .eq('post_id', post.id)
                    .order('created_at', { ascending: false });

                if (!error && dbData) {
                    dbComments = dbData.map(c => ({
                        id: c.id,
                        author: c.author_username.startsWith('@') ? c.author_username : `@${c.author_username}`,
                        text: c.comment_text,
                        created_at: c.created_at
                    }));
                }
            } catch (err) {}

            const combined = [...parsedLocal, ...dbComments];
            const uniqueComments = combined.reduce((acc: any[], current) => {
                const x = acc.find(item => item.id === current.id);
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, []);

            setComments(uniqueComments);
        };

        loadPostComments();
    }, [post.id, post.content_type, user]);

    const handleLike = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!liked) {
            setLiked(true);
            setLikeCount(prev => prev + 1);
            // Trigger flying flame particles
            const newFlames = Array.from({ length: 6 }).map((_, i) => ({
                id: Date.now() + i,
                x: Math.random() * 80 - 40,
                y: -Math.random() * 80 - 40
            }));
            setFlames(newFlames);
            setTimeout(() => setFlames([]), 1000);
        } else {
            setLiked(false);
            setLikeCount(prev => prev - 1);
        }
    };

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;
        if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
            // Trigger Double-Tap Rev
            if (!liked) {
                setLiked(true);
                setLikeCount(prev => prev + 1);
            }
            // Trigger flame animation
            const newFlames = Array.from({ length: 12 }).map((_, i) => ({
                id: Date.now() + i,
                x: Math.random() * 120 - 60,
                y: -Math.random() * 120 - 60
            }));
            setFlames(newFlames);
            setTimeout(() => setFlames([]), 1000);

            // TikTok style center flash
            setShowDoubleTapFlame(true);
            setTimeout(() => setShowDoubleTapFlame(false), 800);
        } else {
            // Wait for potential second tap; if not, open details drawer
            setTimeout(() => {
                const diff = Date.now() - lastTap.current;
                if (diff >= DOUBLE_PRESS_DELAY) {
                    onOpenDetails();
                }
            }, DOUBLE_PRESS_DELAY);
        }
        lastTap.current = now;
    };

    const handleToggleRSVP = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            alert('You must be logged in to join a convoy.');
            return;
        }

        const username = `@${user.email?.split('@')[0] || 'driver'}`;
        const localRsvpsKey = `rsvps-${post.id}`;

        let updated: string[];
        if (isJoined) {
            updated = rsvps.filter(u => u !== username);
            setIsJoined(false);
        } else {
            updated = [...rsvps, username];
            setIsJoined(true);
        }

        setRsvps(updated);
        localStorage.setItem(localRsvpsKey, JSON.stringify(updated));
    };

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !user) return;

        const username = user.email ? `@${user.email.split('@')[0]}` : '@Enthusiast';
        const newComment = {
            id: `c-${Date.now()}`,
            author: username,
            text: commentText,
            created_at: new Date().toISOString()
        };

        const updatedComments = [newComment, ...comments];
        setComments(updatedComments);
        localStorage.setItem(`comments-${post.id}`, JSON.stringify(updatedComments));

        try {
            await supabase.from('post_comments').insert({
                post_id: post.id,
                author_username: username.replace('@', ''),
                comment_text: commentText
            });
        } catch (err) {}

        setCommentText('');
    };

    const getImage = () => {
        if (post.image_url) return post.image_url;
        if (post.vehicle?.image_url) return post.vehicle.image_url;
        return null;
    };

    let locationText = 'Local Meet';
    let bodyText = post.body || '';
    let parsedConvoyDetails: any = null;

    if (post.body?.startsWith('{')) {
        try {
            parsedConvoyDetails = JSON.parse(post.body);
            locationText = parsedConvoyDetails.location || 'Local Meet';
            bodyText = parsedConvoyDetails.text || '';
        } catch (e) {
            bodyText = post.body || '';
        }
    }

    const matchScore = post.tags?.includes('BMW') ? 99 : Math.floor(Math.random() * 30 + 70);
    const matchReason = post.tags?.[0] ? `Matches ${post.tags[0]}` : 'Trending';

    // ────────────────────────────────────────────────────────
    // 1. CLASSIC GRID CARD VIEW
    // ────────────────────────────────────────────────────────
    if (layoutType === 'grid') {
        return (
            <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                onViewportEnter={() => { startTime.current = Date.now(); }}
                onViewportLeave={() => {
                    const duration = (Date.now() - startTime.current) / 1000;
                    onView(post.id, duration);
                }}
                onClick={onOpenDetails}
                transition={{ duration: 0.4 }}
                className={clsx(
                    "group relative overflow-hidden rounded-3xl bg-steel border border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 cursor-pointer",
                    isLarge ? 'md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-video' : 'col-span-1 aspect-square md:aspect-[4/5]'
                )}
            >
                {getImage() ? (
                    <div className="absolute inset-0">
                        {post.content_type === 'video' || getImage()!.includes('.mp4') || getImage()!.startsWith('data:video') ? (
                            <video
                                src={getImage()!}
                                loop
                                muted
                                autoPlay
                                playsInline
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                            />
                        ) : (
                            <img
                                src={getImage()!}
                                alt={post.title || 'Feed Image'}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-transparent opacity-90" />
                    </div>
                ) : post.content_type === 'convoy' ? (
                    <div className="absolute inset-0 bg-signal-orange/10">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center grayscale mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-carbon to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-steel-light to-steel" />
                )}

                <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-medium text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Sparkles className="h-3 w-3 text-signal-orange" />
                        <span className="text-white font-bold">{matchScore}%</span>
                        <span className="text-white/60">{matchReason}</span>
                    </div>
                </div>

                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white border border-white/10 overflow-hidden">
                            {post.author?.avatar_url ? (
                                <img src={post.author.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                post.author?.username?.[0] || 'D'
                            )}
                        </div>
                        <span className="text-sm font-bold text-white drop-shadow-md">
                            {post.author?.username ? `@${post.author.username}` : '@Driver'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            {post.title && (
                                <h3 className={clsx("font-black uppercase tracking-tighter text-white drop-shadow-lg leading-tight italic", isLarge ? 'text-4xl' : 'text-2xl')}>
                                    {post.title}
                                </h3>
                            )}
                            {bodyText && <p className="text-white/70 text-sm line-clamp-2">{bodyText}</p>}
                        </div>

                        {post.content_type === 'maintenance_log' && post.log && (
                            <div className="bg-carbon/50 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-3 mb-2 text-signal-orange">
                                    <Wrench className="h-5 w-5" />
                                    <span className="font-bold text-sm uppercase">Maintenance</span>
                                </div>
                                <div className="text-white font-bold text-lg">{post.log.title}</div>
                            </div>
                        )}

                        {post.content_type === 'convoy' && (
                            <div className="bg-carbon/80 backdrop-blur-md rounded-xl p-4 border border-signal-orange/30">
                                <div className="flex items-center gap-3 mb-2 text-signal-orange">
                                    <MapPin className="h-5 w-5" />
                                    <span className="font-bold text-sm uppercase">Convoy Invite</span>
                                </div>
                                <div className="text-white font-black text-lg truncate uppercase italic">{post.title}</div>
                            </div>
                        )}

                        {post.content_type !== 'convoy' && (
                            <div className="flex items-center gap-6 pt-2">
                                <button onClick={handleLike} className="flex items-center gap-2 action-button text-white/50 hover:text-signal-orange transition-colors">
                                    <Heart className={clsx("h-5 w-5", liked && "fill-signal-orange text-signal-orange")} />
                                    <span className="text-xs font-mono font-bold">{likeCount}</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onOpenDetails(); }} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                                    <MessageCircle className="h-5 w-5" />
                                    <span className="text-xs font-mono font-bold">{post.comment_count || 0}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.article>
        );
    }

    // ────────────────────────────────────────────────────────
    // 2. HIGH-RETENTION IMMERSIVE SOCIAL TIMELINE CARD
    // ────────────────────────────────────────────────────────
    return (
        <motion.article
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            onViewportEnter={() => { startTime.current = Date.now(); }}
            onViewportLeave={() => {
                const duration = (Date.now() - startTime.current) / 1000;
                onView(post.id, duration);
            }}
            transition={{ duration: 0.4 }}
            className="w-full bg-[#0f0f12]/95 border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-white/10 transition-all duration-300"
        >
            {/* 2.1 Header: User context info */}
            <div className="p-5 flex items-center justify-between border-b border-white/5 bg-white/1">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-white overflow-hidden relative">
                        {post.author?.avatar_url ? (
                            <img src={post.author.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            post.author?.username?.[0]?.toUpperCase() || 'D'
                        )}
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-signal-orange rounded-full border-2 border-[#0e0e11] animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white hover:text-signal-orange transition-colors cursor-pointer">
                                {post.author?.username ? `@${post.author.username}` : '@Driver'}
                            </span>
                            <span className="text-zinc-600 font-mono text-xs">•</span>
                            <span className="text-[10px] text-text-dim font-mono">{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        {post.vehicle ? (
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <Link href={`/vehicle/${post.vehicle.id}`} className="text-[10px] font-black text-signal-orange hover:underline font-mono uppercase tracking-tight flex items-center gap-1">
                                    🚗 {post.vehicle.year} {post.vehicle.make} {post.vehicle.model}
                                </Link>
                                {post.community && (
                                    <>
                                        <span className="text-zinc-600 font-mono text-[9px]">•</span>
                                        <Link href={`/communities/${post.community.id}`} className="text-[10px] font-bold text-zinc-400 hover:text-signal-orange hover:underline font-mono uppercase tracking-tight">
                                            🛡️ {post.community.name}
                                        </Link>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-zinc-500 font-mono">Enthusiast</span>
                                {post.community && (
                                    <>
                                        <span className="text-zinc-600 font-mono text-[9px]">•</span>
                                        <Link href={`/communities/${post.community.id}`} className="text-[10px] font-bold text-zinc-400 hover:text-signal-orange hover:underline font-mono uppercase tracking-tight">
                                            🛡️ {post.community.name}
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 bg-white/2 border border-white/5 rounded-lg text-[10px] font-mono font-bold text-signal-orange/80">
                    <Sparkles className="h-3 w-3" /> {matchScore}% Match
                </div>
            </div>

            {/* 2.2 Story Content */}
            <div className="p-5 pb-4 space-y-3">
                {post.title && (
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                        {post.title}
                    </h3>
                )}
                {bodyText && <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{bodyText}</p>}
            </div>

            {/* 2.3 Media Upload with double tap to rev */}
            {getImage() && (
                <div 
                    onClick={handleImageClick}
                    className="relative w-full aspect-video md:aspect-[16/10] overflow-hidden bg-black/20 border-y border-white/5 cursor-pointer group/image"
                >
                    {post.content_type === 'video' || getImage()!.includes('.mp4') || getImage()!.startsWith('data:video') ? (
                        <video
                            src={getImage()!}
                            controls
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-102"
                        />
                    ) : (
                        <img
                            src={getImage()!}
                            alt={post.title || 'Feed Media'}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-102"
                        />
                    )}

                    {/* Shimmer Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/image:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                    {/* Direct double tap flame overlay */}
                    <AnimatePresence>
                        {showDoubleTapFlame && (
                            <motion.div
                                initial={{ scale: 0.3, opacity: 0 }}
                                animate={{ scale: [0.3, 1.2, 1], opacity: [0, 1, 0.8] }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                            >
                                <div className="h-28 w-28 rounded-full bg-signal-orange/10 border border-signal-orange/30 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.3)]">
                                    <span className="text-6xl animate-bounce">🔥</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* 2.4 Blueprint / Convoy Info Blocks */}
            <div className="px-5 pb-2">
                {post.content_type === 'maintenance_log' && (
                    <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-5 relative overflow-hidden group shadow-[0_0_15px_rgba(255,255,255,0.01)] mt-2">
                        <div className="absolute inset-0 opacity-[0.01] pointer-events-none"
                            style={{
                                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                backgroundSize: '15px 15px'
                            }}
                        />
                        <div className="relative z-10 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-signal-orange">
                                    <Wrench className="h-4 w-4" />
                                    <span className="font-mono text-xs font-black uppercase tracking-widest">Verified Provenance Log</span>
                                </div>
                                <span className="text-xs font-mono font-bold bg-white/5 text-white px-2 py-0.5 rounded border border-white/10">
                                    {post.log?.cost_amount ? formatCurrency(post.log.cost_amount) : 'Free'}
                                </span>
                            </div>
                            <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{post.log?.title || post.title}</h4>
                            {post.log?.odometer_reading && (
                                <span className="inline-block text-[9px] font-black font-mono text-text-dim bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                                    Odometer: {formatDistance(post.log.odometer_reading)}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {post.content_type === 'convoy' && (
                    <div className="bg-[#0f0e0c] border border-signal-orange/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.03)] flex flex-col mt-2">
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-signal-orange">
                                    <MapPin className="h-4 w-4" />
                                    <span className="font-mono text-xs font-black uppercase tracking-widest">Convoy Briefing</span>
                                </div>
                                <span className="text-xs font-bold text-signal-orange bg-signal-orange/10 px-2.5 py-0.5 rounded border border-signal-orange/20 font-mono">
                                    {rsvps.length} Drivers RSVP'd
                                </span>
                            </div>
                            
                            {parsedConvoyDetails?.startPoint && (
                                <div className="p-3 bg-white/2 border border-white/5 rounded-xl space-y-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="h-2 w-2 rounded-full bg-signal-orange" />
                                        <span className="text-white/60 font-mono text-[10px] uppercase">Start:</span>
                                        <span className="text-white font-bold truncate">{parsedConvoyDetails.startPoint}</span>
                                    </div>
                                    <div className="w-0.5 h-3 bg-dashed border-l border-white/20 ml-1" />
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="h-2 w-2 rounded-full bg-signal-orange" />
                                        <span className="text-white/60 font-mono text-[10px] uppercase">End:</span>
                                        <span className="text-white font-bold truncate">{parsedConvoyDetails.endPoint}</span>
                                    </div>
                                </div>
                            )}

                            {parsedConvoyDetails?.startPoint && parsedConvoyDetails?.endPoint && (
                                <div className="w-full aspect-[21/9] rounded-xl overflow-hidden border border-white/5 relative bg-[#0a0a0a]">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(1) contrast(1.2)' }}
                                        loading="lazy"
                                        allowFullScreen
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(parsedConvoyDetails.startPoint)}+to+${encodeURIComponent(parsedConvoyDetails.endPoint)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                                    />
                                    <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                                <div className="p-2 bg-white/2 border border-white/5 rounded-lg text-text-dim">
                                    Style: <span className="text-white">{parsedConvoyDetails?.cruiseStyle || 'Canyon Run'}</span>
                                </div>
                                <div className="p-2 bg-white/2 border border-white/5 rounded-lg text-text-dim">
                                    Pace: <span className="text-white">{parsedConvoyDetails?.pace || 'Spirited'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-[#141311] border-t border-white/5 flex gap-3 items-center justify-between">
                            <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-signal-orange" />
                                {parsedConvoyDetails?.dateTime || 'Oct 28 • 10:00 PM'}
                            </div>
                            <button
                                onClick={handleToggleRSVP}
                                className={clsx(
                                    "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all duration-300 flex items-center gap-1.5 active:scale-95",
                                    isJoined
                                        ? "bg-signal-orange/10 border-signal-orange/30 text-signal-orange shadow-[0_0_15px_rgba(249,115,22,0.05)]"
                                        : "bg-signal-orange border-signal-orange text-white hover:bg-orange-600 shadow-lg shadow-orange-600/10"
                                )}
                            >
                                {isJoined ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" /> RSVP Active
                                    </>
                                ) : (
                                    'Join Convoy'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 2.5 Action Bar */}
            <div className="p-4 border-t border-white/5 flex items-center gap-6 bg-white/[0.01]">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-2 group/btn relative action-button text-white/50 hover:text-signal-orange transition-colors"
                >
                    <motion.div
                        whileTap={{ scale: 0.7 }}
                        animate={liked ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : {}}
                        transition={{ type: "spring", stiffness: 450, damping: 12 }}
                        className="relative"
                    >
                        <Heart className={clsx("h-5 w-5 transition-colors", liked ? "fill-signal-orange text-signal-orange drop-shadow-[0_0_10px_#f97316]" : "text-white group-hover/btn:text-signal-orange")} />
                        
                        {/* Flying Flames particles */}
                        <AnimatePresence>
                            {flames.map(f => (
                                <motion.span
                                    key={f.id}
                                    initial={{ opacity: 1, scale: 0.8, y: 0, x: 0 }}
                                    animate={{ opacity: 0, scale: 1.6, y: f.y, x: f.x, rotate: f.x * 2 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.7, ease: 'easeOut' }}
                                    className="absolute text-base pointer-events-none z-30"
                                    style={{ left: '0px', top: '-10px' }}
                                >
                                    🔥
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                    <span className={clsx("text-xs font-mono font-bold transition-all", liked ? "text-signal-orange" : "text-white/50")}>
                        REV ({likeCount})
                    </span>
                </button>

                <button 
                    onClick={() => setShowComments(!showComments)}
                    className={clsx(
                        "flex items-center gap-2 group/btn transition-colors text-white/50 hover:text-white",
                        showComments && "text-white"
                    )}
                >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-xs font-mono font-bold">{comments.length}</span>
                </button>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                        alert('Copied link to clipboard!');
                    }}
                    className="flex items-center gap-2 group/btn ml-auto text-white/50 hover:text-white transition-colors"
                >
                    <Share2 className="h-5 w-5" />
                </button>
            </div>

            {/* 2.6 Collapsible Inline Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5 bg-black/20 p-4 space-y-4"
                    >
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {comments.length === 0 ? (
                                <p className="text-xs text-zinc-600 font-mono uppercase py-2">No comments yet. Rev the engine or write one!</p>
                            ) : (
                                comments.map(c => (
                                    <div key={c.id} className="text-xs space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{c.author}</span>
                                            <span className="text-[9px] text-zinc-500 font-mono">
                                                {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-text-dim pl-2 border-l border-white/5 leading-relaxed">{c.text}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleSendComment} className="flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Add to the conversation..."
                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-signal-orange/40 transition-all font-semibold"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="px-3 bg-white/5 border border-white/10 hover:border-signal-orange/40 hover:bg-signal-orange/5 text-white disabled:opacity-50 text-xs font-bold rounded-xl transition-all uppercase tracking-wider font-mono"
                            >
                                Post
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

export function Feed() {
    const [view, setView] = useState<'following' | 'discover' | 'vrooqtv'>('discover');
    const [layoutType, setLayoutType] = useState<'social' | 'grid'>('social');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const { user } = useAuth();
    const { posts, loading, logView } = useFeed(user?.id);

    // Modal states
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [modalType, setModalType] = useState<'post' | 'listing' | 'convoy'>('post');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredPosts = activeTag 
        ? posts.filter(post => 
            post.tags?.some(t => t.toLowerCase().includes(activeTag.toLowerCase())) ||
            post.content_type?.toLowerCase().includes(activeTag.toLowerCase()) ||
            post.title?.toLowerCase().includes(activeTag.toLowerCase()) ||
            post.body?.toLowerCase().includes(activeTag.toLowerCase())
          )
        : posts;

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header / Filter */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                            {view === 'following' ? 'Driver Feed' : 'Discover'}
                        </h1>
                        {activeTag && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-signal-orange/10 border border-signal-orange/20 text-signal-orange text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg animate-in zoom-in-95 select-none">
                                #{activeTag}
                                <button onClick={() => setActiveTag(null)} className="hover:text-white transition-colors p-0.5 rounded-full bg-white/5">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-text-dim text-sm">
                        {view === 'following' ? 'Command center for your garage.' : 'Trending stories and builds from the streets.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                    {view === 'following' && (
                        <div className="flex rounded-lg bg-black/40 p-1 border border-white/5 select-none shrink-0">
                            <button
                                onClick={() => setLayoutType('social')}
                                className={clsx(
                                    "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase font-mono",
                                    layoutType === 'social' ? "bg-signal-orange text-white" : "text-text-dim hover:text-white"
                                )}
                            >
                                Timeline
                            </button>
                            <button
                                onClick={() => setLayoutType('grid')}
                                className={clsx(
                                    "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase font-mono",
                                    layoutType === 'grid' ? "bg-signal-orange text-white" : "text-text-dim hover:text-white"
                                )}
                            >
                                Grid
                            </button>
                        </div>
                    )}

                    <div className="flex gap-4 relative">
                        <button
                            onClick={() => setView('following')}
                            className={`text-sm font-bold pb-2 transition-colors relative ${view === 'following' ? 'text-white' : 'text-text-dim hover:text-white'}`}
                        >
                            Following
                            {view === 'following' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-signal-orange" />}
                        </button>
                        <button
                            onClick={() => setView('discover')}
                            className={`text-sm font-bold pb-2 transition-colors relative ${view === 'discover' ? 'text-white' : 'text-text-dim hover:text-white'}`}
                        >
                            Discover
                            {view === 'discover' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-signal-orange" />}
                        </button>
                        <button
                            onClick={() => setView('vrooqtv')}
                            className={`text-sm font-bold pb-2 transition-colors relative ${view === 'vrooqtv' ? 'text-white' : 'text-text-dim hover:text-white'}`}
                        >
                            Vrooq TV 📺
                            {view === 'vrooqtv' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-signal-orange" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Switcher */}
            {view === 'following' ? (
                <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Main Feed */}
                    <div className={clsx(
                        "flex-1 w-full",
                        layoutType === 'social'
                            ? "max-w-2xl mx-auto flex flex-col gap-8"
                            : "grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min"
                    )}>
                        {loading && filteredPosts.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-white/50 font-mono uppercase tracking-widest animate-pulse">Scanning frequencies...</div>
                        ) : (
                            <>
                                {layoutType === 'social' && <FeedTuner />}
                                {filteredPosts.map((post, idx) => (
                                    <React.Fragment key={post.id}>
                                        {layoutType === 'grid' && idx === 1 && <FeedTuner key="tuner" />}
                                        <FeedItem 
                                            post={post} 
                                            layoutType={layoutType}
                                            onView={logView} 
                                            onOpenDetails={() => {
                                                setSelectedItem(post);
                                                setModalType(post.content_type === 'convoy' ? 'convoy' : 'post');
                                                setIsModalOpen(true);
                                            }}
                                        />
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Dashboard Sidebar (Desktop) */}
                    {layoutType === 'grid' && (
                        <div className="hidden lg:block w-80 shrink-0">
                            <DashboardSidebar />
                        </div>
                    )}
                </div>
            ) : view === 'discover' ? (
                <DiscoverView onSelectTag={(tag) => {
                    setActiveTag(tag);
                    setView('following');
                }} />
            ) : (
                <VrooqTV />
            )}

            {/* Global Overlay Detail Modal */}
            <DetailModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                type={modalType} 
                data={selectedItem} 
            />
        </div>
    );
}
