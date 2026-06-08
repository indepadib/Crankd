'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConvoysMap } from '@/components/ConvoysMap';
import { EventCard } from '@/components/EventCard';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// MOCK EVENTS (FALLBACK)
const EVENTS = [
    {
        id: 'mock-1',
        title: 'Friday Night Daikoku',
        date: 'Oct 24',
        time: '8:00 PM',
        location: 'Daikoku PA',
        image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2670&auto=format&fit=crop',
        attendees: 142,
        type: 'meet' as const
    },
    {
        id: 'mock-2',
        title: 'Canyon Carving: Angels Crest',
        date: 'Oct 25',
        time: '6:30 AM',
        location: 'Shell, La Cañada',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2698&auto=format&fit=crop',
        attendees: 12,
        type: 'drive' as const
    },
    {
        id: 'mock-3',
        title: 'Track Day: Laguna Seca',
        date: 'Nov 02',
        time: '7:00 AM',
        location: 'Laguna Seca Raceway',
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop',
        attendees: 45,
        type: 'track' as const
    },
    {
        id: 'mock-4',
        title: 'Euro Sunday',
        date: 'Oct 26',
        time: '9:00 AM',
        location: 'The Avenue',
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2670&auto=format&fit=crop',
        attendees: 88,
        type: 'meet' as const
    }
];

export default function ConvoysPage() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*, profiles:author_id(username)')
                    .eq('content_type', 'convoy')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    const parsed = data.map(post => {
                        // Parse body to retrieve meeting location and description
                        let location = 'Local Meet';
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

                        // Format created_at date
                        const createdDate = new Date(post.created_at);
                        const month = createdDate.toLocaleString('default', { month: 'short' });
                        const day = createdDate.getDate();
                        const dateStr = `${month} ${day}`;
                        const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return {
                            id: post.id,
                            title: post.title || 'Untitled Convoy',
                            date: dateStr,
                            time: timeStr,
                            location: location,
                            image: post.image_url || 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2670&auto=format&fit=crop',
                            attendees: post.like_count ? post.like_count + 1 : 8,
                            type: type
                        };
                    });
                    setEvents(parsed);
                } else {
                    setEvents(EVENTS);
                }
            } catch (err) {
                console.warn('[Convoys] Fetch failed, using mock events:', err);
                setEvents(EVENTS);
            } finally {
                setLoading(false);
            }
        };

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
                        Find meets, join drives, and track local activity.
                    </p>
                </div>
                <button 
                    onClick={() => router.push('/create')}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Create Event
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* LEFT: Event List (Scrollable) */}
                <div className="lg:col-span-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Nearby Events</h3>
                        <button className="text-xs text-signal-orange font-bold hover:text-orange-400">View All</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {loading ? (
                            <div className="py-20 text-center text-zinc-500 font-bold">Pinging satellites...</div>
                        ) : (
                            events.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Map Interface (Full Height) */}
                <div className="lg:col-span-2 min-h-[400px]">
                    <ConvoysMap events={events} />
                </div>

            </div>
        </div>
    );
}
