
'use client';

import React, { useState } from 'react';
import { Plus, Settings, Share2, ShieldCheck, PenTool, TrendingUp } from 'lucide-react';
import { useGarage } from '@/hooks/useGarage';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';
import { Vehicle } from '@/hooks/useGarage'; // Ensure type is exported or redefine
import { AddVehicleModal } from '@/components/AddVehicleModal';

export default function GaragePage() {
    const { user } = useAuth();
    const { vehicles, loading, addVehicle } = useGarage(user?.id);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Mock timeline for now
    const getTimeline = (vid: string) => [
        { type: 'Service', title: 'Scheduled Maintenance', date: 'Recently' }
    ];

    return (
        <div className="space-y-8">
            <AddVehicleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addVehicle}
            />

            <header className="flex justify-between items-end pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">My Garage</h1>
                    <p className="text-text-dim">Manage your fleet, track maintenance, and build your digital history.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-signal-orange text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                </button>
            </header>

            <div className="grid grid-cols-1 gap-12">
                {loading && <div className="text-zinc-500">Loading your machines...</div>}

                {!loading && vehicles.length === 0 && (
                    <div className="text-zinc-500 py-10 bg-zinc-900/30 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4">
                        <p>No vehicles found in your garage.</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-signal-orange text-white px-6 py-2 rounded-full font-bold text-sm"
                        >
                            Add First Vehicle
                        </button>
                    </div>
                )}

                {!loading && vehicles.map((car: any) => (
                    <div key={car.id} className="group">
                        <section className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">
                            {car.image_url ? (
                                <img src={car.image_url} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 font-bold">No Image</div>
                            )}

                            <div className="absolute top-6 right-6 flex gap-4">
                                <button className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white hover:text-black transition-colors">
                                    <Share2 className="h-4 w-4" />
                                </button>
                                <button className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white hover:text-black transition-colors">
                                    <Settings className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="absolute bottom-8 left-8">
                                <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">{car.make} {car.model}</h2>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-signal-orange text-white text-xs font-bold shadow-lg shadow-signal-orange/20">
                                        <ShieldCheck className="h-3 w-3" />
                                        <span>Verified Owner</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        Health: 98/100
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            {/* Detailed Stats / Mods */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <PenTool className="h-4 w-4 text-text-dim" />
                                    Modifications
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {car.mods?.map((mod: string) => (
                                        <span key={mod} className="px-3 py-1.5 rounded-lg bg-black border border-white/10 text-white/80 text-sm">
                                            {mod}
                                        </span>
                                    ))}
                                    <button className="px-3 py-1.5 rounded-lg border border-dashed border-white/20 text-text-dim text-xs hover:text-white hover:border-white/50 transition-colors">
                                        + Add Mod
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-4">Maintenance</h3>
                                <div className="space-y-4">
                                    {getTimeline(car.id).map((event: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-signal-orange shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-white font-medium">{event.title}</div>
                                                <div className="text-white/40 text-xs">{event.type} • {event.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
