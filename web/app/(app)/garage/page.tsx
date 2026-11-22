'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CarFront, CheckCircle2, ClipboardList, Gauge, Plus, RefreshCw, Search, ShieldCheck, Wrench } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { MAINTENANCE_RULES, maintenanceRule } from '@/lib/maintenance';

type Vehicle = { id:string; make:string; model:string; year:number; image_url:string|null };
type VehicleSpec = {
  vehicle_id:string; fuel_type:string|null; engine_description:string|null;
  engine_code:string|null; trim_name:string|null; fiscal_power:number|null;
  first_registration_date:string|null;
};
type Maintenance = {
  id:string; vehicle_id:string; title:string; service_type:string;
  occurred_at:string; description:string|null; cost_amount:number|null;
  cost_currency:string|null; odometer_reading:number|null;
  odometer_unit:string|null; service_code:string|null; next_due_km:number|null;
};
const field='mt-2 w-full rounded-xl border border-white/15 bg-[#242426] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none';
const fuelLabels:Record<string,string>={diesel:'Diesel',petrol:'Essence',hybrid:'Hybride',phev:'Hybride rechargeable',electric:'Électrique',lpg:'GPL',other:'Autre'};
function money(value:number,currency='MAD') {
  try {return new Intl.NumberFormat('fr-MA',{style:'currency',currency,maximumFractionDigits:0}).format(value);}
  catch{return value.toLocaleString('fr-MA')+' '+currency;}
}

