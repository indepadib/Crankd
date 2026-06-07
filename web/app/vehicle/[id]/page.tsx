'use client';

import {
    Activity,
    Calendar, // Keep for potential usage or remove if unused, but spec says "Use standard lucide-react"
    MapPin,   // Keep
    Share2,   // Keep
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

// MOCK DATA
const VEHICLE_DATA = {
    id: '1',
    vin: 'WBA333X...',
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

    return (
        <div className="max-w-7xl mx-auto pb-24">

            {/* HERO SECTION */}
            <div className="relative h-[50vh] min-h-[400px] w-full rounded-b-3xl overflow-hidden group">
                <Image
                    src={VEHICLE_DATA.image_url}
                    alt={VEHICLE_DATA.model}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
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
                                    {VEHICLE_DATA.vin}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">
                                {VEHICLE_DATA.model}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/70 font-light mt-2">
                                {VEHICLE_DATA.year} {VEHICLE_DATA.make}
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
                                <span className="text-3xl font-black text-white">{VEHICLE_DATA.health_score}</span>
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
                    <Link href="/profile" className="block glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors border border-white/5 hover:border-signal-orange/30">
                        <div className="text-xs text-text-dim uppercase tracking-wider mb-4 font-bold">Current Custodian</div>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-steel flex items-center justify-center text-white font-bold border border-white/10 text-xl">
                                {VEHICLE_DATA.owner.avatar}
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg">{VEHICLE_DATA.owner.name}</div>
                                <div className="text-signal-orange text-sm font-medium">{VEHICLE_DATA.owner.handle}</div>
                            </div>
                        </div>
                    </Link>

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
                            <SpecItem label="Engine" value={VEHICLE_DATA.specs.engine} icon={Zap} />
                            <SpecItem label="Power" value={VEHICLE_DATA.specs.power} icon={Gauge} />
                            <SpecItem label="Weight" value={VEHICLE_DATA.specs.weight} icon={Scale} />
                            <SpecItem label="Drivetrain" value={VEHICLE_DATA.specs.drivetrain} icon={GitCommit} />
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button className="w-full py-4 bg-white text-carbon font-black uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            <ArrowRightLeft className="h-5 w-5" />
                            Transfer Ownership
                        </button>
                        <button className="w-full py-4 bg-steel border border-white/10 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                            <DollarSign className="h-5 w-5 text-signal-orange" />
                            List for Sale
                        </button>
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
                            {VEHICLE_DATA.timeline.map((event) => (
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
