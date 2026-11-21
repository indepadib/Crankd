'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Compass, HelpCircle, ShoppingBag, Store, Wrench, X } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

type Goal = 'buy' | 'sell' | 'explore';
type Step = { title: string; detail: string; location: string; href: string; button: string };

const TUTORIAL_VERSION = 'v1';

const GOALS: { id: Goal; title: string; detail: string; icon: typeof ShoppingBag }[] = [
  { id: 'buy', title: 'Trouver une pièce', detail: 'Rechercher une pièce d’occasion compatible avec ma voiture.', icon: ShoppingBag },
  { id: 'sell', title: 'Vendre une pièce', detail: 'Créer une boutique, publier et suivre mes demandes.', icon: Store },
  { id: 'explore', title: 'Découvrir VROOQ', detail: 'Ajouter ma voiture, partager et rejoindre des passionnés.', icon: Compass },
];

const STEPS: Record<Goal, Step[]> = {
  buy: [
    { title: 'Rechercher une pièce', detail: 'Ouvre Market → Pièces. Cherche par nom, référence OEM, marque ou ville. Tu peux filtrer les résultats.', location: 'Market → Pièces automobiles', href: '/marketplace/parts', button: 'Voir les pièces' },
    { title: 'Ajouter sa voiture', detail: 'Dans Garage, enregistre ton véhicule. Tu pourras ensuite filtrer les pièces selon le modèle et l’année déclarés.', location: 'Garage → Mon garage', href: '/garage', button: 'Ouvrir mon garage' },
    { title: 'Retrouver ses commandes', detail: 'Chaque demande est enregistrée dans Mes commandes. Tant que le paiement sécurisé n’est pas activé, aucune somme n’est débitée.', location: 'Market → Pièces → Mes commandes', href: '/marketplace/parts/orders', button: 'Mes commandes' },
  ],
  sell: [
    { title: 'Activer sa boutique', detail: 'Crée gratuitement ton compte vendeur. Indique ton nom public, ta ville et tes conditions de retour.', location: 'Market → Pièces → Ma boutique', href: '/marketplace/parts/sell', button: 'Créer ma boutique' },
    { title: 'Publier une pièce', detail: 'Ajoute des photos réelles, l’état, les défauts connus, la référence OEM, la compatibilité et le prix en dirhams.', location: 'Market → Pièces → Vendre une pièce', href: '/marketplace/parts/new', button: 'Déposer une pièce' },
    { title: 'Suivre ses ventes', detail: 'Dans Mes annonces, ajuste le stock et les prix. Dans Mes commandes, réponds aux demandes. N’expédie pas sans confirmation de paiement VROOQ.', location: 'Market → Pièces → Mes annonces', href: '/marketplace/parts/mine', button: 'Mes annonces' },
  ],
  explore: [
    { title: 'Commencer par son garage', detail: 'Ajoute ta voiture et personnalise ton profil. Ton garage deviendra ta référence dans la communauté.', location: 'Garage → Ajouter un véhicule', href: '/garage', button: 'Mon garage' },
    { title: 'Découvrir la communauté', detail: 'Dans Feed, explore les publications des passionnés. Utilise le bouton + pour partager une photo ou un projet.', location: 'Feed → Bouton +', href: '/feed', button: 'Voir le feed' },
    { title: 'Rencontrer les passionnés', detail: 'Retrouve les communautés par centre d’intérêt et les sorties auto dans Convoys. Les onglets sont dans le menu sur ordinateur.', location: 'Communities / Convoys', href: '/communities', button: 'Les communautés' },
  ],
};

