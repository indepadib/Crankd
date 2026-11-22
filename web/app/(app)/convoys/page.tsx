'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConvoysMap } from '@/components/ConvoysMap';
import { EventCard } from '@/components/EventCard';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DetailModal } from '@/components/ui/DetailModal';

export default function ConvoysPage() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal details
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        let dbEvents: any[] = [];
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, profiles:author_id(username)')
                .eq('content_type', 'convoy')
                .order('created_at', { ascending: false });

            if (!error && data) {
                dbEvents = data;
            }
        } catch (err) {
            console.warn('[Convoys] Fetch failed:', err);
        }

        // Retrieve local posts
        let localList: any[] = [];
        try {
            const savedLocal = localStorage.getItem('local-posts');
            const parsedLocal = savedLocal ? JSON.parse(savedLocal) : [];
            localList = Array.isArray(parsedLocal) ? parsedLocal : [];
        } catch { /* Storage can be unavailable or malformed. */ }
        const localConvoys = localList.filter((p: any) => p.content_type === 'convoy');

        const combined = [
            ...localConvoys,
            ...dbEvents
        ];

        const toParse = combined;

        const parsed = toParse.map(post => {
            // If it's already in the final event format (like mock events), return as is
            if (post.type && (post.type === 'meet' || post.type === 'drive' || post.type === 'track') && !post.content_type) {
                return post;
            }

            // Parse body to retrieve meeting location and description
            let location = 'Lieu à confirmer';
            if (post.body && post.body.startsWith('Location: ')) {
                const parts = post.body.split('. Description: ');
                if (parts.length >= 2) {
                    location = parts[0].replace('Location: ', '');
                } else {
                    const parts2 = post.body.split('Location: ');
                    if (parts2[1]) {
                        location = parts2[1];
                    }
                }
            } else if (post.body && post.body.startsWith('{')) {
                try {
                    const parsedJson = JSON.parse(post.body);
                    location = parsedJson.location || 'Lieu à confirmer';
                } catch (e) {
                    location = 'Local Meet';
                }
            }

            // Determine event type based on tags or title
            let type: 'meet' | 'drive' | 'track' = 'drive';
            const lowerTitle = (post.title || '').toLowerCase();
            const tags = post.tags || [];
            const hasTrack = tags.some((t: string) => t.toLowerCase().includes('track')) || lowerTitle.includes('track');
            const hasMeet = tags.some((t: string) => t.toLowerCase().includes('meet') || t.toLowerCase().includes('coffee')) || lowerTitle.includes('meet') || lowerTitle.includes('coffee');
            
            if (hasTrack) {
                type = 'track';
            } else if (hasMeet) {
                type = 'meet';
            }

            // A post's publication timestamp is not the event schedule.
            // Do not present it as the convoy's date or departure time.
            const dateStr = 'Date à confirmer';
            const timeStr = 'Heure à confirmer';

            return {
                id: post.id,
                title: post.title || 'Untitled Convoy',
                date: dateStr,
                time: timeStr,
                location: location,
                image: post.image_url || 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2670&auto=format&fit=crop',
                attendees: 0, // Likes are not RSVPs. Never invent participants.
                type: type,
                body: post.body,
                author: post.profiles || post.author
            };
        });

        // Filter out duplicate IDs
        const uniqueEvents = parsed.reduce((acc: any[], current) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        setEvents(uniqueEvents);
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Convoys
                    </h1>
                    <p className="text-text-dim text-sm">
                        Découvrez les sorties et rassemblements réellement publiés par la communauté.
                    </p>
                </div>
                <button 
                    onClick={() => router.push('/create')}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Créer une sortie
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* LEFT: Event List (Scrollable) */}
                <div className="lg:col-span-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Événements publiés</h3>

                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {loading ? (
                            <div className="py-20 text-center text-zinc-500 font-bold">Chargement des événements…</div>
                        ) : events.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-300">Aucun convoi publié pour le moment. Proposez la première sortie à la communauté.</div>
                        ) : (
                            events.map(event => (
                                <EventCard 
                                    key={event.id} 
                                    event={event} 
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setIsModalOpen(true);
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Map Interface (Full Height) */}
                <div className="lg:col-span-2 min-h-[400px]">
                    <ConvoysMap events={events} />
                </div>

            </div>

            {/* Dynamic Event Details Modal */}
            <DetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type="convoy"
                data={selectedEvent}
                onActionSuccess={fetchEvents}
            />
        </div>
    );
}
