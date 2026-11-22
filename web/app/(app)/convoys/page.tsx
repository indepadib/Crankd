'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { ConvoysMap } from '@/components/ConvoysMap';
import { EventCard } from '@/components/EventCard';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DetailModal } from '@/components/ui/DetailModal';

export default function ConvoysPage() {
    const { user } = useAuth();
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [meetingPlace, setMeetingPlace] = useState('');
    const [startsAt, setStartsAt] = useState('');
    const [feedback, setFeedback] = useState('');
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal details
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('vrooq_events')
            .select('id,title,description,meeting_place,starts_at,capacity,status,organizer_id')
            .eq('status', 'published').gte('starts_at', new Date().toISOString())
            .order('starts_at', { ascending: true }).limit(100);
        if (error) setFeedback('Les événements sont temporairement indisponibles.');
        setEvents((data || []).map(event => {
            const start = new Date(event.starts_at);
            return {
                id: event.id,
                title: event.title,
                date: start.toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: start.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' }),
                location: event.meeting_place,
                image: '',
                attendees: 0,
                type: 'drive' as const,
                body: event.description,
                organizer_id: event.organizer_id
            };
        }));
        setLoading(false);
    };

    const createEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) { setFeedback('Connectez-vous pour organiser un convoi.'); return; }
        const start = new Date(startsAt);
        if (!title.trim() || !meetingPlace.trim() || !startsAt || Number.isNaN(start.getTime()) || start <= new Date()) {
            setFeedback('Renseignez un titre, un lieu et une date future.'); return;
        }
        const { error } = await supabase.from('vrooq_events').insert({
            organizer_id: user.id, title: title.trim(), meeting_place: meetingPlace.trim(),
            starts_at: start.toISOString()
        });
        if (error) { setFeedback('Création impossible : ' + error.message); return; }
        setCreating(false); setTitle(''); setMeetingPlace(''); setStartsAt('');
        setFeedback('Sortie publiée.'); await fetchEvents();
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Convoys
                    </h1>
                    <p className="text-text-dim text-sm">
                        Découvrez les sorties et rassemblements réellement publiés par la communauté.
                    </p>
                </div>
                <button 
                    onClick={() => setCreating(value => !value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Créer une sortie
                </button>
            </div>

            {feedback && <p role="status" className="mb-4 rounded-xl border border-white/15 p-3 text-sm text-white">{feedback}</p>}
            {creating && <form onSubmit={createEvent} className="mb-5 grid gap-3 rounded-2xl border border-white/15 bg-white/5 p-5 sm:grid-cols-2">
                <label className="text-xs text-white">Titre<input required minLength={5} maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-800 p-3 text-white" /></label>
                <label className="text-xs text-white">Lieu de rendez-vous<input required minLength={3} value={meetingPlace} onChange={e=>setMeetingPlace(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-800 p-3 text-white" /></label>
                <label className="text-xs text-white">Départ (heure locale)<input required type="datetime-local" value={startsAt} onChange={e=>setStartsAt(e.target.value)} className="mt-1 w-full rounded-lg bg-zinc-800 p-3 text-white" /></label>
                <button type="submit" className="self-end rounded-xl bg-orange-500 p-3 font-bold text-black">Publier la sortie</button>
            </form>}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* LEFT: Event List (Scrollable) */}
                <div className="lg:col-span-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Événements publiés</h3>

                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {loading ? (
                            <div className="py-20 text-center text-zinc-500 font-bold">Chargement des événements…</div>
                        ) : events.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-300">Aucun convoi publié pour le moment. Proposez la première sortie à la communauté.</div>
                        ) : (
                            events.map(event => (
                                <EventCard 
                                    key={event.id} 
                                    event={event} 
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setIsModalOpen(true);
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Map Interface (Full Height) */}
                <div className="lg:col-span-2 min-h-[400px]">
                    <ConvoysMap events={events} />
                </div>

            </div>

            {/* Dynamic Event Details Modal */}
            <DetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type="convoy"
                data={selectedEvent}
                onActionSuccess={fetchEvents}
            />
        </div>
    );
}
