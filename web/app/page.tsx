'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { PhoneMockup } from '@/components/PhoneMockup';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as any }
    }),
};

export default function Home() {
    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            <Navbar />

            {/* ── HERO ── */}
            <section className="relative pt-36 pb-24 md:pt-52 md:pb-36">
                {/* Ambient Orbs */}
                <div className="absolute top-[-15%] left-[-5%] w-[55%] h-[65%] bg-orange-600/10 blur-[160px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-5%] right-[-8%] w-[45%] h-[55%] bg-blue-700/8 blur-[180px] rounded-full pointer-events-none" />
                <div className="absolute top-[30%] left-[40%] w-[25%] h-[30%] bg-purple-700/8 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">

                    {/* Left: Copy */}
                    <div className="text-center lg:text-left">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-300 text-xs font-semibold mb-10 backdrop-blur-sm"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-signal-orange animate-pulse" />
                            v1.0 is now live for iOS & Android
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0.1}
                            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.88] text-white"
                        >
                            THE PULSE<br />
                            OF{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 animate-gradient bg-300%">
                                CAR CULTURE.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0.25}
                            className="text-lg md:text-xl text-zinc-400 mb-12 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light"
                        >
                            Discover unique builds, mint your garage on-chain, and join the world's most exclusive automotive marketplace.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0.4}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            {/* App Store Button */}
                            <button className="group relative px-7 py-3.5 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                                <span className="text-xl leading-none">🍎</span>
                                <div className="flex flex-col items-start leading-none gap-0.5">
                                    <span className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Download on the</span>
                                    <span className="text-base font-bold">App Store</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            {/* Play Store Button */}
                            <button className="group px-7 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/8 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]">
                                <span className="text-xl leading-none">🤖</span>
                                <div className="flex flex-col items-start leading-none gap-0.5">
                                    <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Get it on</span>
                                    <span className="text-base font-bold">Google Play</span>
                                </div>
                            </button>
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0.55}
                            className="mt-12 flex items-center gap-4 justify-center lg:justify-start"
                        >
                            <div className="flex -space-x-2">
                                {['#F97316', '#3B82F6', '#8B5CF6', '#10B981'].map((c, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505]" style={{ background: c }} />
                                ))}
                            </div>
                            <p className="text-sm text-zinc-500">
                                <span className="text-white font-bold">12,400+</span> enthusiasts already in
                            </p>
                        </motion.div>
                    </div>

                    {/* Right: Phone */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex justify-center lg:justify-end relative"
                    >
                        <div className="relative animate-float">
                            <PhoneMockup />
                        </div>
                        {/* Glow behind phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[480px] bg-gradient-to-tr from-orange-500/25 to-purple-600/15 blur-[80px] rounded-full -z-10" />
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600"
                >
                    <div className="w-px h-10 bg-gradient-to-b from-transparent to-zinc-600" />
                </motion.div>
            </section>

            {/* ── BENTO GRID ── */}
            <section className="py-32 border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-16 text-center"
                    >
                        <p className="text-signal-orange text-xs font-bold uppercase tracking-[0.2em] mb-4">Everything You Need</p>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5">Built for enthusiasts.</h2>
                        <p className="text-zinc-500 text-lg max-w-lg mx-auto">One platform for your entire automotive life.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Large: Verified Garage */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="md:col-span-2 rounded-3xl bg-zinc-900/50 border border-white/8 p-8 relative overflow-hidden group min-h-[320px] flex flex-col justify-between"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6">💎</div>
                                <h3 className="text-2xl font-bold mb-3">Verified Garage</h3>
                                <p className="text-zinc-400 leading-relaxed max-w-sm">Mint your vehicle's history on the blockchain. Service records, modifications, and ownership history become immutable assets.</p>
                            </div>
                            <div className="relative z-10 mt-6 p-4 bg-zinc-950/60 rounded-2xl border border-white/5 font-mono text-[11px] text-blue-400/50 leading-relaxed">
                                <div>0x7f23a4b9c1e...</div>
                                <div className="text-white/20">Block: 19284372 • Minted: ✓</div>
                                <div className="text-white/20">Owner: 0xDriftKing.eth</div>
                            </div>
                        </motion.div>

                        {/* Algorithm */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="rounded-3xl bg-zinc-900/50 border border-white/8 p-8 relative overflow-hidden group min-h-[320px] flex flex-col justify-between"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-orange-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-signal-orange/15 border border-signal-orange/20 text-signal-orange flex items-center justify-center text-2xl mb-6">🔥</div>
                                <h3 className="text-2xl font-bold mb-3">Algorithm</h3>
                                <p className="text-zinc-400">A feed that actually understands cars.</p>
                            </div>
                            <div className="relative z-10 flex items-end justify-center gap-1.5 h-24 mt-6">
                                {[35, 75, 45, 95, 55, 70, 40, 85].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-signal-orange/30 group-hover:bg-signal-orange/50 rounded-t-md transition-all duration-500"
                                        style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Marketplace */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="rounded-3xl bg-zinc-900/50 border border-white/8 p-8 group relative overflow-hidden min-h-[200px] flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4">🤝</div>
                                <h3 className="text-xl font-bold mb-2">Marketplace</h3>
                                <p className="text-zinc-400 text-sm">No scams. No middlemen. Just cars.</p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">Verified Sellers</span>
                                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-xs">$2.3M+ traded</span>
                            </div>
                        </motion.div>

                        {/* Direct Chat */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="rounded-3xl bg-zinc-900/50 border border-white/8 p-8 group relative overflow-hidden min-h-[200px] flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-4">💬</div>
                                <h3 className="text-xl font-bold mb-2">Direct Chat</h3>
                                <p className="text-zinc-400 text-sm">Talk to sellers and builders instantly.</p>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <div className="w-5 h-5 rounded-full bg-blue-500" />
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-blue-500/30 rounded-full" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <div className="w-5 h-5 rounded-full bg-purple-500" />
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-1/2 bg-purple-500/30 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Convoys */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="rounded-3xl bg-gradient-to-br from-signal-orange/10 to-transparent border border-signal-orange/20 p-8 group relative overflow-hidden min-h-[200px] flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-signal-orange/15 border border-signal-orange/30 text-signal-orange flex items-center justify-center text-xl mb-4">📍</div>
                                <h3 className="text-xl font-bold mb-2">Convoys</h3>
                                <p className="text-zinc-400 text-sm">Organize and join local drives with your tribe.</p>
                            </div>
                            <Link
                                href="/signup"
                                className="mt-4 w-full py-2.5 bg-signal-orange text-white font-bold rounded-xl text-sm text-center hover:bg-signal-orange-dim transition-colors block"
                            >
                                Find a Convoy →
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── CTA SECTION ── */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-signal-orange/5 to-transparent pointer-events-none" />
                <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-signal-orange text-xs font-bold uppercase tracking-[0.2em] mb-6">The Machine is the Hero</p>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-white">
                            Your car deserves a <span className="text-gradient-orange">digital soul.</span>
                        </h2>
                        <p className="text-zinc-500 text-lg mb-12 max-w-xl mx-auto">
                            Join thousands of enthusiasts who are building the future of automotive culture.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-3 px-10 py-4 bg-signal-orange text-white font-black text-lg rounded-2xl hover:bg-signal-orange-dim transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(249,115,22,0.3)]"
                        >
                            Get Early Access
                            <span className="text-xl">→</span>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-16 bg-zinc-950 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-black tracking-tighter mb-1">CRANKD</h3>
                        <p className="text-zinc-600 text-sm">© 2026 Crankd Inc. The Digital Soul of Your Machine.</p>
                    </div>
                    <div className="flex gap-8 text-sm font-bold text-zinc-500">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="hover:text-white transition-colors">Discord</a>
                        <Link href="/dashboard" className="text-signal-orange hover:text-orange-400 transition-colors">Dealer Portal</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
