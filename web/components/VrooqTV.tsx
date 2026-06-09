'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    Sparkles, 
    ThumbsUp, 
    ThumbsDown, 
    ShoppingBag, 
    ChevronUp, 
    ChevronDown, 
    Send, 
    Play, 
    Pause, 
    Volume2, 
    VolumeX,
    X,
    CheckCircle
} from 'lucide-react';

// public royalty-free car clips from Mixkit
const REELS_VIDEOS = [
    {
        id: 'r-1',
        title: 'Toyota Supra JZA80 Dyno Run',
        description: 'Tuning session on the twin-turbo setup. Screaming to 8000 RPM under load!',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-in-a-parking-lot-40439-large.mp4',
        tags: ['JDM', 'High HP', 'Dyno', 'Brakes'],
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
        tags: ['Porsche', 'Euro', 'TrackDay', 'Suspension'],
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
        tags: ['High HP', 'JDM', 'Turbo', 'Exhaust'],
        author: { username: 'GodzillaTuning', avatar: 'GT' },
        likes: 4120,
        comments: 672,
        marketplaceItem: { name: 'Titanium Catback Exhaust', price: 2950, category: 'Exhaust' }
    }
];

export function VrooqTV() {
    const [userInterests, setUserInterests] = useState<Record<string, number>>({
        JDM: 5.0,
        Porsche: 5.0,
        BMW: 5.0,
        Euro: 5.0,
        DIY: 5.0,
        Maintenance: 5.0,
        "High HP": 5.0,
        TrackDay: 5.0
    });

    const [videoStack, setVideoStack] = useState<any[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    // AI telemetry logs console
    const [aiLogs, setAiLogs] = useState<string[]>([
        '[Vrooq AI]: Neural personalized network online.',
        '[Vrooq AI]: Listening on localStorage user-interests registry...'
    ]);

    // UI overlays
    const [showComments, setShowComments] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [likeExplosion, setLikeExplosion] = useState(false);
    const [tuningAnimation, setTuningAnimation] = useState<string | null>(null);

    // Refs
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const logScrollRef = useRef<HTMLDivElement | null>(null);

    // Load interests from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('vrooq-tv-interests');
            if (saved) {
                try {
                    setUserInterests(JSON.parse(saved));
                } catch (e) {}
            }
        }
    }, []);

    // Save interests to localStorage and trigger log statement
    const updateInterestScore = useCallback((tags: string[], delta: number, description: string) => {
        setUserInterests(prev => {
            const next = { ...prev };
            tags.forEach(t => {
                if (next[t] !== undefined) {
                    next[t] = Math.max(0.1, parseFloat((next[t] + delta).toFixed(2)));
                } else {
                    next[t] = Math.max(0.1, delta);
                }
            });
            localStorage.setItem('vrooq-tv-interests', JSON.stringify(next));
            return next;
        });

        setAiLogs(prev => [
            ...prev,
            `[Vrooq AI]: ${description} (${delta > 0 ? '+' : ''}${delta} on ${tags.join(', ')})`
        ]);
    }, []);

    // Personalization sorting algorithm
    const sortVideos = useCallback((interests: Record<string, number>) => {
        const scored = REELS_VIDEOS.map(v => {
            let score = 0;
            v.tags.forEach(t => {
                score += interests[t] || 5.0;
            });
            // Add tiny random fluctuation for exploration (discovery)
            const noise = Math.random() * 1.5;
            return { ...v, algoScore: score + noise };
        });

        // Sort descending
        return scored.sort((a, b) => b.algoScore - a.algoScore);
    }, []);

    // Re-sort stack on interest change
    useEffect(() => {
        const sorted = sortVideos(userInterests);
        setVideoStack(sorted);
    }, [userInterests, sortVideos]);

    // Scroll AI terminal log to bottom
    useEffect(() => {
        if (logScrollRef.current) {
            logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
        }
    }, [aiLogs]);

    const activeVideo = videoStack[activeIdx] || null;

    // Trigger video play / pause on click
    const togglePlayback = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    // Calculate match percentage for UI gauge
    const getMatchPercent = (video: any) => {
        if (!video) return 50;
        let sum = 0;
        video.tags.forEach((t: string) => {
            sum += userInterests[t] || 5.0;
        });
        const maxPossible = video.tags.length * 15; // Cap delta
        return Math.min(Math.floor((sum / maxPossible) * 100), 99);
    };

    // Upvote / Downvote feedback
    const handleTuning = (type: 'upvote' | 'downvote') => {
        if (!activeVideo) return;
        
        if (type === 'upvote') {
            setTuningAnimation('up');
            updateInterestScore(activeVideo.tags, 4.5, 'User upvoted video style');
            setTimeout(() => setTuningAnimation(null), 800);
            
            // Advance to next video
            handleNext();
        } else {
            setTuningAnimation('down');
            updateInterestScore(activeVideo.tags, -3.5, 'User downvoted/skipped style');
            setTimeout(() => setTuningAnimation(null), 800);
            
            // Skip instantly
            handleNext();
        }
    };

    const handleNext = () => {
        if (activeIdx < videoStack.length - 1) {
            setActiveIdx(prev => prev + 1);
            setIsPlaying(true);
            setShowCheckout(false);
            setShowComments(false);
            setCheckoutComplete(false);
        } else {
            // Loop back to start
            setActiveIdx(0);
            setIsPlaying(true);
            setShowCheckout(false);
            setShowComments(false);
            setCheckoutComplete(false);
            setAiLogs(prev => [...prev, '[Vrooq AI]: End of stack reached. Re-queueing catalog...']);
        }
    };

    const handleBack = () => {
        if (activeIdx > 0) {
            setActiveIdx(prev => prev - 1);
            setIsPlaying(true);
            setShowCheckout(false);
            setShowComments(false);
            setCheckoutComplete(false);
        }
    };

    const handleLike = () => {
        if (!activeVideo) return;
        setLikeExplosion(true);
        updateInterestScore(activeVideo.tags, 1.8, 'User liked content');
        setTimeout(() => setLikeExplosion(false), 800);
    };

    const performCheckout = () => {
        setCheckoutLoading(true);
        setTimeout(() => {
            setCheckoutLoading(false);
            setCheckoutComplete(true);
            if (activeVideo?.marketplaceItem) {
                updateInterestScore(
                    activeVideo.tags, 
                    6.0, 
                    `Completed ledger checkout: ${activeVideo.marketplaceItem.name}`
                );
            }
        }, 1500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start select-none max-w-6xl mx-auto pb-12">
            
            {/* LEFT HUD: Sober AI Telemetry & Interest vectors (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-steel border border-white/8 p-6 shadow-xl glass-panel space-y-6">
                <div>
                    <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-signal-orange animate-pulse" /> Vrooq AI Profiler HUD
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold font-mono uppercase mt-1">Real-time interest matching telemetry</p>
                </div>

                {/* Match compatibility gauge */}
                {activeVideo && (
                    <div className="bg-carbon/40 border border-white/5 rounded-2xl p-4 text-center relative overflow-hidden">
                        <span className="text-[8px] text-zinc-500 font-mono font-bold block uppercase">NEURAL COMPATIBILITY</span>
                        <div className="text-4xl font-black text-signal-orange font-mono mt-1 italic">
                            {getMatchPercent(activeVideo)}%
                        </div>
                        <p className="text-[9px] font-mono text-zinc-400 mt-1">Matches tags: {activeVideo.tags.join(', ')}</p>
                    </div>
                )}

                {/* Score Vectors list */}
                <div className="space-y-3">
                    <span className="text-[9px] font-black text-zinc-500 font-mono uppercase block">User Interests Score Map</span>
                    <div className="space-y-2 font-mono text-[10px]">
                        {Object.entries(userInterests).map(([tag, score]) => (
                            <div key={tag} className="space-y-1">
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span className="font-bold">#{tag}</span>
                                    <span className="text-white font-bold">{score.toFixed(1)}</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-signal-orange transition-all duration-300" 
                                        style={{ width: `${Math.min((score / 15) * 100, 100)}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Reasoner Console Terminal */}
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-zinc-500 font-mono uppercase block">Neural Event log</span>
                    <div 
                        ref={logScrollRef}
                        className="bg-carbon border border-white/5 rounded-xl p-3 h-28 overflow-y-auto text-[9px] font-mono text-emerald-400 space-y-1.5 scroll-smooth"
                    >
                        {aiLogs.map((log, i) => (
                            <div key={i} className="leading-relaxed">{log}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CENTER: Immersive Phone Mockup Video Player (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center">
                <div className="relative w-80 aspect-[9/16] rounded-[42px] border-8 border-steel-light bg-black shadow-2xl overflow-hidden glass-panel flex flex-col justify-between">
                    
                    {/* Phone Top Notch Speaker */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-steel-light rounded-b-2xl z-30 flex items-center justify-center">
                        <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                    </div>

                    {/* Autoplay Loop Video player */}
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
                            
                            {/* Gradient overlays */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-zinc-950 z-0 flex items-center justify-center font-mono text-zinc-600 text-xs">
                            SCANNING STACK...
                        </div>
                    )}

                    {/* Mute indicator overlay */}
                    <div className="absolute top-6 left-6 z-10">
                        <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 bg-black/40 border border-white/10 rounded-full backdrop-blur text-white hover:bg-black/60 transition-all"
                        >
                            {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        </button>
                    </div>

                    {/* Play/Pause Overlay indicator */}
                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="p-4 bg-black/50 rounded-full text-white backdrop-blur-md animate-ping">
                                <Play className="h-6 w-6" />
                            </div>
                        </div>
                    )}

                    {/* Heart splash indicator on like trigger */}
                    <AnimatePresence>
                        {likeExplosion && (
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: [1, 1.4, 1], opacity: [1, 1, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none text-red-500"
                            >
                                <Heart className="h-16 w-16 fill-red-500" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Phone Screen Overlay UI layout */}
                    <div className="relative z-10 flex flex-col justify-between h-full p-5 pt-8 select-none pointer-events-none">
                        
                        {/* Upper Header: Tabs */}
                        <div className="flex justify-center gap-4 text-[10px] font-black text-white/50 tracking-wider">
                            <span className="text-white border-b-2 border-signal-orange pb-0.5">VROOQ TV</span>
                            <span>LIVE</span>
                        </div>

                        {/* Lower Block: Description & Right Hand Buttons */}
                        <div className="flex justify-between items-end w-full mt-auto">
                            
                            {/* Video Copy & Marketplace Shop link */}
                            <div className="space-y-3 flex-1 pr-3 pointer-events-auto">
                                <div>
                                    <p className="text-xs font-bold text-white uppercase font-mono">@{activeVideo?.author.username}</p>
                                    <p className="text-[10px] text-white/80 line-clamp-2 mt-1 leading-normal font-medium">{activeVideo?.description}</p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {activeVideo?.tags.map((t: string) => (
                                            <span key={t} className="text-[8px] font-mono text-signal-orange bg-signal-orange/10 px-1.5 py-0.5 rounded font-black uppercase">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Pulsing marketplace item tag */}
                                {activeVideo?.marketplaceItem && (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            setIsPlaying(false);
                                            videoRef.current?.pause();
                                            setShowCheckout(true);
                                        }}
                                        className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg border border-orange-400/30 animate-pulse pointer-events-auto"
                                    >
                                        <ShoppingBag className="h-3 w-3" />
                                        Buy Part: ${activeVideo.marketplaceItem.price}
                                    </motion.button>
                                )}
                            </div>

                            {/* Right Action buttons */}
                            <div className="flex flex-col items-center gap-4.5 pointer-events-auto shrink-0 pl-1">
                                <div className="flex flex-col items-center">
                                    <button 
                                        onClick={handleLike}
                                        className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur border border-white/10 active:scale-90 transition-all"
                                    >
                                        <Heart className="h-4.5 w-4.5 text-red-500 fill-red-500" />
                                    </button>
                                    <span className="text-[9px] font-mono font-bold text-white mt-1 drop-shadow-md">{activeVideo?.likes}</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <button 
                                        onClick={() => setShowComments(true)}
                                        className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur border border-white/10 active:scale-90 transition-all"
                                    >
                                        <MessageCircle className="h-4.5 w-4.5" />
                                    </button>
                                    <span className="text-[9px] font-mono font-bold text-white mt-1 drop-shadow-md">{activeVideo?.comments}</span>
                                </div>

                                <button 
                                    className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur border border-white/10 active:scale-90 transition-all"
                                >
                                    <Share2 className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* NESTED DRAWER 1: MOCK COMMENTS */}
                    <AnimatePresence>
                        {showComments && (
                            <motion.div 
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="absolute inset-x-0 bottom-0 h-[65%] bg-zinc-950/95 border-t border-white/10 rounded-t-[32px] z-20 p-4 flex flex-col justify-between pointer-events-auto"
                            >
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-black text-white font-mono uppercase">COMMENTS ({activeVideo?.comments})</span>
                                    <button onClick={() => setShowComments(false)} className="p-1 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all">
                                        <X className="h-4.5 w-4.5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar text-[10px]">
                                    <div className="bg-white/2 p-2 rounded-lg border border-white/5">
                                        <p className="font-bold text-signal-orange">@GTR_Enthusiast</p>
                                        <p className="text-zinc-300 mt-0.5">That exhaust sound is absolute pure gold! What manifold is this?</p>
                                    </div>
                                    <div className="bg-white/2 p-2 rounded-lg border border-white/5">
                                        <p className="font-bold text-signal-orange">@BrakeChecker</p>
                                        <p className="text-zinc-300 mt-0.5">Brembo GT caliper setup is mandatory for high HP builds. Approved.</p>
                                    </div>
                                    <div className="bg-white/2 p-2 rounded-lg border border-white/5">
                                        <p className="font-bold text-signal-orange">@PorschePurist</p>
                                        <p className="text-zinc-300 mt-0.5">Aircooled setups run so sweet on high altitudes. Great run!</p>
                                    </div>
                                </div>

                                <div className="flex gap-1.5 border-t border-white/5 pt-2">
                                    <input 
                                        type="text" 
                                        placeholder="Add comment..." 
                                        className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-white placeholder-text-muted text-[10px] focus:outline-none"
                                        disabled
                                    />
                                    <button className="p-2 bg-signal-orange text-white rounded-xl">
                                        <Send className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* NESTED DRAWER 2: LEDGER CHECKOUT */}
                    <AnimatePresence>
                        {showCheckout && (
                            <motion.div 
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="absolute inset-x-0 bottom-0 h-[85%] bg-zinc-950/98 border-t border-white/10 rounded-t-[32px] z-20 p-5 flex flex-col justify-between pointer-events-auto"
                            >
                                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                    <span className="text-[9px] font-black text-white font-mono uppercase tracking-wider">VROOQ CHECKOUT SERVICES</span>
                                    <button 
                                        onClick={() => {
                                            setShowCheckout(false);
                                            setIsPlaying(true);
                                            videoRef.current?.play();
                                        }} 
                                        className="p-1 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
                                    >
                                        <X className="h-4.5 w-4.5" />
                                    </button>
                                </div>

                                {checkoutComplete ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-4 animate-in zoom-in-95">
                                        <CheckCircle className="h-12 w-12 text-emerald-500 shadow-md" />
                                        <h4 className="text-sm font-black text-white font-mono uppercase">Checkout Complete</h4>
                                        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                                            Transaction approved. Part debited from account and logged under chassis ledger.
                                        </p>
                                        <button 
                                            onClick={() => {
                                                setShowCheckout(false);
                                                setIsPlaying(true);
                                                videoRef.current?.play();
                                            }}
                                            className="w-full mt-2 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] uppercase font-bold"
                                        >
                                            Return to TV
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
                                                    <span>LEDGER RATE</span>
                                                    <span className="text-signal-orange font-bold">${activeVideo?.marketplaceItem?.price}</span>
                                                </div>
                                                <div className="flex justify-between text-zinc-500">
                                                    <span>SHIPPING</span>
                                                    <span className="text-emerald-400 font-bold">Free (2 Days)</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1 font-mono">
                                                <span className="text-[8px] text-zinc-500 font-bold uppercase">LEDGER ADDRESS</span>
                                                <p className="bg-black/40 border border-white/5 p-2 rounded-lg text-zinc-400 font-bold truncate">
                                                    vrq_ledger_0x4f88127be51a90c29b71e16f
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={performCheckout}
                                            disabled={checkoutLoading}
                                            className="w-full py-3 bg-signal-orange text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10"
                                        >
                                            {checkoutLoading ? 'Verifying ledger...' : 'Checkout with Vrooq Ledger'}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            {/* RIGHT HUD: Tuning controls & Video Switcher console (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-steel border border-white/8 p-6 shadow-xl glass-panel space-y-6">
                <div>
                    <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest">Feedback Tuning Console</h3>
                    <p className="text-[10px] text-zinc-500 font-bold font-mono uppercase mt-1">Shape algorithms through feedback loops</p>
                </div>

                {/* Feedback upvote / downvote buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => handleTuning('upvote')}
                        className="py-4 bg-[#10b981]/10 border border-[#10b981]/20 hover:border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/15 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    >
                        <ThumbsUp className="h-6 w-6" />
                        <span className="text-[10px] font-mono font-black uppercase">Love This Style</span>
                    </button>
                    <button 
                        onClick={() => handleTuning('downvote')}
                        className="py-4 bg-[#ef4444]/10 border border-[#ef4444]/20 hover:border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/15 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    >
                        <ThumbsDown className="h-6 w-6" />
                        <span className="text-[10px] font-mono font-black uppercase">Not for me</span>
                    </button>
                </div>

                {/* Up/Down Stack navigation buttons */}
                <div className="space-y-3">
                    <span className="text-[9px] font-black text-zinc-500 font-mono uppercase block">Queue Navigation Controls</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleBack}
                            disabled={activeIdx === 0}
                            className="flex-1 py-3 bg-white/2 hover:bg-white/5 text-zinc-400 hover:text-white border border-white/8 rounded-xl font-bold font-mono text-[10px] flex items-center justify-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none uppercase"
                        >
                            <ChevronUp className="h-4 w-4" /> Previous
                        </button>
                        <button 
                            onClick={handleNext}
                            className="flex-1 py-3 bg-white/2 hover:bg-white/5 text-zinc-400 hover:text-white border border-white/8 rounded-xl font-bold font-mono text-[10px] flex items-center justify-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none uppercase"
                        >
                            Skip / Next <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Algorithmic info badge */}
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl text-[10px] font-mono text-zinc-500 leading-normal">
                    <p className="font-bold text-white mb-1">How Vrooq TV adapts:</p>
                    Vrooq TV runs a client-side weighted tag sorting stack. Clicking <span className="text-white font-bold">Love This Style</span> increases the weights of active hashtags by +4.5. Clicking <span className="text-white font-bold">Not for me</span> deducts -3.5 and pushes related posts to the back of the queue.
                </div>
            </div>

        </div>
    );
}
