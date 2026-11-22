'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Car, Check, ChevronLeft, CircleHelp, Compass, ShoppingBag, Store, X } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

type Goal = 'buy' | 'sell' | 'explore';
type GuideStep = { title: string; detail: string; href: string; action: string };
type SavedGuide = { goal: Goal | null; step: number; dismissed: boolean };
const VERSION = 'v2';

const journeys: Record<Goal, GuideStep[]> = {
  buy: [
    { title: 'Retrouve la pièce', detail: 'Cherche par nom ou référence OEM. Les résultats sont de vraies annonces publiées.', href: '/marketplace/parts', action: 'Ouvrir les pièces' },
    { title: 'Ajoute ta voiture', detail: 'Une fois ton véhicule enregistré, le filtre Mon garage aide à trouver les annonces déclarées compatibles.', href: '/garage/add', action: 'Ajouter ma voiture' },
    { title: 'Suis ta demande', detail: 'Retrouve tes demandes dans Mes commandes. Aucun paiement réel n’est activé actuellement.', href: '/marketplace/parts/orders', action: 'Voir mes commandes' },
  ],
  sell: [
    { title: 'Active ta boutique', detail: 'Renseigne tes coordonnées vendeur. L’activation est gratuite et distincte de la vérification d’identité.', href: '/marketplace/parts/sell', action: 'Activer ma boutique' },
    { title: 'Publie une vraie pièce', detail: 'Ajoute les photos de la pièce, son état, son prix et la référence OEM si elle est disponible.', href: '/marketplace/parts/new', action: 'Publier une pièce' },
    { title: 'Gère tes annonces', detail: 'Modifie les prix et le stock, puis retrouve les demandes reçues dans Mes commandes.', href: '/marketplace/parts/mine', action: 'Mes annonces' },
  ],
  explore: [
    { title: 'Commence par ton garage', detail: 'Enregistre la marque, le modèle et l’année de ta voiture.', href: '/garage/add', action: 'Ajouter ma voiture' },
    { title: 'Trouve ta communauté', detail: 'Découvre les clubs liés à ta voiture ; rejoindre un club est ton choix.', href: '/communities', action: 'Voir les clubs' },
    { title: 'Partage une publication', detail: 'Les vraies publications sont visibles dans le fil après enregistrement réussi.', href: '/create?type=post', action: 'Créer une publication' },
  ],
};
const goals: { id: Goal; title: string; icon: typeof Car }[] = [
  { id: 'buy', title: 'Chercher une pièce', icon: ShoppingBag },
  { id: 'sell', title: 'Vendre mes pièces', icon: Store },
  { id: 'explore', title: 'Découvrir la communauté', icon: Compass },
];

