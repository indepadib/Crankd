'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CarFront, FilePlus2, PackagePlus, Plus, X } from 'lucide-react';

const ACTIONS = [
    { title: 'Vendre une pièce', detail: 'Publier une pièce d’occasion', href: '/marketplace/parts/new', icon: PackagePlus },
    { title: 'Ajouter ma voiture', detail: 'Compléter mon garage', href: '/garage/add', icon: CarFront },
    { title: 'Partager une publication', detail: 'Photo, projet ou actualité auto', href: '/create?type=post', icon: FilePlus2 },
    { title: 'Vendre un véhicule', detail: 'Déposer une annonce voiture', href: '/create?type=listing', icon: CarFront },
    { title: 'Organiser une sortie', detail: 'Créer un événement automobile', href: '/create?type=event', icon: CalendarDays },
];

export function QuickCreateMenu() {
    const [open, setOpen] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const focusId = requestAnimationFrame(() => closeRef.current?.focus());
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onEscape);
        return () => {
            cancelAnimationFrame(focusId);
            window.removeEventListener('keydown', onEscape);
            triggerRef.current?.focus();
        };
    }, [open]);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-label="Choisir une action à créer"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-orange text-white shadow-[0_0_24px_rgba(249,115,22,0.45)] transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
                <Plus className="h-7 w-7" strokeWidth={2.5} aria-hidden="true" />
            </button>
            {open && (
                <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 px-3 pb-3 backdrop-blur-sm" onClick={() => setOpen(false)}>
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="quick-create-title"
                        className="w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-[28px] border border-white/15 bg-[#191a1d] p-5 text-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 id="quick-create-title" className="text-xl font-black">Qu’aimerais-tu faire ?</h2>
                                <p className="mt-1 text-xs leading-5 text-zinc-400">Choisis une action pour aller directement au bon endroit.</p>
                            </div>
                            <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="rounded-xl border border-white/15 p-2 text-zinc-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"><X className="h-5 w-5"/></button>
                        </div>
                        <div className="space-y-2">
                            {ACTIONS.map(({title,detail,href,icon:Icon})=>(
                                <Link
                                    href={href}
                                    key={href}
                                    onClick={() => setOpen(false)}
                                    className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 transition-colors hover:border-orange-500/45 hover:bg-orange-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400"><Icon className="h-5 w-5" aria-hidden="true"/></span>
                                    <span className="flex-1"><span className="block text-sm font-bold">{title}</span><span className="mt-0.5 block text-xs text-zinc-400">{detail}</span></span>
                                </Link>
                            ))}
                        </div>
                        <p className="mt-4 text-center text-xs text-zinc-500">Les nouvelles publications ne sont visibles par les autres membres qu’après enregistrement réussi.</p>
                    </section>
                </div>
            )}
        </>
    );
}
