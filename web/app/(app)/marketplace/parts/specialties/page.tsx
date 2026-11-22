'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Store, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { PART_CATEGORIES, readableError } from '@/lib/parts';

type Spec={seller_id:string;category:string;brands:string[]};
export default function SellerSpecialtiesPage(){
  const {user,session,loading:authLoading,authError}=useAuth();
  const [shopActive,setShopActive]=useState<boolean|null>(null);
  const [selected,setSelected]=useState<string[]>([]);
  const [brandText,setBrandText]=useState('');
  const [loadedSpecs,setLoadedSpecs]=useState<Spec[]>([]);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!user||!session?.access_token||authError)return;
    let mounted=true;
    void (async()=>{
      const [seller,existing]=await Promise.all([
        supabase.from('part_sellers').select('status').eq('seller_id',user.id).maybeSingle(),
        supabase.from('part_seller_specialties').select('seller_id,category,brands').eq('seller_id',user.id),
      ]);
      if(!mounted)return;
      setShopActive(!seller.error&&seller.data?.status==='active');
      if(existing.error){setError('Impossible de charger les spécialités vendeur.');return;}
      const rows=(existing.data||[]) as Spec[];
      setLoadedSpecs(rows);
      setSelected(rows.map(s=>s.category));
      // If categories have differing brand limits, an empty common setting would
      // broaden them; require the seller to choose explicitly before overwriting.
      const first=rows[0]?.brands||[];
      const same=rows.every(row=>JSON.stringify(row.brands||[])===JSON.stringify(first));
      setBrandText(same?first.join(', '):'');
    })();
    return()=>{mounted=false;};
  },[user,session?.access_token,authError]);

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!user||saving||!shopActive)return;
    const brands=Array.from(new Set(brandText.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean)));
    if(!selected.length){setError('Sélectionne au moins une catégorie de pièces.');return;}
    if(brands.length>40||brands.some(b=>b.length>90)){setError('Limite de 40 marques, 90 caractères par nom.');return;}
    setSaving(true);setError('');setMessage('');
    try{
      const {data:identity,error:authFailure}=await supabase.auth.getUser();
      if(authFailure||identity.user?.id!==user.id)throw new Error('Reconnecte-toi.');
      const rows=selected.map(category=>({seller_id:user.id,category,brands,updated_at:new Date().toISOString()}));
      const {error:upsertError}=await supabase.from('part_seller_specialties').upsert(rows,{onConflict:'seller_id,category'});
      if(upsertError)throw upsertError;
      const removed=loadedSpecs.map(x=>x.category).filter(c=>!selected.includes(c));
      if(removed.length){
        const {error:removeError}=await supabase.from('part_seller_specialties').delete().eq('seller_id',user.id).in('category',removed);
        if(removeError)throw removeError;
      }
      // A successful write response alone is not proof of persistence. Read back
      // the authoritative state before displaying a success confirmation.
      const {data:verified,error:verifyError}=await supabase.from('part_seller_specialties')
        .select('seller_id,category,brands').eq('seller_id',user.id);
      if(verifyError)throw verifyError;
      const actual=(verified||[]) as Spec[];
      const expectedCategories=[...selected].sort();
      const actualCategories=actual.map(item=>item.category).sort();
      const expectedBrands=[...brands].sort();
      const persisted=JSON.stringify(expectedCategories)===JSON.stringify(actualCategories) &&
        actual.every(item=>JSON.stringify([...(item.brands||[])].sort())===JSON.stringify(expectedBrands));
      if(!persisted)throw new Error('Les catégories enregistrées ne correspondent pas à ta sélection. Actualise la page avant de réessayer.');
      setLoadedSpecs(actual);
      setMessage('Spécialités enregistrées et vérifiées. Les nouvelles demandes correspondant à tes catégories seront visibles dans ta boîte à devis.');
    }catch(cause){setError('Enregistrement non confirmé : '+readableError(cause));}
    finally{setSaving(false);}
  }

  return <div className="mx-auto max-w-3xl space-y-6 pb-20">
    <Link href="/marketplace/parts/sell" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4"/> Ma boutique</Link>
    <header className="space-y-2"><p className="text-xs font-bold uppercase tracking-widest text-orange-400">VROOQ Pro · Maroc</p>
      <h1 className="text-3xl font-black text-white">Quelles pièces peux-tu trouver ?</h1>
      <p className="text-sm leading-6 text-zinc-400">Déclare tes familles de pièces et, si nécessaire, les marques que tu prends en charge. Les demandes pertinentes apparaîtront automatiquement dans ta boîte à devis, sans révéler le téléphone du demandeur.</p>
    </header>
    {authLoading||shopActive===null?<p className="text-sm text-zinc-400">Vérification de ta boutique…</p>:!shopActive?
      <section className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6 text-sm text-zinc-300">
        Active d’abord ta boutique de pièces. <Link href="/marketplace/parts/sell" className="font-bold text-orange-300 underline">Configurer ma boutique</Link>
      </section>:
      <form onSubmit={save} className="space-y-6 rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-7">
        <div><h2 className="flex items-center gap-2 text-base font-bold text-white"><Target className="h-5 w-5 text-orange-400"/> Familles traitées *</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-400">Tu recevras seulement les demandes dans les catégories choisies. Choisis celles que tu peux réellement sourcer.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PART_CATEGORIES.map(c=><label key={c.value} className={'flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold '+(selected.includes(c.value)?'border-orange-500/50 bg-orange-500/10 text-white':'border-white/10 text-zinc-300 hover:border-white/20')}>
            <input className="h-4 w-4 accent-orange-500" type="checkbox" checked={selected.includes(c.value)} onChange={e=>setSelected(prev=>e.target.checked?[...prev,c.value]:prev.filter(p=>p!==c.value))}/>
            {c.label}
          </label>)}
        </div>
        <label className="block text-sm font-semibold text-zinc-200">Marques prises en charge (facultatif)
          <textarea rows={3} className="mt-2 w-full rounded-xl border border-white/15 bg-[#242527] p-4 text-sm text-white outline-none focus:border-orange-500" value={brandText} onChange={e=>setBrandText(e.target.value)} placeholder="Ex. Toyota, Renault, Dacia, BMW"/></label>
        <p className="text-xs leading-6 text-zinc-400"><strong>Champ vide :</strong> toutes les marques, y compris les imports. Une marque définie : les demandes doivent correspondre exactement à la marque saisie. Les devis sont saisis dans VROOQ ; l’envoi d’e-mails automatiques n’est pas encore activé.</p>
        {message&&<p role="status" className="flex items-start gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0"/>{message}</p>}
        {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={saving} type="submit" className="rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-black disabled:opacity-50">{saving?'Enregistrement…':'Enregistrer mes spécialités'}</button>
          <Link href="/marketplace/parts/inbox" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-bold text-white"><Store className="h-4 w-4"/> Ma boîte à devis</Link>
        </div>
      </form>}
  </div>;
}
