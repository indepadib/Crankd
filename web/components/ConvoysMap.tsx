'use client';

import { MapPin, Route } from 'lucide-react';

interface ConvoysMapProps {
    events?: { id: string; title: string; attendees: number; type: 'meet' | 'drive' | 'track' }[];
}

export function ConvoysMap({ events = [] }: ConvoysMapProps) {
    return (
        <section className="flex h-full min-h-[340px] flex-col justify-center gap-5 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 text-white">
            <Route className="h-10 w-10 text-orange-400" aria-hidden="true" />
            <h2 className="text-2xl font-black">Préparez votre prochaine sortie</h2>
            <p className="max-w-lg text-sm leading-6 text-zinc-300">Les événements publiés affichent leur véritable lieu de rendez-vous et leur heure de départ. Une carte géographique ne sera proposée que lorsque les organisateurs auront renseigné des coordonnées vérifiables.</p>
            <div className="flex items-center gap-2 text-sm text-zinc-400"><MapPin className="h-4 w-4" /> {events.length} sortie(s) à venir</div>
            <p className="text-xs text-zinc-500">Aucune position fictive n’est affichée.</p>
        </section>
    );
}
