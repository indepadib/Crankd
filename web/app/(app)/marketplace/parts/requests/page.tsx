'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CircleHelp, ClipboardList, Plus, RefreshCw, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { moneyMAD, PART_CATEGORIES } from '@/lib/parts';

type RFQ={
 id:string; make:string;model:string;year:number|null;category:string;
 part_name:string;quantity:number;buyer_city:string;status:string;created_at:string;desired_condition:string;
};
type Quote={
 id:string;request_id:string;seller_id:string;shop_name:string;price_mad:number;
 shipping_fee_mad:number|null;availability_days:number;part_condition:string;
 part_reference:string|null;message:string;created_at:string;expires_at:string;
};
const statusLabels:Record<string,string>={open:'En attente de devis',closed:'Clôturée',cancelled:'Annulée'};
const conditionLabels:Record<string,string>={new:'Neuf',used:'Occasion',refurbished:'Reconditionné'};
export default function MyPartRequestsPage(){
  const {user,session,loading:authLoading,authError}=useAuth();
  const [requests,setRequests]=useState<RFQ[]>([]);
  const [quotes,setQuotes]=useState<Quote[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [changing,setChanging]=useState<string|null>(null);
  const [refresh,setRefresh]=useState(0);
  const [quoteSort,setQuoteSort]=useState<'total'|'availability'|'recent'>('total');
  const reload=useCallback(()=>setRefresh(r=>r+1),[]);
  useEffect(()=>{
    if(!user||!session?.access_token||authError)return;
    let mounted=true;
    void (async()=>{
      const {data,error:fetchError}=await supabase.from('part_requests')
        .select('id,make,model,year,category,part_name,quantity,buyer_city,status,created_at,desired_condition')
        .eq('buyer_id',user.id).order('created_at',{ascending:false}).limit(80);
      if(!mounted)return;
      if(fetchError){setError('Mes demandes ne peuvent pas être chargées.');setLoading(false);return;}
      const rows=(data||[]) as RFQ[];
      setRequests(rows);
      if(rows.length){
        const result=await supabase.from('part_quotes').select('id,request_id,seller_id,shop_name,price_mad,shipping_fee_mad,availability_days,part_condition,part_reference,message,created_at,expires_at')
          .in('request_id',rows.map(r=>r.id)).order('price_mad',{ascending:true});
        if(mounted){setQuotes((result.data||[]) as Quote[]);if(result.error)setError('Les devis n’ont pas pu être chargés.');else setError('');}
      }else{setQuotes([]);setError('');}
      if(mounted)setLoading(false);
    })();
    return()=>{mounted=false;};
  },[user,session?.access_token,authError,refresh]);
  const byRequest=useMemo(()=>{
    const map=new Map<string,Quote[]>();
    for(const quote of quotes)map.set(quote.request_id,[...(map.get(quote.request_id)||[]),quote]);
    return map;
  },[quotes]);

  async function updateStatus(id:string,next:'closed'|'cancelled'){
    if(!user||changing)return;
    setChanging(id);setError('');
    const {error:dbError}=await supabase.from('part_requests').update({status:next,updated_at:new Date().toISOString()})
      .eq('id',id).eq('buyer_id',user.id).eq('status','open');
    if(dbError)setError('Impossible de modifier la demande.');else reload();
    setChanging(null);
  }
  return <div className="mx-auto max-w-4xl space-y-7 pb-20">
    <Link href="/marketplace/parts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4"/> Catalogue pièces</Link>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">VROOQ · Maroc</p>
      <h1 className="mt-2 text-3xl font-black text-white">Mes demandes de pièces</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Compare les devis reçus des boutiques. Les prix sont en DH ; le transport peut être à préciser. Aucun paiement n’est activé.</p></div>
      <Link href="/marketplace/parts/request" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black"><Plus className="h-4 w-4"/> Demander une pièce</Link>
    </header>
    {!authLoading&&!user?<div className="rounded-xl border border-white/15 p-5 text-zinc-300">Connecte-toi pour retrouver tes devis. <Link href="/login" className="text-orange-400">Se connecter</Link></div>:
    <>
      <button type="button" onClick={reload} className="inline-flex items-center gap-2 text-xs text-zinc-300 hover:text-white"><RefreshCw className="h-4 w-4"/> Actualiser mes devis</button>
      {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
      {loading?<p role="status" className="py-12 text-center text-sm text-zinc-400">Recherche des demandes et devis reçus…</p>:requests.length===0?
      <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-orange-400"/>
        <h2 className="mt-3 text-lg font-bold text-white">Aucune demande envoyée</h2>
        <p className="mt-3 text-sm text-zinc-400">Une pièce introuvable ? Demande aux vendeurs qui traitent sa catégorie.</p>
        <Link href="/marketplace/parts/request" className="mt-5 inline-flex rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-black">Créer ma première demande</Link>
      </div>:requests.map(request=>{
        const offers=[...(byRequest.get(request.id)||[])].sort((a,b)=>{
          if(quoteSort==='availability')return a.availability_days-b.availability_days;
          if(quoteSort==='recent')return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();
          const total=(q:Quote)=>q.shipping_fee_mad===null?Number.POSITIVE_INFINITY:q.price_mad+q.shipping_fee_mad;
          return total(a)-total(b);
        });
        return <section key={request.id} className="space-y-4 rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-[11px] uppercase tracking-widest text-orange-400">{PART_CATEGORIES.find(c=>c.value===request.category)?.label||request.category} · {new Date(request.created_at).toLocaleDateString('fr-MA')}</p>
              <h2 className="mt-2 text-xl font-black text-white">{request.part_name}</h2>
              <p className="mt-1 text-xs text-zinc-400">{request.make} {request.model} {request.year||''} · {request.quantity} pièce(s) · {request.buyer_city}</p>
            </div>
            <span className="rounded-full border border-white/15 px-3 py-2 text-xs font-bold text-zinc-300">{statusLabels[request.status]||request.status}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-bold text-white"><Store className="h-4 w-4 text-orange-400"/>{offers.length} devis reçu(s)</div>{offers.length>1&&<select aria-label="Trier les devis" className="min-h-11 rounded-xl border border-white/15 bg-[#242528] px-3 text-xs text-white" value={quoteSort} onChange={e=>setQuoteSort(e.target.value as typeof quoteSort)}><option value="total">Prix total connu</option><option value="availability">Délai annoncé</option><option value="recent">Devis récents</option></select>}</div>
          {offers.length?(
            <div className="space-y-3">{offers.map(quote=>{
              const isExpired=new Date(quote.expires_at).getTime()<Date.now();
              return <article key={quote.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-[1fr_auto]">
                <div><h3 className="text-sm font-bold text-white">{quote.shop_name} <span className="font-normal text-zinc-500">(nom déclaré)</span></h3>
                  <p className="mt-2 text-xs leading-5 text-zinc-300">{quote.message}</p>
                  <p className="mt-2 text-xs text-zinc-400">{conditionLabels[quote.part_condition]||quote.part_condition} · Disponible sous {quote.availability_days} jour(s) selon vendeur</p>
                  {quote.part_reference&&<p className="mt-1 text-xs text-zinc-400">Réf. annoncée : {quote.part_reference}</p>}
                </div>
                <div className="text-right"><strong className="block text-xl text-white">{moneyMAD(quote.price_mad)}</strong>
                  <p className="mt-1 text-xs text-zinc-400">{quote.shipping_fee_mad===null?'Livraison à préciser':'+ '+moneyMAD(quote.shipping_fee_mad)+' livraison'}</p>
                  <p className="mt-1 text-sm font-bold text-orange-200">{quote.shipping_fee_mad===null?'Total non calculable':'Total : '+moneyMAD(quote.price_mad+quote.shipping_fee_mad)}</p>
                  <p className={'mt-2 text-xs '+(isExpired?'text-amber-300':'text-emerald-300')}>{isExpired?'Devis expiré':'Devis indicatif'}</p>
                </div>
              </article>;
            })}</div>
          ):<p className="flex items-start gap-2 rounded-xl bg-orange-500/5 p-4 text-xs leading-6 text-zinc-400"><CircleHelp className="mt-1 h-4 w-4 shrink-0 text-orange-400"/> Les commerçants concernés peuvent répondre depuis leur boîte à devis. Une réponse sous 24 h est un objectif, pas une garantie. Les notifications automatiques ne sont pas encore activées.</p>}
          <p className="text-[11px] leading-5 text-zinc-500">Le tri par prix total place les devis sans frais de livraison renseignés à la fin. Les offres expirées restent visibles à titre indicatif. Comparer un devis n’engage ni paiement ni commande. Confirme la référence OEM, le prix total et l’état réel avant de poursuivre.</p>
          {request.status==='open'&&<div className="flex gap-4 text-xs">
            <button type="button" disabled={changing===request.id} onClick={()=>void updateStatus(request.id,'closed')} className="font-bold text-zinc-300 hover:text-white">Clôturer la demande</button>
            <button type="button" disabled={changing===request.id} onClick={()=>void updateStatus(request.id,'cancelled')} className="font-bold text-red-300 hover:text-red-200">Annuler</button>
          </div>}
        </section>;
      })}
    </>}
  </div>;
}
