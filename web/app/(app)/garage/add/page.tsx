'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpenCheck, CarFront, Check, ShieldAlert, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { VehicleMakeModelPicker } from '@/components/VehicleMakeModelPicker';

type Club = { id: string; name: string; category: string | null };
type Method = 'manual' | 'card_transcription';
type Fuel = '' | 'diesel' | 'petrol' | 'hybrid' | 'phev' | 'electric' | 'lpg' | 'other';
const field = 'mt-1.5 w-full rounded-xl border border-white/15 bg-[#242528] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none';
const fuelLabels: Record<string,string> = {diesel:'Diesel',petrol:'Essence',hybrid:'Hybride',phev:'Hybride rechargeable',electric:'Électrique',lpg:'GPL',other:'Autre'};
const brandNames: Record<string,string[]> = {
  genesis: ['Genesis Tribe'],
  toyota:['JDM Legends'], honda:['JDM Legends'], nissan:['JDM Legends'], mazda:['JDM Legends'], subaru:['JDM Legends'], mitsubishi:['JDM Legends'], lexus:['JDM Legends'],
  bmw:['Euro Outlaws'], audi:['Euro Outlaws'], volkswagen:['Euro Outlaws'], mercedes:['Euro Outlaws'], 'mercedes-benz':['Euro Outlaws'], porsche:['Euro Outlaws'],
  seat:['Euro Outlaws'], skoda:['Euro Outlaws'], peugeot:['Euro Outlaws'], renault:['Euro Outlaws'], citroen:['Euro Outlaws'], fiat:['Euro Outlaws'],
};
function relevantClubs(make: string, model: string, clubs: Club[]): Club[] {
  const brand = make.trim().toLocaleLowerCase('fr');
  const names = [...(brandNames[brand] || [])];
  if (/land cruiser|hilux|patrol|wrangler|defender|jimny/i.test(model)) names.push('Overland Syndicate');
  return clubs.filter((c) => names.includes(c.name));
}

