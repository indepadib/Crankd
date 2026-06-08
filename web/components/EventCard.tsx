'use client';

import { MapPin, Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface EventCardProps {
    event: {
        id: string;
        title: string;
        date: string;
        time: string;
        location: string;
        image: string;
        attendees: number;
        type: 'meet' | 'drive' | 'track';
    };
    onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
    return (
        <div 
            onClick={onClick}
            className="group relative flex gap-4 p-4 rounded-2xl bg-steel/50 border border-white/5 hover:bg-steel hover:border-signal-orange/30 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
            {/* Image */}
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${event.type === 'track' ? 'text-signal-orange border-signal-orange/20 bg-signal-orange/10' :
                        event.type === 'drive' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                            'text-green-400 border-green-400/20 bg-green-400/10'
                        }`}>
                        {event.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-mono text-text-dim">
                        <Users className="h-3 w-3" />
                        {event.attendees}
                    </span>
                </div>

                <h3 className="text-white font-bold truncate group-hover:text-signal-orange transition-colors mb-2">
                    {event.title}
                </h3>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-text-dim">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-dim truncate">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                    </div>
                </div>
            </div>

            {/* Action Arrow */}
            <div className="flex items-center justify-center w-8 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all">
                <ChevronRight className="h-5 w-5" />
            </div>
        </div>
    );
}
