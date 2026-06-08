'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, MessageSquare, Calendar, ChevronRight, UserPlus, Check, Wrench, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useFeed } from '@/hooks/useFeed';
import Link from 'next/link';
import { MOCK_COMMUNITIES } from '@/lib/constants';

export default function CommunityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params.id as string;

    const [community, setCommunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [memberCount, setMemberCount] = useState(0);

    const { posts } = useFeed(user?.id);

    const loadCommunity = useCallback(async () => {
        setLoading(true);
        let targetCommunity: any = null;

        // 1. Try Supabase
        try {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (!error && data) {
                targetCommunity = {
                    id: data.id,
                    name: data.name,
                    description: data.description || 'No description provided.',
                    banner: data.image_url || 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=2600&auto=format&fit=crop',
                    members: data.member_count || 1,
                    online: Math.floor(Math.random() * 20 + 2).toString(),
                    category: data.category,
                    topics: [data.category, 'Builds', 'Discussion'],
                    events: [
                        { id: 1, title: 'Tribe Meet & Greet', date: 'Sat, Next Week • 10:00 AM', location: 'Local Hub' }
                    ]
                };
            }
        } catch (err) {}

        // 2. Try localStorage local-communities
        if (!targetCommunity) {
            const savedLocal = localStorage.getItem('local-communities');
            const localList = savedLocal ? JSON.parse(savedLocal) : [];
            const found = localList.find((c: any) => c.id === id);
            if (found) {
                targetCommunity = {
                    id: found.id,
                    name: found.name,
                    description: found.description || 'No description provided.',
                    banner: found.image_url || 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=2600&auto=format&fit=crop',
                    members: found.member_count || 1,
                    online: Math.floor(Math.random() * 5 + 1).toString(),
                    category: found.category,
                    topics: [found.category, 'Builds', 'Discussion'],
                    events: [
                        { id: 1, title: 'Establishment Gathering', date: 'Sat, Next Week • 10:00 AM', location: 'Local Hub' }
                    ]
                };
            }
        }

        // 3. Try Fallback
        if (!targetCommunity) {
            const found = MOCK_COMMUNITIES.find(c => c.id === id);
            if (found) {
                targetCommunity = {
                    id: found.id,
                    name: found.name,
                    description: found.description || 'No description provided.',
                    banner: found.banner || 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=2600&auto=format&fit=crop',
                    members: found.members || 100,
                    online: found.active || '10',
                    category: found.category,
                    topics: found.topics || [found.category, 'Builds', 'Discussion'],
                    events: found.events || [
                        { id: 1, title: 'Tribe Meet & Greet', date: 'Sat, Next Week • 10:00 AM', location: 'Local Hub' }
                    ]
                };
            }
        }

        // Fallback default
        if (!targetCommunity) {
            targetCommunity = {
                id: MOCK_COMMUNITIES[0].id,
                name: MOCK_COMMUNITIES[0].name,
                description: MOCK_COMMUNITIES[0].description,
                banner: MOCK_COMMUNITIES[0].banner,
                members: MOCK_COMMUNITIES[0].members,
                online: MOCK_COMMUNITIES[0].active,
                category: MOCK_COMMUNITIES[0].category,
                topics: MOCK_COMMUNITIES[0].topics,
                events: MOCK_COMMUNITIES[0].events
            };
        }

        setCommunity(targetCommunity);
        setMemberCount(targetCommunity.members);

        // Check Join Status
        const localJoinedKey = 'joined-communities';
        const savedJoined = localStorage.getItem(localJoinedKey);
        const joinedList = savedJoined ? JSON.parse(savedJoined) : [];
        let joined = joinedList.includes(targetCommunity.id);

        if (!joined && user) {
            try {
                const { data } = await supabase
                    .from('community_members')
                    .select('id')
                    .eq('community_id', targetCommunity.id)
                    .eq('user_id', user.id)
                    .maybeSingle();
                if (data) joined = true;
            } catch (e) {}
        }
        setIsJoined(joined);
        setLoading(false);
    }, [id, user]);

    useEffect(() => {
        loadCommunity();
    }, [loadCommunity]);

    const handleToggleJoin = async () => {
        if (!user || !community) return;

        const localJoinedKey = 'joined-communities';
        const savedJoined = localStorage.getItem(localJoinedKey);
        const joinedList = savedJoined ? JSON.parse(savedJoined) : [];

        let updated: string[];
        if (isJoined) {
            updated = joinedList.filter((cId: string) => cId !== community.id);
            setIsJoined(false);
            setMemberCount(prev => Math.max(0, prev - 1));
            try {
                await supabase
                    .from('community_members')
                    .delete()
                    .eq('community_id', community.id)
                    .eq('user_id', user.id);
            } catch (e) {}
        } else {
            updated = [...joinedList, community.id];
            setIsJoined(true);
            setMemberCount(prev => prev + 1);
            try {
                await supabase
                    .from('community_members')
                    .insert({
                        community_id: community.id,
                        user_id: user.id
                    });
            } catch (e) {}
        }

        localStorage.setItem(localJoinedKey, JSON.stringify(updated));
    };

    // Filter community-specific posts
    const communityPosts = community ? posts.filter(post => 
        post.community_id === community.id ||
        post.tags?.some(t => t.toLowerCase() === community.name.toLowerCase() || t.toLowerCase() === community.category.toLowerCase()) ||
        post.title?.toLowerCase().includes(community.name.toLowerCase()) ||
        post.body?.toLowerCase().includes(community.name.toLowerCase())
    ) : [];

    if (loading) {
        return <div className="py-40 text-center text-zinc-500 font-mono uppercase tracking-widest animate-pulse">Syncing Tribe Data...</div>;
    }

    if (!community) return null;

    return (
        <div className="max-w-7xl mx-auto pb-32">

            {/* BANNER HEADER */}
            <div className="h-64 md:h-80 w-full relative overflow-hidden rounded-3xl border border-white/5">
                <img
                    src={community.banner}
                    alt={community.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col md:flex-row items-end justify-between gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-signal-orange text-white text-xs font-bold uppercase tracking-wider rounded mb-3 font-mono">
                            {community.category}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-2 leading-none">
                            {community.name}
                        </h1>
                        <div className="flex items-center gap-6 text-xs font-mono text-white/80">
                            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-signal-orange" /> {memberCount.toLocaleString()} Members</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {community.online} Online</span>
                        </div>
                    </div>

                    {user && (
                        <button 
                            onClick={handleToggleJoin}
                            className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg active:scale-95 text-xs uppercase tracking-wider font-mono border ${
                                isJoined 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-white text-carbon hover:bg-gray-200 border-white'
                            }`}
                        >
                            {isJoined ? (
                                <>
                                    <Check className="h-4 w-4" /> Joined Tribe
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" /> Join Tribe
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4 md:px-6 mt-8">

                {/* LEFT COLUMN: About & Events */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-white font-bold uppercase tracking-wider text-xs font-mono border-b border-white/5 pb-2">Manifesto</h3>
                        <p className="text-text-dim text-sm leading-relaxed">
                            {community.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {community.topics.map((topic: string) => (
                                <span key={topic} className="px-2.5 py-1 bg-white/2 border border-white/5 rounded-lg text-[10px] text-text-dim font-mono">
                                    #{topic}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-white font-bold uppercase tracking-wider text-xs font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                            <Calendar className="h-4 w-4 text-signal-orange" />
                            Tribal Gatherings
                        </h3>
                        <div className="space-y-4">
                            {community.events.map((event: any) => (
                                <div key={event.id} className="group cursor-pointer">
                                    <div className="text-white font-bold text-sm group-hover:text-signal-orange transition-colors">{event.title}</div>
                                    <div className="text-[10px] text-text-dim mt-1 font-mono">{event.date}</div>
                                    <div className="text-[10px] text-text-dim font-mono">{event.location}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Community Timeline */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-panel p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                            {user?.email?.[0]?.toUpperCase() || 'D'}
                        </div>
                        <input
                            type="text"
                            onClick={() => router.push(`/create?communityId=${community.id}&communityName=${encodeURIComponent(community.name)}`)}
                            readOnly
                            placeholder={`Share build updates or spots with ${community.name}...`}
                            className="bg-transparent text-white placeholder-text-dim text-sm flex-1 focus:outline-none cursor-pointer hover:text-white/80 transition-colors"
                        />
                    </div>

                    {communityPosts.length === 0 ? (
                        <div className="p-12 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center min-h-[300px] bg-white/1">
                            <MessageSquare className="h-12 w-12 text-white/5 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2 uppercase italic tracking-tight">Tribe Timeline Empty</h3>
                            <p className="text-text-dim max-w-sm text-xs leading-relaxed">
                                Welcome to the {community.name} tribe! Be the first to share your machine or organize a meet by creating a new post.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {communityPosts.map(post => (
                                <div key={post.id} className="bg-steel border border-white/5 rounded-2xl p-5 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                                            {post.author?.username?.[0]?.toUpperCase() || 'D'}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-white">@{post.author?.username || 'driver'}</span>
                                            <span className="text-[9px] text-text-dim font-mono block">{new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{post.title}</h4>
                                    {post.image_url && (
                                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5">
                                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
