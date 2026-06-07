'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Lock, Globe } from 'lucide-react';

const communities = [
    { id: '1', name: 'BMW Owners UK', members: 12400, posts: 8900, cover: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', tags: ['BMW', 'UK', 'Track'], private: false, description: 'The home of BMW culture in the UK. Track days, meets, and build logs.' },
    { id: '2', name: 'JDM Underground', members: 28700, posts: 45000, cover: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80', tags: ['JDM', 'Stance', 'Track'], private: false, description: 'Everything Japanese. Drift, time attack, canyon runs.' },
    { id: '3', name: 'Gulf Supercars', members: 5200, posts: 3100, cover: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80', tags: ['Supercar', 'Dubai', 'Exclusive'], private: true, description: 'Exclusive community for supercar owners in the Gulf region.' },
    { id: '4', name: 'Euro Restomod Club', members: 9800, posts: 12300, cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', tags: ['Porsche', 'BMW', 'Restomod'], private: false, description: 'Classic European iron with modern performance.' },
    { id: '5', name: 'Track Day Warriors', members: 18600, posts: 22000, cover: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80', tags: ['TrackDay', 'Lap Times', 'Racing'], private: false, description: 'For those who live for the lap timer.' },
    { id: '6', name: 'Widebody Culture', members: 31200, posts: 67000, cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', tags: ['Widebody', 'LBWK', 'Build'], private: false, description: 'Wide, loud, and proud.' },
];

export default function CommunitiesPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1">Find Your People</p>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Tribes</h1>
                    <p className="text-text-dim mt-2">Join communities built around your passion.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {communities.map((c, i) => (
                    <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        className="rounded-3xl bg-steel border border-white/8 overflow-hidden group hover:border-white/15 transition-all cursor-pointer"
                    >
                        <div className="h-40 relative overflow-hidden">
                            <img src={c.cover} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-steel to-transparent" />
                            {c.private && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 border border-white/10 rounded-full text-white text-[10px] font-bold backdrop-blur-sm">
                                    <Lock className="h-3 w-3" /> Private
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <h3 className="font-bold text-white text-lg mb-1 group-hover:text-signal-orange transition-colors">{c.name}</h3>
                            <p className="text-text-dim text-sm line-clamp-2 mb-4">{c.description}</p>

                            <div className="flex gap-2 flex-wrap mb-4">
                                {c.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-text-dim font-bold">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-text-dim">
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.members.toLocaleString()}</span>
                                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{c.posts.toLocaleString()} posts</span>
                                </div>
                                <button className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${c.private ? 'bg-white/5 border border-white/10 text-text-dim hover:border-white/20' : 'bg-signal-orange/10 border border-signal-orange/20 text-signal-orange hover:bg-signal-orange hover:text-white'}`}>
                                    {c.private ? 'Request' : 'Join'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
