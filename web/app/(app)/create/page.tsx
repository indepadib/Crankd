'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Wrench, ShoppingBag, MapPin, ChevronRight, Upload } from 'lucide-react';

const postTypes = [
    { id: 'media', label: 'Build Post', icon: Image, description: 'Share photos and updates of your build', color: 'from-signal-orange/20 to-transparent', iconColor: 'text-signal-orange', borderColor: 'border-signal-orange/30' },
    { id: 'maintenance_log', label: 'Service Log', icon: Wrench, description: 'Document a maintenance or modification', color: 'from-blue-500/20 to-transparent', iconColor: 'text-blue-400', borderColor: 'border-blue-500/30' },
    { id: 'listing', label: 'List a Car', icon: ShoppingBag, description: 'List your vehicle on the marketplace', color: 'from-emerald-500/20 to-transparent', iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/30' },
    { id: 'convoy', label: 'Create Convoy', icon: MapPin, description: 'Organize a drive or track day event', color: 'from-purple-500/20 to-transparent', iconColor: 'text-purple-400', borderColor: 'border-purple-500/30' },
];

export default function CreatePage() {
    const [selected, setSelected] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    if (selected) {
        const type = postTypes.find(t => t.id === selected)!;
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelected(null)} className="text-text-dim hover:text-white transition-colors text-sm font-bold">← Back</button>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-sm font-bold text-white">{type.label}</span>
                </div>

                <div className="glass-panel rounded-3xl p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-dim uppercase tracking-wider">Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Give it a name..."
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/50 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-dim uppercase tracking-wider">Caption</label>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            placeholder="Tell the story..."
                            rows={4}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/50 transition-all resize-none"
                        />
                    </div>

                    {/* Media Upload */}
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-signal-orange/30 transition-colors cursor-pointer group">
                        <Upload className="h-8 w-8 mx-auto mb-3 text-text-muted group-hover:text-signal-orange transition-colors" />
                        <p className="text-sm font-bold text-text-dim group-hover:text-white transition-colors">Drop images here or click to upload</p>
                        <p className="text-xs text-text-muted mt-1">JPG, PNG up to 20MB</p>
                    </div>

                    <button className="w-full py-3.5 bg-signal-orange text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-signal-orange-dim transition-all active:scale-[0.98]">
                        Publish <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-white">Create</h1>
                <p className="text-text-dim mt-2">What are you sharing today?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {postTypes.map((type, i) => (
                    <motion.button
                        key={type.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelected(type.id)}
                        className={`relative rounded-3xl bg-gradient-to-br ${type.color} border ${type.borderColor} p-6 text-left overflow-hidden group hover:shadow-xl transition-all`}
                    >
                        <type.icon className={`h-8 w-8 ${type.iconColor} mb-4`} />
                        <h3 className="text-lg font-bold text-white mb-1">{type.label}</h3>
                        <p className="text-sm text-text-dim">{type.description}</p>
                        <ChevronRight className="absolute bottom-5 right-5 h-5 w-5 text-white/20 group-hover:text-white/60 transition-colors" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
