'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Plus, Shield, Wrench, BarChart3, ChevronRight } from 'lucide-react';

const mockVehicles = [
    {
        id: '1',
        make: 'BMW',
        model: 'M3 Competition',
        year: 2019,
        health_score: 98,
        color: 'Individual Frozen Black',
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
        logs: 14,
        mods: 8,
        verified: true,
    },
    {
        id: '2',
        make: 'Porsche',
        model: '911 GT3',
        year: 2022,
        health_score: 100,
        color: 'Guards Red',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
        logs: 6,
        mods: 2,
        verified: true,
    },
];

export default function GaragePage() {
    const [activeVehicle, setActiveVehicle] = useState(mockVehicles[0]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1">Your Collection</p>
                    <h1 className="text-4xl font-black tracking-tighter text-white">The Garage</h1>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-signal-orange text-white font-bold rounded-xl text-sm hover:bg-signal-orange-dim transition-all active:scale-[0.98]">
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                </button>
            </div>

            {/* Vehicle Selector */}
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {mockVehicles.map(v => (
                    <motion.button
                        key={v.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveVehicle(v)}
                        className={`flex-shrink-0 w-64 rounded-2xl border p-4 text-left transition-all ${activeVehicle.id === v.id ? 'border-signal-orange/50 bg-signal-orange/5' : 'border-white/8 bg-steel/40 hover:border-white/15'}`}
                    >
                        <div className="aspect-video rounded-xl overflow-hidden mb-3">
                            <img src={v.image} alt={v.model} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-bold text-sm">{v.year} {v.model}</p>
                                <p className="text-text-dim text-xs">{v.make}</p>
                            </div>
                            {v.verified && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                    <Shield className="h-3 w-3" /> Verified
                                </div>
                            )}
                        </div>
                    </motion.button>
                ))}

                {/* Add Vehicle card */}
                <button className="flex-shrink-0 w-64 rounded-2xl border border-dashed border-white/15 hover:border-signal-orange/40 transition-colors flex items-center justify-center gap-2 text-text-dim hover:text-signal-orange min-h-[160px]">
                    <Plus className="h-5 w-5" />
                    <span className="text-sm font-bold">Add Vehicle</span>
                </button>
            </div>

            {/* Active Vehicle Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main card */}
                <div className="lg:col-span-2 rounded-3xl bg-steel border border-white/8 overflow-hidden">
                    <div className="aspect-video relative">
                        <img src={activeVehicle.image} alt={activeVehicle.model} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-steel to-transparent" />
                        <div className="absolute bottom-6 left-6">
                            <p className="text-white/60 text-sm">{activeVehicle.year} • {activeVehicle.color}</p>
                            <h2 className="text-3xl font-black text-white">{activeVehicle.make} {activeVehicle.model}</h2>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-3 gap-4">
                        {[
                            { label: 'Health Score', value: `${activeVehicle.health_score}%`, icon: BarChart3, color: 'text-emerald-400' },
                            { label: 'Service Logs', value: activeVehicle.logs.toString(), icon: Wrench, color: 'text-blue-400' },
                            { label: 'Modifications', value: activeVehicle.mods.toString(), icon: Car, color: 'text-signal-orange' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center p-4 bg-carbon/50 rounded-2xl">
                                <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                                <p className="text-xs text-text-dim mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="rounded-3xl bg-steel border border-white/8 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-signal-orange" />
                        Service History
                    </h3>
                    <div className="space-y-4">
                        {[
                            { date: 'Jun 2026', title: 'Oil Change + Filter', cost: '$120', type: 'maintenance' },
                            { date: 'Apr 2026', title: 'Brake Pad Replacement', cost: '$480', type: 'repair' },
                            { date: 'Feb 2026', title: 'BC Coilover Install', cost: '$2,200', type: 'modification' },
                            { date: 'Dec 2025', title: 'Annual Service', cost: '$850', type: 'maintenance' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-3 group cursor-pointer">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-signal-orange mt-1.5 flex-shrink-0" />
                                    {i < 3 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                                </div>
                                <div className="pb-4 flex-1">
                                    <p className="text-[10px] text-text-muted uppercase tracking-wider">{log.date}</p>
                                    <p className="text-sm font-bold text-white group-hover:text-signal-orange transition-colors">{log.title}</p>
                                    <p className="text-xs text-text-dim">{log.cost}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-2 py-2.5 rounded-xl border border-white/8 hover:border-white/20 text-text-dim hover:text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
                        View All Logs <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
