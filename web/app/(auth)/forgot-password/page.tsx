'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError(null);

        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                throw new Error('Password recovery is temporarily unavailable. Please try again later.');
            }

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (resetError) throw resetError;
            // Supabase deliberately does not disclose whether an email is registered.
            setSent(true);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not send the recovery email. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="space-y-6" aria-labelledby="recovery-heading">
            <div className="space-y-2">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-orange">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to sign in
                </Link>
                <h1 id="recovery-heading" className="text-3xl font-black uppercase italic tracking-tight text-white">
                    Reset your password
                </h1>
                <p className="text-sm leading-relaxed text-zinc-400">
                    Enter your account email. We&apos;ll send you a secure link to choose a new password.
                </p>
            </div>

            {sent ? (
                <div role="status" className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                    <h2 className="font-bold text-white">Check your inbox</h2>
                    <p className="text-sm leading-relaxed text-zinc-400">
                        If an account exists for that address, you&apos;ll receive a recovery email shortly.
                        Check your spam folder as well.
                    </p>
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-signal-orange hover:text-orange-400">
                        Return to sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="recovery-email" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                            <input id="recovery-email" type="email" name="email" autoComplete="email"
                                value={email} onChange={(event) => setEmail(event.target.value)}
                                required disabled={submitting} placeholder="you@example.com"
                                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus-visible:border-signal-orange focus-visible:outline-none"
                            />
                        </div>
                    </div>
                    {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
                    <button type="submit" disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-signal-orange px-5 py-3 font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                        {submitting ? 'Sending…' : 'Send recovery link'}
                        {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                    </button>
                </form>
            )}
        </section>
    );
}
