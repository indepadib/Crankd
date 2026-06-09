
import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-black">
            {/* Left Side: Visual / Content */}
            <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
                {/* Background Video/Image Placeholder */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2930&auto=format&fit=crop"
                        alt="Background"
                        className="h-full w-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-lg">
                    <Link href="/" className="inline-block mb-12">
                        <span className="text-4xl font-black italic tracking-tighter text-white">VROOQ.</span>
                    </Link>
                    <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-6 leading-tight">
                        Fuel Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Obsession.</span>
                    </h1>
                    <p className="text-xl text-zinc-400 font-medium">
                        Join the most exclusive network of automotive enthusiasts, builders, and collectors.
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 text-sm font-bold text-zinc-500">
                        <span>© 2026 Vrooq Inc.</span>
                        <Link href="/terms" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col items-center justify-center p-6 lg:p-24 bg-carbon border-l border-white/5 relative">
                {/* Mobile Header */}
                <div className="lg:hidden absolute top-8 left-8">
                    <Link href="/" className="text-2xl font-black italic tracking-tighter text-white">VROOQ.</Link>
                </div>

                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}
