'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ClipboardList, RefreshCw, Send, Settings2, } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { PART_CATEGORIES } from '@/lib/parts';

type RFQ={id:string;make:string;model:string;year:number|null;category:string;part_name:string;
  fuel_type:string|null;engine_code:string|null;oem_reference:string|null;quantity:number;
  buyer_city:string;details:string;desired_condition:string;created_at:string;status:string;};
type ExistingQuote={id:string;request_id:string;price_mad:number;};
export default function SellerRFQInbox(){
  const {user,session,loading:authLoading,authError}=useAuth();
  const [shop,setShop]=useState<{shop_name:string;status:string}|null>(null);
  const [specialties,setSpecialties]=useState<number|null>(null);
  const [requests,setRequests]=useState<RFQ[]>([]);
  const [sent,setSent]=useState<ExistingQuote[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [error,setError]=useState('');
  const [formError,setFormError]=useState('');
  const [saving,setSaving]=useState<string|null>(null);
  const [openQuote,setOpenQuote]=useState<string|null>(null);
  const [refetch,setRefetch]=useState(0);
  useEffect(()=>{
    if(!user||!session?.access_token||authError)return;
    let mounted=true;
    void (async()=>{
      const [seller,skills]=await Promise.all([
        supabase.from('part_sellers').select('shop_name,status').eq('seller_id',user.id).maybeSingle(),
        supabase.from('part_seller_specialties').select('category',{head:true,count:'exact'}).eq('seller_id',user.id),
      ]);
      if(!mounted)return;
      setShop(seller.data||null);setSpecialties(skills.count||0);
      if(seller.error||skills.error){setError('Impossible de vérifier ton espace professionnel.');setLoaded(true);return;}
      if(seller.data?.status!=='active'||!skills.count){setLoaded(true);return;}
      const [req,quotes]=await Promise.all([
        supabase.from('part_requests')
          .select('id,make,model,year,category,part_name,fuel_type,engine_code,oem_reference,quantity,buyer_city,details,desired_condition,created_at,status')
          .eq('status','open').order('created_at',{ascending:false}).limit(100),
        supabase.from('part_quotes').select('id,request_id,price_mad').eq('seller_id',user.id).limit(200),
      ]);
      if(!mounted)return;
      setRequests((req.data||[]) as RFQ[]);
      setSent((quotes.data||[]) as ExistingQuote[]);
      setError(req.error||quotes.error?'Impossible de charger toutes les demandes et devis.':'');
      setLoaded(true);
    })();
    return()=>{mounted=false;};
  },[user,session?.access_token,authError,refetch]);
  const quoted=useMemo(()=>new Set(sent.map(q=>q.request_id)),[sent]);
  async function sendQuote(event:FormEvent<HTMLFormElement>,requestId:string){
    event.preventDefault();
    if(!user||!shop||saving||quoted.has(requestId))return;
    const form=new FormData(event.currentTarget);
    const price=Number(form.get('price_mad')||0);
    const shippingRaw=String(form.get('shipping_fee')||'').trim();
    const shipping=shippingRaw?Number(shippingRaw):null;
    const delay=Number(form.get('availability_days')||0);
    const message=String(form.get('message')||'').trim();
    const condition=String(form.get('part_condition')||'used');
    const reference=String(form.get('part_reference')||'').trim();
    const requestedCondition=requests.find(r=>r.id===requestId)?.desired_condition;
    if(requestedCondition&&requestedCondition!=='any'&&requestedCondition!==condition){setFormError('Cette demande accepte uniquement des pièces '+(requestedCondition==='new'?'neuves':'d’occasion')+'.');return;}
    const compatibilityAcknowledged=form.get('compatibility_acknowledged')==='on';
    if(!compatibilityAcknowledged){setFormError('Confirme avoir vérifié les caractéristiques du véhicule et indique les réserves éventuelles dans ton message.');return;}
    if(!Number.isInteger(price)||price<10||price>10000000||!Number.isInteger(delay)||delay<0||delay>45||
       (shipping!==null&&(!Number.isInteger(shipping)||shipping<0||shipping>100000))||message.length<10||message.length>1500||
       !['new','used','refurbished'].includes(condition)){
      setFormError('Vérifie prix en DH, disponibilité, état, coût de transport et commentaire.');return;
    }
    setFormError('');setSaving(requestId);
    try{
      const {data:identity,error:authFailure}=await supabase.auth.getUser();
      if(authFailure||identity.user?.id!==user.id)throw new Error('Reconnecte-toi avant d’envoyer ton devis.');
      const {data,error:quoteError}=await supabase.from('part_quotes').insert({
        request_id:requestId,seller_id:user.id,shop_name:shop.shop_name,
        price_mad:price,shipping_fee_mad:shipping,availability_days:delay,
        part_condition:condition,part_reference:reference||null,message,quote_status:'sent',
      }).select('id,request_id,price_mad').single();
      if(quoteError||!data)throw quoteError||new Error('Enregistrement non confirmé.');
      setSent(previous=>[...previous,data as ExistingQuote]);setOpenQuote(null);
    }catch(cause){setFormError(cause instanceof Error?cause.message:'Le devis n’a pas pu être envoyé.');}
    finally{setSaving(null);}
  }
  return <div className="mx-auto max-w-4xl space-y-7 pb-20">
    <Link href="/marketplace/parts/sell" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4"/> Ma boutique</Link>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">VROOQ Pro · Maroc</p>
        <h1 className="mt-2 text-3xl font-black text-white">Boîte à demandes de pièces</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">Les demandes correspondent aux familles et marques déclarées par ta boutique. Une fois la pièce trouvée, propose ton prix en DH. Le client peut comparer plusieurs offres.</p>
      </div>
      <Link href="/marketplace/parts/specialties" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white"><Settings2 className="h-4 w-4"/> Mes spécialités</Link>
    </header>
    {!authLoading&&!user?<div className="rounded-xl border border-white/10 p-5 text-zinc-300">Connecte-toi pour accéder à la boîte à devis. <Link href="/login" className="text-orange-400">Connexion</Link></div>:
    !loaded?<p role="status" className="py-12 text-sm text-zinc-400">Chargement des demandes de pièces…</p>:
    !shop||shop.status!=='active'?<div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5 text-sm text-zinc-300">Active une boutique pour recevoir les demandes. <Link href="/marketplace/parts/sell" className="font-bold text-orange-300 underline">Activer ma boutique</Link></div>:
    !specialties?<div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6 text-sm text-zinc-300">
      <h2 className="font-bold text-white">Configure les pièces que tu peux sourcer</h2>
      <p className="mt-2 text-xs leading-6">Choisis tes catégories pour que les demandes correspondantes arrivent ici. Les demandes ne sont pas envoyées par SMS ou e-mail actuellement.</p>
      <Link href="/marketplace/parts/specialties" className="mt-4 inline-flex rounded-xl bg-orange-500 px-4 py-3 font-bold text-black">Définir mes catégories</Link>
    </div>:<>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-400">{requests.length} demande(s) ouvertes visibles · {sent.length} devis envoyé(s)</p>
        <button onClick={()=>{setLoaded(false);setRefetch(v=>v+1);}} type="button" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white"><RefreshCw className="h-4 w-4"/> Actualiser</button>
      </div>
      {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
      {requests.length===0?<div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-400"><ClipboardList className="mx-auto mb-3 h-10 w-10 text-orange-400"/> Aucune demande ouverte ne correspond actuellement à tes spécialités.</div>:
      <div className="space-y-4">{requests.map(request=>{
        const already=quoted.has(request.id);
        return <article key={request.id} className="space-y-4 rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-[11px] uppercase tracking-widest text-orange-400">{PART_CATEGORIES.find(c=>c.value===request.category)?.label||request.category}</p>
              <h2 className="mt-2 text-lg font-bold text-white">{request.part_name}</h2>
              <p className="mt-1 text-xs text-zinc-400">{request.make} {request.model} {request.year||''} · {request.quantity} pièce(s) · {request.buyer_city}</p>
            </div>
            <span className={'rounded-full border px-3 py-2 text-xs font-bold '+(already?'border-emerald-500/25 text-emerald-300':'border-orange-500/25 text-orange-300')}>
              {already?'Devis envoyé':'À étudier'}
            </span>
          </div>
          <div className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
            <p>Carburant : {request.fuel_type||'non précisé'}</p><p>Code moteur : {request.engine_code||'non précisé'}</p>
            <p>Réf. OEM demandée : {request.oem_reference||'inconnue'}</p>
            <p>État accepté : {request.desired_condition==='any'?'neuf ou occasion':request.desired_condition==='new'?'neuf':'occasion'}</p>
          </div>
          {request.details&&<p className="rounded-xl bg-white/[0.03] p-3 text-xs leading-6 text-zinc-300">{request.details}</p>}
          {already?<p className="text-xs text-emerald-300">Ton offre est enregistrée. Le demandeur peut la comparer à celles des autres boutiques.</p>:(
            <>
              <button type="button" onClick={()=>{setOpenQuote(current=>current===request.id?null:request.id);setFormError('');}} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-xs font-black text-black"><Send className="h-4 w-4"/> Proposer mon devis <ArrowRight className="h-4 w-4"/></button>
              {openQuote===request.id&&<form onSubmit={e=>void sendQuote(e,request.id)} className="space-y-4 rounded-2xl border border-orange-500/20 bg-black/20 p-4">
                <p className="text-sm font-bold text-white">Offre pour {request.part_name}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm text-zinc-300">Prix de la pièce en DH *<input required className="mt-1 w-full rounded-lg border border-white/15 bg-[#242527] p-3 text-white" name="price_mad" type="number" min={10} max={10000000} step={1}/></label>
                  <label className="text-sm text-zinc-300">Frais de livraison en DH (facultatifs)<input className="mt-1 w-full rounded-lg border border-white/15 bg-[#242527] p-3 text-white" name="shipping_fee" type="number" min={0} max={100000} step={1}/></label>
                  <label className="text-sm text-zinc-300">Disponibilité sous * (jours)<input required className="mt-1 w-full rounded-lg border border-white/15 bg-[#242527] p-3 text-white" name="availability_days" defaultValue={2} type="number" min={0} max={45}/></label>
                  <label className="text-sm text-zinc-300">État réel *
                    <select className="mt-1 w-full rounded-lg border border-white/15 bg-[#242527] p-3 text-white" name="part_condition" required defaultValue={request.desired_condition==='new'?'new':'used'}>{request.desired_condition!=='new'&&<option value="used">Occasion</option>}{request.desired_condition!=='used'&&<option value="new">Neuf</option>}{request.desired_condition==='any'&&<option value="refurbished">Reconditionné</option>}</select></label>
                  <label className="text-sm text-zinc-300 sm:col-span-2">Référence OEM / fabricant<input className="mt-1 w-full rounded-lg border border-white/15 bg-[#242527] p-3 text-white" name="part_reference" maxLength={100} placeholder="Référence sur la pièce"/></label>
                </div>
                <label className="block text-sm text-zinc-300">Ce que tu proposes *<textarea required name="message" minLength={10} maxLength={1500} rows={3} className="mt-1 w-full rounded-lg border border-white/15 bg-[#242527] p-3 text-white" placeholder="État, provenance, compatibilité à vérifier, garantie éventuelle…"/></label>
                <label className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-zinc-200"><input name="compatibility_acknowledged" type="checkbox" required className="mt-1 h-4 w-4 accent-orange-500"/> Je confirme avoir examiné les informations véhicule et la référence disponible. Je précise dans mon offre toute incertitude ou vérification complémentaire nécessaire. Cette confirmation ne constitue pas une certification VROOQ.</label>
                <p className="text-[11px] leading-5 text-zinc-500">Devis indicatif valable 7 jours. Pas d’encaissement, pas de transporteur connecté, pas de commande déclenchée. Une offre envoyée n’est pas modifiable dans cette version.</p>
                {formError&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-xs text-red-200">{formError}</p>}
                <button disabled={saving===request.id} type="submit" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black disabled:opacity-40">{saving===request.id?'Envoi…':'Envoyer ce devis au client'}</button>
              </form>}
            </>
          )}
        </article>;
      })}</div>}
    </>}
    <p className="text-xs leading-6 text-zinc-500">Ce système propose un aiguillage par catégorie et marque, mais aucune notification automatique en dehors de VROOQ. La disponibilité sous 24 h dépend de l’activité réelle des vendeurs.</p>
  </div>;
}
