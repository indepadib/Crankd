'use client';

import { useParams } from 'next/navigation';
import { Users, MessageSquare, Calendar, ChevronRight, UserPlus } from 'lucide-react';

// MOCK DATA (Reuse basic structure, extend for detail)
const COMMUNITY = {
    id: '1',
    name: 'JDM Legends',
    description: 'Celebrating the Golden Era of Japanese performance.',
    banner: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=2600&auto=format&fit=crop',
    stats: {
        members: '12.4k',
        online: '142',
        posts: '1.2k'
    },
    topics: ['Builds', 'Imports', 'Drifting', 'Parts Hunting'],
    events: [
        { id: 1, title: 'Friday Night Daikoku', date: 'Fri, Oct 24 • 8:00 PM', location: 'Daikoku PA, Yokohama' },
        { id: 2, title: 'Coffee & Rice', date: 'Sun, Oct 26 • 7:00 AM', location: 'Shibuya Crossing' }
    ]
};

export default function CommunityDetailPage() {
    const params = useParams();

    return (
        <div className="max-w-7xl mx-auto pb-32">

            {/* HERDER */}
            <div className="h-64 md:h-80 w-full relative group">
                <img
                    src={COMMUNITY.banner}
                    alt={COMMUNITY.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/60 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col md:flex-row items-end justify-between gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-signal-orange text-white text-xs font-bold uppercase tracking-wider rounded mb-3">
                            Japanese Domestic
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-2">
                            {COMMUNITY.name}
                        </h1>
                        <div className="flex items-center gap-6 text-sm font-mono text-white/80">
                            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {COMMUNITY.stats.members} Members</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {COMMUNITY.stats.online} Online</span>
                        </div>
                    </div>

                    <button className="px-6 py-3 bg-white text-carbon font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg">
                        <UserPlus className="h-4 w-4" />
                        Join Tribe
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4 md:px-12 mt-8">

                {/* LEFT SIDEBAR (Info & Events) */}
                <div className="lg:col-span-1 space-y-6">

                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">About</h3>
                        <p className="text-text-dim text-sm leading-relaxed mb-6">
                            {COMMUNITY.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {COMMUNITY.topics.map(topic => (
                                <span key={topic} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-xs text-text-dim">
                                    #{topic}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-signal-orange" />
                            Upcoming Events
                        </h3>
                        <div className="space-y-4">
                            {COMMUNITY.events.map(event => (
                                <div key={event.id} className="group cursor-pointer">
                                    <div className="text-white font-bold group-hover:text-signal-orange transition-colors">{event.title}</div>
                                    <div className="text-xs text-text-dim mt-1">{event.date}</div>
                                    <div className="text-xs text-text-dim">{event.location}</div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-xs font-bold text-center text-white/50 hover:text-white transition-colors uppercase tracking-wider">
                            View Calendar
                        </button>
                    </div>

                </div>

                {/* MAIN FEED area (Placeholder for now, re-using Feed style visually) */}
                <div className="lg:col-span-3">

                    {/* Input Area */}
                    <div className="glass-panel p-4 rounded-xl mb-6 flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-steel flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Share something with JDM Legends..."
                            className="bg-transparent text-white placeholder-text-dim flex-1 focus:outline-none"
                        />
                    </div>

                    <div className="p-8 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center min-h-[400px]">
                        <MessageSquare className="h-12 w-12 text-white/10 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Community Feed</h3>
                        <p className="text-text-dim max-w-sm">
                            This is where members share builds, spot events, and discuss techniques.
                            <br /><span className="text-xs opacity-50">(Feed component would populate here)</span>
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}
