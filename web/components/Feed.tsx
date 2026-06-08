'use client';

import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, MapPin, Wrench, Calendar, ChevronRight, Sparkles, Sliders, X } from 'lucide-react';
import { Post } from '@/types'; // Use shared type
import { VehicleCard } from './VehicleCard';
import { DiscoverView } from './DiscoverView';
import { DashboardSidebar } from './DashboardSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useFeed } from '@/hooks/useFeed';
import { useAuth } from '@/context/AuthProvider';
import { DetailModal } from './ui/DetailModal';

function FeedTuner() {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="col-span-1 aspect-[4/2] md:aspect-auto md:h-full bg-gradient-to-br from-carbon to-black rounded-3xl border border-white/5 p-6 relative overflow-hidden group"
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
                        <span className="text-xs font-bold uppercase tracking-wider">Crankd Intelligence</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Fine-tune your feed</h3>
                    <p className="text-sm text-text-dim">Our algorithm adapts to your garage.</p>
                </div>

                <div className="space-y-2 mt-4">
                    {['More Track Builds', 'Less Stance', 'Euro Parts'].map(opt => (
                        <button key={opt} className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-signal-orange/30 text-sm text-white transition-all flex items-center justify-between group/btn">
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
    onView, 
    onOpenDetails 
}: { 
    post: Post; 
    onView: (id: string, duration: number) => void;
    onOpenDetails: () => void;
}) {
    const isLarge = post.cohort_level >= 2;
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [flames, setFlames] = useState<{ id: number; x: number; y: number }[]>([]);
    const startTime = useRef<number>(0);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the detail card modal
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

    const handleCommentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenDetails();
    };

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Fallback share simulation
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        alert('Copied link to clipboard!');
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent modal open if they clicked on action buttons
        if ((e.target as HTMLElement).closest('.action-button')) {
            return;
        }
        onOpenDetails();
    };

    const getImage = () => {
        if (post.image_url) return post.image_url;
        if (post.vehicle?.image_url) return post.vehicle.image_url;
        return null;
    };

    // Parse location / description from rich JSON block if it exists
    let locationText = 'Local Meet';
    let bodyText = post.body || '';
    if (post.content_type === 'convoy' && post.body?.startsWith('{')) {
        try {
            const parsed = JSON.parse(post.body);
            locationText = parsed.location || 'Local Meet';
            bodyText = parsed.text || '';
        } catch (e) {
            bodyText = post.body || '';
        }
    } else if (post.body?.startsWith('{')) {
        try {
            const parsed = JSON.parse(post.body);
            bodyText = parsed.text || '';
        } catch (e) {
            bodyText = post.body || '';
        }
    }

    const matchScore = post.tags?.includes('BMW') ? 99 : Math.floor(Math.random() * 30 + 70);
    const matchReason = post.tags?.[0] ? `Matches ${post.tags[0]}` : 'Trending';

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
            onClick={handleCardClick}
            transition={{ duration: 0.5 }}
            className={clsx(
                "group relative overflow-hidden rounded-3xl bg-steel border border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 cursor-pointer",
                isLarge ? 'md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-video' : 'col-span-1 aspect-square md:aspect-[4/5]'
            )}
        >
            {/* Background Image / Content */}
            {getImage() ? (
                <div className="absolute inset-0">
                    <img
                        src={getImage()!}
                        alt={post.title || 'Feed Image'}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                    />
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

            {/* AI Context Chip - "Sober AI" */}
            <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-medium text-white shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Sparkles className="h-3 w-3 text-signal-orange" />
                    <span className="text-white/80">Matched:</span>
                    <span className="text-white font-bold">{matchScore}%</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-white/80">{matchReason}</span>
                </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* User Header */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white border border-white/10 overflow-hidden">
                        {post.author?.avatar_url ? (
                            <img src={post.author.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            post.author?.username?.[0] || 'D'
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white drop-shadow-md">
                            {post.author?.username ? `@${post.author.username}` : '@Driver'}
                        </span>
                    </div>
                </div>

                {/* Body Details */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        {post.title && (
                            <h3 className={`font-black uppercase tracking-tighter text-white drop-shadow-lg leading-tight ${isLarge ? 'text-4xl' : 'text-2xl'}`}>
                                {post.title}
                            </h3>
                        )}

                        {bodyText && (
                            <p className="text-white/70 text-sm line-clamp-2">{bodyText}</p>
                        )}

                        {post.content_type === 'maintenance_log' && post.log && (
                            <div className="bg-carbon/50 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-3 mb-2 text-signal-orange">
                                    <Wrench className="h-5 w-5" />
                                    <span className="font-bold text-sm uppercase">Maintenance Record</span>
                                </div>
                                <div className="text-white font-bold text-lg">{post.log.title}</div>
                                <div className="text-white/50 text-sm">{post.log.occurred_at} • {post.log.cost_currency} {post.log.cost_amount}</div>
                            </div>
                        )}

                        {post.content_type === 'convoy' && (
                            <div className="bg-carbon/80 backdrop-blur-md rounded-xl p-4 border border-signal-orange/30 group-hover:border-signal-orange transition-colors">
                                <div className="flex items-center gap-3 mb-2 text-signal-orange">
                                    <MapPin className="h-5 w-5" />
                                    <span className="font-bold text-sm uppercase">Convoy Invite</span>
                                </div>
                                <h4 className="font-black text-xl text-white uppercase italic truncate">{post.title}</h4>
                                <div className="mt-2 text-white/70 text-sm flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-signal-orange" />
                                    {locationText}
                                </div>
                                <div className="mt-4">
                                    <button 
                                        onClick={handleCommentClick}
                                        className="w-full py-2 bg-signal-orange text-white font-bold rounded-lg text-sm hover:bg-orange-600 transition-colors action-button"
                                    >
                                        View Details / RSVP
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Social Stats Row */}
                    {post.content_type !== 'convoy' && (
                        <div className="flex items-center gap-6 pt-2 relative">
                            {/* Give Gas / Rev button with micro animations & screen shake */}
                            <button
                                onClick={handleLike}
                                className="flex items-center gap-2 group/btn relative action-button"
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
                                    {liked ? 'REVVING' : 'REV'} ({likeCount})
                                </span>
                            </button>

                            <button 
                                onClick={handleCommentClick}
                                className="flex items-center gap-2 group/btn action-button"
                            >
                                <MessageCircle className="h-5 w-5 text-white/50 group-hover/btn:text-white transition-colors" />
                                <span className="text-xs font-mono font-bold text-white/50">{post.comment_count || 0}</span>
                            </button>

                            <button 
                                onClick={handleShareClick}
                                className="flex items-center gap-2 group/btn ml-auto action-button"
                            >
                                <Share2 className="h-5 w-5 text-white/50 group-hover/btn:text-white transition-colors" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

export function Feed() {
    const [view, setView] = useState<'following' | 'discover'>('discover');
    const { user } = useAuth();
    const { posts, loading, logView } = useFeed(user?.id);

    // Modal states
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [modalType, setModalType] = useState<'post' | 'listing' | 'convoy'>('post');
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header / Filter */}
            <header className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2 italic">
                        {view === 'following' ? 'Driver Feed' : 'Discover'}
                    </h1>
                    <p className="text-text-dim text-sm">
                        {view === 'following' ? 'Command center for your garage.' : 'Trending stories and builds from the streets.'}
                    </p>
                </div>
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
                </div>
            </header>

            {/* Content Switcher */}
            {view === 'following' ? (
                <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Main Feed */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
                        {loading && posts.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-white/50">Scanning frequencies...</div>
                        ) : (
                            posts.map((post, idx) => (
                                <React.Fragment key={post.id}>
                                    {idx === 1 && <FeedTuner key="tuner" />}
                                    <FeedItem 
                                        post={post} 
                                        onView={logView} 
                                        onOpenDetails={() => {
                                            setSelectedItem(post);
                                            setModalType(post.content_type === 'convoy' ? 'convoy' : 'post');
                                            setIsModalOpen(true);
                                        }}
                                    />
                                </React.Fragment>
                            ))
                        )}
                    </div>

                    {/* Dashboard Sidebar (Desktop) */}
                    <div className="hidden lg:block w-80 shrink-0">
                        <DashboardSidebar />
                    </div>
                </div>
            ) : (
                <DiscoverView />
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
