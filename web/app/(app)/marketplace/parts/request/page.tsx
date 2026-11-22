'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ClipboardList, LockKeyhole, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { VehicleMakeModelPicker } from '@/components/VehicleMakeModelPicker';
import { PartTypePicker } from '@/components/PartTypePicker';

type Car={id:string;make:string;model:string;year:number};
type Spec={fuel_type:string|null;engine_code:string|null};
const field='mt-2 w-full rounded-xl border border-white/15 bg-[#242528] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none';

export default function CreatePartRequestPage(){
  const router=useRouter();
  const {user,session,loading:authLoading,authError}=useAuth();
  const [cars,setCars]=useState<Car[]>([]);
  const [vehicleId,setVehicleId]=useState('');
  const [make,setMake]=useState('');
  const [model,setModel]=useState('');
  const [year,setYear]=useState('');
  const [fuel,setFuel]=useState('');
  const [engineCode,setEngineCode]=useState('');
  const [category,setCategory]=useState('');
  const [partName,setPartName]=useState('');
  const [city,setCity]=useState('');
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    if(!user||!session?.access_token||authError)return;
    let mounted=true;
    void (async()=>{
      const [v,details]=await Promise.all([
        supabase.from('vehicles').select('id,make,model,year').eq('owner_id',user.id).order('created_at',{ascending:false}).limit(100),
        supabase.from('member_details').select('city').eq('user_id',user.id).maybeSingle(),
      ]);
      if(!mounted)return;
      setCars((v.data||[]) as Car[]);
      setCity(details.data?.city||'Casablanca');
      try{
        const suggested=sessionStorage.getItem('vrooq-find-parts-vehicle');
        const picked=(v.data||[]).find(c=>c.id===suggested);
        if(picked){
          setVehicleId(picked.id);setMake(picked.make);setModel(picked.model);setYear(String(picked.year));
          sessionStorage.removeItem('vrooq-find-parts-vehicle');
        }
      }catch{}
    })();
    return()=>{mounted=false;};
  },[user,session?.access_token,authError]);

  async function chooseVehicle(id:string){
    setVehicleId(id);
    const c=cars.find(c=>c.id===id);
    setMake(c?.make||'');setModel(c?.model||'');setYear(c?String(c.year):'');
    setFuel('');setEngineCode('');
    if(!id)return;
    const {data}=await supabase.from('vehicle_specs').select('fuel_type,engine_code').eq('vehicle_id',id).maybeSingle();
    const spec=data as Spec|null;
    if(spec){setFuel(spec.fuel_type||'');setEngineCode(spec.engine_code||'');}
  }

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!user||saving)return;
    const form=new FormData(event.currentTarget);
    const quantity=Number(form.get('quantity')||1);
    const condition=String(form.get('condition')||'any');
    const oem=String(form.get('oem')||'').trim();
    const notes=String(form.get('notes')||'').trim();
    const yearNumber=year?Number(year):null;
    if(make.trim().length<2||!model.trim()||!category||partName.trim().length<3||
      city.trim().length<2||!Number.isInteger(quantity)||quantity<1||quantity>10||
      (yearNumber!==null&&(!Number.isInteger(yearNumber)||yearNumber<1950||yearNumber>new Date().getFullYear()+2))){
      setError('Complète la voiture, la catégorie, la pièce et la ville.');return;
    }
    setError('');setSaving(true);
    try{
      const {data:identity,error:sessionError}=await supabase.auth.getUser();
      if(sessionError||identity.user?.id!==user.id)throw new Error('Reconnecte-toi pour demander un devis.');
      const {error:insertError}=await supabase.from('part_requests').insert({
        buyer_id:user.id,client_request_id:crypto.randomUUID(),
        vehicle_id:vehicleId||null,make:make.trim(),model:model.trim(),year:yearNumber,
        fuel_type:fuel||null,engine_code:engineCode.trim()||null,
        category,part_name:partName.trim(),oem_reference:oem||null,
        quantity,desired_condition:condition,buyer_city:city.trim(),details:notes,status:'open',
      });
      if(insertError)throw insertError;
      router.push('/marketplace/parts/requests?new=1');
    }catch(cause){
      const msg=cause instanceof Error?cause.message:'Demande impossible.';
      setError(msg.includes('duplicate')?'Cette demande semble déjà enregistrée. Consulte « Mes demandes ».':msg);
    }finally{setSaving(false);}
  }

  return <div className="mx-auto max-w-3xl space-y-7 pb-20">
    <Link href="/marketplace/parts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4"/> Toutes les pièces</Link>
    <header className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.17em] text-orange-400">VROOQ Parts · Maroc</p>
      <h1 className="text-3xl font-black text-white sm:text-4xl">Tu ne trouves pas ta pièce ?</h1>
      <p className="text-sm leading-7 text-zinc-300">Décris ton besoin une seule fois. Les boutiques déclarées compétentes pour cette catégorie et cette marque verront la demande et pourront proposer chacune leur prix en dirhams.</p>
      <p className="text-xs leading-6 text-zinc-500">Objectif de réponse : 24 h selon la disponibilité des vendeurs, <strong>non garanti</strong>. Pas d’envoi SMS ou e-mail automatique pour le moment. Aucun paiement demandé pour déposer la demande.</p>
    </header>
    {!authLoading&&!user?<div className="rounded-2xl border border-white/10 p-6 text-sm text-zinc-300">
      <p>Connecte-toi pour déposer une demande et recevoir tes devis dans VROOQ.</p>
      <Link href="/login" className="mt-4 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">Se connecter</Link>
    </div>:<form onSubmit={submit} className="space-y-6">
      <section className="space-y-5 rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Search className="h-5 w-5 text-orange-400"/> 01 · Ta voiture</h2>
        {cars.length>0&&<label className="block text-sm font-semibold text-zinc-200">Reprendre une voiture de mon garage (facultatif)
          <select className={field} value={vehicleId} onChange={e=>void chooseVehicle(e.target.value)}>
            <option value="">Saisie libre / voiture importée</option>
            {cars.map(c=><option key={c.id} value={c.id}>{c.make} {c.model} · {c.year}</option>)}
          </select>
        </label>}
        <VehicleMakeModelPicker make={make} model={model} onMakeChange={v=>{setMake(v);setVehicleId('');}} onModelChange={v=>{setModel(v);setVehicleId('');}}/>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-zinc-200">Année<input className={field} type="number" min={1950} max={new Date().getFullYear()+2} value={year} onChange={e=>{setYear(e.target.value);setVehicleId('');}} placeholder="Ex. 2014"/></label>
          <label className="text-sm font-semibold text-zinc-200">Carburant<select className={field} value={fuel} onChange={e=>setFuel(e.target.value)}>
            <option value="">Non précisé</option><option value="diesel">Diesel</option><option value="petrol">Essence</option><option value="hybrid">Hybride</option><option value="phev">Hybride rechargeable</option><option value="electric">Électrique</option><option value="lpg">GPL</option><option value="other">Autre</option>
          </select></label>
          <label className="text-sm font-semibold text-zinc-200 sm:col-span-2">Code moteur (facultatif)<input className={field} maxLength={60} value={engineCode} onChange={e=>setEngineCode(e.target.value)} placeholder="Ex. 1ND-TV"/></label>
        </div>
      </section>
      <section className="space-y-4 rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white"><ClipboardList className="h-5 w-5 text-orange-400"/> 02 · Ta pièce recherchée</h2>
        <PartTypePicker category={category} partName={partName} onCategoryChange={setCategory} onPartNameChange={setPartName}/>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-zinc-200">Référence OEM, si connue<input className={field} name="oem" maxLength={100} placeholder="Inscription sur l’ancienne pièce"/></label>
          <label className="text-sm font-semibold text-zinc-200">Quantité *<input className={field} name="quantity" type="number" required min={1} max={10} defaultValue={1}/></label>
        </div>
        <label className="block text-sm font-semibold text-zinc-200">État accepté<select className={field} name="condition" defaultValue="any"><option value="any">Neuf ou occasion</option><option value="used">Occasion uniquement</option><option value="new">Neuf uniquement</option></select></label>
        <label className="block text-sm font-semibold text-zinc-200">Ville de réception au Maroc *<input className={field} required maxLength={100} value={city} onChange={e=>setCity(e.target.value)} placeholder="Casablanca"/></label>
        <label className="block text-sm font-semibold text-zinc-200">Informations utiles (facultatif)
          <textarea className={field} name="notes" rows={4} maxLength={2000} placeholder="Côté droit/gauche, version, dimensions, photos à fournir ultérieurement, autres contraintes…"/></label>
      </section>
      <p className="flex items-start gap-2 text-xs leading-6 text-zinc-400"><LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-orange-400"/> Les vendeurs ciblés voient la demande technique et ta ville, jamais ton téléphone ni ton adresse personnelle. Les devis sont comparables dans ton espace privé.</p>
      {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
      <button type="submit" disabled={saving||authLoading||Boolean(authError)} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-orange-500 px-5 py-4 text-sm font-black text-black disabled:opacity-40">
        {saving?'Envoi de la demande…':'Envoyer ma demande aux boutiques concernées'}<ArrowRight className="h-5 w-5"/>
      </button>
      <p className="flex items-start gap-2 text-xs leading-5 text-zinc-500"><ShieldCheck className="mt-1 h-4 w-4 shrink-0"/> La demande n’est pas une commande. La compatibilité et la disponibilité sont déclarées par les vendeurs ; aucun achat ni paiement n’est activé sur ce parcours.</p>
    </form>}
  </div>;
}
