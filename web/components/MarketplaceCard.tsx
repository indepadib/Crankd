'use client';

import { MapPin, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MarketplaceCardProps {
    item: {
        id: string;
        title: string;
        price: string;
        image: string;
        location: string;
        category: 'Vehicle' | 'Part';
        verified?: boolean;
        specs?: string; // e.g., "32k miles • Manual"
    }
}

export function MarketplaceCard({ item }: MarketplaceCardProps) {
    return (
        <Link href={`/marketplace/${item.id}`} className="group block relative break-inside-avoid mb-6">
            <div className="relative rounded-2xl overflow-hidden bg-steel border border-white/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] group-hover:border-signal-orange/30">

                {/* Image */}
                <div className="aspect-[4/3] w-full relative overflow-hidden">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-transparent to-transparent opacity-60" />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {item.category === 'Vehicle' ? (
                            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                                Vehicle
                            </span>
                        ) : (
                            <span className="bg-carbon/60 backdrop-blur-md text-text-dim border border-white/10 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                                Part
                            </span>
                        )}
                        {item.verified && (
                            <span className="bg-signal-orange/90 backdrop-blur-md text-white border border-signal-orange text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Verified
                            </span>
                        )}
                    </div>

                    {/* Like Button */}
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-signal-orange/90 hover:text-white text-white/70 transition-all border border-white/10 hover:border-signal-orange/50 hover:scale-110 active:scale-95 group/btn">
                        <Heart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                    </button>

                    {/* Price Tag */}
                    <div className="absolute bottom-3 right-3 bg-white text-carbon font-black text-sm px-3 py-1.5 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                        {item.price}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white leading-tight group-hover:text-signal-orange transition-colors line-clamp-2">
                            {item.title}
                        </h3>
                    </div>

                    {item.specs && (
                        <div className="text-sm text-text-dim font-mono mb-3 border-b border-white/5 pb-3">
                            {item.specs}
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-text-dim font-medium uppercase tracking-wide">
                        <MapPin className="h-3 w-3 text-signal-orange" />
                        {item.location}
                    </div>
                </div>
            </div>
        </Link>
    );
}