export default function AddVehiclePage() {
  const { user, loading: authLoading } = useAuth();
  const [method,setMethod] = useState<Method>('card_transcription');
  const [make,setMake] = useState('');
  const [model,setModel] = useState('');
  const [year,setYear] = useState('');
  const [fuel,setFuel] = useState<Fuel>('');
  const [engine,setEngine] = useState('');
  const [engineCode,setEngineCode] = useState('');
  const [trim,setTrim] = useState('');
  const [fiscalPower,setFiscalPower] = useState('');
  const [firstRegistration,setFirstRegistration] = useState('');
  const [clubs,setClubs] = useState<Club[]>([]);
  const [joinClubs,setJoinClubs] = useState(false);
  const [saving,setSaving] = useState(false);
  const [registered,setRegistered] = useState(false);
  const [savedId,setSavedId] = useState('');
  const [notice,setNotice] = useState('');
  const [error,setError] = useState('');

  useEffect(() => {
    let mounted = true;
    void supabase.from('communities').select('id,name,category').then(({data}) => {
      if (mounted) setClubs((data || []) as Club[]);
    });
    return () => { mounted = false; };
  }, []);
  const suggested = useMemo(() => relevantClubs(make,model,clubs), [make,model,clubs]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;
    setError('');
    const modelYear = Number(year);
    if (make.trim().length < 2 || !model.trim() || !Number.isInteger(modelYear) ||
        modelYear < 1950 || modelYear > new Date().getFullYear()+2) {
      setError('Vérifie la marque, le modèle et l’année.'); return;
    }
    if (fiscalPower && (!Number.isInteger(Number(fiscalPower)) || Number(fiscalPower) < 1 || Number(fiscalPower) > 80)) {
      setError('La puissance fiscale doit être un nombre valide.'); return;
    }
    setSaving(true);
    try {
      const {data:auth,error:authError} = await supabase.auth.getUser();
      if (authError || auth.user?.id !== user.id) throw new Error('Connecte-toi pour enregistrer ta voiture.');
      const {data:vehicle,error:vehicleError} = await supabase.from('vehicles').insert({
        owner_id:user.id, make:make.trim(), model:model.trim(), year:modelYear,
      }).select('id').single();
      if (vehicleError || !vehicle) throw new Error('Impossible d’enregistrer la voiture. Réessaie.');

      const id = String(vehicle.id);
      setSavedId(id);
      setRegistered(true);
      try { sessionStorage.setItem('vrooq-find-parts-vehicle',id); } catch { /* Private mode */ }

      const hasDetails = Boolean(fuel || engine.trim() || engineCode.trim() || trim.trim() || fiscalPower || firstRegistration);
      if (hasDetails) {
        const {error:specError} = await supabase.from('vehicle_specs').insert({
          vehicle_id:id, owner_id:user.id,
          fuel_type:fuel || null, engine_description:engine.trim() || null,
          engine_code:engineCode.trim() || null, trim_name:trim.trim() || null,
          fiscal_power:fiscalPower ? Number(fiscalPower) : null,
          first_registration_date:firstRegistration || null,
          source_method:method,
        });
        if (specError) setNotice('La voiture est enregistrée, mais certaines caractéristiques techniques n’ont pas pu être sauvegardées.');
      }

      if (joinClubs && suggested.length) {
        const {error:membershipError} = await supabase.from('community_members')
          .upsert(suggested.map(c=>({community_id:c.id,user_id:user.id})),{onConflict:'community_id,user_id',ignoreDuplicates:true});
        if (membershipError) setNotice('Voiture enregistrée ; l’adhésion au club est à confirmer dans la rubrique Clubs.');
      }
    } catch(cause) {
      setError(cause instanceof Error ? cause.message : 'L’enregistrement a échoué.');
    } finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      <Link href="/garage" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4"/> Mon garage</Link>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Mon garage · Maroc</p>
        <h1 className="mt-2 text-3xl font-black text-white">Ajoute ta voiture.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Avec les données techniques de ta carte grise marocaine, ou simplement en indiquant le modèle. Aucune photo ni plaque d’immatriculation n’est demandée.</p>
      </div>
      {!authLoading && !user ? (
        <div className="rounded-2xl border border-white/10 p-6 text-zinc-300">Connecte-toi pour ajouter ta voiture. <Link href="/login" className="font-bold text-orange-400">Se connecter</Link></div>
      ) : registered ? (
        <section className="space-y-4 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-6" role="status">
          <div className="flex items-center gap-2 text-orange-400"><Check className="h-5 w-5"/><span className="font-bold">Voiture ajoutée à ton garage</span></div>
          <h2 className="text-xl font-black text-white">{make} {model} · {year}</h2>
          {fuel && <p className="text-sm text-zinc-300">Carburant déclaré : {fuelLabels[fuel]}</p>}
          {notice && <p className="text-sm text-amber-200">{notice}</p>}
          <p className="text-sm leading-6 text-zinc-300">Les pièces affichées utilisent les caractéristiques saisies par leurs vendeurs. La compatibilité exacte devra être vérifiée avec la référence OEM.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/marketplace/parts" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-black">Chercher des pièces <ArrowRight className="ml-1 inline h-4 w-4"/></Link>
            <Link href="/garage" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white">Voir mon garage</Link>
            {savedId && <Link href="/communities" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white">Voir les clubs</Link>}
          </div>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#1b1c1e] p-2" role="group" aria-label="Mode d'ajout du véhicule">
            <button type="button" onClick={()=>setMethod('card_transcription')} aria-pressed={method==='card_transcription'}
              className={'flex min-h-14 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold '+(method==='card_transcription'?'bg-orange-500 text-black':'text-zinc-300 hover:bg-white/5')}>
              <BookOpenCheck className="h-4 w-4"/> Ma carte grise
            </button>
            <button type="button" onClick={()=>setMethod('manual')} aria-pressed={method==='manual'}
              className={'flex min-h-14 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold '+(method==='manual'?'bg-orange-500 text-black':'text-zinc-300 hover:bg-white/5')}>
              <CarFront className="h-4 w-4"/> Saisie rapide
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-7">
            {method==='card_transcription' && (
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-white"><BookOpenCheck className="h-4 w-4 text-orange-300"/> Recopie seulement les informations techniques</p>
                <p className="mt-2 text-xs leading-6 text-zinc-300">Sur la carte grise marocaine : marque, modèle/type, carburant, puissance fiscale et numéro de châssis peuvent apparaître. Nous ne demandons ni nom du titulaire, ni adresse, ni immatriculation, ni numéro de châssis complet.</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <VehicleMakeModelPicker className="sm:col-span-2" make={make} model={model} onMakeChange={setMake} onModelChange={setModel} />
              <label className="text-sm font-semibold text-zinc-200">Année *<input className={field} required type="number" min={1950} max={new Date().getFullYear()+2} value={year} onChange={e=>setYear(e.target.value)} placeholder="2014"/></label>
              <label className="text-sm font-semibold text-zinc-200">Carburant
                <select className={field} value={fuel} onChange={e=>setFuel(e.target.value as Fuel)}>
                  <option value="">Non renseigné</option>
                  {Object.entries(fuelLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-zinc-200">Motorisation / cylindrée<input className={field} maxLength={100} value={engine} onChange={e=>setEngine(e.target.value)} placeholder="Ex. 1.4 D-4D"/></label>
              <label className="text-sm font-semibold text-zinc-200">Code moteur (si connu)<input className={field} maxLength={60} value={engineCode} onChange={e=>setEngineCode(e.target.value)} placeholder="Ex. 1ND-TV"/></label>
              {method==='card_transcription' && <>
                <label className="text-sm font-semibold text-zinc-200">Version / finition<input className={field} maxLength={100} value={trim} onChange={e=>setTrim(e.target.value)} placeholder="Ex. Dynamic"/></label>
                <label className="text-sm font-semibold text-zinc-200">Puissance fiscale (CV)<input className={field} type="number" min={1} max={80} value={fiscalPower} onChange={e=>setFiscalPower(e.target.value)} placeholder="Ex. 6"/></label>
                <label className="text-sm font-semibold text-zinc-200 sm:col-span-2">Première mise en circulation (facultatif)<input className={field} type="date" value={firstRegistration} onChange={e=>setFirstRegistration(e.target.value)}/></label>
              </>}
            </div>
            {suggested.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-white"><Users className="h-4 w-4 text-orange-400"/> Les clubs de ta voiture</p>
                <p className="mt-2 text-xs leading-5 text-zinc-300">{suggested.map(c=>c.name).join(' · ')}</p>
                <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-zinc-300">
                  <input type="checkbox" checked={joinClubs} onChange={e=>setJoinClubs(e.target.checked)} className="mt-1 accent-orange-500"/>
                  Je souhaite rejoindre ces clubs. Mon adhésion peut être visible aux autres membres.
                </label>
              </div>
            )}
            <p className="flex items-start gap-2 text-xs leading-6 text-zinc-400"><ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-orange-400"/> Aucune base de VIN marocain ou catalogue OEM sous licence n’est encore connecté. Les caractéristiques et compatibilités restent déclaratives, jamais certifiées automatiquement.</p>
            {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            <button type="submit" disabled={saving||authLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 text-sm font-black text-black hover:bg-orange-400 disabled:opacity-40">
              {saving ? 'Enregistrement…' : 'Enregistrer ma voiture'}<ArrowRight className="h-4 w-4"/>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