export function ActivationGuide() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [opened, setOpened] = useState(false);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const previousUser = useRef<string | null>(null);

  const key = user ? 'vrooq-tour-' + VERSION + '-' + user.id : '';
  useEffect(() => {
    if (loading) return;
    if (!user) {
      previousUser.current = null;
      return;
    }
    if (previousUser.current === user.id) return;
    previousUser.current = user.id;
    let saved: SavedGuide | null = null;
    try {
      const raw = localStorage.getItem('vrooq-tour-' + VERSION + '-' + user.id);
      if (raw) saved = JSON.parse(raw) as SavedGuide;
    } catch { /* Storage can be unavailable on private devices. */ }
    const nextGoal = saved?.goal && journeys[saved.goal] ? saved.goal : null;
    const nextStep = nextGoal ? Math.min(Math.max(saved?.step ?? 0, 0), journeys[nextGoal].length - 1) : 0;
    const frame = window.requestAnimationFrame(() => {
      setGoal(nextGoal);
      setStep(nextStep);
      setOpened(!saved?.dismissed);
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, user]);

  function save(nextGoal: Goal | null, nextStep: number, dismissed: boolean) {
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify({ goal: nextGoal, step: nextStep, dismissed })); }
    catch { /* Privacy mode: navigation still works. */ }
  }
  function choose(nextGoal: Goal) {
    setGoal(nextGoal);
    setStep(0);
    save(nextGoal, 0, false);
  }
  function close() {
    setOpened(false);
    save(goal, step, true);
  }
  function reopen() {
    setOpened(true);
    save(goal, step, false);
  }
  function advance(navigate: boolean) {
    if (!goal) return;
    const path = journeys[goal][step].href;
    const nextStep = step + 1;
    if (nextStep >= journeys[goal].length) {
      setOpened(false);
      save(goal, step, true);
    } else {
      setStep(nextStep);
      save(goal, nextStep, false);
    }
    if (navigate) router.push(path);
  }

  if (!user || loading || !ready) return null;
  const current = goal ? journeys[goal][step] : null;

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+6.6rem)] z-[65] flex justify-end md:bottom-6 md:right-6 md:left-auto">
      {!opened ? (
        <button
          type="button" onClick={reopen} aria-label="Afficher le guide VROOQ"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-[#212225] px-4 py-3 text-sm font-bold text-white shadow-xl hover:border-orange-400/60"
        >
          <CircleHelp className="h-5 w-5 text-orange-400" /> Besoin d’aide ?
        </button>
      ) : (
        <aside aria-label="Assistant de démarrage VROOQ" className="pointer-events-auto max-h-[min(62dvh,460px)] w-full max-w-[370px] overflow-y-auto rounded-[22px] border border-orange-500/30 bg-[#1a1b1d] p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-orange-400">Guide interactif · VROOQ</p>
              <h2 className="mt-1 text-base font-black">{current ? current.title : 'Qu’est-ce que tu veux faire ?'}</h2>
            </div>
            <button onClick={close} aria-label="Réduire le guide" type="button" className="rounded-lg border border-white/10 p-2 text-zinc-300 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
          {!goal ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs leading-5 text-zinc-400">Choisis ton objectif. Le guide reste petit pour te laisser utiliser le site.</p>
              {goals.map(({id,title,icon:Icon}) => (
                <button type="button" key={id} onClick={() => choose(id)} className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm font-semibold hover:border-orange-400/60">
                  <Icon className="h-4 w-4 text-orange-400" />{title}<ArrowRight className="ml-auto h-4 w-4 text-zinc-500" />
                </button>
              ))}
            </div>
          ) : current && (
            <>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-400"><span>Étape {step + 1} / {journeys[goal].length}</span><span>{pathname === current.href.split('?')[0] ? 'Tu es sur la bonne page' : 'Tu peux naviguer librement'}</span></div>
              <div className="mt-2 flex gap-1.5" aria-hidden="true">{journeys[goal].map((_,index)=><span key={index} className={'h-1.5 flex-1 rounded-full '+(index<=step?'bg-orange-500':'bg-white/15')}/>)}</div>
              <p className="mt-3 text-xs leading-6 text-zinc-300">{current.detail}</p>
              <button type="button" onClick={() => advance(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-black hover:bg-orange-400">
                {current.action}<ArrowRight className="h-4 w-4" />
              </button>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button type="button" onClick={() => { if(step===0){setGoal(null);save(null,0,false);}else{setStep(step-1);save(goal,step-1,false);} }} className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"><ChevronLeft className="h-4 w-4"/>Retour</button>
                <button type="button" onClick={() => advance(false)} className="inline-flex items-center gap-1 text-xs text-zinc-200 hover:text-orange-400">{step === journeys[goal].length - 1 ? 'Terminer' : 'Étape suivante'}<Check className="h-3.5 w-3.5"/></button>
              </div>
            </>
          )}
          <p className="mt-3 border-t border-white/10 pt-2 text-[11px] leading-4 text-zinc-500">Ce guide ne bloque pas l’écran. Ferme-le ou reviens à tout moment.</p>
        </aside>
      )}
    </div>
  );
}
