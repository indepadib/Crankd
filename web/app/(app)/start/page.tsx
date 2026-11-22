'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CarFront, Check, Package, ShoppingBag, Store, UserRound, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

type Snapshot = { vehicleCount:number; sellerActive:boolean; shopName:string; listingCount:number; loading:boolean };

export default function MySpacePage() {
  const {user,session,loading:authLoading,authError} = useAuth();
  const [snapshot,setSnapshot] = useState<Snapshot>({vehicleCount:0,sellerActive:false,shopName:'',listingCount:0,loading:true});
  const [tab,setTab] = useState<'driver'|'merchant'>('driver');

  useEffect(()=>{
    if(!user || !session?.access_token || authError) return;
    let mounted=true;
    void (async()=>{
      const [cars,shop,listings]=await Promise.all([
        supabase.from('vehicles').select('id',{head:true,count:'exact'}).eq('owner_id',user.id),
        supabase.from('part_sellers').select('shop_name,status').eq('seller_id',user.id).maybeSingle(),
        supabase.from('part_listings').select('id',{head:true,count:'exact'}).eq('seller_id',user.id),
      ]);
      if(!mounted)return;
      setSnapshot({
        vehicleCount:cars.error?0:cars.count||0,
        sellerActive:!shop.error&&shop.data?.status==='active',
        shopName:shop.data?.shop_name||'',
        listingCount:listings.error?0:listings.count||0,
        loading:false,
      });
      setTab(shop.data?.status==='active'||user.user_metadata?.account_intent==='sell'?'merchant':'driver');
    })();
    return()=>{mounted=false;};
  },[user,session?.access_token,authError]);

  if(authLoading)return <div role="status" className="py-20 text-center text-sm text-zinc-400">Ouverture de ton espace…</div>;
  if(!user)return <div className="mx-auto max-w-xl space-y-5 py-10 text-center"><h1 className="text-2xl font-black text-white">Connecte-toi pour personnaliser VROOQ</h1><Link href="/login" className="inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">Se connecter</Link></div>;
  const actions = tab==='driver' ? [
    {number:'1',title:'Ajoute ta voiture',detail:'Avec les caractéristiques de ta carte grise marocaine.',href:'/garage/add',done:snapshot.vehicleCount>0,button:'Mon garage'},
    {number:'2',title:'Trouve une pièce',detail:'Recherche par marque, référence constructeur et motorisation déclarée.',href:'/marketplace/parts',done:false,button:'Voir les pièces'},
    {number:'3',title:'Rejoins des passionnés',detail:'Découvre les clubs en lien avec ton véhicule.',href:'/communities',done:false,button:'Les clubs'},
  ] : [
    {number:'1',title:'Active ta boutique',detail:'Gratuit pendant le pilote, sans abonnement ni paiement réel.',href:'/marketplace/parts/sell',done:snapshot.sellerActive,button:'Ma boutique'},
    {number:'2',title:'Dépose une pièce',detail:'Photo, état et référence OEM, prix obligatoirement en DH.',href:'/marketplace/parts/new',done:snapshot.listingCount>0,button:'Publier une pièce'},
    {number:'3',title:'Suis les demandes',detail:'Les demandes sont enregistrées dans VROOQ. Pas encore d’encaissement.',href:'/marketplace/parts/orders',done:false,button:'Voir les demandes'},
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-20">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">VROOQ Maroc · Mon espace</p>
        <h1 className="text-3xl font-black text-white sm:text-4xl">Bienvenue {user.user_metadata?.first_name||user.user_metadata?.username||''}.</h1>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">Ton compte fonctionne pour les deux usages. Choisis un espace ci-dessous pour retrouver directement les actions utiles.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Choisir son espace VROOQ">
        <button type="button" onClick={()=>setTab('driver')} aria-pressed={tab==='driver'} className={'flex items-start gap-3 rounded-2xl border p-5 text-left '+(tab==='driver'?'border-orange-500/60 bg-orange-500/10':'border-white/10 bg-white/[0.03]')}>
          <CarFront className="mt-1 h-6 w-6 text-orange-400"/><span><strong className="block text-lg text-white">Mon Garage</strong><span className="mt-1 block text-xs leading-5 text-zinc-400">Automobiliste · pièces · clubs</span><span className="mt-2 block text-xs text-orange-300">{snapshot.vehicleCount} voiture(s) enregistrée(s)</span></span>
        </button>
        <button type="button" onClick={()=>setTab('merchant')} aria-pressed={tab==='merchant'} className={'flex items-start gap-3 rounded-2xl border p-5 text-left '+(tab==='merchant'?'border-orange-500/60 bg-orange-500/10':'border-white/10 bg-white/[0.03]')}>
          <Store className="mt-1 h-6 w-6 text-orange-400"/><span><strong className="block text-lg text-white">Ma Boutique</strong><span className="mt-1 block text-xs leading-5 text-zinc-400">Vendeur · annonces · demandes</span><span className="mt-2 block text-xs text-orange-300">{snapshot.sellerActive?'Boutique active':'Boutique à activer'} · {snapshot.listingCount} annonce(s)</span></span>
        </button>
      </div>
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-black text-white">{tab==='driver'?'Mes prochaines actions':'Mon parcours vendeur'}</h2><span className="text-xs text-zinc-400">{snapshot.loading?'Actualisation…':'Informations de mon compte'}</span></div>
        {actions.map(item=>(
          <div key={item.number} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#1d1e20] p-4 sm:p-5">
            <div className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black '+(item.done?'bg-emerald-400/10 text-emerald-300':'bg-orange-500/10 text-orange-300')}>{item.done?<Check className="h-5 w-5"/>:item.number}</div>
            <div className="min-w-[170px] flex-1"><p className="text-sm font-bold text-white">{item.title}</p><p className="mt-1 text-xs leading-5 text-zinc-400">{item.detail}</p></div>
            <Link href={item.href} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-white hover:border-orange-400/50">{item.button}<ArrowRight className="h-4 w-4"/></Link>
          </div>
        ))}
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/garage" className="flex items-center gap-2 rounded-xl border border-white/10 p-4 text-xs font-bold text-zinc-300 hover:text-white"><CarFront className="h-4 w-4"/> Garage</Link>
        <Link href="/marketplace/parts" className="flex items-center gap-2 rounded-xl border border-white/10 p-4 text-xs font-bold text-zinc-300 hover:text-white"><ShoppingBag className="h-4 w-4"/> Pièces</Link>
        <Link href="/feed" className="flex items-center gap-2 rounded-xl border border-white/10 p-4 text-xs font-bold text-zinc-300 hover:text-white"><Users className="h-4 w-4"/> Actualités</Link>
        <Link href="/profile" className="flex items-center gap-2 rounded-xl border border-white/10 p-4 text-xs font-bold text-zinc-300 hover:text-white"><UserRound className="h-4 w-4"/> Mon profil</Link>
      </div>
      <p className="flex items-start gap-2 text-xs leading-6 text-zinc-500"><Package className="mt-1 h-4 w-4 shrink-0"/> L’activation de la boutique ne signifie pas identité vérifiée. Les paiements et expéditions restent en préparation tant que les prestataires ne sont pas intégrés.</p>
    </div>
  );
}
