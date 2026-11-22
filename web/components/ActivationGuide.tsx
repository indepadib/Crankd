'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Check, ChevronLeft, CircleHelp, RefreshCw, Store, CarFront, Users, X } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';

type Goal = 'buy' | 'sell' | 'explore';
type CheckKey = 'catalog' | 'vehicle' | 'orders' | 'seller' | 'part' | 'communities' | 'post';
type Step = {title:string; why:string; href:string; button:string; check:CheckKey};
type Progress = Record<CheckKey,boolean>;
const emptyProgress: Progress = {catalog:false,vehicle:false,orders:false,seller:false,part:false,communities:false,post:false};
const guideVersion = 'v3';

const journeys: Record<Goal,Step[]> = {
  buy:[
    {title:'Choisis une pièce',why:'Dans Pièces, recherche par modèle ou référence OEM. Tu verras uniquement de vraies annonces.',href:'/marketplace/parts',button:'Ouvrir les pièces',check:'catalog'},
    {title:'Ajoute ta voiture',why:'Renseigne ton véhicule avec les informations techniques de sa carte grise marocaine.',href:'/garage/add',button:'Ajouter ma voiture',check:'vehicle'},
    {title:'Retrouve tes demandes',why:'Toutes tes demandes de pièces se consultent ici. Aucun paiement réel n’est encore actif.',href:'/marketplace/parts/requests',button:'Mes demandes de devis',check:'orders'},
  ],
  sell:[
    {title:'Active ta boutique',why:'Ton compte VROOQ peut aussi vendre des pièces. Crée gratuitement ton espace vendeur.',href:'/marketplace/parts/sell',button:'Activer ma boutique',check:'seller'},
    {title:'Publie ta première pièce',why:'Ajoute photos réelles, prix en DH, référence et compatibilité déclarée.',href:'/marketplace/parts/new',button:'Publier une pièce',check:'part'},
    {title:'Gère ton activité',why:'Suis les demandes dans ton espace vendeur. N’expédie rien avant paiement confirmé.',href:'/marketplace/parts/inbox',button:'Boîte à devis',check:'orders'},
  ],
  explore:[
    {title:'Ajoute ta voiture',why:'Enregistre ton véhicule pour personnaliser le garage et les recommandations de clubs.',href:'/garage/add',button:'Mon garage',check:'vehicle'},
    {title:'Découvre tes clubs',why:'Des clubs sont proposés selon ta voiture. Ton adhésion reste facultative.',href:'/communities',button:'Voir les clubs',check:'communities'},
    {title:'Publie une photo',why:'Partage une vraie publication visible par les membres après validation de l’enregistrement.',href:'/create?type=post',button:'Créer un post',check:'post'},
  ],
};
const goals: {id:Goal;label:string;icon:typeof Store}[] = [
  {id:'buy',label:'Acheter une pièce',icon:CarFront},
  {id:'sell',label:'Vendre des pièces',icon:Store},
  {id:'explore',label:'Clubs & communauté',icon:Users},
];

