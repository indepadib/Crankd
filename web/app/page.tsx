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
    ShoppingBag, 
    Plus, 
    ChevronRight, 
    Sparkles, 
    Wrench,
    TrendingUp, 
    Compass,
    ShieldCheck,
    Gauge
} from 'lucide-react';

const FEATURES = [
    {
        id: 'garage',
        title: 'Digital Garage',
        icon: Car,
        accent: 'from-orange-500 to-red-600',
        badge: 'On-Chain Ledger',
        description: 'Mint your machine. Record dyno graphs, parts listings, and service records in a secure digital logbook.',
        mockup: {
            title: '1994 Mazda RX-7 FD',
            spec: '13B-REW • Single Turbo Conversion',
            power: '420 WHP',
            status: 'Ready',
            logs: [
                { type: 'Mod', label: 'HKS Super Manifold & Garrett G30-770', cost: '$4,200' },
                { type: 'Service', label: 'Apex seals & housing check', cost: '$1,850' }
            ]
        }
    },
    {
        id: 'convoys',
        title: 'Live Convoys',
        icon: MapPin,
        accent: 'from-blue-500 to-indigo-600',
        badge: 'GPS Tracking',
        description: 'Organize canyon runs, track days, or local meets. Lead active drives with integrated route navigation.',
        mockup: {
            title: 'Midnight Canyon Run',
            location: 'Jebel Hafeet, UAE',
            date: 'Sat, Jun 14 • 11:00 PM',
            attendees: '24 drivers RSVP\'d',
            tags: ['Supercar', 'Night Run']
        }
    },
    {
        id: 'tribes',
        title: 'Enthusiast Tribes',
        icon: Users,
        accent: 'from-purple-500 to-pink-600',
        badge: 'Sub-Cultures',
        description: 'Join communities dedicated to specific chassis, engines, or regions. Exchange tuning knowledge with peers.',
        mockup: {
            groups: [
                { name: 'JDM Legends', members: '12.4k', active: '142 online' },
                { name: 'Euro Outlaws', members: '8.2k', active: '98 online' },
                { name: 'Rotary Club', members: '2.8k', active: '45 online' }
            ]
        }
    },
    {
        id: 'marketplace',
        title: 'Peer Marketplace',
        icon: ShoppingBag,
        accent: 'from-emerald-500 to-teal-600',
        badge: 'Zero Fees',
        description: 'Buy and sell enthusiast cars and components directly. All vehicles link directly to verified build logs.',
        mockup: {
            title: 'Porsche 911 GT3 RS (997.2)',
            price: '$245,000',
            mileage: '12,400 mi',
            history: 'Verified Logged History (7 Records)',
            badge: 'Verified Sale'
        }
    }
];

