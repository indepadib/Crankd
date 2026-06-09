'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    ShoppingBag, 
    ChevronUp, 
    ChevronDown, 
    Send, 
    Play, 
    Pause, 
    Volume2, 
    VolumeX,
    X,
    Check
} from 'lucide-react';

const REELS_VIDEOS = [
    {
        id: 'r-1',
        title: 'Toyota Supra JZA80 Dyno Run',
        description: 'Tuning session on the twin-turbo setup. Screaming to 8000 RPM under load!',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-in-a-parking-lot-40439-large.mp4',
        tags: ['JDM', 'Supra', 'Dyno', 'Brakes'],
        author: { username: 'SupraSupremacy', avatar: 'SS' },
        likes: 1240,
        comments: 240,
        marketplaceItem: { name: 'Brembo GT Braking System', price: 2200, category: 'Brakes' }
    },
    {
        id: 'r-2',
        title: 'Singer Porsche 911 Mountain Run',
        description: 'Testing the flat-six response on high-altitude twists. Aircooled perfection.',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-porsche-car-driving-on-a-curved-road-41482-large.mp4',
        tags: ['Porsche', 'Singer', 'MountainRun', 'Suspension'],
        author: { username: 'Flat6Fever', avatar: 'F6' },
        likes: 3820,
        comments: 512,
        marketplaceItem: { name: 'Bilstein B16 Coilovers', price: 1850, category: 'Suspension' }
    },
    {
        id: 'r-3',
        title: 'S54 Valve Clearance Adjustment',
        description: 'DIY garage day. Restoring the clearances on the E46 M3 engine block.',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-mechanic-hands-repairing-a-car-engine-40488-large.mp4',
        tags: ['Maintenance', 'DIY', 'BMW', 'Engine'],
        author: { username: 'E46_Wrench', avatar: 'EW' },
        likes: 850,
        comments: 89,
        marketplaceItem: { name: 'Liqui Moly 5W40 Engine Oil', price: 85, category: 'Maintenance' }
    },
    {
        id: 'r-4',
        title: 'Under the Hood: Twin Turbo GTR',
        description: 'Full layout walkthrough. Carbon fiber piping and upgraded custom intake blocks.',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-luxurious-car-parked-in-a-garage-41486-large.mp4',
        tags: ['HighHP', 'GTR', 'TwinTurbo', 'Exhaust'],
        author: { username: 'GodzillaTuning', avatar: 'GT' },
        likes: 4120,
        comments: 672,
        marketplaceItem: { name: 'Titanium Catback Exhaust', price: 2950, category: 'Exhaust' }
    }
];

