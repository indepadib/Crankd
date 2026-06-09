'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { 
    Car, 
    MapPin, 
    Users, 
    ChevronRight, 
    Sparkles, 
    ShieldCheck, 
    Gauge, 
    TrendingUp,
    Compass,
    ArrowUpRight,
    Star,
    ArrowRight
} from 'lucide-react';

const INVENTORY = [
    {
        id: 'inv-1',
        num: '01',
        make: 'BMW',
        model: 'M4 Competition',
        year: 2024,
        price: 96000,
        mileage: 1200,
        hp: 503,
        torque: '650 Nm',
        topSpeed: '290 km/h',
        location: 'Munich, DE',
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        desc: 'Twin-turbo inline-6 precision builder with track-ready cooling and active M differential.',
        type: 'track' as const,
        themeColor: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'inv-2',
        num: '02',
        make: 'Ferrari',
        model: 'Roma Spider',
        year: 2024,
        price: 272000,
        mileage: 350,
        hp: 612,
        torque: '760 Nm',
        topSpeed: '320 km/h',
        location: 'Maranello, IT',
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
        desc: 'Timeless open-top elegance. Handcrafted twin-turbo V8 delivering sensory perfection.',
        type: 'meet' as const,
        themeColor: 'from-red-500 to-rose-600'
    },
    {
        id: 'inv-3',
        num: '03',
        make: 'Porsche',
        model: '911 Turbo S',
        year: 2023,
        price: 230000,
        mileage: 2400,
        hp: 640,
        torque: '800 Nm',
        topSpeed: '330 km/h',
        location: 'Stuttgart, DE',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
        desc: 'The benchmark for supercar execution. Twin-turbo flat-six, active aero, and rear-wheel steer.',
        type: 'track' as const,
        themeColor: 'from-orange-500 to-red-600'
    },
    {
        id: 'inv-4',
        num: '04',
        make: 'Mercedes-Benz',
        model: 'AMG GT R',
        year: 2021,
        price: 185000,
        mileage: 6800,
        hp: 577,
        torque: '700 Nm',
        topSpeed: '318 km/h',
        location: 'Affalterbach, DE',
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
        desc: 'Race-bred aerodynamics and coilover suspension setup developed on the Green Hell.',
        type: 'drive' as const,
        themeColor: 'from-emerald-500 to-teal-600'
    }
];

const REVIEWS = [
    {
        id: 1,
        author: 'Esther Howard',
        role: 'Collector',
        rating: 5,
        review: 'Bought my first custom Porsche through the Vrooq portal and honestly the transparency was incredible. Zero friction, pure machine.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
    },
    {
        id: 2,
        author: 'Robert Fox',
        role: 'Track Enthusiast',
        rating: 5,
        review: 'The build log history verification solved my biggest concern. Real history, documented mods, and direct owner contact.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'
    },
    {
        id: 3,
        author: 'Jacob Jones',
        role: 'Club Lead',
        rating: 5,
        review: 'Organizing weekend convoys became completely seamless. Map pins, live attendee logs, and direct route sharing.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80'
    }
];

const BRANDS = [
    { name: 'Porsche', origin: 'DE' },
    { name: 'Ferrari', origin: 'IT' },
    { name: 'Lamborghini', origin: 'IT' },
    { name: 'BMW M', origin: 'DE' },
    { name: 'AMG', origin: 'DE' },
    { name: 'Aston Martin', origin: 'UK' }
];

