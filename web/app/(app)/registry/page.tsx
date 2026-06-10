'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Car, Calendar, Activity, ArrowRight, Gauge, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePreferences } from '@/hooks/usePreferences';
import Link from 'next/link';

export default function RegistryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatDistance } = usePreferences();

    useEffect(() => {
        const fetchRegistry = async () => {
            setLoading(true);
            let dbVehicles: any[] = [];
            
            try {
                // Fetch all public vehicles in database
                const { data, error } = await supabase
                    .from('vehicles')
                    .select('*, profiles:owner_id(username)');
                
                if (!error && data) {
                    dbVehicles = data;
                }
            } catch (err) {
                console.warn('[Registry] Database fetch failed, using local storage fallback:', err);
            }

            // Fetch local vehicles
            const localSaved = localStorage.getItem('local-vehicles');
            const localList = localSaved ? JSON.parse(localSaved) : [];
            
            const combined = [...localList, ...dbVehicles];
            
            // Remove duplicates
            const deduped = combined.reduce((acc: any[], current) => {
                const exists = acc.find(item => item.id === current.id);
                if (!exists) {
                    return acc.concat([current]);
                }
                return acc;
            }, []);

            // Enrich vehicles with their local specs if stored
            const enriched = deduped.map(v => {
                let localSpecs: any = null;
                if (typeof window !== 'undefined') {
                    const savedSpecs = localStorage.getItem(`vehicle-specs-${v.id}`);
                    if (savedSpecs) {
                        try { localSpecs = JSON.parse(savedSpecs); } catch (e) {}
                    }
                }
                return {
                    ...v,
                    vin: localSpecs?.vin || v.vin || 'WBAXXXXXXXXXXXXXX',
                    trim: localSpecs?.trim || v.trim || 'OEM Spec',
                    health_score: localSpecs?.healthScore || v.health_score || 95,
                    stage: localSpecs?.stage || 'Stock',
                    color: localSpecs?.color || 'OEM Spec',
                    chassisCode: localSpecs?.chassisCode || 'N/A',
                    power: localSpecs?.power ? `${localSpecs.power} HP` : 'N/A HP'
                };
            });

            setVehicles(enriched);
            setLoading(false);
        };

        fetchRegistry();
    }, []);

    const filteredVehicles = vehicles.filter(v => {
        const search = searchQuery.toLowerCase();
        return (
            v.make?.toLowerCase().includes(search) ||
            v.model?.toLowerCase().includes(search) ||
            v.vin?.toLowerCase().includes(search) ||
            v.year?.toString().includes(search) ||
            v.chassisCode?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-24 px-4">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1 font-mono">Public Register</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                        Chassis Heritage Registry
                    </h1>
                    <p className="text-text-dim mt-2 max-w-2xl">
                        Search and verify any vehicle's permanent identity, specification logbook, ownership chain, and maintenance heritage.
                    </p>
                </div>
            </div>

            {/* Explainer / Help Block */}
            <div className="glass-panel p-6 rounded-2xl border border-signal-orange/20 bg-signal-orange/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-signal-orange/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-signal-orange/10 border border-signal-orange/30 rounded-xl flex items-center justify-center text-signal-orange shrink-0">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-white uppercase italic tracking-tight">Understanding the Chassis Ledger</h4>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed font-mono uppercase">
                            Unlike traditional automotive databases which link history to temporary license plates, Vrooq decouples the car from its owner. 
                            Each car profile is bound permanently to its chassis serial number (VIN) as an immutable record of ownership transitions, dyno statistics, and service timelines.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Enter VIN code, Make, Model, or Chassis Code (e.g. WBA, E46, Porsche)..."
                    className="w-full pl-11 pr-4 py-3.5 bg-steel border border-white/8 rounded-2xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/50 transition-all font-semibold"
                />
            </div>

            {/* Registry Grid */}
            {loading ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-zinc-500 font-mono font-bold uppercase tracking-widest animate-pulse">
                    Scanning public registers...
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center space-y-4 max-w-xl mx-auto mt-8">
                    <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-signal-orange">
                        <Shield className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic">No Registered Chassis Found</h3>
                    <p className="text-sm text-text-dim max-w-sm mx-auto">
                        We couldn't find any chassis matching your search criteria. Check spelling or register this vehicle in your garage.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle, idx) => (
                        <motion.div
                            key={vehicle.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                            className="rounded-2xl bg-[#0b0b0d] border border-white/8 overflow-hidden hover:border-signal-orange/30 hover:shadow-2xl transition-all flex flex-col justify-between group"
                        >
                            <div>
                                {/* Cover Photo */}
                                <div className="aspect-[16/10] relative overflow-hidden border-b border-white/5">
                                    <img
                                        src={vehicle.image_url || 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=600'}
                                        alt={vehicle.model}
                                        className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    
                                    {/* Health Score Badge */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 border border-white/10 rounded-full text-white text-[10px] font-black font-mono backdrop-blur-sm shadow-lg">
                                        <span className="text-signal-orange">Health:</span> {vehicle.health_score}
                                    </div>
                                    
                                    {/* Tuning Stage Badge */}
                                    <div className="absolute bottom-3 left-4 flex items-center gap-1 px-2 py-0.5 bg-signal-orange text-white text-[9px] font-bold rounded uppercase tracking-wider shadow-md font-mono">
                                        {vehicle.stage}
                                    </div>
                                </div>

                                {/* Content info */}
                                <div className="p-5 space-y-4">
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-signal-orange transition-colors">
                                            {vehicle.year} {vehicle.make} {vehicle.model}
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono mt-1 flex items-center gap-1">
                                            <Shield className="h-3 w-3 text-signal-orange shrink-0" />
                                            VIN: {vehicle.vin}
                                        </p>
                                    </div>

                                    {/* Spec Grid */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono font-bold text-zinc-400">
                                        <div className="bg-white/2 p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-600 block uppercase tracking-wider text-[8px] mb-0.5">Engine</span>
                                            <span className="text-white truncate block">{vehicle.specs?.engine || vehicle.engine || 'OEM Config'}</span>
                                        </div>
                                        <div className="bg-white/2 p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-600 block uppercase tracking-wider text-[8px] mb-0.5">Drivetrain</span>
                                            <span className="text-white truncate block">{vehicle.specs?.drivetrain || vehicle.drivetrain || 'N/A'}</span>
                                        </div>
                                        <div className="bg-white/2 p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-600 block uppercase tracking-wider text-[8px] mb-0.5">Power</span>
                                            <span className="text-white truncate block">{vehicle.power || 'N/A'}</span>
                                        </div>
                                        <div className="bg-white/2 p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-600 block uppercase tracking-wider text-[8px] mb-0.5">Color Code</span>
                                            <span className="text-white truncate block">{vehicle.specs?.color || vehicle.color || 'OEM Spec'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* View Action Link */}
                            <div className="px-5 pb-5 pt-0">
                                <Link
                                    href={`/vehicle/${vehicle.id}`}
                                    className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-signal-orange/40 hover:bg-signal-orange/5 text-[10px] font-black text-white hover:text-white rounded-xl uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-all"
                                >
                                    Inspect Certified Ledger <ArrowRight className="h-3.5 w-3.5 text-signal-orange" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
