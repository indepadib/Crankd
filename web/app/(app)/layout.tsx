'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dock } from '@/components/Dock';
import { ActivationGuide } from '@/components/ActivationGuide';
import { SessionHealthNotice } from '@/components/SessionHealthNotice';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { authError } = useAuth();
    return (
        <div className="min-h-screen bg-carbon text-text-main">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Bottom Dock */}
            <Dock />

            {/* Show once per signed-in member; replay with the help icon. */}
            <ActivationGuide />

            <SessionHealthNotice />

            {/* Main Content */}
            <main className="md:pl-24 pb-24 md:pb-0 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
                    {authError ? (
                        <section className="mx-auto mt-12 max-w-xl space-y-4 rounded-3xl border border-amber-400/20 bg-white/[0.04] p-6 text-center">
                            <h1 className="text-2xl font-black text-white">Connexion à rétablir</h1>
                            <p className="text-sm leading-6 text-zinc-300">Le jeton de connexion est expiré. Tes données restent enregistrées. Utilise « Réessayer » en haut de l’écran ou reconnecte-toi pour reprendre.</p>
                            <Link href="/" className="inline-flex rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Retour à l’accueil</Link>
                        </section>
                    ) : children}
                </div>
            </main>
        </div>
    );
}
