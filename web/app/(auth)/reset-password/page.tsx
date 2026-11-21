'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type RecoveryState = 'checking' | 'ready' | 'invalid' | 'complete';

export default function ResetPasswordPage() {
    const [state, setState] = useState<RecoveryState>('checking');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        // Supabase processes the recovery URL during client initialization.
        // Listen before checking the current session so we cannot miss that event.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!active) return;
            if ((event === 'PASSWORD_RECOVERY' || event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session) {
                setState(current => current === 'complete' ? current : 'ready');
            }
        });

        supabase.auth.getSession().then(({ data, error: sessionError }) => {
            if (!active) return;
            if (sessionError || !data.session) {
                setState(current => current === 'ready' || current === 'complete' ? current : 'invalid');
            } else {
                setState(current => current === 'complete' ? current : 'ready');
            }
        }).catch(() => {
            if (active) setState(current => current === 'ready' || current === 'complete' ? current : 'invalid');
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        setError(null);
        if (password.length < 8) {
            setError('Utilise au moins 8 caractères.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        setSubmitting(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            setPassword('');
            setConfirmPassword('');
            setState('complete');
            // An account is safer when a recovery session does not remain active.
            await supabase.auth.signOut();
        } catch (cause) {
            if (state !== 'complete') {
                setError(cause instanceof Error ? cause.message : 'Could not update the password. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="space-y-6" aria-labelledby="new-password-heading">
            <div className="space-y-2">
                <h1 id="new-password-heading" className="text-3xl font-black uppercase italic tracking-tight text-white">
                    Nouveau mot de passe
                </h1>
                <p className="text-sm leading-relaxed text-zinc-400">
                    Choisis un mot de passe solide pour protéger ton compte VROOQ.
                </p>
            </div>

            {state === 'checking' && <p role="status" className="text-sm text-zinc-400">Vérification du lien…</p>}
            {state === 'invalid' && (
                <div role="alert" className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-zinc-300">Ce lien a expiré ou n’est plus valide. Demande un nouveau lien.</p>
                    <Link href="/forgot-password" className="inline-flex items-center gap-2 font-semibold text-signal-orange">
                        Demander un nouveau lien <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            )}
            {state === 'complete' && (
                <div role="status" className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="font-semibold text-white">Ton mot de passe a été mis à jour.</p>
                    <p className="text-sm text-zinc-400">Connecte-toi avec ton nouveau mot de passe.</p>
                    <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-signal-orange">
                        Se connecter <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            )}
            {state === 'ready' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nouveau mot de passe</label>
                        <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                            <input id="new-password" name="new-password" type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password" minLength={8} required disabled={submitting}
                                value={password} onChange={event => setPassword(event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-sm text-white focus-visible:border-signal-orange focus-visible:outline-none"
                            />
                            <button type="button" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                onClick={() => setShowPassword(value => !value)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-zinc-400">Confirmer le mot de passe</label>
                        <input id="confirm-password" name="confirm-password" type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password" minLength={8} required disabled={submitting}
                            value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus-visible:border-signal-orange focus-visible:outline-none"
                        />
                    </div>
                    {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
                    <button type="submit" disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-signal-orange px-5 py-3 font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                        {submitting ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
                        {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                    </button>
                </form>
            )}
        </section>
    );
}
