'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CarFront, Check, Search, ShieldAlert, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';

type Club = { id: string; name: string; category: string | null };
type Decoded = { make: string; model: string; year: number; source: string; warning: string };
const field = 'mt-1.5 w-full rounded-xl border border-white/15 bg-[#242528] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none';

function relevantClubs(make: string, model: string, clubs: Club[]): Club[] {
  const brand = make.trim().toLocaleLowerCase('fr');
  const modelName = model.trim().toLocaleLowerCase('fr');
  const names: string[] = [];
  if (brand === 'genesis' || modelName.includes('genesis')) names.push('Genesis Tribe');
  if (['toyota','honda','nissan','mazda','subaru','mitsubishi','lexus','suzuki','infiniti','acura'].includes(brand)) names.push('JDM Legends');
  if (['bmw','audi','volkswagen','mercedes','mercedes-benz','porsche','seat','skoda','peugeot','renault','citroen','citroën','fiat','opel'].includes(brand)) names.push('Euro Outlaws');
  if (/land cruiser|hilux|patrol|wrangler|defender|jimny/.test(modelName)) names.push('Overland Syndicate');
  return clubs.filter((club) => names.includes(club.name));
}

export default function AddVehiclePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [lookupConsent, setLookupConsent] = useState(false);
  const [lookupEnabled, setLookupEnabled] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [registeredVehicle, setRegisteredVehicle] = useState<string | null>(null);
  const [clubMessage, setClubMessage] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [joinSuggested, setJoinSuggested] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.from('communities').select('id,name,category').then(({data}) => {
      if (active) setClubs((data || []) as Club[]);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let mounted = true;
    void fetch('/api/vehicle-lookup', { cache: 'no-store' })
      .then(r=>r.json()).then((result: {enabled?:boolean})=>{
        if (mounted) setLookupEnabled(result.enabled === true);
      }).catch(()=>{ /* Manual entry remains available. */ });
    return () => { mounted = false; };
  }, []);
  const suggestedClubs = useMemo(() => relevantClubs(make, model, clubs), [make,model,clubs]);

  async function lookupVin() {
    if (!lookupEnabled) { setLookupMessage('La recherche VIN automatique est en cours de validation. Saisis ta voiture manuellement.'); return; }
    setLookupMessage('');
    setError('');
    if (!lookupConsent) { setLookupMessage('Coche d’abord ton accord pour utiliser le service externe.'); return; }
    setChecking(true);
    try {
      const { data: session, error: authError } = await supabase.auth.getSession();
      if (authError || !session.session?.access_token) throw new Error('Connecte-toi pour rechercher un VIN.');
      const response = await fetch('/api/vehicle-lookup', {
        method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.session.access_token },
        body: JSON.stringify({ vin: vin.trim(), consent: true }),
      });
      const result = (await response.json()) as Decoded & { error?: string };
      if (!response.ok) throw new Error(result.error || 'Véhicule non identifié.');
      setMake(result.make);
      setModel(result.model);
      setYear(String(result.year));
      setLookupMessage('Suggestion récupérée via NHTSA : ' + result.make + ' ' + result.model + ' (' + result.year + '). Vérifie la carte grise avant de confirmer.');
    } catch (cause) {
      setLookupMessage(cause instanceof Error ? cause.message : 'Recherche indisponible. Ajoute ta voiture manuellement.');
    } finally { setChecking(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;
    setError('');
    const normalizedMake = make.trim();
    const normalizedModel = model.trim();
    const numericYear = Number(year);
    if (normalizedMake.length < 2 || normalizedModel.length < 1 ||
       !Number.isInteger(numericYear) || numericYear < 1950 || numericYear > new Date().getFullYear() + 2) {
      setError('Vérifie la marque, le modèle et l’année de ta voiture.'); return;
    }
    setSaving(true);
    try {
      const {data: identity,error:identityError} = await supabase.auth.getUser();
      if (identityError || identity.user?.id !== user.id) throw new Error('Reconnecte-toi avant de continuer.');
      const { data, error: insertError } = await supabase.from('vehicles').insert({
        owner_id: user.id, make: normalizedMake, model: normalizedModel, year: numericYear,
      }).select('id').single();
      if (insertError || !data) throw new Error('La voiture n’a pas pu être enregistrée. Réessaie après avoir vérifié ta connexion.');
      const vehicleId = String(data.id);
      setRegisteredVehicle(vehicleId);
      try { sessionStorage.setItem('vrooq-find-parts-vehicle', vehicleId); } catch { /* private browsing */ }

      if (joinSuggested && suggestedClubs.length > 0) {
        const rows = suggestedClubs.map(club => ({ community_id: club.id, user_id: user.id }));
        const { error: joinError } = await supabase.from('community_members')
          .upsert(rows, { onConflict: 'community_id,user_id', ignoreDuplicates: true });
        setClubMessage(joinError
          ? 'Voiture enregistrée, mais adhésion aux clubs non finalisée. Tu peux les rejoindre depuis Clubs.'
          : 'Tu as rejoint ' + suggestedClubs.map(c => c.name).join(', ') + '.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enregistrement impossible. Aucun véhicule ajouté.');
    } finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      <Link href="/garage" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Mon garage</Link>
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Mon garage · Étape 1</p>
        <h1 className="text-3xl font-black text-white sm:text-4xl">Ajoute ta voiture en quelques clics.</h1>
        <p className="text-sm leading-6 text-zinc-400">Elle servira à personnaliser tes recherches de pièces et à te proposer des clubs automobiles.</p>
      </header>
      {!authLoading && !user ? (
        <div className="rounded-2xl border border-white/10 bg-[#1b1c1e] p-6 text-center text-sm text-zinc-300">Connecte-toi avant d’ajouter ta voiture. <Link href="/login" className="font-bold text-orange-400">Se connecter</Link></div>
      ) : registeredVehicle ? (
        <div role="status" className="space-y-5 rounded-3xl border border-orange-500/25 bg-orange-500/[0.06] p-6">
          <div className="flex items-center gap-2 text-orange-400"><Check className="h-6 w-6"/><span className="font-bold">Voiture enregistrée !</span></div>
          <h2 className="text-xl font-bold text-white">{make} {model} · {year}</h2>
          {clubMessage && <p className="text-sm leading-6 text-zinc-300">{clubMessage}</p>}
          <p className="text-sm leading-6 text-zinc-300">Les résultats de pièces utilisent les informations déclarées par les vendeurs. Confirme toujours les références OEM avant un achat.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/marketplace/parts" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-black">Chercher des pièces <ArrowRight className="h-4 w-4"/></Link>
            <Link href="/communities" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white">Mes clubs</Link>
            <button type="button" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white" onClick={()=>router.push('/garage')}>Mon garage</button>
          </div>
        </div>
      ) : (
        <>
          <section className="space-y-4 rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-7">
            <div className="flex items-center gap-2"><Search className="h-5 w-5 text-orange-400"/><h2 className="font-bold text-white">Tu as le VIN sur la carte grise ?</h2></div>
            <p className="text-xs leading-6 text-zinc-400">Le VIN (17 caractères) peut aider à identifier un véhicule. La recherche automatique est désactivée tant que la couverture marocaine et le transfert vers un service externe ne sont pas validés. Tu peux déjà enregistrer ta voiture manuellement.</p>
            <label className="block text-xs font-semibold text-zinc-200">VIN (facultatif)
              <input className={field+' uppercase'} value={vin} onChange={e=>setVin(e.target.value.toUpperCase().replace(/\s/g,''))} maxLength={17} placeholder="Ex. VF1XXXXXXXXXXXXXX"/>
            </label>
            <label className="flex items-start gap-3 text-xs leading-5 text-zinc-300">
              <input type="checkbox" checked={lookupConsent} onChange={e=>setLookupConsent(e.target.checked)} className="mt-1 accent-orange-500"/>
              J’autorise l’envoi ponctuel du VIN à la NHTSA (États-Unis) pour cette recherche. Je comprends qu’il ne s’agit ni d’un contrôle de propriété ni d’une garantie de compatibilité.
            </label>
            <button type="button" onClick={lookupVin} disabled={!lookupEnabled || checking || !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)} className="rounded-xl border border-orange-500/40 px-4 py-3 text-sm font-bold text-orange-300 hover:bg-orange-500/10 disabled:opacity-40">
              {!lookupEnabled?'Identification VIN bientôt disponible':checking?'Recherche en cours…':'Chercher avec ce VIN'}
            </button>
            {lookupMessage && <p role="status" className="text-xs leading-6 text-amber-200">{lookupMessage}</p>}
          </section>
          <form onSubmit={save} className="space-y-5 rounded-3xl border border-white/10 bg-[#1b1c1e] p-5 sm:p-7">
            <div className="flex items-center gap-2"><CarFront className="h-5 w-5 text-orange-400"/><h2 className="font-bold text-white">Confirme les informations de ta voiture</h2></div>
            <p className="text-xs leading-5 text-zinc-400">Tu peux saisir ces trois informations manuellement, sans VIN ni photo de carte grise.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-zinc-200">Marque *<input className={field} value={make} onChange={e=>setMake(e.target.value)} maxLength={60} required placeholder="Ex. Toyota"/></label>
              <label className="text-sm font-semibold text-zinc-200">Modèle *<input className={field} value={model} onChange={e=>setModel(e.target.value)} maxLength={80} required placeholder="Ex. Auris"/></label>
              <label className="text-sm font-semibold text-zinc-200 sm:col-span-2">Année *<input className={field} value={year} onChange={e=>setYear(e.target.value)} min={1950} max={new Date().getFullYear()+2} type="number" required placeholder="Ex. 2014"/></label>
            </div>
            {suggestedClubs.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-orange-400"/><h3 className="text-sm font-bold text-white">Clubs qui pourraient te correspondre</h3></div>
                <p className="mt-2 text-sm text-zinc-300">{suggestedClubs.map(c=>c.name).join(' · ')}</p>
                <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-zinc-300"><input type="checkbox" checked={joinSuggested} onChange={e=>setJoinSuggested(e.target.checked)} className="mt-1 accent-orange-500"/> Je souhaite rejoindre ces clubs lors de l’enregistrement. Mon adhésion pourra être visible dans VROOQ.</label>
              </div>
            )}
            <p className="flex items-start gap-2 text-xs leading-5 text-zinc-400"><ShieldAlert className="h-4 w-4 shrink-0 text-orange-400"/>La compatibilité exacte d’une pièce dépend de la motorisation, de la version et parfois de la référence constructeur. Une correspondance marque/modèle/année reste indicative.</p>
            {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
            <button type="submit" disabled={saving||authLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 text-sm font-black text-black hover:bg-orange-400 disabled:opacity-40">
              {saving?'Enregistrement…':'Enregistrer ma voiture'}<ArrowRight className="h-4 w-4"/>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
