'use client';

import { MapPin, Navigation } from 'lucide-react';

interface ConvoysMapProps {
    events?: {
        id: string;
        title: string;
        attendees: number;
        type: 'meet' | 'drive' | 'track';
    }[];
}

export function ConvoysMap({ events = [] }: ConvoysMapProps) {
    // Deterministic position based on string ID hash to keep them stable
    const getCoords = (id: string, index: number) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Map hash to stable coordinates in the central area of the map
        const x = 25 + Math.abs((hash + index * 17) % 50); // 25% to 75%
        const y = 25 + Math.abs((hash * 7 + index * 23) % 50); // 25% to 75%
        return { x: `${x}%`, y: `${y}%` };
    };

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden relative bg-[#0a0a0a] border border-white/5 group shadow-2xl">

            {/* Map Background (Styled) */}
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Dark Map Base Layer - Simulation */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#050505] opacity-80" />

            {/* World Map Overlay Simulation */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center grayscale mix-blend-overlay" />

            {/* Radar Sweep Animation - More subtle */}
            <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-5 pointer-events-none overflow-hidden">
                <div className="w-[150%] h-[150%] animate-spin-slow bg-gradient-to-r from-transparent via-signal-orange/20 to-transparent" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }} />
            </div>

            {/* Active Convoys (Pins) */}
            <div className="absolute inset-0 w-full h-full">
                {events.map((event, index) => {
                    const { x, y } = getCoords(event.id, index);
                    const isTrack = event.type === 'track';
                    const isDrive = event.type === 'drive';
                    
                    const pinColorClass = isTrack 
                        ? 'bg-signal-orange shadow-[0_0_15px_#f97316]' 
                        : isDrive 
                            ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' 
                            : 'bg-green-500 shadow-[0_0_10px_#22c55e]';
                    
                    const pingBgClass = isTrack 
                        ? 'bg-signal-orange' 
                        : isDrive 
                            ? 'bg-blue-500' 
                            : 'bg-green-500';

                    return (
                        <div 
                            key={event.id}
                            style={{ top: y, left: x }}
                            className="absolute flex flex-col items-center gap-2 group/pin cursor-pointer z-10 -translate-x-1/2 -translate-y-1/2"
                        >
                            <div className="relative">
                                <div className={`absolute inset-0 ${pingBgClass} rounded-full animate-ping opacity-50`} />
                                <div className={`relative h-3.5 w-3.5 rounded-full border-2 border-black ${pinColorClass}`} />
                            </div>
                            <div className="bg-carbon/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover/pin:opacity-100 transition-all transform translate-y-2 group-hover/pin:translate-y-0 shadow-xl whitespace-nowrap font-bold pointer-events-none">
                                {event.title} <span className="text-signal-orange ml-1">({event.attendees} cars)</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* UI Overlays */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-signal-orange rounded-full animate-pulse" />
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter shadow-black drop-shadow-lg">Live Map</h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-signal-orange/80 bg-black/40 backdrop-blur rounded px-2 py-1 border border-white/5">
                    {events.length} Active Groups nearby
                </div>
            </div>

            <button className="absolute bottom-6 right-6 p-4 rounded-full bg-signal-orange text-white shadow-lg hover:bg-orange-600 hover:scale-105 transition-all z-20">
                <Navigation className="h-6 w-6" />
            </button>

        </div>
    );
}
