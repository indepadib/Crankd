'use client';

import { Image as ImageIcon, Car, Calendar, ArrowUpRight, X, Upload, Sparkles, Command } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import { MouseEvent, useRef } from 'react';

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 50 } }
};

function TiltCard({ opt }: { opt: any }) {
    const ref = useRef<HTMLDivElement>(null);

    // Mouse Motion Values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth Spring Physics
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    // Tilt Transforms
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    // Spotlight Gradient Position
    const spotlightX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const spotlightY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

    function onMouseMove(e: MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        // Normalize mouse position (-0.5 to 0.5)
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = (e.clientX - rect.left - width / 2) / width;
        const mouseYVal = (e.clientY - rect.top - height / 2) / height;

        x.set(mouseXVal);
        y.set(mouseYVal);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={ref}
            variants={item}
            className="h-full perspective-1000"
            style={{ perspective: 1000 }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        >
            <Link href={opt.href} className="block h-full group">
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d"
                    }}
                    className="relative h-full transition-shadow duration-500 rounded-[2rem]"
                >
                    {/* --- SPOTLIGHT GLOW BORDER --- */}
                    <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br from-white/20 to-white/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />

                    {/* --- OUTER SHELL --- */}
                    <div className="relative h-full bg-[#0a0a0a]/90 backdrop-blur-xl rounded-[1.9rem] p-8 border border-white/5 overflow-hidden shadow-2xl group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-shadow duration-500">

                        {/* Dynamic Mouse Spotlight */}
                        <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{
                                background: useMotionTemplate`radial-gradient(400px circle at ${spotlightX} ${spotlightY}, rgba(255,255,255,0.06), transparent 80%)`
                            }}
                        />

                        {/* Top Gradient Highlight */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                        {/* --- 3D FLOATING CONTENT --- */}
                        <div style={{ transform: "translateZ(20px)" }} className="relative z-10 flex flex-col h-full">

                            {/* Floating Icon */}
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${opt.accent} p-[1px] mb-8 shadow-lg ${opt.shadow} group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                                <div className="w-full h-full bg-black/40 backdrop-blur-md rounded-[0.9rem] flex items-center justify-center">
                                    <opt.icon className="h-8 w-8 text-white" />
                                </div>
                            </div>

                            {/* Floating Text */}
                            <div className="mt-auto">
                                <h3 className="text-3xl font-black text-white italic tracking-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">
                                    {opt.title}
                                </h3>
                                <p className="text-text-dim font-medium leading-relaxed group-hover:text-white/80 transition-colors">
                                    {opt.description}
                                </p>
                            </div>

                            {/* Floating Action Button */}
                            <div className="absolute top-0 right-0">
                                <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-lg">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        {/* Decorative Tech Lines */}
                        <div className="absolute bottom-6 right-6 flex gap-1 items-end opacity-20 group-hover:opacity-60 transition-opacity">
                            <div className="w-1 h-1 bg-white rounded-full" />
                            <div className="w-1 h-3 bg-white rounded-full" />
                            <div className="w-1 h-2 bg-white rounded-full" />
                        </div>

                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

export default function CreatePage() {
    const router = useRouter();

    const OPTIONS = [
        {
            id: 'post',
            title: 'New Post',
            description: 'Share a build update, spot, or media.',
            icon: ImageIcon,
            accent: 'from-blue-500 to-indigo-600',
            shadow: 'shadow-blue-500/20',
            href: '#'
        },
        {
            id: 'listing',
            title: 'List Vehicle',
            description: 'Sell your machine or parts on the market.',
            icon: Car,
            accent: 'from-orange-500 to-red-600',
            shadow: 'shadow-orange-500/20',
            href: '/marketplace/create'
        },
        {
            id: 'event',
            title: 'Host Event',
            description: 'Organize a meet, drive, or track day.',
            icon: Calendar,
            accent: 'from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/20',
            href: '/convoys/create'
        }
    ];

    return (
        <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
            {/* --- CINEMATIC BACKGROUND --- */}
            <div className="absolute inset-0 bg-[#050505] z-0">
                {/* Breathing Ambient Glows */}
                <motion.div
                    animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1.1, 1, 1.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-orange-900/10 rounded-full blur-[100px]"
                />

                {/* Hex Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
                        maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                    }}
                />

                {/* Vignette */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/50 to-black pointer-events-none" />
            </div>

            {/* --- CONTENT --- */}
            <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 py-12">

                {/* Header Row */}
                <div className="flex justify-between items-start mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="flex items-center gap-3 mb-2 text-white/50 text-xs font-mono uppercase tracking-[0.2em]">
                            <Sparkles className="w-3 h-3 text-signal-orange animate-pulse" />
                            <span>System Ready</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">
                            Create<span className="text-signal-orange">.</span>
                        </h1>
                    </motion.div>

                    <button
                        onClick={() => router.back()}
                        className="group relative h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden hover:border-white/30 transition-all active:scale-95"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <X className="h-6 w-6 text-white relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Main Action Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 perspective-1000"
                >
                    {OPTIONS.map((opt) => (
                        <TiltCard key={opt.id} opt={opt} />
                    ))}
                </motion.div>

                {/* Secondary Actions / Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    {/* Big Drag & Drop Zone */}
                    <div className="md:col-span-3 relative group cursor-pointer overflow-hidden rounded-3xl bg-white/5 border border-dashed border-white/10 hover:border-signal-orange/50 hover:bg-white/10 transition-all duration-300">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        {/* Scanning Line Animation */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-[1.5s] ease-in-out pointer-events-none" />

                        <div className="relative p-10 flex items-center gap-8">
                            <div className="h-20 w-20 rounded-full bg-carbon border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-signal-orange transition-all duration-300 shadow-xl">
                                <Upload className="h-8 w-8 text-white/50 group-hover:text-signal-orange transition-colors" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white mb-1 group-hover:text-signal-orange transition-colors">Quick Upload</h4>
                                <p className="text-text-dim text-sm">Drag & drop media anywhere to start</p>
                            </div>

                            <div className="ml-auto hidden md:block">
                                <span className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white/50 flex items-center gap-2 group-hover:text-white transition-colors">
                                    <Command className="h-3 w-3" /> V to Paste
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats / Info */}
                    <div className="md:col-span-1 rounded-3xl bg-gradient-to-br from-carbon to-black border border-white/5 p-8 flex flex-col justify-between group hover:border-white/20 transition-colors relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="text-[10px] font-mono text-signal-orange uppercase tracking-wider">
                                Daily Quota
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-black text-white">4/10</div>
                            <div className="w-full bg-white/10 h-1 rounded-full mt-4 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "40%" }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    className="h-full bg-signal-orange rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