export default function Home() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('garage');
    const [username, setUsername] = useState('');

    const handleClaimUsername = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;
        // Strip out spaces and symbols to make a clean username
        const cleanName = username.replace(/[^a-zA-Z0-9_]/g, '');
        router.push(`/signup?username=${cleanName}`);
    };

    const currentFeature = FEATURES.find(f => f.id === activeTab)!;

    return (
        <div className="min-h-screen bg-carbon text-white overflow-x-hidden flex flex-col justify-between selection:bg-signal-orange selection:text-white">
            <Navbar />

            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ opacity: [0.3, 0.45, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-orange-600/10 rounded-full blur-[140px]"
                />
                <motion.div
                    animate={{ opacity: [0.2, 0.35, 0.2], scale: [1.05, 1, 1.05] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-700/8 rounded-full blur-[160px]"
                />
                {/* Tech Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0H0v40h40V0zM1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        maskImage: 'radial-gradient(circle at center, black, transparent 90%)'
                    }}
                />
            </div>

            {/* ── HERO SECTION ── */}
            <section className="relative z-10 pt-36 pb-20 md:pt-48 md:pb-24 max-w-7xl mx-auto px-6 w-full text-center lg:text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    
                    {/* Left: Main Copy & Username Claim */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 text-zinc-400 text-xs font-semibold backdrop-blur-md"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-signal-orange animate-pulse" />
                            <span>v1.0 is now live for web & mobile</span>
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h1 
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                                className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.88] text-white"
                            >
                                The digital soul<br />
                                of your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-400">machine.</span>
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
                            >
                                Document your builds, join GPS-tracked drives, and connect with verified enthusiasts. Rebuilt to be fast, clean, and interactive.
                            </motion.p>
                        </div>

                        {/* Frictionless Onboarding input */}
                        <motion.form 
                            onSubmit={handleClaimUsername}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md focus-within:border-signal-orange/40 transition-all shadow-xl"
                        >
                            <div className="flex-1 flex items-center px-4 gap-1">
                                <span className="text-signal-orange font-bold text-lg select-none">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="your_username"
                                    className="bg-transparent text-white placeholder-text-muted text-sm font-semibold focus:outline-none w-full"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-white text-carbon font-bold rounded-xl text-sm hover:bg-zinc-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2 group"
                            >
                                Claim Username
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.form>

                        {/* Core features indicators */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-xs font-mono text-zinc-500 pt-4"
                        >
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-signal-orange" />
                                <span>Verified Builds</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Gauge className="h-4 w-4 text-signal-orange" />
                                <span>Realtime Analytics</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Compass className="h-4 w-4 text-signal-orange" />
                                <span>No Middlemen</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Premium Interactive Showcase */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-5 w-full flex flex-col"
                    >
                        <div className="glass-panel p-6 rounded-3xl border border-white/8 bg-[#0a0a0a]/90 backdrop-blur-xl relative overflow-hidden shadow-2xl flex-1 flex flex-col justify-between min-h-[380px]">
                            
                            {/* Tab Selectors */}
                            <div className="flex gap-1.5 overflow-x-auto pb-4 border-b border-white/5 scrollbar-hide">
                                {FEATURES.map(feat => {
                                    const Icon = feat.icon;
                                    const isSelected = activeTab === feat.id;
                                    return (
                                        <button
                                            key={feat.id}
                                            onClick={() => setActiveTab(feat.id)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 relative ${isSelected ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            {isSelected && (
                                                <motion.div 
                                                    layoutId="activeTabBackground"
                                                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                />
                                            )}
                                            <Icon className={`h-3.5 w-3.5 relative z-10 ${isSelected ? 'text-signal-orange' : ''}`} />
                                            <span className="relative z-10">{feat.title}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Dynamic Panel Content */}
                            <div className="py-6 flex-1 flex flex-col justify-between">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-zinc-300">
                                                {currentFeature.badge}
                                            </span>
                                        </div>
                                        <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                            {currentFeature.description}
                                        </p>

                                         {/* Mockup Previews */}
                                         <div className="mt-4 p-5 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col gap-3">
                                             {(() => {
                                                 const mockup = currentFeature.mockup as any;
                                                 if (activeTab === 'garage') {
                                                     return (
                                                         <>
                                                             <div className="flex justify-between items-start">
                                                                 <div>
                                                                     <div className="font-black text-lg italic uppercase text-white tracking-tight">{mockup.title}</div>
                                                                     <div className="text-xs text-zinc-500 font-mono mt-0.5">{mockup.spec}</div>
                                                                 </div>
                                                                 <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                                                                     {mockup.status}
                                                                 </span>
                                                             </div>
                                                             <div className="h-px bg-white/5 my-1" />
                                                             <div className="space-y-2">
                                                                 {mockup.logs?.map((log: any, i: number) => (
                                                                     <div key={i} className="flex justify-between text-xs">
                                                                         <span className="text-zinc-400 font-mono"><span className="text-signal-orange">[{log.type}]</span> {log.label}</span>
                                                                         <span className="text-white font-bold">{log.cost}</span>
                                                                     </div>
                                                                 ))}
                                                             </div>
                                                         </>
                                                     );
                                                 }
                                                 if (activeTab === 'convoys') {
                                                     return (
                                                         <>
                                                             <div>
                                                                 <div className="font-black text-lg italic uppercase text-white tracking-tight">{mockup.title}</div>
                                                                 <div className="text-xs text-signal-orange font-bold mt-1 flex items-center gap-1">
                                                                     <MapPin className="h-3 w-3" /> {mockup.location}
                                                                 </div>
                                                             </div>
                                                             <div className="flex flex-wrap gap-2 mt-2">
                                                                 {mockup.tags?.map((t: string, i: number) => (
                                                                     <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] text-zinc-400 font-bold">
                                                                         #{t}
                                                                     </span>
                                                                 ))}
                                                             </div>
                                                             <div className="text-xs text-zinc-500 font-mono pt-2 border-t border-white/5 mt-2 flex justify-between">
                                                                 <span>{mockup.date}</span>
                                                                 <span className="text-white font-bold">{mockup.attendees}</span>
                                                             </div>
                                                         </>
                                                     );
                                                 }
                                                 if (activeTab === 'tribes') {
                                                     return (
                                                         <div className="space-y-3">
                                                             {mockup.groups?.map((g: any, i: number) => (
                                                                 <div key={i} className="flex justify-between items-center bg-white/2 p-3 rounded-xl border border-white/5">
                                                                     <div className="font-bold text-white text-xs">{g.name}</div>
                                                                     <div className="flex gap-3 text-[10px] text-zinc-500 font-mono">
                                                                         <span>{g.members}</span>
                                                                         <span className="text-green-500">{g.active}</span>
                                                                     </div>
                                                                 </div>
                                                             ))}
                                                         </div>
                                                     );
                                                 }
                                                 if (activeTab === 'marketplace') {
                                                     return (
                                                         <>
                                                             <div className="flex justify-between items-start">
                                                                 <div>
                                                                     <div className="font-black text-lg italic uppercase text-white tracking-tight">{mockup.title}</div>
                                                                     <div className="text-xs text-zinc-500 font-mono mt-0.5">{mockup.mileage} • {mockup.history}</div>
                                                                 </div>
                                                                 <span className="px-2 py-0.5 bg-signal-orange/10 border border-signal-orange/20 text-signal-orange text-[10px] font-bold rounded">
                                                                     {mockup.badge}
                                                                 </span>
                                                             </div>
                                                             <div className="h-px bg-white/5 my-1" />
                                                             <div className="flex justify-between items-center">
                                                                 <span className="text-zinc-500 text-xs font-mono">Asking Price</span>
                                                                 <span className="text-xl font-black text-white">{mockup.price}</span>
                                                             </div>
                                                         </>
                                                     );
                                                 }
                                                 return null;
                                             })()}
                                         </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Floating decorative lights */}
                            <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-signal-orange/10 rounded-full blur-2xl pointer-events-none" />
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-12 bg-zinc-950/40 border-t border-white/5 relative z-10 w-full mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left space-y-1">
                        <h3 className="text-xl font-black tracking-tighter text-white uppercase italic">CRANKD</h3>
                        <p className="text-zinc-500 text-xs">© 2026 Crankd Inc. Built with passion for the machine.</p>
                    </div>
                    <div className="flex gap-6 text-xs font-bold text-zinc-500">
                        <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
                        <Link href="/signup" className="hover:text-white transition-colors">Register</Link>
                        <Link href="/dashboard" className="text-signal-orange hover:text-orange-400 transition-colors">Dealer Portal</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