export default function GaragePage() {
  const {user,session,loading:authLoading,authError}=useAuth();
  const [vehicles,setVehicles]=useState<Vehicle[]>([]);
  const [selectedId,setSelectedId]=useState('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [specs,setSpecs]=useState<VehicleSpec|null>(null);
  const [savedVin,setSavedVin]=useState<string|null>(null);
  const [removingVin,setRemovingVin]=useState(false);
  const [logs,setLogs]=useState<Maintenance[]>([]);
  const [detailsError,setDetailsError]=useState('');
  const [showLogForm,setShowLogForm]=useState(false);
  const [showOptionalFields,setShowOptionalFields]=useState(false);
  const [savingLog,setSavingLog]=useState(false);
  const [logError,setLogError]=useState('');
  const [serviceCode,setServiceCode]=useState('oil_change');
  const selectedService=maintenanceRule(serviceCode);
  const [logSuccess,setLogSuccess]=useState(false);

  useEffect(()=>{
    if(authLoading || !session?.access_token || !user || authError) return;
    let mounted=true;
    void (async()=>{
      const {data,error:dbError}=await supabase.from('vehicles')
        .select('id,make,model,year,image_url')
        .eq('owner_id',user.id).order('created_at',{ascending:false});
      if(!mounted)return;
      if(dbError) {
        setError('Ton garage est momentanément indisponible. Réessaie après avoir vérifié ta connexion.');
        setVehicles([]);
      }else{
        const cars=(data||[]) as Vehicle[];
        setVehicles(cars);
        setSelectedId(current=>cars.some(v=>v.id===current)?current:(cars[0]?.id||''));
        setError('');
      }
      setLoading(false);
    })();
    return()=>{mounted=false;};
  },[user,session?.access_token,authLoading,authError]);

  useEffect(()=>{
    if(!selectedId || !user || !session?.access_token || authError)return;
    let mounted=true;
    void (async()=>{
      const [specResult,logResult,vinResult]=await Promise.all([
        supabase.from('vehicle_specs').select('vehicle_id,fuel_type,engine_description,engine_code,trim_name,fiscal_power,first_registration_date')
          .eq('vehicle_id',selectedId).maybeSingle(),
        supabase.from('maintenance_logs')
          .select('id,vehicle_id,title,service_type,occurred_at,description,cost_amount,cost_currency,odometer_reading,odometer_unit,service_code,next_due_km')
          .eq('vehicle_id',selectedId).eq('performed_by_user_id',user.id)
          .order('occurred_at',{ascending:false}).limit(50),
        supabase.from('vehicle_private_identifiers').select('vin').eq('vehicle_id',selectedId).maybeSingle(),
      ]);
      if(!mounted)return;
      setSpecs((specResult.data as VehicleSpec|null)||null);
      setSavedVin(vinResult.data?.vin||null);
      setLogs((logResult.data||[]) as Maintenance[]);
      setDetailsError(specResult.error||logResult.error||vinResult.error
        ?'Les détails de cette voiture ne sont pas tous accessibles. Vérifie ta connexion.'
        :'');
    })();
    return()=>{mounted=false;};
  },[selectedId,user,session?.access_token,authError]);

  async function removeVin(){
    if(!user||!selectedId||removingVin)return;
    setRemovingVin(true);
    const {error:deleteError}=await supabase.from('vehicle_private_identifiers')
      .delete().eq('vehicle_id',selectedId).eq('owner_id',user.id);
    if(deleteError)setDetailsError('Impossible de supprimer ton VIN. Réessaie.');
    else {setSavedVin(null);setDetailsError('');}
    setRemovingVin(false);
  }

  async function addMaintenance(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!selectedId||!user||savingLog)return;
    const form=new FormData(event.currentTarget);
    const title = String(form.get('title')||'').trim() || selectedService.label;
    const date=String(form.get('date')||'');
    const type=selectedService.serviceType;
    const description=String(form.get('description')||'').trim();
    const costString=String(form.get('cost')||'').trim();
    const odoString=String(form.get('odometer')||'').trim();
    const dueString=String(form.get('next_due_km')||'').trim();
    const amount=costString?Number(costString):null;
    const odometer=odoString?Number(odoString):null;
    const nextDueKm=selectedService.nextDueKm&&dueString?Number(dueString):null;
    if(title.length<3||!date||
       (selectedService.odometer==='required'&&odometer===null)||
       (amount!==null&&(!Number.isFinite(amount)||amount<0))||
       (odometer!==null&&(!Number.isInteger(odometer)||odometer<0))||
       (nextDueKm!==null&&(!Number.isInteger(nextDueKm)||nextDueKm<0|| (odometer!==null&&nextDueKm<=odometer)))) {
      setLogError('Renseigne la date et, pour cette intervention, un kilométrage valide. La prochaine échéance doit dépasser le kilométrage actuel.');return;
    }
    setSavingLog(true);setLogError('');setLogSuccess(false);
    try{
      const {data:identity,error:authFailure}=await supabase.auth.getUser();
      if(authFailure||identity.user?.id!==user.id)throw new Error('Reconnecte-toi avant d’enregistrer cet entretien.');
      const {data,error:dbError}=await supabase.from('maintenance_logs').insert({
        vehicle_id:selectedId,performed_by_user_id:user.id,occurred_at:new Date(date+'T12:00:00').toISOString(),
        service_type:type,service_code:serviceCode,title,description:description||null,cost_amount:amount,cost_currency:'MAD',
        odometer_reading:odometer,odometer_unit:odometer!==null?'km':null,next_due_km:nextDueKm,is_verified:false,
      }).select('id,vehicle_id,title,service_type,occurred_at,description,cost_amount,cost_currency,odometer_reading').single();
      if(dbError||!data)throw new Error('L’entretien n’a pas pu être enregistré. Aucune information n’a été ajoutée.');
      setLogs(previous=>[data as Maintenance,...previous].sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at)));
      setShowLogForm(false);
      setShowOptionalFields(false);
      setLogSuccess(true);
    }catch(cause){setLogError(cause instanceof Error?cause.message:'Enregistrement impossible.');}
    finally{setSavingLog(false);}
  }

  const selected=vehicles.find(v=>v.id===selectedId)||null;
  if(authLoading)return <p role="status" className="py-20 text-center text-sm text-zinc-400">Ouverture de ton garage…</p>;
  if(!user)return <div className="mx-auto max-w-xl py-16 text-center"><h1 className="text-2xl font-bold text-white">Connecte-toi pour voir ton garage</h1><Link href="/login" className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">Se connecter</Link></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-20">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">VROOQ Maroc · Mon espace</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Mon Garage</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">Retrouve tes véhicules, leurs caractéristiques déclarées et ton historique d’entretien. Rien n’est inventé.</p>
        </div>
        <Link href="/garage/add" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400"><Plus className="h-4 w-4"/> Ajouter une voiture</Link>
      </header>
      {error&&<div role="alert" className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-100">{error}</div>}
      {loading?(
        <div role="status" className="rounded-3xl border border-white/10 p-10 text-center text-sm text-zinc-400">Chargement des voitures enregistrées…</div>
      ):vehicles.length===0?(
        <section className="rounded-3xl border border-dashed border-orange-500/25 bg-white/[0.03] p-9 text-center">
          <CarFront className="mx-auto h-12 w-12 text-orange-400"/>
          <h2 className="mt-4 text-xl font-black text-white">Ta première voiture commence ici</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">Ajoute sa marque, son modèle et son année. Tu peux compléter les données techniques en recopiant les champs de ta carte grise.</p>
          <Link href="/garage/add" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-black">Ajouter ma voiture <Plus className="h-4 w-4"/></Link>
        </section>
      ):(
        <>
          <section aria-label="Sélectionner sa voiture" className="flex gap-3 overflow-x-auto pb-1">
            {vehicles.map(car=>(
              <button key={car.id} type="button" onClick={()=>{setSelectedId(car.id);setSpecs(null);setSavedVin(null);setLogs([]);setLogSuccess(false);setShowLogForm(false);}} aria-pressed={selectedId===car.id}
                className={'flex min-w-[210px] shrink-0 items-center gap-3 rounded-2xl border p-4 text-left '+(selectedId===car.id?'border-orange-500/50 bg-orange-500/10':'border-white/10 bg-[#1c1d20] hover:border-white/25')}>
                <span className="rounded-xl bg-orange-500/10 p-3 text-orange-400"><CarFront className="h-6 w-6"/></span>
                <span><strong className="block text-sm text-white">{car.make} {car.model}</strong><span className="block text-xs text-zinc-400">{car.year}</span></span>
              </button>
            ))}
          </section>
          {selected&&(
            <>
              <section className="rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">Mon véhicule</p><h2 className="mt-2 text-2xl font-black text-white">{selected.make} {selected.model}</h2><p className="mt-1 text-sm text-zinc-400">Année {selected.year} · Informations déclarées</p></div>
                  <Link href="/marketplace/parts" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-black"><Search className="h-4 w-4"/> Chercher des pièces</Link>
                </div>
                {detailsError&&<p role="alert" className="mt-4 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-200">{detailsError}</p>}
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ['Carburant',specs?.fuel_type?fuelLabels[specs.fuel_type]||specs.fuel_type:'Non renseigné'],
                    ['Motorisation',specs?.engine_description||'Non renseignée'],
                    ['Code moteur',specs?.engine_code||'Non renseigné'],
                    ['Finition',specs?.trim_name||'Non renseignée'],
                    ['Puissance fiscale',specs?.fiscal_power?specs.fiscal_power+' CV':'Non renseignée'],
                    ['Mise en circulation',specs?.first_registration_date?new Date(specs.first_registration_date).toLocaleDateString('fr-MA'):'Non renseignée'],
                  ].map(([label,value])=>(
                    <div key={label} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><p className="text-xs text-zinc-500">{label}</p><p className="mt-2 text-sm font-bold text-white">{value}</p></div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-orange-500/20 bg-orange-500/[0.055] p-4 sm:p-5">
                  <h3 className="text-sm font-bold text-white">Fiabiliser les informations de cette voiture</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">Informations déclarées par le propriétaire, non vérifiées par VROOQ. Les détails suivants réduisent le risque d’erreur lors d'une recherche de pièces.</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className={specs?.fuel_type?'text-emerald-300':'text-amber-200'}>{specs?.fuel_type?'✓':'○'} Carburant {specs?.fuel_type?'renseigné':'à compléter'}</li>
                    <li className={specs?.engine_description?'text-emerald-300':'text-amber-200'}>{specs?.engine_description?'✓':'○'} Motorisation {specs?.engine_description?'renseignée':'à compléter'}</li>
                    <li className={specs?.engine_code?'text-emerald-300':'text-zinc-400'}>{specs?.engine_code?'✓':'○'} Code moteur {specs?.engine_code?'renseigné':'utile pour certaines pièces'}</li>
                    <li className={savedVin?'text-emerald-300':'text-zinc-400'}>{savedVin?'✓':'○'} VIN privé {savedVin?'enregistré':'facultatif, avec consentement'}</li>
                  </ul>
                  <p className="mt-3 text-xs leading-5 text-zinc-400">Même avec ces données, confirme la compatibilité avec une référence OEM ou un professionnel avant l’achat. Aucun score de fiabilité artificiel n’est attribué.</p>
                </div>
                {savedVin&&<div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 p-4 text-xs text-zinc-300">
                  <span>VIN privé enregistré : •••••••••••{savedVin.slice(-6)}</span>
                  <button type="button" disabled={removingVin} onClick={()=>void removeVin()} className="font-bold text-red-300 hover:text-red-200 disabled:opacity-50">{removingVin?'Suppression…':'Supprimer mon VIN'}</button>
                </div>}
                <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-zinc-400"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-orange-400"/> Ces informations proviennent de ta saisie, pas d’une vérification officielle. Les pièces ne sont pas automatiquement certifiées compatibles ; vérifie toujours leur référence OEM.</p>
              </section>
              <section className="space-y-4 rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className="flex items-center gap-2 text-xl font-black text-white"><ClipboardList className="h-5 w-5 text-orange-400"/> Historique d’entretien</h2><p className="mt-1 text-xs text-zinc-400">Privé · saisi par le propriétaire · non certifié par VROOQ</p></div>
                  <button type="button" onClick={()=>{setShowLogForm(v=>!v);setShowOptionalFields(false);setLogError('');}} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white"><Plus className="h-4 w-4"/> Ajouter un entretien</button>
                </div>
                {logSuccess&&<p role="status" className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4"/> Entretien enregistré dans ton historique privé.</p>}
                {showLogForm&&(
                  <form onSubmit={addMaintenance} className="space-y-4 rounded-2xl border border-orange-500/25 bg-black/20 p-5">
                    <h3 className="text-lg font-bold text-white">Ajouter un entretien en quelques secondes</h3>
                    <p className="text-xs text-zinc-400">Choisis l’intervention, la date et le kilométrage si nécessaire. Le reste est facultatif.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-bold text-zinc-300 sm:col-span-2">Quelle intervention ? *
                        <select className={field} name="service_code" value={serviceCode} onChange={e=>setServiceCode(e.target.value)}>
                          {MAINTENANCE_RULES.map(rule=><option key={rule.code} value={rule.code}>{rule.group} · {rule.label}</option>)}
                        </select>
                      </label>
                      <label className="text-sm font-bold text-zinc-300">Date de l’intervention *<input className={field} required type="date" name="date" max={new Date().toISOString().slice(0,10)} defaultValue={new Date().toISOString().slice(0,10)}/></label>
                      {selectedService.odometer!=='not_needed'&&(
                        <label className="text-sm font-bold text-zinc-300 sm:col-span-2">
                          Kilométrage au moment de l’intervention{selectedService.odometer==='required'?' *':' (facultatif)'}
                          <input className={field} name="odometer" type="number" required={selectedService.odometer==='required'} min={0} step={1} placeholder="Ex. 150000 km"/>
                        </label>
                      )}
                    </div>
                    <button type="button" aria-expanded={showOptionalFields} onClick={()=>setShowOptionalFields(v=>!v)} className="min-h-11 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-orange-500/40">{showOptionalFields?'Masquer les détails facultatifs':'Ajouter coût, échéance ou détails (facultatif)'}</button>
                    {showOptionalFields&&<div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-bold text-zinc-300">Coût payé en DH<input className={field} type="number" min={0} step="0.01" name="cost" placeholder="Ex. 650"/></label>
                      {selectedService.nextDueKm&&(
                        <label className="text-sm font-bold text-zinc-300 sm:col-span-2">Prochaine échéance prévue en km (facultatif)
                          <input className={field} name="next_due_km" type="number" min={0} step={1} placeholder="Selon carnet du constructeur"/>
                        </label>
                      )}
                      <label className="text-sm font-bold text-zinc-300 sm:col-span-2">Précision ou référence (facultatif)
                        <input className={field} name="title" minLength={3} maxLength={140} placeholder="Ex. Huile 5W30, courroie + galets"/>
                      </label>
                    </div>}
                    {selectedService.guidance&&<p className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-xs leading-6 text-orange-100">{selectedService.guidance}</p>}
                    {showOptionalFields&&<label className="block text-sm font-bold text-zinc-300">Notes<textarea className={field} rows={3} name="description" maxLength={2500} placeholder="Travaux effectués, références, observations"/></label>}
                    {logError&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{logError}</p>}
                    <button disabled={savingLog} type="submit" className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-black disabled:opacity-50">{savingLog?'Enregistrement…':'Enregistrer cet entretien'}</button>
                  </form>
                )}
                {logs.length===0?(
                  <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400"><Wrench className="mx-auto mb-3 h-6 w-6 text-zinc-500"/> Aucun entretien enregistré pour cette voiture.</div>
                ):(
                  <div className="space-y-3">{logs.map(log=>(
                    <article key={log.id} className="flex flex-wrap items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                      <span className="rounded-xl bg-orange-500/10 p-3 text-orange-400"><Wrench className="h-5 w-5"/></span>
                      <div className="min-w-[180px] flex-1"><h3 className="text-sm font-bold text-white">{log.title}</h3><p className="mt-1 flex items-center gap-1 text-xs text-zinc-400"><CalendarDays className="h-3.5 w-3.5"/>{new Date(log.occurred_at).toLocaleDateString('fr-MA')} · {log.service_type}</p>{log.description&&<p className="mt-2 text-xs leading-6 text-zinc-300">{log.description}</p>}</div>
                      <div className="text-right text-xs text-zinc-400">{log.cost_amount!==null&&<p className="font-bold text-white">{money(Number(log.cost_amount),log.cost_currency||'USD')}</p>}{log.odometer_reading!==null&&<p className="mt-2 flex items-center justify-end gap-1"><Gauge className="h-3.5 w-3.5"/>{Number(log.odometer_reading).toLocaleString('fr-MA')} {log.odometer_unit||'unité inconnue'}</p>}{log.next_due_km!==null&&<p className="mt-1 text-orange-300">Échéance indiquée : {Number(log.next_due_km).toLocaleString('fr-MA')} km</p>}</div>
                    </article>
                  ))}<p className="text-[11px] leading-5 text-zinc-500">Les échéances proviennent de ta saisie, pas d’un calcul validé par le constructeur. Les anciennes données sans unité sont signalées comme telles.</p></div>
                )}
              </section>
            </>
          )}
        </>
      )}
      <p className="flex items-start gap-2 text-xs leading-5 text-zinc-500"><RefreshCw className="mt-0.5 h-4 w-4 shrink-0"/> Cet espace affiche uniquement les données réellement enregistrées dans Supabase. Les anciens outils de simulation automobile ne sont pas affichés dans ce garage simplifié.</p>
    </div>
  );
}