export default function Home() {
    const router = useRouter();
    const [selectedCarIndex, setSelectedCarIndex] = useState(2); // Porsche 911 active by default
    const [username, setUsername] = useState('');

    const handleClaimUsername = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;
        const cleanName = username.replace(/[^a-zA-Z0-9_]/g, '');
        router.push(`/signup?username=${cleanName}`);
    };

    const activeCar = INVENTORY[selectedCarIndex];

    return (
        <div className="min-h-screen bg-[#070708] text-white overflow-x-hidden flex flex-col justify-between selection:bg-signal-orange selection:text-white">
            <Navbar />

            {/* Ambient Lighting Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-signal-orange/5 rounded-full blur-[150px]" />
                <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/5 rounded-full blur-[160px]" />
                {/* Tech Grid Line Overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* ── 1. CINEMATIC HERO SECTION ── */}
            <section className="relative z-10 pt-32 pb-16 md:pt-40 md:pb-24 max-w-7xl mx-auto px-6 w-full">
                <div className="rounded-[40px] bg-gradient-to-b from-[#111113] to-[#0b0b0c] border border-white/5 p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-24 h-[1px] bg-gradient-to-r from-signal-orange to-transparent" />
                    <div className="absolute top-0 left-0 w-[1px] h-24 bg-gradient-to-b from-signal-orange to-transparent" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative z-10">
                        {/* Title Copy */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5 text-zinc-400 text-xs font-mono">
                                <Sparkles className="w-3 h-3 text-signal-orange animate-pulse" />
                                <span>VROOQ PROTOCOL v1.0 LIVE</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                                DRIVE YOUR<br />
                                DREAM TODAY<span className="text-signal-orange">.</span>
                            </h1>
                        </div>

                        {/* Specs Widgets (Top Right) */}
                        <div className="lg:col-span-4 flex justify-start lg:justify-end gap-12 border-l lg:border-l border-white/5 lg:pl-12 py-2">
                            <div>
                                <span className="block text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1">Max Output</span>
                                <span className="text-3xl md:text-4xl font-black tracking-tight text-white italic">640 HP</span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-1">Enthusiasts</span>
                                <span className="text-3xl md:text-4xl font-black tracking-tight text-white italic">95K+</span>
                            </div>
                        </div>
                    </div>

                    {/* Supercar Main Presentation Image */}
                    <div className="relative my-8 md:my-12 w-full h-[250px] md:h-[420px] rounded-3xl overflow-hidden group">
                        <img 
                            src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1600&q=80" 
                            alt="Porsche 911 Silhouette" 
                            className="w-full h-full object-cover grayscale opacity-90 transition-transform duration-1000 group-hover:scale-105"
                        />
                        {/* Curved Vignette Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-6 flex justify-center">
                            <Link 
                                href="/signup"
                                className="px-6 py-3.5 bg-signal-orange hover:bg-orange-600 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-98 flex items-center gap-2"
                            >
                                Get Started <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Onboarding Username Form */}
                    <div className="max-w-xl mx-auto border-t border-white/5 pt-8">
                        <p className="text-center text-xs text-zinc-400 font-medium mb-4">
                            Claim your digital builder alias to catalog your machine and start tracking builds:
                        </p>
                        <form 
                            onSubmit={handleClaimUsername}
                            className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md focus-within:border-signal-orange/40 transition-all shadow-xl"
                        >
                            <div className="flex-1 flex items-center px-4 gap-1">
                                <span className="text-signal-orange font-bold text-lg select-none">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="username"
                                    className="bg-transparent text-white placeholder-text-muted text-sm font-semibold focus:outline-none w-full"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-white text-[#070708] font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
                            >
                                Claim Username
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ── 2. FEATURE SPECS & DETAILS SECTION ── */}
            <section className="relative z-10 py-12 max-w-7xl mx-auto px-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left: Headline & Sourcing Info */}
                    <div className="lg:col-span-5 rounded-[32px] bg-[#111113] border border-white/5 p-8 flex flex-col justify-between space-y-8">
                        <div className="space-y-4">
                            <span className="text-signal-orange text-[10px] font-mono uppercase tracking-widest">ABOUT US</span>
                            <h2 className="text-3xl font-black uppercase italic tracking-tight leading-none text-white">
                                BUILT FOR THOSE WHO CHOOSE DIFFERENTLY.
                            </h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Vrooq is the specialized ledger for automotive enthusiasts. We connect detailed service logs, dyno verified modifications, and GPS convoys directly to chassis records.
                            </p>
                        </div>

                        {/* Small horizontal block */}
                        <div className="border-t border-white/5 pt-6 space-y-2">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <span className="h-2 w-2 rounded-full bg-signal-orange animate-pulse" />
                                GLOBAL SOURCING
                            </div>
                            <p className="text-xs text-zinc-500">
                                Connect and source hard-to-find components from trusted builders in Germany, Japan, UAE, and the UK.
                            </p>
                        </div>
                    </div>

                    {/* Right: Technical Specs Showcase */}
                    <div className="lg:col-span-7 rounded-[32px] bg-[#111113] border border-white/5 p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-6 space-y-6">
                            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest block">Performance Blueprint</span>
                            
                            <div className="space-y-4">
                                <div className="border-b border-white/5 pb-3 flex justify-between items-end">
                                    <span className="text-xs text-zinc-400 font-medium">Top Speed Target</span>
                                    <span className="text-lg font-black text-white font-mono italic">320 km/h</span>
                                </div>
                                <div className="border-b border-white/5 pb-3 flex justify-between items-end">
                                    <span className="text-xs text-zinc-400 font-medium">Torque Target</span>
                                    <span className="text-lg font-black text-white font-mono italic">800 Nm</span>
                                </div>
                                <div className="border-b border-white/5 pb-3 flex justify-between items-end">
                                    <span className="text-xs text-zinc-400 font-medium">Displacement</span>
                                    <span className="text-lg font-black text-white font-mono italic">3,745 cc</span>
                                </div>
                            </div>
                        </div>

                        {/* Vector Silhouette Simulation */}
                        <div className="md:col-span-6 h-full min-h-[200px] flex items-center justify-center bg-black/30 rounded-2xl border border-white/5 p-6 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center grayscale" />
                            <div className="relative text-center z-10 space-y-2">
                                <Car className="h-10 w-10 text-signal-orange mx-auto opacity-80" />
                                <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Aero Tuned Vector</span>
                                <span className="block text-xs text-zinc-600 font-bold">1:18 Chassis Blueprint</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 3. INTERACTIVE SHOWCASE ("BROWSE WHAT JUST LANDED") ── */}
            <section className="relative z-10 py-12 max-w-7xl mx-auto px-6 w-full">
                <div className="rounded-[40px] bg-[#111113] border border-white/5 p-8 md:p-12">
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="text-signal-orange text-[10px] font-mono uppercase tracking-widest block mb-2">INVENTORY SELECTOR</span>
                            <h2 className="text-4xl font-black uppercase italic tracking-tight leading-none text-white">
                                BROWSE WHAT JUST LANDED<span className="text-signal-orange">.</span>
                            </h2>
                        </div>
                        <p className="text-zinc-500 text-sm max-w-xs">
                            Active high-fidelity custom listings freshly cataloged on our marketplace.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT: Accordion List (40% width) */}
                        <div className="lg:col-span-5 space-y-3">
                            {INVENTORY.map((car, idx) => {
                                const isActive = selectedCarIndex === idx;
                                return (
                                    <button
                                        key={car.id}
                                        onClick={() => setSelectedCarIndex(idx)}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                                            isActive 
                                                ? 'bg-white/5 border-signal-orange/40 shadow-lg' 
                                                : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/2'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs font-mono font-bold ${isActive ? 'text-signal-orange' : 'text-zinc-500'}`}>
                                                {car.num}
                                            </span>
                                            <div>
                                                <span className="block text-xs text-zinc-500 font-semibold">{car.make}</span>
                                                <span className={`block font-bold text-sm tracking-tight ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                                                    {car.model}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isActive ? (
                                                <span className="h-1.5 w-1.5 rounded-full bg-signal-orange" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-zinc-600" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* RIGHT: Active Car Showcase Card (60% width) */}
                        <div className="lg:col-span-7">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCar.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.4 }}
                                    className="rounded-3xl bg-[#0b0b0c] border border-white/5 p-6 space-y-6 relative overflow-hidden"
                                >
                                    {/* Image */}
                                    <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden relative border border-white/5 bg-black/40">
                                        <img 
                                            src={activeCar.image} 
                                            alt={`${activeCar.make} ${activeCar.model}`} 
                                            className="w-full h-full object-cover object-center"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur rounded-full border border-white/10">
                                            <span className="h-1.5 w-1.5 rounded-full bg-signal-orange animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Active Build</span>
                                        </div>

                                        {/* Price */}
                                        <div className="absolute bottom-4 left-5 text-3xl font-black text-white italic tracking-tight">
                                            ${activeCar.price.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-black uppercase text-white italic tracking-tight">
                                                    {activeCar.year} {activeCar.make} {activeCar.model}
                                                </h3>
                                                <p className="text-zinc-400 text-xs mt-1">
                                                    {activeCar.desc}
                                                </p>
                                            </div>
                                            <Link 
                                                href={`/marketplace`}
                                                className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                                            >
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Link>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                                            <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                                                <span className="block text-zinc-500 text-[9px] font-mono uppercase tracking-widest mb-1">Power Output</span>
                                                <span className="text-base font-black text-white italic">{activeCar.hp} HP</span>
                                            </div>
                                            <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                                                <span className="block text-zinc-500 text-[9px] font-mono uppercase tracking-widest mb-1">Torque Specs</span>
                                                <span className="text-base font-black text-white italic">{activeCar.torque}</span>
                                            </div>
                                            <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                                                <span className="block text-zinc-500 text-[9px] font-mono uppercase tracking-widest mb-1">Top Velocity</span>
                                                <span className="text-base font-black text-white italic">{activeCar.topSpeed}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. TESTIMONIALS & STATS ── */}
            <section className="relative z-10 py-12 max-w-7xl mx-auto px-6 w-full">
                <div className="rounded-[40px] bg-[#111113] border border-white/5 p-8 md:p-12 space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="text-signal-orange text-[10px] font-mono uppercase tracking-widest block mb-2">REVIEWS & FEEDBACK</span>
                            <h2 className="text-4xl font-black uppercase italic tracking-tight leading-none text-white">
                                EVERY REVIEW IS A STORY<br />WE ARE PROUD OF<span className="text-signal-orange">.</span>
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-zinc-300">
                                95K+ Enthusiasts Connected
                            </span>
                        </div>
                    </div>

                    {/* Review Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {REVIEWS.map(rev => (
                            <div 
                                key={rev.id}
                                className="bg-[#0b0b0c] border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-white/10 transition-all"
                            >
                                <div className="space-y-4">
                                    {/* Star Rating */}
                                    <div className="flex gap-1">
                                        {[...Array(rev.rating)].map((_, i) => (
                                            <Star key={i} className="h-3.5 w-3.5 fill-signal-orange text-signal-orange" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed italic">
                                        "{rev.review}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                    <img 
                                        src={rev.avatar} 
                                        alt={rev.author} 
                                        className="h-9 w-9 rounded-full object-cover border border-white/10"
                                    />
                                    <div>
                                        <span className="block font-bold text-white text-xs">{rev.author}</span>
                                        <span className="block text-[10px] text-zinc-500 font-semibold">{rev.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Core Metric Counters Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                        <div>
                            <span className="text-3xl font-black text-white italic tracking-tight">12K+</span>
                            <span className="block text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">Active Build Logs</span>
                        </div>
                        <div>
                            <span className="text-3xl font-black text-white italic tracking-tight">600+</span>
                            <span className="block text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">Verified Sales</span>
                        </div>
                        <div>
                            <span className="text-3xl font-black text-white italic tracking-tight">150+</span>
                            <span className="block text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">GPS Convoys Organized</span>
                        </div>
                        <div>
                            <span className="text-3xl font-black text-white italic tracking-tight">100%</span>
                            <span className="block text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">Owner Verified History</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. BRAND PARTNERS LOGOS ── */}
            <section className="relative z-10 py-12 max-w-7xl mx-auto px-6 w-full text-center">
                <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest block mb-8">
                    THE BRANDS PEOPLE ACTUALLY DREAM ABOUT — ALL IN ONE PLACE
                </span>
                
                <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
                    {BRANDS.map(brand => (
                        <div 
                            key={brand.name}
                            className="px-6 py-2.5 rounded-full bg-white/2 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest italic text-zinc-400 hover:text-white cursor-default"
                        >
                            {brand.name} <span className="text-zinc-600 text-[9px] font-mono ml-1">{brand.origin}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-12 bg-zinc-950/40 border-t border-white/5 relative z-10 w-full mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left space-y-1">
                        <h3 className="text-xl font-black tracking-tighter text-white uppercase italic">VROOQ<span className="text-signal-orange">.</span></h3>
                        <p className="text-zinc-500 text-[11px]">© 2026 Vrooq Inc. Built with absolute passion for automotive culture.</p>
                    </div>
                    <div className="flex gap-6 text-xs font-bold text-zinc-500">
                        <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
                        <Link href="/signup" className="hover:text-white transition-colors">Register</Link>
                        <Link href="/feed" className="text-signal-orange hover:text-orange-400 transition-colors">Launch App</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
