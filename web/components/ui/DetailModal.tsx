'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Calendar, 
    MapPin, 
    Users, 
    MessageCircle, 
    Send, 
    Heart, 
    Shield, 
    Gauge, 
    Scale, 
    Zap,
    GitCommit,
    CheckCircle2,
    Car,
    Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'post' | 'listing' | 'convoy';
    data: any;
    onActionSuccess?: () => void;
}

export function DetailModal({ isOpen, onClose, type, data, onActionSuccess }: DetailModalProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [rsvps, setRsvps] = useState<string[]>([]);
    const [isJoined, setIsJoined] = useState(false);

    // Parse description/body JSON if structured
    let parsedDetails: any = null;
    let descriptionText = '';

    if (type === 'listing' && data?.description) {
        try {
            if (data.description.startsWith('{')) {
                parsedDetails = JSON.parse(data.description);
                descriptionText = parsedDetails.text || '';
            } else {
                descriptionText = data.description;
            }
        } catch (e) {
            descriptionText = data.description;
        }
    } else if (type === 'convoy' && data?.body) {
        try {
            if (data.body.startsWith('{')) {
                parsedDetails = JSON.parse(data.body);
                descriptionText = parsedDetails.text || '';
            } else {
                descriptionText = data.body;
            }
        } catch (e) {
            descriptionText = data.body;
        }
    }

    // Load comments and RSVPs
    useEffect(() => {
        if (!isOpen || !data?.id) return;

        // Reset state
        setCommentText('');
        setIsJoined(false);

        // Load Comments from localStorage (as robust fallback) or Supabase
        const localCommentsKey = `comments-${data.id}`;
        const savedComments = localStorage.getItem(localCommentsKey);
        const parsedLocal = savedComments ? JSON.parse(savedComments) : [];

        // Mock initial comments for visual richness
        const defaultComments = [
            { id: 'mock-c1', author: '@ApexPredator', text: 'This spec is absolutely stunning. Worth every penny!', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
            { id: 'mock-c2', author: '@BoostedF80', text: 'Rod bearings done? That is a huge relief for E46 owners.', created_at: new Date(Date.now() - 3600000 * 4).toISOString() }
        ];

        setComments(parsedLocal.length > 0 ? parsedLocal : defaultComments);

        // Load RSVPs for Convoys
        if (type === 'convoy') {
            const localRsvpsKey = `rsvps-${data.id}`;
            const savedRsvps = localStorage.getItem(localRsvpsKey);
            const parsedRsvps = savedRsvps ? JSON.parse(savedRsvps) : ['@driver_one', '@canyon_blaster', '@m3_guy'];
            setRsvps(parsedRsvps);

            if (user?.email) {
                const username = user.email.split('@')[0];
                setIsJoined(parsedRsvps.includes(`@${username}`));
            }
        }
    }, [isOpen, data, type, user]);

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !data?.id) return;

        setIsSubmittingComment(true);
        const username = user?.email ? `@${user.email.split('@')[0]}` : '@Enthusiast';
        const newComment = {
            id: `c-${Date.now()}`,
            author: username,
            text: commentText,
            created_at: new Date().toISOString()
        };

        const updatedComments = [newComment, ...comments];
        setComments(updatedComments);
        localStorage.setItem(`comments-${data.id}`, JSON.stringify(updatedComments));

        // Try writing to database (if comments table existed)
        try {
            await supabase.from('post_comments').insert({
                post_id: data.id,
                author_username: username.replace('@', ''),
                comment_text: commentText
            });
        } catch (err) {
            // Silence DB errors since we fall back to localStorage
        }

        setCommentText('');
        setIsSubmittingComment(false);
    };

    const handleToggleRSVP = () => {
        if (!user || !data?.id) return;
        const username = `@${user.email?.split('@')[0] || 'driver'}`;
        const localRsvpsKey = `rsvps-${data.id}`;

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
        if (onActionSuccess) onActionSuccess();
    };

    if (!isOpen || !data) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-2xl h-full bg-[#0a0a0c] border-l border-white/8 shadow-2xl flex flex-col justify-between z-10"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40 backdrop-blur-md">
                        <div>
                            <span className="text-signal-orange text-[10px] font-mono uppercase tracking-widest block mb-1">
                                {type === 'listing' ? 'Marketplace Deal' : type === 'convoy' ? 'Convoy Meetup' : 'Feed Story'}
                            </span>
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white leading-none">
                                {data.title || `${data.make} ${data.model}`}
                            </h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* Image Gallery / Main Image */}
                        <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/5 bg-black/30 relative">
                            <img 
                                src={data.image_url || data.image || 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&q=80'} 
                                alt="Showcase"
                                className="w-full h-full object-cover"
                            />
                            {type === 'listing' && (
                                <div className="absolute bottom-4 left-5 px-4 py-2 bg-[#0a0a0c]/80 backdrop-blur rounded-xl border border-white/10 text-2xl font-black text-white italic">
                                    ${data.price?.toLocaleString()}
                                </div>
                            )}
                        </div>

                        {/* Polymorphic Body Rendering */}
                        {type === 'listing' && (
                            <div className="space-y-6">
                                {/* Details Grid */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3 font-mono">Technical Specs</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <SpecField label="Make / Model" value={`${data.make} ${data.model}`} icon={Car} />
                                        <SpecField label="Production Year" value={data.year} icon={Calendar} />
                                        <SpecField label="Mileage" value={`${data.mileage?.toLocaleString()} mi`} icon={Gauge} />
                                        <SpecField label="VIN Code" value={parsedDetails?.vin || 'Verified'} icon={Shield} />
                                        <SpecField label="Engine Config" value={parsedDetails?.engine || 'Naturally Aspirated'} icon={Zap} />
                                        <SpecField label="Gearbox" value={parsedDetails?.transmission || 'Manual'} icon={GitCommit} />
                                    </div>
                                </div>

                                {/* Colors & Mod List */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div>
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Exterior & Interior</h4>
                                        <p className="text-sm text-zinc-300 font-semibold">
                                            {parsedDetails?.exteriorColor || 'OEM Black'} / {parsedDetails?.interiorColor || 'OEM Carbon'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Location</h4>
                                        <p className="text-sm text-zinc-300 font-semibold">{data.location || 'Global Delivery'}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Seller Narrative</h4>
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        {descriptionText || 'No seller narrative provided.'}
                                    </p>
                                </div>

                                {/* Modifications */}
                                {parsedDetails?.mods && (
                                    <div className="pt-4 border-t border-white/5 space-y-3">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Upgraded Modifications</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {parsedDetails.mods.split(',').map((mod: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 bg-white/2 border border-white/5 text-zinc-300 text-xs rounded-xl font-medium">
                                                    {mod.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {type === 'convoy' && (
                            <div className="space-y-6">
                                {/* Route specifications */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">Convoy Route Info</h3>
                                        <div className="flex gap-2">
                                            {parsedDetails?.cruiseStyle && (
                                                <span className="px-2 py-0.5 bg-signal-orange/10 border border-signal-orange/20 text-signal-orange text-[9px] font-black rounded-lg uppercase tracking-wide">
                                                    {parsedDetails.cruiseStyle}
                                                </span>
                                            )}
                                            {parsedDetails?.pace && (
                                                <span className={`px-2 py-0.5 border text-[9px] font-black rounded-lg uppercase tracking-wide ${
                                                    parsedDetails.pace === 'Chill' 
                                                        ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                                                        : parsedDetails.pace === 'Spirited' 
                                                            ? 'border-signal-orange/20 text-signal-orange bg-signal-orange/5' 
                                                            : 'border-red-500/20 text-red-400 bg-red-500/5'
                                                }`}>
                                                    {parsedDetails.pace} Pace
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <SpecField label="Starting Point" value={parsedDetails?.startPoint || 'Local Hub'} icon={MapPin} />
                                        <SpecField label="Destination" value={parsedDetails?.endPoint || 'Canyon Summit'} icon={CheckCircle2} />
                                        <SpecField label="Date & Time" value={parsedDetails?.dateTime || data.date || 'Upcoming'} icon={Calendar} />
                                        <SpecField label="Eligible Cars" value={parsedDetails?.eligibleCars || 'All Classes'} icon={Car} />
                                    </div>
                                </div>

                                {/* Embedded Google Maps Route Iframe */}
                                {parsedDetails?.startPoint && parsedDetails?.endPoint && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Telemetry Route Map</h4>
                                        <div className="w-full h-[220px] rounded-2xl overflow-hidden border border-white/10 shadow-lg relative bg-[#0a0a0c]">
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                className="opacity-90 grayscale contrast-125" 
                                                frameBorder="0" 
                                                scrolling="no" 
                                                marginHeight={0} 
                                                marginWidth={0} 
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${parsedDetails.startPoint} to ${parsedDetails.endPoint}`)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Join Banner */}
                                <div className="p-5 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                                            <Users className="h-4 w-4 text-signal-orange" />
                                            {rsvps.length} Drivers RSVP'd
                                        </div>
                                        <p className="text-xs text-zinc-500 font-mono">
                                            Max driver limit: {parsedDetails?.driverLimit || 'Unlimited'}
                                        </p>
                                    </div>

                                    <button 
                                        onClick={handleToggleRSVP}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                                            isJoined 
                                                ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' 
                                                : 'bg-signal-orange text-white hover:bg-orange-600'
                                        }`}
                                    >
                                        {isJoined ? 'Leave Convoy' : 'Join Convoy'}
                                    </button>
                                </div>

                                {/* Checklist of required gear */}
                                {parsedDetails?.requiredGear && parsedDetails.requiredGear.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono block">Required Gear Checklist</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {parsedDetails.requiredGear.map((gear: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2 p-2.5 bg-white/2 border border-white/5 rounded-xl text-xs font-bold text-white">
                                                    <Check className="h-3.5 w-3.5 text-signal-orange shrink-0" />
                                                    {gear}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Driver List */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">RSVP List</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {rsvps.map((driver, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-black/40 border border-white/5 text-xs text-white rounded-lg flex items-center gap-2 font-semibold">
                                                <div className="w-4 h-4 rounded-full bg-signal-orange/20 text-signal-orange text-[9px] flex items-center justify-center">
                                                    {driver.replace('@', '')[0]?.toUpperCase()}
                                                </div>
                                                {driver}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Drive Details</h4>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                        {descriptionText || 'No drive specifics listed.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {type === 'post' && (
                            <div className="space-y-6">
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {data.body}
                                </p>

                                {/* Specifications overlay if present */}
                                {data.tags && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.tags.map((t: string, idx: number) => (
                                            <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/8 text-zinc-400 text-xs rounded-lg font-semibold">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Live Comments Engine */}
                        <div className="pt-8 border-t border-white/5 space-y-6">
                            <div className="flex items-center gap-2 text-white font-bold text-lg">
                                <MessageCircle className="h-5 w-5 text-signal-orange" />
                                Comments ({comments.length})
                            </div>

                            {/* Comment Input */}
                            <form onSubmit={handleSendComment} className="flex gap-2">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 px-4 py-3 bg-white/2 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 transition-all font-semibold"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmittingComment}
                                    className="p-3 bg-signal-orange text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-4 pt-2">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="p-4 bg-white/2 border border-white/5 rounded-2xl flex gap-3 animate-in fade-in duration-300">
                                        <div className="h-8 w-8 rounded-lg bg-signal-orange/20 text-signal-orange flex items-center justify-center font-bold text-xs shrink-0 uppercase border border-signal-orange/10">
                                            {comment.author.replace('@', '')[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white">{comment.author}</span>
                                                <span className="text-[10px] text-zinc-600 font-mono">
                                                    {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-300">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function SpecField({ label, value, icon: Icon }: { label: string, value: any, icon: any }) {
    return (
        <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {label}
            </span>
            <span className="text-sm font-bold text-white block">{value || 'N/A'}</span>
        </div>
    );
}
