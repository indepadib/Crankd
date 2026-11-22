'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Building2, CheckCircle2, LockKeyhole, ShieldCheck, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { readableError } from '@/lib/parts';

type Seller = {
  seller_id: string;
  shop_name: string;
  seller_kind: 'individual' | 'garage' | 'professional';
  contact_phone: string;
  city: string;
  returns_policy: string;
  status: 'active' | 'suspended';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  plan_code: 'free' | 'pro' | 'business';
  subscription_status: string;
};

const inputClass = 'mt-2 w-full rounded-xl border border-white/15 bg-[#242528] px-4 py-3 text-sm text-white outline-none focus:border-orange-500/70 placeholder:text-zinc-500';
const labelClass = 'block text-sm font-semibold text-zinc-200';

export default function SellOnVrooq() {
  const { user, loading: authLoading } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [memberDefaults, setMemberDefaults] = useState<{city:string;contact_phone:string}|null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    void supabase.from('part_sellers').select('*').eq('seller_id', user.id)
      .maybeSingle().then(({ data, error: fetchError }) => {
        if (!mounted) return;
        if (fetchError) setServiceError('Les comptes vendeurs ne sont pas encore activés sur cette version de VROOQ.');
        else setSeller((data as Seller | null) || null);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    void supabase.from('member_details').select('city,contact_phone').eq('user_id', user.id).maybeSingle().then(({data})=>{
      if (mounted && data) setMemberDefaults(data as {city:string;contact_phone:string});
    });
    return () => { mounted = false; };
  }, [user]);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving || serviceError) return;
    const form = new FormData(event.currentTarget);
    const shop_name = String(form.get('shop_name') || '').trim();
    const seller_kind = String(form.get('seller_kind') || 'individual');
    const contact_phone = String(form.get('contact_phone') || '').trim();
    const city = String(form.get('city') || '').trim();
    const returns_policy = String(form.get('returns_policy') || '').trim();
    const accepted = form.get('accepts_seller_rules') === 'on';

    if (!accepted && !seller) { setError('Confirmez les règles de vente avant de créer votre boutique.'); return; }
    if (!['individual','garage','professional'].includes(seller_kind) ||
      shop_name.length < 3 || contact_phone.length < 9 || city.length < 2 || returns_policy.length < 15) {
      setError('Veuillez compléter les informations de votre boutique et la politique de retour.'); return;
    }
    setError('');
    setSuccessMessage('');
    setSaving(true);
    try {
      const { data: session, error: authError } = await supabase.auth.getUser();
      if (authError || session.user?.id !== user.id) throw new Error('Reconnectez-vous avant de créer votre boutique.');
      const editable = { shop_name, seller_kind, contact_phone, city, returns_policy };
      const result = seller
        ? await supabase.from('part_sellers').update({ ...editable, updated_at: new Date().toISOString() }).eq('seller_id', user.id)
        : await supabase.from('part_sellers').insert({ seller_id: user.id, ...editable, accepts_seller_rules: true });
      if (result.error) throw result.error;
      setSeller((current) => current ? ({...current,...editable,seller_kind:seller_kind as Seller['seller_kind']}) : ({
        seller_id: user.id, ...editable,
        seller_kind: seller_kind as Seller['seller_kind'],
        status: 'active', verification_status: 'unverified',
        plan_code: 'free', subscription_status: 'not_required',
      }));
      setSuccessMessage(seller ? 'Les informations de ta boutique ont été enregistrées.' : 'Ta boutique est activée ! Tu peux maintenant publier ta première pièce.');
    } catch (caught) { setError(readableError(caught)); }
    finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <Link href="/marketplace/parts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Pièces automobiles</Link>
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">VROOQ pour les vendeurs</p>
        <h1 className="text-4xl font-black tracking-tight text-white">Votre boutique automobile.</h1>
        <p className="text-sm leading-6 text-zinc-300">Un compte VROOQ suffit pour démarrer. Active ta boutique gratuitement, ajoute tes coordonnées vendeur et publie tes pièces. Le paiement VROOQ sera proposé après intégration de notre prestataire agréé.</p>
        <div className="grid gap-2 pt-2 sm:grid-cols-3">
          {['1 · Créer son compte','2 · Activer sa boutique','3 · Publier sa pièce'].map((item,index)=>(
            <div key={item} className={'rounded-xl border px-3 py-3 text-xs font-bold '+(index===1?'border-orange-500/35 bg-orange-500/10 text-orange-200':'border-white/10 bg-white/[0.03] text-zinc-300')}>{item}</div>
          ))}
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Store className="mb-3 h-5 w-5 text-orange-400" /><p className="text-sm font-bold text-white">Boutique gratuite</p><p className="mt-1 text-xs text-zinc-400">Aucun abonnement facturé à ce stade.</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><ShieldCheck className="mb-3 h-5 w-5 text-orange-400" /><p className="text-sm font-bold text-white">Compte identifiable</p><p className="mt-1 text-xs text-zinc-400">Vérification professionnelle à venir.</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><LockKeyhole className="mb-3 h-5 w-5 text-orange-400" /><p className="text-sm font-bold text-white">Paiement VROOQ</p><p className="mt-1 text-xs text-zinc-400">Aucun règlement direct entre membres.</p></div>
      </div>
      {!authLoading && !user ? (
        <div className="rounded-2xl border border-white/10 bg-[#1b1c1e] p-7 text-center">
          <p className="mb-5 text-zinc-300">Créez d’abord un compte VROOQ ou connectez-vous.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-black">Créer mon compte</Link>
            <Link href="/login" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white">Se connecter</Link>
          </div>
        </div>
      ) : authLoading || (user && loading) ? (
        <p role="status" className="py-12 text-center text-sm text-zinc-400">Vérification de votre compte…</p>
      ) : serviceError ? (
        <div role="status" className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-6 text-sm leading-6 text-amber-100">{serviceError} Les annonces existantes restent consultables.</div>
      ) : (
        <>
          {seller && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div><p className="text-xs uppercase tracking-widest text-zinc-400">Compte vendeur</p><p className="mt-1 flex items-center gap-2 text-sm font-bold text-white"><BadgeCheck className="h-4 w-4 text-orange-400" /> {seller.status === 'active' ? 'Boutique active' : 'Boutique suspendue'}</p><p className="mt-1 text-xs text-zinc-400">Vérification : {seller.verification_status === 'verified' ? 'confirmée' : 'non confirmée'} · Offre : {seller.plan_code.toUpperCase()}</p></div>
              <div className="flex flex-wrap gap-2">
                <Link href="/marketplace/parts/new" className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-black hover:bg-orange-400">Publier une pièce</Link>
                <Link href="/marketplace/parts/mine" className="rounded-xl border border-white/20 px-4 py-3 text-sm text-white hover:bg-white/10">Mes annonces</Link>
                <Link href="/marketplace/parts/specialties" className="rounded-xl border border-white/20 px-4 py-3 text-sm text-white hover:bg-white/10">Mes spécialités</Link>
                <Link href="/marketplace/parts/inbox" className="rounded-xl border border-orange-500/30 px-4 py-3 text-sm font-bold text-orange-300 hover:bg-orange-500/10">Demandes de pièces / devis</Link>
              </div>
            </div>
          )}
          {successMessage && <div role="status" className="space-y-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
            <p className="font-bold text-white">{successMessage}</p>
            <div className="flex flex-wrap gap-3"><Link href="/marketplace/parts/new" className="inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black">Publier ma première pièce</Link>
            <Link href="/marketplace/parts/specialties" className="inline-flex rounded-xl border border-orange-500/30 px-5 py-3 text-sm font-bold text-orange-300">Choisir mes catégories de demandes</Link></div>
          </div>}
          <form key={(seller?.seller_id || 'new')+'-'+(memberDefaults?.contact_phone || '')} onSubmit={register} className="space-y-6 rounded-3xl border border-white/10 bg-[#1b1c1e] p-6 md:p-8">
            <h2 className="flex items-center gap-3 text-xl font-bold text-white"><Building2 className="h-5 w-5 text-orange-400" /> {seller ? 'Informations de ma boutique' : 'Créer mon compte vendeur'}</h2>
            <label className={labelClass}>Nom public de la boutique *<input className={inputClass} name="shop_name" defaultValue={seller?.shop_name || ''} minLength={3} maxLength={100} required placeholder="Ex. Garage Atlas Parts" /></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>Je suis *<select className={inputClass} name="seller_kind" defaultValue={seller?.seller_kind || 'individual'}>
                <option value="individual">Particulier</option><option value="garage">Garage / réparateur</option><option value="professional">Professionnel / distributeur</option>
              </select></label>
              <label className={labelClass}>Ville *<input className={inputClass} name="city" defaultValue={seller?.city || memberDefaults?.city || ''} minLength={2} maxLength={100} required placeholder="Casablanca" /></label>
            </div>
            <label className={labelClass}>Téléphone professionnel / de contact *<input className={inputClass} name="contact_phone" defaultValue={seller?.contact_phone || memberDefaults?.contact_phone || ''} type="tel" minLength={9} maxLength={20} required placeholder="+212 6…" /></label>
            <label className={labelClass}>Conditions de retour proposées *<textarea className={inputClass} rows={4} name="returns_policy" defaultValue={seller?.returns_policy || ''} minLength={15} maxLength={2000} required placeholder="Ex. Retour en cas de non-conformité, selon la politique VROOQ et les règles applicables." /></label>
            {!seller && <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-zinc-300">
              <input type="checkbox" name="accepts_seller_rules" required className="mt-1 accent-orange-500" />
              <span>Je confirme avoir le droit de vendre ces pièces, décrire honnêtement leur état, traiter les demandes sur VROOQ et ne pas réclamer de paiement direct à l’acheteur.</span>
            </label>}
            <p className="text-xs leading-5 text-zinc-400">La création du compte vendeur n’est pas une certification d’identité. Les vérifications et les abonnements payants seront introduits séparément et annoncés avant activation.</p>
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
            <button type="submit" disabled={saving || seller?.status === 'suspended'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 font-black text-black hover:bg-orange-400 disabled:opacity-50">
              <CheckCircle2 className="h-5 w-5" /> {saving ? 'Enregistrement…' : seller ? 'Enregistrer mes informations' : 'Activer ma boutique gratuitement'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}