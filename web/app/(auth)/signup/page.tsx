'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';

function SignupFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [envMissing, setEnvMissing] = useState(false);

    useEffect(() => {
        // Pre-populate username if present in the URL query
        const urlUsername = searchParams.get('username');
        if (urlUsername) {
            setUsername(urlUsername);
        }
        
        // Check if environment variables are missing
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            setEnvMissing(true);
        }
    }, [searchParams]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (envMissing) {
            setError('Database connection is missing. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Netlify settings.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { 
                        username, 
                        full_name: username 
                    }
                }
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                setSuccess(true);
                setTimeout(() => router.push('/feed'), 2000);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
            >
                <div className="text-5xl animate-bounce">🏎️</div>
                <h3 className="text-2xl font-black text-white uppercase italic">Registration Sent!</h3>
                <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                    Check your email inbox to confirm your account. Redirecting you to your feed...
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Create Garage</h2>
                <p className="text-zinc-500 text-sm mt-1">Claim your driver tag and start tracking builds.</p>
            </div>

            {envMissing && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3 text-xs text-orange-400">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <div>
                        <span className="font-bold block mb-1">Configuration Needed</span>
                        This deploy is running in offline mock mode. To connect, define your Supabase credentials in Netlify's Environment Variables.
                    </div>
                </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Driver Username</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-signal-orange transition-colors" />
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value.replace(/\s+/g, ''))}
                            required
                            placeholder="DriftKing"
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 focus:bg-white/10 transition-all font-semibold"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-signal-orange transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 focus:bg-white/10 transition-all font-semibold"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-signal-orange transition-colors" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Min. 6 characters"
                            className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 focus:bg-white/10 transition-all font-semibold"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold leading-relaxed">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-signal-orange text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-signal-orange-dim transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(249,115,22,0.15)]"
                >
                    {loading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Create Account <ArrowRight className="h-4 w-4" /></>
                    )}
                </button>
            </form>

            <div className="h-px bg-white/5 my-6" />

            <p className="text-zinc-500 text-xs text-center font-semibold">
                Already registered?{' '}
                <Link href="/login" className="text-signal-orange hover:text-orange-400 transition-colors">
                    Sign In
                </Link>
            </p>
        </motion.div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="text-zinc-500 text-center py-8">Loading...</div>}>
            <SignupFormContent />
        </Suspense>
    );
}
