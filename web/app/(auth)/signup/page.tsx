'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CarFront, CheckCircle2, Eye, EyeOff, LockKeyhole, Store, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Intent = 'buy' | 'sell' | 'both';
const field = 'mt-2 w-full rounded-xl border border-white/15 bg-[#212225] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/70';
const cities = ['Casablanca','Rabat','Mohammedia','Tanger','Marrakech','Fès','Meknès','Agadir','Kénitra','Tétouan','Oujda','El Jadida','Autre'];

function SignupForm() {
  const router = useRouter();
  const query = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [intent, setIntent] = useState<Intent>(() => query.get('mode') === 'seller' ? 'sell' : 'buy');
  const [username, setUsername] = useState(() => query.get('username')?.replace(/\s/g,'') || '');
  const [firstName,setFirstName] = useState('');
  const [lastName,setLastName] = useState('');
  const [phone,setPhone] = useState('');
  const [city,setCity] = useState('Casablanca');
  const [otherCity,setOtherCity] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [showPassword,setShowPassword] = useState(false);
  const [marketingConsent,setMarketingConsent] = useState(false);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState(false);

  const cityValue = city === 'Autre' ? otherCity.trim() : city;
  const sellerIntent = intent === 'sell' || intent === 'both';

  function nextIdentity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (firstName.trim().length < 2 || lastName.trim().length < 2 ||
        cityValue.length < 2 || phone.replace(/[\s().-]/g,'').length < 9) {
      setError('Complète ton prénom, ton nom, ton numéro et ta ville.');
      return;
    }
    setError('');
    setStep(3);
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (username.trim().length < 3 || !/^[A-Za-z0-9_.]+$/.test(username)) {
      setError('Choisis un pseudo de 3 caractères minimum, sans espace.');
      return;
    }
    if (password.length < 8) { setError('Utilise au moins 8 caractères pour ton mot de passe.'); return; }
    setSaving(true);
    setError('');
    try {
      const mappedIntent = sellerIntent ? 'sell' : 'buy';
      const {data,error: signupError} = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password,
        options: {
          emailRedirectTo: window.location.origin + '/login',
          data: {
            username: username.trim(), full_name: firstName.trim() + ' ' + lastName.trim(),
            first_name: firstName.trim(), last_name: lastName.trim(),
            contact_phone: phone.replace(/[\s().-]/g,''), city: cityValue,
            country_code: 'MA', account_intent: mappedIntent,
            role_profile: intent, marketing_opt_in: marketingConsent,
          },
        },
      });
      if (signupError) throw signupError;
      if (data.session) {
        router.replace(sellerIntent ? '/marketplace/parts/sell' : '/garage/add');
      } else {
        setSuccess(true);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Inscription momentanément impossible.');
    } finally { setSaving(false); }
  }

  if (success) {
    return (
      <section className="space-y-5 rounded-3xl border border-orange-500/25 bg-orange-500/[0.05] p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-orange-400" />
        <h1 className="text-2xl font-black text-white">Plus qu’une confirmation !</h1>
        <p className="text-sm leading-7 text-zinc-300">Ouvre l’e-mail de confirmation, puis reconnecte-toi. {sellerIntent ? 'Tu pourras ensuite activer ta boutique gratuitement.' : 'Tu pourras ensuite ajouter ta voiture.'}</p>
        <Link href="/login" className="inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black">Aller à la connexion</Link>
      </section>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-orange-400">VROOQ Maroc · Compte gratuit</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Ton espace automobile commence ici.</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Un seul compte pour ta voiture, tes recherches et, si tu le souhaites, ta boutique de pièces.</p>
      </div>
      <div className="flex gap-2" aria-label={'Inscription étape '+step+' sur 3'}>
        {[1,2,3].map(n => <div key={n} className={'h-1.5 flex-1 rounded-full '+(n<=step?'bg-orange-500':'bg-white/15')}/>)}
      </div>
      {step === 1 && (
        <section className="space-y-4" aria-label="Choisir son parcours">
          <h2 className="text-lg font-bold">Que veux-tu faire sur VROOQ ?</h2>
          <p className="text-xs text-zinc-400">Tu pourras toujours changer d’usage plus tard.</p>
          {([
            {id:'buy',title:'J’ai une voiture',description:'Mon garage, mes clubs, des pièces adaptées à rechercher.',icon:CarFront},
            {id:'sell',title:'Je vends des pièces',description:'Une boutique gratuite, mes annonces et mes demandes.',icon:Store},
            {id:'both',title:'Les deux',description:'Je suis passionné d’auto et je veux aussi vendre des pièces.',icon:Users},
          ] as const).map(option => (
            <button type="button" key={option.id} aria-pressed={intent === option.id} onClick={()=>setIntent(option.id)}
              className={'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 '+(intent===option.id?'border-orange-500 bg-orange-500/10':'border-white/15 bg-white/[0.04] hover:border-white/30')}>
              <span className="rounded-xl bg-orange-500/10 p-3 text-orange-400"><option.icon className="h-5 w-5"/></span>
              <span className="flex-1"><span className="block text-sm font-bold">{option.title}</span><span className="mt-1 block text-xs leading-5 text-zinc-400">{option.description}</span></span>
              {intent===option.id && <CheckCircle2 className="h-5 w-5 text-orange-400"/>}
            </button>
          ))}
          <button onClick={()=>setStep(2)} type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-black">Continuer <ArrowRight className="h-4 w-4"/></button>
        </section>
      )}
      {step === 2 && (
        <form onSubmit={nextIdentity} className="space-y-4">
          <h2 className="text-lg font-bold">Quelques informations utiles</h2>
          <p className="text-xs leading-6 text-zinc-400">Ces coordonnées restent privées. Elles servent à ton compte et, pour les vendeurs, à préparer le suivi des commandes.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-zinc-300">Prénom *<input className={field} required autoComplete="given-name" minLength={2} maxLength={70} value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Prénom"/></label>
            <label className="text-xs font-semibold text-zinc-300">Nom *<input className={field} required autoComplete="family-name" minLength={2} maxLength={70} value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Nom"/></label>
          </div>
          <label className="block text-xs font-semibold text-zinc-300">Téléphone marocain *<input className={field} required type="tel" autoComplete="tel" minLength={9} maxLength={20} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+212 6…"/></label>
          <label className="block text-xs font-semibold text-zinc-300">Ville au Maroc *
            <select className={field} value={city} onChange={e=>setCity(e.target.value)}>{cities.map(x=><option key={x} value={x}>{x}</option>)}</select>
          </label>
          {city === 'Autre' && <label className="block text-xs font-semibold text-zinc-300">Ma ville *<input className={field} required minLength={2} maxLength={100} value={otherCity} onChange={e=>setOtherCity(e.target.value)}/></label>}
          {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <div className="flex gap-3"><button type="button" onClick={()=>{setError('');setStep(1);}} className="rounded-xl border border-white/15 px-4 py-3 text-sm text-white"><ArrowLeft className="h-4 w-4"/></button><button type="submit" className="flex-1 rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">Continuer</button></div>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={createAccount} className="space-y-4">
          <h2 className="text-lg font-bold">Sécurise ton compte</h2>
          <label className="block text-xs font-semibold text-zinc-300">Pseudo public *<input className={field} required minLength={3} maxLength={30} autoComplete="username" value={username} onChange={e=>setUsername(e.target.value.replace(/\s/g,''))} placeholder="Ex. atlas_driver"/></label>
          <label className="block text-xs font-semibold text-zinc-300">E-mail *<input className={field} required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="toi@exemple.com"/></label>
          <label className="block text-xs font-semibold text-zinc-300">Mot de passe *
            <div className="relative">
              <input className={field+' pr-12'} required type={showPassword?'text':'password'} minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="8 caractères minimum"/>
              <button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Masquer le mot de passe':'Afficher le mot de passe'} className="absolute right-3 top-1/2 rounded-lg p-2 text-zinc-400 hover:text-white">
                {showPassword?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}
              </button>
            </div>
          </label>
          <label className="flex items-start gap-3 text-xs leading-6 text-zinc-300"><input type="checkbox" checked={marketingConsent} onChange={e=>setMarketingConsent(e.target.checked)} className="mt-1 accent-orange-500"/>Je souhaite recevoir les nouveautés VROOQ. Facultatif.</label>
          <p className="flex items-start gap-2 text-xs leading-6 text-zinc-400"><LockKeyhole className="mt-1 h-4 w-4 shrink-0"/>Pays : Maroc · Devise : MAD · Distances : km. Tes coordonnées personnelles ne sont pas affichées sur ton profil public.</p>
          {sellerIntent && <p className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-100">Ta boutique s’active gratuitement après la création du compte. L’inscription n’implique aucun abonnement payant.</p>}
          {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={()=>{setError('');setStep(2);}} className="rounded-xl border border-white/15 px-4 py-3 text-white"><ArrowLeft className="h-4 w-4"/></button>
            <button disabled={saving} type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-black disabled:opacity-50">{saving?'Création…':'Créer mon compte'}<ArrowRight className="h-4 w-4"/></button>
          </div>
        </form>
      )}
      <p className="text-center text-xs text-zinc-400">Déjà inscrit ? <Link href="/login" className="font-bold text-orange-400">Se connecter</Link></p>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense fallback={<p className="p-8 text-center text-sm text-zinc-400">Chargement…</p>}><SignupForm/></Suspense>;
}
