'use client';

import { Users, MessageSquare, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CommunityCardProps {
    community: {
        id: string;
        name: string;
        description: string;
        image: string;
        members: string;
        active: string;
        category: string;
    }
}

export function CommunityCard({ community }: CommunityCardProps) {
    return (
        <Link href={`/communities/${community.id}`} className="group block relative h-72 rounded-3xl overflow-hidden bg-steel border border-white/5 transition-all duration-500 hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] hover:border-signal-orange/30">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={community.image}
                    alt={community.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
            </div>

            {/* Hover Indicator */}
            <div className="absolute top-4 right-4 h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 border border-white/20">
                <ArrowUpRight className="h-5 w-5 text-white" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold bg-signal-orange text-white px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                            {community.category}
                        </span>
                    </div>

                    <h3 className="text-3xl font-black text-white leading-none mb-3 italic tracking-tighter shadow-lg">
                        {community.name}
                    </h3>

                    <p className="text-sm text-white/70 line-clamp-2 mb-6 group-hover:text-white transition-colors duration-300 font-medium leading-relaxed max-w-[90%]">
                        {community.description}
                    </p>

                    <div className="flex items-center gap-6 text-xs font-mono border-t border-white/10 pt-4 mt-auto">
                        <div className="flex items-center gap-2 text-white/90">
                            <Users className="h-3.5 w-3.5 text-signal-orange" />
                            <span className="font-bold">{community.members}</span> Members
                        </div>
                        <div className="flex items-center gap-2 text-white/90">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </div>
                            <span className="font-bold">{community.active}</span> Online
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
