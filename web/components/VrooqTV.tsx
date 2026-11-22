'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    ChevronUp, 
    ChevronDown, 
    Send, 
    Play, 
    Pause, 
    Volume2, 
    VolumeX,
    X,
} from 'lucide-react';

export function VrooqTV() {
    const { user } = useAuth();
    const [videoStack, setVideoStack] = useState<any[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [videoError, setVideoError] = useState(false);

    // Track user-liked status per video
    const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
    // Local comments state per video
    const [videoComments, setVideoComments] = useState<Record<string, any[]>>({});
    const [commentInput, setCommentInput] = useState('');

    // UI overlays
    const [showComments, setShowComments] = useState(false);
    const [likeExplosion, setLikeExplosion] = useState(false);

    // Ref for HTML video element
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const activeVideo = videoStack[activeIdx] || null;

    useEffect(() => {
        const fetchReels = async () => {
            let dbVideos: any[] = [];
            try {
                // Fetch videos from Supabase
                const { data, error } = await supabase
                    .from('posts')
                    .select('*, author:profiles(username, avatar_url)')
                    .eq('content_type', 'video')
                    .order('created_at', { ascending: false });
                
                if (!error && data) {
                    dbVideos = data;
                }
            } catch (err) {
                console.warn('Failed to fetch video posts from database:', err);
            }

            const formatted = dbVideos.map(post => {
                let description = '';
                if (post.body) {
                    try {
                        const parsed = JSON.parse(post.body);
                        description = parsed.text || post.body;
                    } catch (e) {
                        description = post.body;
                    }
                }
                const username = post.author?.username || post.author_username || 'Driver';
                const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

                return {
                    id: post.id,
                    title: post.title || 'Vrooq Clip',
                    description: description,
                    url: post.image_url || '',
                    tags: post.tags || ['vrooq'],
                    author: {
                        username: cleanUsername,
                        avatar: cleanUsername.substring(0, 2).toUpperCase()
                    },
                    likes: post.like_count || 0,
                    comments: post.comment_count || 0,
                    marketplaceItem: null
                };
            });

            setVideoStack(formatted.filter(item => Boolean(item.url)));
        };

        fetchReels();
    }, []);

    useEffect(() => {
        if (!user?.id || videoStack.length === 0) {
            setLikedVideos({});
            return;
        }
        let cancelled = false;
        const loadLikes = async () => {
            const { data, error } = await supabase.from('post_interactions')
                .select('post_id')
                .eq('user_id', user.id)
                .eq('interaction_type', 'like')
                .in('post_id', videoStack.map(v => v.id));
            if (cancelled) return;
            if (error) {
                console.warn('Could not load saved likes:', error.message);
                return;
            }
            setLikedVideos(Object.fromEntries((data || []).map(row => [row.post_id, true])));
        };
        void loadLikes();
        return () => { cancelled = true; };
    }, [user?.id, videoStack.map(v => v.id).join(',')]);

    useEffect(() => {
        setVideoError(false);
        const video = videoRef.current;
        if (!video) return;
        video.load();
        const shouldAutoplay = !document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (shouldAutoplay) {
            void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
            video.pause();
            setIsPlaying(false);
        }
        setShowComments(false);
    }, [activeIdx, videoStack]);

    useEffect(() => {
        const pauseWhenHidden = () => {
            if (document.hidden) {
                videoRef.current?.pause();
                setIsPlaying(false);
            }
        };
        document.addEventListener('visibilitychange', pauseWhenHidden);
        return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
    }, []);

    useEffect(() => {
        if (!showComments || !activeVideo?.id) return;
        const postId = activeVideo.id;
        let cancelled = false;
        const loadComments = async () => {
            const { data, error } = await supabase.from('post_comments')
                .select('id,author_username,comment_text,created_at')
                .eq('post_id', postId)
                .order('created_at', { ascending: false });
            if (cancelled) return;
            if (error) {
                console.warn('VROOQ TV comments unavailable:', error.message);
                return;
            }
            setVideoComments(prev => ({
                ...prev,
                [postId]: (data || []).map(row => ({
                    id: row.id,
                    username: '@' + row.author_username.replace(/^@/, ''),
                    text: row.comment_text,
                    created_at: row.created_at
                }))
            }));
        };
        void loadComments();
        return () => { cancelled = true; };
    }, [showComments, activeVideo?.id]);

    const togglePlayback = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().then(() => {
                setVideoError(false);
                setIsPlaying(true);
            }).catch(() => setIsPlaying(false));
        }
    };

    const handleNext = () => {
        if (videoStack.length === 0) return;
        if (activeIdx < videoStack.length - 1) {
            setActiveIdx(prev => prev + 1);
        } else {
            setActiveIdx(0); // loop back to first video
        }
    };

    const handleBack = () => {
        if (videoStack.length === 0) return;
        if (activeIdx > 0) {
            setActiveIdx(prev => prev - 1);
        } else {
            setActiveIdx(videoStack.length - 1); // loop back to last video
        }
    };

    const [likePending, setLikePending] = useState(false);

    const handleLike = async () => {
        if (!activeVideo || likePending) return;
        if (!user?.id) {
            alert('Connecte-toi pour aimer cette vidéo.');
            return;
        }
        const id = activeVideo.id;
        const wasLiked = Boolean(likedVideos[id]);
        setLikePending(true);
        try {
            if (wasLiked) {
                const { error } = await supabase.from('post_interactions')
                    .delete().eq('post_id', id).eq('user_id', user.id)
                    .eq('interaction_type', 'like');
                if (error) throw error;
            } else {
                const { error } = await supabase.from('post_interactions')
                    .insert({ post_id: id, user_id: user.id, interaction_type: 'like' });
                if (error) throw error;
            }
            setLikedVideos(prev => ({ ...prev, [id]: !wasLiked }));
            if (!wasLiked) {
                setLikeExplosion(true);
                setTimeout(() => setLikeExplosion(false), 800);
            }
            const { data: refreshed } = await supabase.from('posts')
                .select('like_count').eq('id', id).single();
            if (refreshed) {
                setVideoStack(prev => prev.map(v => v.id === id
                    ? { ...v, likes: refreshed.like_count ?? v.likes } : v));
            }
        } catch (err) {
            console.error('Like could not be saved:', err);
            alert('Le like n’a pas été enregistré. Réessaie.');
        } finally {
            setLikePending(false);
        }
    };

    const getCommentsList = () => {
        if (!activeVideo) return [];
        
        // 1. If in videoComments state, return it
        if (videoComments[activeVideo.id]) {
            return videoComments[activeVideo.id];
        }

        return [];
    };

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim() || !activeVideo || !user) return;
        const text = commentInput.trim();
        const { data: profile, error: profileError } = await supabase.from('profiles').select('username').eq('id', user.id).single();
        if (profileError || !profile?.username) {
            alert('Impossible de vérifier ton profil. Réessaie.');
            return;
        }
        const { data, error } = await supabase.from('post_comments').insert({
            post_id: activeVideo.id,
            author_id: user.id,
            author_username: profile.username,
            comment_text: text
        }).select('id,author_username,comment_text,created_at').single();
        if (error || !data) {
            alert('Le commentaire n’a pas été enregistré. Réessaie.');
            return;
        }
        setVideoComments(prev => ({
            ...prev,
            [activeVideo.id]: [{
                id: data.id,
                username: '@' + data.author_username.replace(/^@/, ''),
                text: data.comment_text,
                created_at: data.created_at
            }, ...(prev[activeVideo.id] || [])]
        }));
        setVideoStack(prev => prev.map(v => v.id === activeVideo.id
            ? { ...v, comments: v.comments + 1 } : v));
        setCommentInput('');
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
                                loop
                                preload="metadata"
                                onError={() => { setVideoError(true); setIsPlaying(false); }}
                                muted={isMuted}
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            {videoError && <div role="alert" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-zinc-950/90 p-6 text-center text-white"><p>Impossible de lire cette vidéo.</p><button type="button" className="rounded-xl border border-white/30 px-4 py-2" onClick={e => { e.stopPropagation(); setVideoError(false); videoRef.current?.load(); void videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setVideoError(true)); }}>Réessayer</button></div>}
                            {/* Cinematic shadow overlays */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-zinc-950 z-0 flex items-center justify-center font-mono text-zinc-600 text-xs">
                            Aucune vidéo publiée pour le moment.
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

                            </div>

                            {/* Vertically stacked action buttons */}
                            <div className="flex flex-col items-center gap-4 pointer-events-auto shrink-0 pl-1">
                                <div className="flex flex-col items-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); void handleLike(); }}
                                        disabled={likePending}
                                        aria-label={likedVideos[activeVideo?.id] ? 'Retirer le like' : 'Aimer cette vidéo'}
                                        aria-pressed={Boolean(likedVideos[activeVideo?.id])}
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
                                    {getCommentsList().length === 0 && <p className="text-zinc-400 text-center py-6">Aucun commentaire pour le moment.</p>}
                                    {getCommentsList().map((c: any) => (
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
                                        placeholder="Écrire un commentaire…" 
                                        className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-white placeholder-text-muted text-[10px] focus:outline-none focus:border-signal-orange/30"
                                    />
                                    <button type="submit" className="p-2 bg-signal-orange hover:bg-orange-600 text-white rounded-xl active:scale-95 transition-all">
                                        <Send className="h-3.5 w-3.5" />
                                    </button>
                                </form>
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
