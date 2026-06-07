'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Clock, ChevronRight } from 'lucide-react';

const convoys = [
    {
        id: '1',
        title: 'MIDNIGHT CANYON RUN',
        location: 'Jebel Hafeet, UAE',
        date: 'Sat, Jun 14 • 11:00 PM',
        attendees: 24,
        maxAttendees: 30,
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
        host: '@SheikhSpeed',
        tags: ['Night Run', 'Canyon', 'Supercar'],
        status: 'open',
    },
    {
        id: '2',
        title: 'TRACK DAY — DXB AUTODROME',
        location: 'Dubai Autodrome, UAE',
        date: 'Sun, Jun 22 • 7:00 AM',
        attendees: 18,
        maxAttendees: 20,
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        host: '@TrackDayDXB',
        tags: ['Track Day', 'Timed Laps', 'Open Pit'],
        status: 'almost-full',
    },
    {
        id: '3',
        title: 'COASTAL CRUISE — JBR TO ABU DHABI',
        location: 'JBR Beach, Dubai → Abu Dhabi',
        date: 'Fri, Jun 27 • 8:30 AM',
        attendees: 41,
        maxAttendees: 50,
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
        host: '@CruzControl',
        tags: ['Coastal', 'Scenic', 'All Welcome'],
        status: 'open',
    },
    {
        id: '4',
        title: 'SUPERCAR SUNDAY — YAS MARINA',
        location: 'Yas Marina Circuit, Abu Dhabi',
        date: 'Sun, Jul 6 • 9:00 AM',
        attendees: 8,
        maxAttendees: 15,
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
        host: '@YasCircuit',
        tags: ['Supercar', 'F1 Track', 'Exclusive'],
        status: 'open',
    },
];

const statusColors: Record<string, string> = {
    open: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'almost-full': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    full: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const statusLabels: Record<string, string> = {
    open: 'Open',
    'almost-full': 'Almost Full',
    full: 'Full',
};

export default function ConvoysPage() {
    return (
        <div className="space-y-8">
            <div>
                <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1">Upcoming Drives</p>
                <h1 className="text-4xl font-black tracking-tighter text-white">Convoys</h1>
                <p className="text-text-dim mt-2">Find and join drives near you.</p>
            </div>

            <div className="space-y-4">
                {convoys.map((convoy, i) => (
                    <motion.div
                        key={convoy.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className="rounded-3xl bg-steel border border-white/8 overflow-hidden group hover:border-white/15 transition-all cursor-pointer"
                    >
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-56 h-40 md:h-auto relative flex-shrink-0 overflow-hidden">
                                <img src={convoy.image} alt={convoy.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-steel/60 hidden md:block" />
                            </div>

                            <div className="flex-1 p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-black text-white group-hover:text-signal-orange transition-colors tracking-tight">
                                                {convoy.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold flex-shrink-0 ${statusColors[convoy.status]}`}>
                                                {statusLabels[convoy.status]}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-text-dim mb-3">
                                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-signal-orange" />{convoy.location}</span>
                                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-signal-orange" />{convoy.date}</span>
                                            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-signal-orange" />{convoy.attendees}/{convoy.maxAttendees} going</span>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            {convoy.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/8 rounded-full text-[10px] text-text-dim font-bold">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="flex-shrink-0 px-5 py-2.5 bg-signal-orange text-white font-bold rounded-xl text-sm hover:bg-signal-orange-dim transition-all active:scale-[0.98] flex items-center gap-2">
                                        RSVP <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-signal-orange rounded-full transition-all"
                                        style={{ width: `${(convoy.attendees / convoy.maxAttendees) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