function storageKey(userId:string) {return 'vrooq-guided-'+guideVersion+'-'+userId;}
export function ActivationGuide() {
  const {user,session,loading,authError} = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [opened,setOpened] = useState(false);
  const [goal,setGoal] = useState<Goal|null>(null);
  const [step,setStep] = useState(0);
  const [progress,setProgress] = useState<Progress>(emptyProgress);
  const [checking,setChecking] = useState(false);
  const [ready,setReady] = useState(false);
  const loadedUser = useRef<string|null>(null);
  const key = user ? storageKey(user.id) : '';

  useEffect(()=>{
    if(loading||!user) return;
    if(loadedUser.current===user.id) return;
    loadedUser.current=user.id;
    let saved: {goal?:Goal;step?:number;dismissed?:boolean}|null = null;
    try {saved=JSON.parse(localStorage.getItem(storageKey(user.id)) || 'null');}catch{}
    const storedGoal = saved?.goal && journeys[saved.goal] ? saved.goal : (user.user_metadata?.account_intent==='sell'?'sell': 'buy');
    const storedStep = Math.max(0,Math.min(Number(saved?.step)||0,journeys[storedGoal].length-1));
    const frame=requestAnimationFrame(()=>{
      setGoal(storedGoal);
      setStep(storedStep);
      setOpened(!saved?.dismissed);
      setReady(true);
    });
    return ()=>cancelAnimationFrame(frame);
  },[user,loading]);

  const refresh = useCallback(async()=>{
    if(!user || !session?.access_token || authError) return;
    setChecking(true);
    try {
      const [cars,shop,parts,posts] = await Promise.all([
        supabase.from('vehicles').select('id',{head:true,count:'exact'}).eq('owner_id',user.id),
        supabase.from('part_sellers').select('status').eq('seller_id',user.id).maybeSingle(),
        supabase.from('part_listings').select('id',{head:true,count:'exact'}).eq('seller_id',user.id).eq('status','active'),
        supabase.from('posts').select('id',{head:true,count:'exact'}).eq('author_id',user.id),
      ]);
      const visited = (path:string)=>{
        try {return localStorage.getItem('vrooq-guide-visit-'+user.id+'-'+path)==='yes';}catch{return false;}
      };
      setProgress({
        vehicle:!cars.error && (cars.count||0)>0,
        seller:!shop.error && shop.data?.status==='active',
        part:!parts.error && (parts.count||0)>0,
        post:!posts.error && (posts.count||0)>0,
        catalog:visited('catalog'),
        orders:visited('orders'),
        communities:visited('communities'),
      });
    } finally {setChecking(false);}
  },[user,session?.access_token,authError]);

  useEffect(()=>{
    if(!user || !ready) return;
    const visit = (pathname.startsWith('/marketplace/parts/requests')||pathname.startsWith('/marketplace/parts/inbox'))?'orders':
      pathname==='/marketplace/parts'?'catalog':
      pathname.startsWith('/communities')?'communities':null;
    if(visit){
      try {localStorage.setItem('vrooq-guide-visit-'+user.id+'-'+visit,'yes');}catch{}
    }
    void refresh();
  },[pathname,user,ready,refresh]);

  function persist(nextGoal:Goal|null,nextStep:number,dismissed:boolean){
    if(!key)return;
    try {localStorage.setItem(key,JSON.stringify({goal:nextGoal,step:nextStep,dismissed}));}catch{}
  }
  function changeGoal(next:Goal){
    setGoal(next);setStep(0);persist(next,0,false);
  }
  function hide(){setOpened(false);persist(goal,step,true);}
  function open(){setOpened(true);persist(goal,step,false);void refresh();}
  function next(){
    if(!goal)return;
    const n=step+1;
    if(n>=journeys[goal].length){hide();return;}
    setStep(n);persist(goal,n,false);
  }
  function back(){
    if(!goal)return;
    if(step===0){setGoal(null);persist(null,0,false);}
    else {setStep(step-1);persist(goal,step-1,false);}
  }
  if(!user || !ready || loading || authError)return null;
  const steps=goal?journeys[goal]:null;
  const current=steps?.[step];
  const finished=steps?.filter(s=>progress[s.check]).length||0;
  return(
    <div className="pointer-events-none fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+6.8rem)] z-[65] flex justify-end md:bottom-5 md:right-5 md:left-auto">
      {!opened?(
        <button type="button" onClick={open} aria-label="Ouvrir le guide VROOQ" className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-[#242527] px-4 py-3 text-xs font-bold text-white shadow-xl hover:border-orange-500/50">
          <CircleHelp className="h-4 w-4 text-orange-400"/> Mon guide {goal && <span className="text-orange-400">{finished}/{journeys[goal].length}</span>}
        </button>
      ):(
        <section aria-label="Guide VROOQ interactif" className="pointer-events-auto max-h-[min(58dvh,400px)] w-full max-w-[345px] overflow-y-auto rounded-[22px] border border-orange-500/30 bg-[#191a1d] p-4 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-2">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">Mon guide interactif</p><h2 className="mt-1 text-base font-black">{current?.title || 'Que souhaites-tu faire ?'}</h2></div>
            <button type="button" aria-label="Réduire le guide" onClick={hide} className="rounded-lg p-2 text-zinc-300 hover:bg-white/10"><X className="h-4 w-4"/></button>
          </div>
          {!goal?(
            <div className="mt-4 space-y-2">{goals.map(({id,label,icon:Icon})=>(
              <button type="button" key={id} onClick={()=>changeGoal(id)} className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm font-bold hover:border-orange-500/40"><Icon className="h-4 w-4 text-orange-400"/>{label}<ArrowRight className="ml-auto h-4 w-4"/></button>
            ))}</div>
          ):current&&steps&&(
            <>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-400"><span>Étape {step+1}/{steps.length}</span><span>{finished} action(s) réalisée(s)</span></div>
              <div className="mt-2 flex gap-1.5">{steps.map((item,index)=><span key={index} className={'h-1.5 flex-1 rounded-full '+(progress[item.check]?'bg-emerald-400':index===step?'bg-orange-500':'bg-white/15')}/>)}</div>
              <p className="mt-3 text-xs leading-6 text-zinc-300">{current.why}</p>
              <div aria-live="polite" className={'mt-2 flex items-center gap-2 text-xs '+(progress[current.check]?'text-emerald-300':'text-orange-300')}>
                {progress[current.check]?<Check className="h-4 w-4"/>:<CircleHelp className="h-4 w-4"/>}
                {progress[current.check]?'Action réellement effectuée':'À faire dans VROOQ'}
              </div>
              <button type="button" onClick={()=>router.push(current.href)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-black">{current.button}<ArrowRight className="h-4 w-4"/></button>
              <div className="mt-3 flex items-center justify-between">
                <button type="button" onClick={back} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"><ChevronLeft className="h-4 w-4"/>Retour</button>
                <button type="button" onClick={()=>void refresh()} disabled={checking} className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white"><RefreshCw className={'h-3.5 w-3.5 '+(checking?'animate-spin':'')}/>Vérifier</button>
                <button type="button" onClick={next} className="flex items-center gap-1 text-xs font-bold text-orange-300 hover:text-orange-200">{step===steps.length-1?'Terminer':'Suivant'}<ArrowRight className="h-3.5 w-3.5"/></button>
              </div>
            </>
          )}
          <button type="button" onClick={()=>{setGoal(null);setStep(0);persist(null,0,false);}} className="mt-3 border-t border-white/10 pt-3 text-xs text-zinc-500 hover:text-white">Changer d’objectif</button>
        </section>
      )}
    </div>
  );
}
