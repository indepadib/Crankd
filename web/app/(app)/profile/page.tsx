'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Car, Heart, Share2, Shield, ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';

const stats = [
    { label: 'Vehicles', value: '2' },
    { label: 'Posts', value: '47' },
    { label: 'Followers', value: '1.2K' },
    { label: 'Following', value: '389' },
];

const recentPosts = [
    { id: '1', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80', likes: 284 },
    { id: '2', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80', likes: 197 },
    { id: '3', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&q=80', likes: 412 },
    { id: '4', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80', likes: 341 },
    { id: '5', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&q=80', likes: 526 },
    { id: '6', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', likes: 183 },
];

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Driver';

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-3xl p-8"
            >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-signal-orange to-orange-700 flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-signal-orange/20">
                            {username[0]?.toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-500 rounded-full border-2 border-steel flex items-center justify-center">
                            <Shield className="h-3.5 w-3.5 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-black text-white">@{username}</h1>
                        <p className="text-text-dim text-sm mt-1">Car enthusiast • Builder • Explorer</p>
                        <p className="text-text-dim text-xs mt-0.5">{user?.email}</p>

                        {/* Stats */}
                        <div className="flex gap-6 mt-5 justify-center sm:justify-start">
                            {stats.map(s => (
                                <div key={s.label} className="text-center">
                                    <p className="text-xl font-black text-white">{s.value}</p>
                                    <p className="text-xs text-text-muted uppercase tracking-wider">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                        <button className="p-2.5 glass-panel rounded-xl hover:bg-white/10 transition-colors">
                            <Share2 className="h-4 w-4 text-text-dim" />
                        </button>
                        <Link href="/settings" className="p-2.5 glass-panel rounded-xl hover:bg-white/10 transition-colors">
                            <Settings className="h-4 w-4 text-text-dim" />
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Garage Sneak Peek */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Car className="h-5 w-5 text-signal-orange" /> Garage
                    </h2>
                    <Link href="/garage" className="text-sm text-signal-orange font-bold hover:text-orange-400 transition-colors flex items-center gap-1">
                        View All <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {[
                        { make: 'BMW', model: 'M3 Competition', year: 2019, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80' },
                        { make: 'Porsche', model: '911 GT3', year: 2022, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80' },
                    ].map((v, i) => (
                        <div key={i} className="flex-shrink-0 w-56 rounded-2xl overflow-hidden border border-white/8 group cursor-pointer hover:border-white/20 transition-all">
                            <div className="h-32 relative">
                                <img src={v.image} alt={v.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-3">
                                <p className="text-white font-bold text-sm">{v.year} {v.model}</p>
                                <p className="text-text-dim text-xs">{v.make}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            <div>
                <h2 className="text-lg font-bold text-white mb-4">Posts</h2>
                <div className="grid grid-cols-3 gap-2">
                    {recentPosts.map((post, i) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            className="aspect-square rounded-2xl overflow-hidden group relative cursor-pointer"
                        >
                            <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex items-center gap-1 text-white font-bold text-sm">
                                    <Heart className="h-4 w-4 fill-white" /> {post.likes}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Sign Out */}
            <button
                onClick={signOut}
                className="w-full py-3 rounded-2xl border border-white/8 hover:border-red-500/30 hover:bg-red-500/5 text-text-dim hover:text-red-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
                <LogOut className="h-4 w-4" />
                Sign Out
            </button>
        </div>
    );
}
