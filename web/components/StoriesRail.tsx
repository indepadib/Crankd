'use client';

import { Plus } from 'lucide-react';

const STORIES = [
    { id: '1', user: 'You', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2698&auto=format&fit=crop', seen: false, isUser: true },
    { id: '2', user: 'RWB_Akira', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2670&auto=format&fit=crop', seen: false },
    { id: '3', user: 'TopSecret', image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=2600&auto=format&fit=crop', seen: false },
    { id: '4', user: 'Hoonigan', image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2670&auto=format&fit=crop', seen: true },
    { id: '5', user: 'SpeedHunters', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop', seen: true },
];

export function StoriesRail() {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-6 -mx-4 px-4 md:mx-0 md:px-0">
            {STORIES.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0">
                    <div className={`p-[3px] rounded-full ${story.isUser ? 'border-2 border-dashed border-white/20' : story.seen ? 'bg-white/10' : 'bg-gradient-to-tr from-signal-orange to-yellow-500'}`}>
                        <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden border-4 border-carbon bg-carbon">
                            <img src={story.image} alt={story.user} className="w-full h-full object-cover transition-transform group-hover:scale-110" />

                            {story.isUser && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Plus className="h-6 w-6 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                    <span className="text-xs font-medium text-text-dim group-hover:text-white transition-colors truncate w-20 text-center">
                        {story.user}
                    </span>
                </div>
            ))}
        </div>
    );
}
