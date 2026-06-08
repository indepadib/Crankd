'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Plus, Shield, Wrench, BarChart3, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';

const PRESET_VEHICLE_IMAGES = [
    { name: 'M3 Black', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80' },
    { name: 'Singer 911', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
    { name: 'JDM Supra', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&q=80' },
    { name: 'GT-R R35', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80' },
    { name: '488 Pista', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80' }
];

const MOCK_VEHICLES = [
    {
        id: 'mock-1',
        make: 'BMW',
        model: 'M3 Competition',
        year: 2019,
        health_score: 98,
        color: 'Individual Frozen Black',
        image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
        logs: 14,
        mods: 8,
        verified: true,
    },
    {
        id: 'mock-2',
        make: 'Porsche',
        model: '911 GT3',
        year: 2022,
        health_score: 100,
        color: 'Guards Red',
        image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
        logs: 6,
        mods: 2,
        verified: true,
    },
];

export default function GaragePage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [activeVehicle, setActiveVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [selectedImage, setSelectedImage] = useState(PRESET_VEHICLE_IMAGES[0].url);
    const [modalError, setModalError] = useState<string | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    const loadVehicles = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                // Map database columns to fit schema
                const parsed = data.map(v => ({
                    ...v,
                    health_score: 100,
                    logs: 0,
                    mods: 0,
                    verified: false
                }));
                setVehicles(parsed);
                setActiveVehicle(parsed[0]);
            } else {
                // Fallback to mock data if empty
                setVehicles(MOCK_VEHICLES);
                setActiveVehicle(MOCK_VEHICLES[0]);
            }
        } catch (err) {
            console.warn('[Garage] Fetch failed, using mock data:', err);
            setVehicles(MOCK_VEHICLES);
            setActiveVehicle(MOCK_VEHICLES[0]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setModalLoading(true);
        setModalError(null);

        try {
            const { data, error } = await supabase.from('vehicles').insert({
                owner_id: user.id,
                make,
                model,
                year: parseInt(year),
                image_url: selectedImage
            }).select();

            if (error) throw error;

            // Close and refresh
            setShowModal(false);
            setMake('');
            setModel('');
            setYear('');
            await loadVehicles();
        } catch (err: any) {
            setModalError(err.message || 'Error inserting vehicle.');
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="space-y-8 relative">
            
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1">Your Collection</p>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">The Garage</h1>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-signal-orange text-white font-bold rounded-xl text-sm hover:bg-signal-orange-dim transition-all active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-zinc-500 font-bold">Scanning Garage...</div>
            ) : (
                <>
                    {/* Vehicle Selector */}
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {vehicles.map(v => (
                            <motion.button
                                key={v.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveVehicle(v)}
                                className={`flex-shrink-0 w-64 rounded-2xl border p-4 text-left transition-all ${activeVehicle?.id === v.id ? 'border-signal-orange/50 bg-signal-orange/5' : 'border-white/8 bg-steel/40 hover:border-white/15'}`}
                            >
                                <div className="aspect-video rounded-xl overflow-hidden mb-3">
                                    <img src={v.image_url || v.image} alt={v.model} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-bold text-sm truncate max-w-[150px]">{v.year} {v.model}</p>
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

                        {/* Add Vehicle card link */}
                        <button 
                            onClick={() => setShowModal(true)}
                            className="flex-shrink-0 w-64 rounded-2xl border border-dashed border-white/15 hover:border-signal-orange/40 transition-colors flex items-center justify-center gap-2 text-text-dim hover:text-signal-orange min-h-[160px]"
                        >
                            <Plus className="h-5 w-5" />
                            <span className="text-sm font-bold">Add Vehicle</span>
                        </button>
                    </div>

                    {/* Active Vehicle Detail */}
                    {activeVehicle && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Display */}
                            <div className="lg:col-span-2 rounded-3xl bg-steel border border-white/8 overflow-hidden">
                                <div className="aspect-video relative">
                                    <img src={activeVehicle.image_url || activeVehicle.image} alt={activeVehicle.model} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-steel via-steel/20 to-transparent" />
                                    <div className="absolute bottom-6 left-6">
                                        <p className="text-white/60 text-sm">{activeVehicle.year} • {activeVehicle.color || 'OEM Spec'}</p>
                                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">{activeVehicle.make} {activeVehicle.model}</h2>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'Health Score', value: `${activeVehicle.health_score || 100}%`, icon: BarChart3, color: 'text-emerald-400' },
                                        { label: 'Service Logs', value: (activeVehicle.logs || 0).toString(), icon: Wrench, color: 'text-blue-400' },
                                        { label: 'Modifications', value: (activeVehicle.mods || 0).toString(), icon: Car, color: 'text-signal-orange' },
                                    ].map(stat => (
                                        <div key={stat.label} className="text-center p-4 bg-carbon/50 rounded-2xl border border-white/5">
                                            <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                                            <p className="text-2xl font-black text-white">{stat.value}</p>
                                            <p className="text-xs text-text-dim mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Service Timeline placeholder */}
                            <div className="rounded-3xl bg-steel border border-white/8 p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-signal-orange" />
                                    Service History
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { date: 'Jun 2026', title: 'Oil Change & Filter', cost: '$120', type: 'maintenance' },
                                        { date: 'Apr 2026', title: 'Brake Pad Replacement', cost: '$480', type: 'repair' },
                                        { date: 'Feb 2026', title: 'BC Coilover Installation', cost: '$2,200', type: 'modification' },
                                        { date: 'Dec 2025', title: 'Annual Checkup', cost: '$850', type: 'maintenance' },
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
                    )}
                </>
            )}

            {/* ── ADD VEHICLE POPUP MODAL ── */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black"
                        />

                        {/* Modal Container */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-6"
                        >
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <h3 className="text-xl font-black text-white uppercase italic">Add Vehicle</h3>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddVehicle} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Make</label>
                                        <input 
                                            type="text" 
                                            value={make}
                                            onChange={e => setMake(e.target.value)}
                                            required
                                            placeholder="Toyota"
                                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Model</label>
                                        <input 
                                            type="text" 
                                            value={model}
                                            onChange={e => setModel(e.target.value)}
                                            required
                                            placeholder="Supra"
                                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Year</label>
                                    <input 
                                        type="number" 
                                        value={year}
                                        onChange={e => setYear(e.target.value)}
                                        required
                                        placeholder="1997"
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40"
                                    />
                                </div>

                                {/* Photo Selector */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Cover Photo</label>
                                    <div className="flex gap-2 overflow-x-auto py-1">
                                        {PRESET_VEHICLE_IMAGES.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedImage(img.url)}
                                                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImage === img.url ? 'border-signal-orange' : 'border-transparent'}`}
                                            >
                                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {modalError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                                        {modalError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="w-full py-3 bg-signal-orange text-white font-bold rounded-xl text-sm hover:bg-signal-orange-dim transition-all active:scale-[0.98]"
                                >
                                    {modalLoading ? 'Adding...' : 'Add to Garage'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