export function VrooqTV() {
    const [videoStack, setVideoStack] = useState<any[]>(REELS_VIDEOS);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    // Track user-liked status per video
    const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
    // Local comments state per video
    const [videoComments, setVideoComments] = useState<Record<string, any[]>>({});
    const [commentInput, setCommentInput] = useState('');

    // UI overlays
    const [showComments, setShowComments] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [likeExplosion, setLikeExplosion] = useState(false);

    // Ref for HTML video element
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const activeVideo = videoStack[activeIdx] || null;

    useEffect(() => {
        // Autoplay whenever active index changes
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(() => {
                setIsPlaying(false);
            });
        }
        setShowComments(false);
        setShowCheckout(false);
        setCheckoutComplete(false);
    }, [activeIdx]);

    const togglePlayback = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            });
        }
    };

    const handleNext = () => {
        if (activeIdx < videoStack.length - 1) {
            setActiveIdx(prev => prev + 1);
        } else {
            setActiveIdx(0); // loop back to first video
        }
    };

    const handleBack = () => {
        if (activeIdx > 0) {
            setActiveIdx(prev => prev - 1);
        } else {
            setActiveIdx(videoStack.length - 1); // loop back to last video
        }
    };

    const handleLike = () => {
        if (!activeVideo) return;
        const id = activeVideo.id;
        const isCurrentlyLiked = likedVideos[id];

        setLikedVideos(prev => ({
            ...prev,
            [id]: !isCurrentlyLiked
        }));

        if (!isCurrentlyLiked) {
            setLikeExplosion(true);
            setTimeout(() => setLikeExplosion(false), 800);
        }

        setVideoStack(prev => prev.map(v => {
            if (v.id === id) {
                return {
                    ...v,
                    likes: isCurrentlyLiked ? v.likes - 1 : v.likes + 1
                };
            }
            return v;
        }));
    };

    const handleSendComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim() || !activeVideo) return;

        const id = activeVideo.id;
        const newComment = {
            id: `c-${Date.now()}`,
            username: '@driver_one',
            text: commentInput.trim(),
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const currentComments = videoComments[id] || [
            { id: 'c1', username: '@GTR_Enthusiast', text: 'Clean layout! Approved.', created_at: '10:14 AM' },
            { id: 'c2', username: '@BrakeChecker', text: 'Top tier mods on this build.', created_at: '11:05 AM' }
        ];

        setVideoComments(prev => ({
            ...prev,
            [id]: [newComment, ...currentComments]
        }));

        setVideoStack(prev => prev.map(v => {
            if (v.id === id) {
                return {
                    ...v,
                    comments: v.comments + 1
                };
            }
            return v;
        }));

        setCommentInput('');
    };

    const performCheckout = () => {
        setCheckoutLoading(true);
        setTimeout(() => {
            setCheckoutLoading(false);
            setCheckoutComplete(true);
        }, 1200);
    };

    const getCommentsList = () => {
        if (!activeVideo) return [];
        return videoComments[activeVideo.id] || [
            { id: 'c1', username: '@GTR_Enthusiast', text: 'Clean layout! Approved.', created_at: '10:14 AM' },
            { id: 'c2', username: '@BrakeChecker', text: 'Top tier mods on this build.', created_at: '11:05 AM' }
        ];
    };

    return (
        <div className="flex flex-col items-center justify-center py-6 w-full select-none">
            
            {/* Center: Beautiful centered iPhone style mockup */}
            <div className="relative flex items-center justify-center gap-6">
                
                {/* Desktop navigation left (ChevronUp) */}
                <button 
                    onClick={handleBack}
                    className="hidden md:flex p-3 rounded-full bg-steel border border-white/5 text-zinc-400 hover:text-signal-orange hover:border-signal-orange/20 transition-all active:scale-90"
                >
                    <ChevronUp className="h-5 w-5" />
                </button>

                {/* Vertical Reels Phone Chassis */}
                <div className="relative w-80 sm:w-88 aspect-[9/16] rounded-[42px] border-8 border-steel-light bg-black shadow-2xl overflow-hidden glass-panel flex flex-col justify-between">
                    
                    {/* Top Notch Bezel Speaker */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-steel-light rounded-b-2xl z-30 flex items-center justify-center">
                        <div className="w-12 h-1 bg-zinc-850 rounded-full" />
                    </div>

                    {/* Autoplay loop video element */}
                    {activeVideo ? (
                        <div className="absolute inset-0 z-0 bg-zinc-950 cursor-pointer" onClick={togglePlayback}>
                            <video
                                ref={videoRef}
                                src={activeVideo.url}
                                autoPlay
                                loop
                                muted={isMuted}
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            {/* Cinematic shadow overlays */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-zinc-950 z-0 flex items-center justify-center font-mono text-zinc-600 text-xs">
                            SCANNING TELEMETRY...
                        </div>
                    )}

                    {/* Mute toggle button */}
                    <div className="absolute top-6 left-6 z-10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                            className="p-2 bg-black/40 border border-white/10 rounded-full backdrop-blur text-white hover:bg-black/60 transition-all"
                        >
                            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        </button>
                    </div>

                    {/* Big Pause Overlay indicator */}
                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="p-4 bg-black/60 rounded-full text-white backdrop-blur-md animate-ping">
                                <Play className="h-6 w-6 text-signal-orange" />
                            </div>
                        </div>
                    )}

                    {/* Pulsing heart explosion on double click / like */}
                    <AnimatePresence>
                        {likeExplosion && (
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: [1, 1.4, 1], opacity: [1, 1, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none text-signal-orange"
                            >
                                <Heart className="h-16 w-16 fill-signal-orange text-signal-orange drop-shadow-[0_0_20px_#f97316]" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Immersive overlay UI */}
                    <div className="relative z-10 flex flex-col justify-between h-full p-5 pt-8 select-none pointer-events-none">
                        
                        {/* Feed title */}
                        <div className="flex justify-center gap-4 text-[10px] font-black text-white/50 tracking-wider">
                            <span className="text-white border-b-2 border-signal-orange pb-0.5 font-mono">VROOQ TV</span>
                            <span className="font-mono">LIVE</span>
                        </div>

                        {/* Description & Action panel */}
                        <div className="flex justify-between items-end w-full mt-auto">
                            
                            {/* Info Block */}
                            <div className="space-y-3 flex-1 pr-3 pointer-events-auto">
                                <div>
                                    <p className="text-xs font-bold text-white uppercase font-mono">@{activeVideo?.author.username}</p>
                                    <p className="text-[10px] text-white/95 line-clamp-2 mt-1 leading-normal font-semibold font-mono">{activeVideo?.description}</p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {activeVideo?.tags.map((t: string) => (
                                            <span key={t} className="text-[8px] font-mono text-signal-orange bg-signal-orange/10 px-1.5 py-0.5 rounded font-black uppercase">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Marketplace product badge */}
                                {activeVideo?.marketplaceItem && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsPlaying(false);
                                            videoRef.current?.pause();
                                            setShowCheckout(true);
                                        }}
                                        className="w-full py-2 bg-gradient-to-r from-signal-orange to-signal-orange-dim text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg border border-white/10 animate-pulse pointer-events-auto"
                                    >
                                        <ShoppingBag className="h-3 w-3" />
                                        Buy Part: ${activeVideo.marketplaceItem.price.toLocaleString()}
                                    </motion.button>
                                )}
                            </div>

                            {/* Vertically stacked action buttons */}
                            <div className="flex flex-col items-center gap-4 pointer-events-auto shrink-0 pl-1">
                                <div className="flex flex-col items-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleLike(); }}
                                        className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur border border-white/10 active:scale-90 transition-all"
                                    >
                                        <Heart className={`h-4.5 w-4.5 transition-colors ${likedVideos[activeVideo?.id] ? 'text-signal-orange fill-signal-orange' : 'text-white'}`} />
                                    </button>
                                    <span className="text-[9px] font-mono font-bold text-white mt-1 drop-shadow-md">{activeVideo?.likes}</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                                        className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur border border-white/10 active:scale-90 transition-all"
                                    >
                                        <MessageCircle className="h-4.5 w-4.5 text-white" />
                                    </button>
                                    <span className="text-[9px] font-mono font-bold text-white mt-1 drop-shadow-md">{activeVideo?.comments}</span>
                                </div>

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Vrooq TV clip link copied!');
                                    }}
                                    className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur border border-white/10 active:scale-90 transition-all"
                                >
                                    <Share2 className="h-4.5 w-4.5 text-white" />
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Nested Slide-up Comments Drawer */}
                    <AnimatePresence>
                        {showComments && (
                            <motion.div 
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="absolute inset-x-0 bottom-0 h-[65%] bg-carbon border-t border-white/10 rounded-t-[32px] z-20 p-4 flex flex-col justify-between pointer-events-auto"
                            >
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-black text-white font-mono uppercase">COMMENTS ({activeVideo?.comments})</span>
                                    <button onClick={() => setShowComments(false)} className="p-1 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar text-[10px]">
                                    {getCommentsList().map((c) => (
                                        <div key={c.id} className="bg-white/2 p-2 rounded-lg border border-white/5">
                                            <p className="font-bold text-signal-orange">{c.username}</p>
                                            <p className="text-zinc-300 mt-0.5">{c.text}</p>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSendComment} className="flex gap-1.5 border-t border-white/5 pt-2">
                                    <input 
                                        type="text" 
                                        value={commentInput}
                                        onChange={e => setCommentInput(e.target.value)}
                                        placeholder="Add comment..." 
                                        className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-white placeholder-text-muted text-[10px] focus:outline-none focus:border-signal-orange/30"
                                    />
                                    <button type="submit" className="p-2 bg-signal-orange hover:bg-orange-600 text-white rounded-xl active:scale-95 transition-all">
                                        <Send className="h-3.5 w-3.5" />
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Nested Slide-up Checkout Drawer */}
                    <AnimatePresence>
                        {showCheckout && (
                            <motion.div 
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="absolute inset-x-0 bottom-0 h-[85%] bg-carbon border-t border-white/10 rounded-t-[32px] z-20 p-5 flex flex-col justify-between pointer-events-auto"
                            >
                                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                    <span className="text-[9px] font-black text-white font-mono uppercase tracking-wider">VROOQ TV CHECKOUT</span>
                                    <button 
                                        onClick={() => {
                                            setShowCheckout(false);
                                            setIsPlaying(true);
                                            videoRef.current?.play();
                                        }} 
                                        className="p-1 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {checkoutComplete ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-4 animate-in zoom-in-95">
                                        <div className="h-12 w-12 rounded-full bg-signal-orange/10 border border-signal-orange/30 flex items-center justify-center text-signal-orange">
                                            <Check className="h-6 w-6" />
                                        </div>
                                        <h4 className="text-sm font-black text-white font-mono uppercase">Checkout Complete</h4>
                                        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                                            Order processed. Item registered under your chassis specifications registry.
                                        </p>
                                        <button 
                                            onClick={() => {
                                                setShowCheckout(false);
                                                setIsPlaying(true);
                                                videoRef.current?.play();
                                            }}
                                            className="w-full mt-2 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl text-[10px] uppercase font-bold transition-all"
                                        >
                                            Return to feed
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col justify-between py-2 text-[10px]">
                                        <div className="space-y-4">
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl space-y-1.5 font-mono">
                                                <div className="flex justify-between text-zinc-500">
                                                    <span>PRODUCT</span>
                                                    <span className="text-white font-bold max-w-[140px] truncate">{activeVideo?.marketplaceItem?.name}</span>
                                                </div>
                                                <div className="flex justify-between text-zinc-500">
                                                    <span>PRICE</span>
                                                    <span className="text-signal-orange font-bold">${activeVideo?.marketplaceItem?.price.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-zinc-500">
                                                    <span>SHIPPING</span>
                                                    <span className="text-white font-bold">Complimentary</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1 font-mono">
                                                <span className="text-[8px] text-zinc-500 font-bold uppercase">LEDGER WALLET ADDRESS</span>
                                                <p className="bg-black/40 border border-white/5 p-2 rounded-lg text-zinc-400 font-bold truncate text-[9px]">
                                                    vrq_ledger_0x4f88127be51a90c29b71e16f
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={performCheckout}
                                            disabled={checkoutLoading}
                                            className="w-full py-3 bg-signal-orange hover:bg-orange-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 active:scale-98 disabled:opacity-50"
                                        >
                                            {checkoutLoading ? 'Verifying ledger...' : 'Checkout with Vrooq Ledger'}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* Desktop navigation right (ChevronDown) */}
                <button 
                    onClick={handleNext}
                    className="hidden md:flex p-3 rounded-full bg-steel border border-white/5 text-zinc-400 hover:text-signal-orange hover:border-signal-orange/20 transition-all active:scale-90"
                >
                    <ChevronDown className="h-5 w-5" />
                </button>

            </div>

        </div>
    );
}
