'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';

function SignupFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [username, setUsername] = useState(() => searchParams.get('username')?.replace(/\s+/g, '') || '');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [city, setCity] = useState('');
    const [accountIntent, setAccountIntent] = useState<'buy' | 'sell' | 'explore'>('explore');
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const envMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (envMissing) {
            setError('Database connection is missing. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Netlify settings.');
            return;
        }

        if (firstName.trim().length < 2 || lastName.trim().length < 2 || city.trim().length < 2 || contactPhone.trim().length < 9) {
            setError('Complète ton prénom, ton nom, ton téléphone et ta ville.');
            return;
        }
        if (password.length < 8) {
            setError('Utilise un mot de passe d’au moins 8 caractères.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: { 
                        username, 
                        full_name: username,
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        contact_phone: contactPhone.trim(),
                        city: city.trim(),
                        account_intent: accountIntent,
                        marketing_opt_in: marketingConsent 
                    }
                }
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                if (data.session) {
                    router.replace(accountIntent === 'sell' ? '/marketplace/parts/sell' : accountIntent === 'buy' ? '/marketplace/parts' : '/feed');
                } else {
                    setSuccess(true);
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
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
                <h3 className="text-2xl font-black text-white uppercase italic">Vérifie ton e-mail</h3>
                <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                    Confirme ton adresse e-mail puis connecte-toi pour accéder à ton garage.
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
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Créer mon compte</h2>
                <p className="text-zinc-500 text-sm mt-1">Inscris-toi pour rejoindre VROOQ et retrouver ta voiture, tes annonces et la communauté.</p>
            </div>

            {envMissing && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3 text-xs text-orange-400">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <div>
                        <span className="font-bold block mb-1">Configuration Needed</span>
                        This deploy is running in offline mock mode. To connect, define your Supabase credentials in Netlify&apos;s Environment Variables.
                    </div>
                </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-zinc-300">Prénom *
                        <input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-orange-500" value={firstName} onChange={e=>setFirstName(e.target.value)} autoComplete="given-name" minLength={2} maxLength={70} required placeholder="Prénom"/>
                    </label>
                    <label className="text-xs font-semibold text-zinc-300">Nom *
                        <input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-orange-500" value={lastName} onChange={e=>setLastName(e.target.value)} autoComplete="family-name" minLength={2} maxLength={70} required placeholder="Nom"/>
                    </label>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-zinc-300">Téléphone *
                        <input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-orange-500" type="tel" value={contactPhone} onChange={e=>setContactPhone(e.target.value)} autoComplete="tel" minLength={9} maxLength={20} required placeholder="+212 6…"/>
                    </label>
                    <label className="text-xs font-semibold text-zinc-300">Ville *
                        <input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-orange-500" value={city} onChange={e=>setCity(e.target.value)} autoComplete="address-level2" minLength={2} maxLength={100} required placeholder="Casablanca"/>
                    </label>
                </div>
                <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-zinc-300">Ton objectif sur VROOQ</legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                        {([
                            ['buy', 'Acheter des pièces'],
                            ['sell', 'Vendre des pièces'],
                            ['explore', 'Communauté auto']
                        ] as const).map(([value,label])=>(
                            <label key={value} className={"flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold " + (accountIntent===value?"border-orange-500 bg-orange-500/10 text-white":"border-white/10 text-zinc-300")}>
                                <input type="radio" name="account_intent" checked={accountIntent===value} onChange={()=>setAccountIntent(value)} className="accent-orange-500"/>{label}
                            </label>
                        ))}
                    </div>
                    {accountIntent==='sell' && <p className="text-xs leading-5 text-orange-200">Après inscription, tu pourras activer gratuitement ta boutique. La vérification vendeur est distincte.</p>}
                </fieldset>
                {/* Username */}
                <div className="space-y-1.5">
                    <label htmlFor="signup-username" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pseudo</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-signal-orange transition-colors" />
                        <input
                            id="signup-username"
                            type="text"
                            autoComplete="username"
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
                    <label htmlFor="signup-email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-signal-orange transition-colors" />
                        <input
                            id="signup-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 focus:bg-white/10 transition-all font-semibold"
                        />
                    </div>
                </div>

                {/* Mot de passe */}
                <div className="space-y-1.5">
                    <label htmlFor="signup-password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mot de passe</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-signal-orange transition-colors" />
                        <input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Au moins 8 caractères"
                            className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 focus:bg-white/10 transition-all font-semibold"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <label className="flex items-start gap-3 text-xs leading-5 text-zinc-400">
                    <input type="checkbox" checked={marketingConsent} onChange={e=>setMarketingConsent(e.target.checked)} className="mt-0.5 accent-orange-500"/>
                    Je souhaite recevoir des actualités et offres VROOQ. Ce choix est facultatif.
                </label>
                <p className="text-[11px] leading-5 text-zinc-500">Ton prénom, nom, téléphone et ville sont réservés à la gestion de ton compte. Ton pseudo est public. Tu pourras choisir de rejoindre des clubs automobile après avoir ajouté ta voiture.</p>
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
                        <>Créer mon compte <ArrowRight className="h-4 w-4" /></>
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
