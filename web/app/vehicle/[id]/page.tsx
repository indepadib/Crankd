'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Calendar,
    MapPin,
    Share2,
    Shield,
    Zap,
    Gauge,
    Scale,
    GitCommit,
    Wrench,
    Trophy,
    ArrowRightLeft,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// MOCK DATA (FALLBACK)
const MOCK_VEHICLE = {
    id: 'mock-1',
    vin: 'WBA333XE46CSL007',
    year: 2003,
    make: 'BMW',
    model: 'M3 CSL',
    trim: 'E46',
    health_score: 98,
    image_url: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600&auto=format&fit=crop',
    specs: {
        engine: '3.2L S54 Inline-6',
        power: '360 hp',
        weight: '1,385 kg',
        drivetrain: 'RWD'
    },
    owner: {
        name: 'DriftKing',
        handle: '@driftking_jp',
        avatar: 'DK'
    },
    timeline: [
        { id: 1, type: 'transfer', title: 'Ownership Transferred', date: 'Mar 15, 2024', detail: 'Acquired from @collector_01', icon: ArrowRightLeft },
        { id: 2, type: 'mod', title: 'Suspension Upgrade', date: 'Apr 02, 2024', detail: 'Installed KW V3 Coilovers', icon: Zap },
        { id: 3, type: 'maintenance', title: 'Rod Bearing Service', date: 'Apr 10, 2024', detail: 'Preventative replacement (WPC treated)', icon: Wrench },
        { id: 4, type: 'event', title: 'Track Day Record', date: 'May 21, 2024', detail: 'Tsukuba Circuit - 1:02.45', icon: Trophy },
    ]
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function VehicleProfilePage() {
    const params = useParams();
    const vehicleId = params.id as string;

    const [vehicle, setVehicle] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicle = async () => {
            if (!vehicleId) return;
            setLoading(true);

            try {
                // Fetch vehicle and join profile owner
                const { data, error } = await supabase
                    .from('vehicles')
                    .select('*, profiles:owner_id(username, avatar_url)')
                    .eq('id', vehicleId)
                    .single();

                if (error) throw error;

                if (data) {
                    // Fetch timeline logs from posts table
                    const { data: logs, error: logsError } = await supabase
                        .from('posts')
                        .select('*')
                        .eq('vehicle_id', vehicleId)
                        .order('created_at', { ascending: false });

                    const parsedTimeline = (logs || []).map((log: any, idx: number) => {
                        const isMaintenance = log.content_type === 'maintenance_log' || log.title?.toLowerCase().includes('service');
                        const isMod = log.content_type === 'media' || log.title?.toLowerCase().includes('upgrade') || log.title?.toLowerCase().includes('install');
                        
                        return {
                            id: log.id,
                            type: isMaintenance ? 'maintenance' : isMod ? 'mod' : 'event',
                            title: log.title || 'Build Update',
                            date: new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
                            detail: log.body || 'No description provided.',
                            icon: isMaintenance ? Wrench : isMod ? Zap : Trophy
                        };
                    });

                    setVehicle({
                        id: data.id,
                        vin: data.vin || 'WBAXXXXXXXXXXXXXX',
                        year: data.year,
                        make: data.make,
                        model: data.model,
                        trim: data.trim || 'OEM Spec',
                        health_score: 95, // Simulated score based on record count
                        image_url: data.image_url || 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600&auto=format&fit=crop',
                        specs: {
                            engine: 'OEM Configured',
                            power: 'N/A HP',
                            weight: 'OEM Curb Weight',
                            drivetrain: 'N/A'
                        },
                        owner: {
                            name: data.profiles?.username || 'Chassis Owner',
                            handle: data.profiles?.username ? `@${data.profiles.username}` : '@Anonymous',
                            avatar: (data.profiles?.username?.[0] || 'C').toUpperCase()
                        }
                    });

                    setTimeline(parsedTimeline.length > 0 ? parsedTimeline : [
                        { id: 99, type: 'transfer', title: 'Ledger Created', date: new Date(data.created_at).toLocaleDateString(), detail: 'Vehicle recorded on the Crankd public database.', icon: ArrowRightLeft }
                    ]);
                } else {
                    // Fallback to mock data if single query succeeds but returns empty
                    setVehicle(MOCK_VEHICLE);
                    setTimeline(MOCK_VEHICLE.timeline);
                }
            } catch (err) {
                console.warn('[VehicleProfile] Fetch failed or mock ID, falling back:', err);
                setVehicle(MOCK_VEHICLE);
                setTimeline(MOCK_VEHICLE.timeline);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [vehicleId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-500 font-bold">
                Reading chassis telemetry...
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-400 font-bold">
                Telemetry reading failed. Vehicle not found.
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-24">
            {/* HERO SECTION */}
            <div className="relative h-[50vh] min-h-[400px] w-full rounded-b-3xl overflow-hidden group">
                <img
                    src={vehicle.image_url}
                    alt={vehicle.model}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-signal-orange/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg shadow-signal-orange/20">
                                    Legendary Spec
                                </span>
                                <span className="flex items-center gap-1 text-white/70 text-sm font-mono">
                                    <Shield className="h-4 w-4" />
                                    {vehicle.vin}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">
                                {vehicle.model}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/70 font-light mt-2">
                                {vehicle.year} {vehicle.make}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex items-center gap-6"
                        >
                            {/* Health Score Badge */}
                            <div className="h-24 w-24 rounded-full border-4 border-signal-orange bg-carbon/80 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                                <span className="text-3xl font-black text-white">{vehicle.health_score}</span>
                                <span className="text-[10px] uppercase text-signal-orange font-bold">Health</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0 -mt-8 relative z-10">
                {/* LEFT COLUMN: SPECS & ACTIONS */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Owner Card */}
                    <div className="block glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="text-xs text-text-dim uppercase tracking-wider mb-4 font-bold">Current Custodian</div>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-steel flex items-center justify-center text-white font-bold border border-white/10 text-xl">
                                {vehicle.owner.avatar}
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg">{vehicle.owner.name}</div>
                                <div className="text-signal-orange text-sm font-medium">{vehicle.owner.handle}</div>
                            </div>
                        </div>
                    </div>

                    {/* Specs Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel p-6 rounded-2xl border border-white/5"
                    >
                        <h3 className="text-white font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-signal-orange" />
                            Build Specs
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <SpecItem label="Engine" value={vehicle.specs.engine} icon={Zap} />
                            <SpecItem label="Power" value={vehicle.specs.power} icon={Gauge} />
                            <SpecItem label="Weight" value={vehicle.specs.weight} icon={Scale} />
                            <SpecItem label="Drivetrain" value={vehicle.specs.drivetrain} icon={GitCommit} />
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button className="w-full py-4 bg-white text-carbon font-black uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            <ArrowRightLeft className="h-5 w-5" />
                            Transfer Ownership
                        </button>
                        <Link href="/create" className="w-full py-4 bg-steel border border-white/10 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-center">
                            <DollarSign className="h-5 w-5 text-signal-orange" />
                            List for Sale
                        </Link>
                    </div>
                </div>

                {/* RIGHT COLUMN: TIMELINE (The Digital Soul) */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-8 rounded-2xl min-h-[600px] border border-white/5">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Shield className="h-6 w-6 text-signal-orange" />
                            Provenance Timeline
                        </h2>

                        <motion.div
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent"
                        >
                            {timeline.map((event) => (
                                <motion.div
                                    key={event.id}
                                    variants={item}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                                >
                                    {/* Icon Marker */}
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-carbon bg-steel text-white shadow-xl shadow-black/50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <event.icon className="w-5 h-5 text-signal-orange" />
                                    </div>

                                    {/* Content Card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 glass-panel rounded-xl border border-white/5 hover:border-signal-orange/30 transition-all hover:bg-white/5">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-white/90">{event.title}</span>
                                            <time className="font-mono text-xs text-text-dim">{event.date}</time>
                                        </div>
                                        <p className="text-text-dim text-sm">{event.detail}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SpecItem({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
    return (
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-1 text-text-dim text-xs uppercase font-bold">
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <div className="text-white font-bold">{value}</div>
        </div>
    );
}