export function ActivationGuide() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [opened, setOpened] = useState(false);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [step, setStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const visitedUserRef = useRef('');

  useEffect(() => {
    if (loading || !user) return;
    if (visitedUserRef.current === user.id) return;
    visitedUserRef.current = user.id;
    const key = 'vrooq-guide-' + TUTORIAL_VERSION + '-' + user.id;
    let complete = false;
    try { complete = window.localStorage.getItem(key) === 'done'; } catch { /* storage blocked */ }
    const raf = window.requestAnimationFrame(() => {
      setOpened(!complete);
      setHasSeenGuide(complete);
      setStep(0);
      setGoal(null);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [user, loading]);

  useEffect(() => {
    if (!opened) return;
    headingRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGuide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // closeGuide only writes the current user's completion key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, step, goal, user?.id]);

  function closeGuide() {
    if (user) {
      try { window.localStorage.setItem('vrooq-guide-' + TUTORIAL_VERSION + '-' + user.id, 'done'); }
      catch { /* private browsing */ }
    }
    setOpened(false);
    setHasSeenGuide(true);
  }

  function replayGuide() {
    setGoal(null);
    setStep(0);
    setOpened(true);
  }

  function chooseGoal(selected: Goal) {
    setGoal(selected);
    setStep(0);
  }

  function openPage(href: string) {
    const isLast = goal !== null && step === STEPS[goal].length - 1;
    if (isLast) closeGuide();
    else setStep((current) => current + 1);
    if (pathname !== href) router.push(href);
  }

  if (!user || loading) return null;
  const activeSteps = goal ? STEPS[goal] : [];
  const active = goal ? activeSteps[step] : null;

  return (
    <>
      {!opened && hasSeenGuide && (
        <button
          type="button"
          onClick={replayGuide}
          aria-label="Revoir le guide VROOQ"
          title="Comment utiliser VROOQ ?"
          className="fixed bottom-24 right-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#242426] text-white shadow-xl transition-colors hover:bg-[#343437] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 md:bottom-6 md:right-6"
        >
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {opened && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 px-4 py-6 backdrop-blur-sm" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="vrooq-guide-title"
            aria-describedby="vrooq-guide-detail"
            className="my-auto w-full max-w-lg rounded-[28px] border border-white/15 bg-[#191a1d] p-5 text-white shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">VROOQ · Guide de démarrage</span>
              <button type="button" onClick={closeGuide} aria-label="Fermer le guide" className="rounded-full border border-white/10 p-2 text-zinc-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"><X className="h-5 w-5" /></button>
            </div>
            {!goal ? (
              <>
                <p className="text-xs font-medium text-zinc-400">Moins d’une minute pour commencer</p>
                <h2 id="vrooq-guide-title" tabIndex={-1} ref={headingRef} className="mt-2 text-2xl font-black tracking-tight focus:outline-none sm:text-3xl">Bienvenue sur VROOQ.</h2>
                <p id="vrooq-guide-detail" className="mt-3 text-sm leading-6 text-zinc-300">Tout est organisé autour de ta voiture. Qu’aimerais-tu faire en premier ?</p>
                <div className="mt-6 space-y-3">
                  {GOALS.map(({ id, title, detail, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => chooseGoal(id)} className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition-colors hover:border-orange-400/60 hover:bg-orange-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400"><Icon className="h-5 w-5" /></span>
                      <span className="flex-1"><span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-xs leading-5 text-zinc-400">{detail}</span></span>
                      <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-orange-400" />
                    </button>
                  ))}
                </div>
              </>
            ) : active && (
              <>
                <div className="flex items-center justify-between text-xs text-zinc-400"><span>Étape {step + 1} sur {activeSteps.length}</span><span>Tu peux revenir à ce guide à tout moment</span></div>
                <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">{activeSteps.map((_, index) => <span key={index} className={'h-1 rounded-full ' + (index <= step ? 'bg-orange-500' : 'bg-white/15')} />)}</div>
                <h2 id="vrooq-guide-title" tabIndex={-1} ref={headingRef} className="mt-6 text-2xl font-black tracking-tight focus:outline-none sm:text-3xl">{active.title}</h2>
                <p id="vrooq-guide-detail" className="mt-3 text-sm leading-7 text-zinc-300">{active.detail}</p>
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-xs font-medium text-orange-200">
                  <Wrench className="h-4 w-4 shrink-0" aria-hidden="true" /> Où aller : {active.location}
                </div>
                <button type="button" onClick={() => openPage(active.href)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-black transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                  {active.button} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <button type="button" onClick={() => { if (step === 0) setGoal(null); else setStep((s) => s - 1); }} className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Retour</button>
                  <button type="button" onClick={() => {
                    if (step === activeSteps.length - 1) closeGuide();
                    else setStep((s) => s + 1);
                  }} className="inline-flex items-center gap-1 text-sm font-bold text-white hover:text-orange-400">
                    {step === activeSteps.length - 1 ? <><Check className="h-4 w-4" /> Terminer</> : <>Étape suivante <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </>
            )}
            <button type="button" onClick={closeGuide} className="mt-6 w-full text-center text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline">Passer le guide</button>
          </section>
        </div>
      )}
    </>
  );
}
