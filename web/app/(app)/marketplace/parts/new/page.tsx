'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, CheckCircle2, Info, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { PART_CATEGORIES, PART_CONDITIONS, readableError } from '@/lib/parts';

export default function NewPartListingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [delivery, setDelivery] = useState(true);
  const [pickup, setPickup] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);
  const [sellerStatus, setSellerStatus] = useState<'checking' | 'active' | 'missing' | 'suspended' | 'unavailable'>('checking');

  useEffect(() => {
    let mounted = true;
    void supabase.from('part_listings').select('id', { head: true }).limit(1).then(({ error: schemaError }) => {
      if (mounted) setBackendReady(!schemaError);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    void supabase.from('part_sellers').select('status').eq('seller_id', user.id).maybeSingle()
      .then(({ data, error: sellerError }) => {
        if (!mounted) return;
        if (sellerError) setSellerStatus('unavailable');
        else if (!data) setSellerStatus('missing');
        else setSellerStatus(data.status === 'active' ? 'active' : 'suspended');
      });
    return () => { mounted = false; };
  }, [user]);

  const field = 'mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#252629] px-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/60';
  const label = 'block text-sm font-semibold text-zinc-200';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || submitting || backendReady !== true || sellerStatus !== 'active') return;
    setError('');
    if (!delivery && !pickup) { setError('Sélectionnez au moins un mode de remise.'); return; }
    if (photos.length < 1 || photos.length > 8) { setError('Ajoutez entre 1 et 8 photos réelles de la pièce.'); return; }
    if (photos.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError('Chaque photo doit être en JPG, PNG ou WebP et peser au maximum 5 Mo.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) || '').trim();
    const price = Number(read('price_mad'));
    const quantity = Number(read('quantity'));
    const yearFrom = read('compatible_year_from') ? Number(read('compatible_year_from')) : null;
    const yearTo = read('compatible_year_to') ? Number(read('compatible_year_to')) : null;
    if (!Number.isInteger(price) || price < 10 || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      setError('Vérifiez le prix et la quantité.');
      return;
    }
    if (yearFrom && yearTo && yearFrom > yearTo) { setError('La plage des années de compatibilité est inversée.'); return; }

    setSubmitting(true);
    const uploadedPaths: string[] = [];
    try {
      const auth = await supabase.auth.getUser();
      if (auth.error || auth.data.user?.id !== user.id) throw new Error('Veuillez vous reconnecter avant de publier.');

      const imageUrls: string[] = [];
      for (const file of photos) {
        const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const path = [user.id, crypto.randomUUID() + '.' + extension].join('/');
        const { error: uploadError } = await supabase.storage.from('part-listing-images')
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
        const { data } = supabase.storage.from('part-listing-images').getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }

      const { data, error: insertError } = await supabase.from('part_listings').insert({
        seller_id: user.id,
        title: read('title'),
        description: read('description'),
        category: read('category'),
        part_condition: read('part_condition'),
        defects: read('defects') || null,
        part_brand: read('part_brand') || null,
        oem_reference: read('oem_reference') || null,
        compatible_make: read('compatible_make'),
        compatible_model: read('compatible_model'),
        compatible_fuel: read('compatible_fuel') || null,
        compatible_engine_code: read('compatible_engine_code') || null,
        compatible_year_from: yearFrom,
        compatible_year_to: yearTo,
        city: read('city'),
        price_mad: price,
        quantity,
        images: imageUrls,
        offers_delivery: delivery,
        offers_pickup: pickup,
        status: 'active',
      }).select('id').single();
      if (insertError) throw insertError;
      router.push('/marketplace/parts/' + data.id);
    } catch (caught) {
      if (uploadedPaths.length) await supabase.storage.from('part-listing-images').remove(uploadedPaths);
      setError(readableError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <Link href="/marketplace/parts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Retour aux pièces</Link>
      <header className="space-y-3"><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Vendre sur VROOQ</p><h1 className="text-4xl font-black text-white">Publier une pièce</h1><p className="text-sm text-zinc-400">Une annonce précise inspire confiance : photos réelles, référence et compatibilité comptent plus qu’un long discours.</p></header>
      {!authLoading && !user ? (
        <div className="rounded-2xl border border-white/10 bg-[#1d1e20] p-8 text-center"><p className="mb-5 text-zinc-300">Connectez-vous pour déposer votre annonce.</p><Link href="/login" className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">Se connecter</Link></div>
      ) : backendReady === null ? (
        <div role="status" className="rounded-2xl border border-white/10 bg-[#1d1e20] p-8 text-center text-sm text-zinc-300">Vérification du service des annonces…</div>
      ) : backendReady === false ? (
        <div role="status" className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
          <h2 className="text-lg font-bold text-amber-100">Publication temporairement indisponible</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-300">Nous finalisons la configuration de la marketplace de pièces. Votre formulaire ne peut pas encore être enregistré : revenez après la mise en service.</p>
          <Link href="/marketplace/parts" className="mt-6 inline-flex rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white">Retour au catalogue</Link>
        </div>
      ) : sellerStatus === 'checking' ? (
        <div role="status" className="rounded-2xl border border-white/10 bg-[#1d1e20] p-8 text-center text-sm text-zinc-300">Vérification de votre compte vendeur…</div>
      ) : sellerStatus !== 'active' ? (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-7 text-center">
          <h2 className="text-xl font-bold text-white">{sellerStatus === 'suspended' ? 'Boutique suspendue' : 'Activez votre boutique vendeur'}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-300">
            {sellerStatus === 'missing'
              ? 'Pour publier des pièces, créez gratuitement votre boutique VROOQ et confirmez les règles de vente.'
              : sellerStatus === 'suspended'
                ? 'Votre boutique est suspendue et ne peut pas créer de nouvelles annonces.'
                : 'Le service des comptes vendeurs doit encore être activé sur VROOQ.'}
          </p>
          {sellerStatus === 'missing' && <Link href="/marketplace/parts/sell" className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black">Créer mon compte vendeur</Link>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-7">
          <section className="space-y-5 rounded-3xl border border-white/10 bg-[#1a1b1d] p-6">
            <h2 className="text-lg font-bold text-white">01 · La pièce</h2>
            <label className={label}>Nom de la pièce *<input required name="title" minLength={8} maxLength={140} className={field} placeholder="Ex. Alternateur d’origine Toyota Auris 1.4 D-4D" /></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={label}>Catégorie *<select required name="category" className={field} defaultValue=""><option value="" disabled>Sélectionner</option>{PART_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className={label}>État *<select required name="part_condition" className={field} defaultValue=""><option value="" disabled>Sélectionner</option>{PART_CONDITIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className={label}>Marque de la pièce<input name="part_brand" maxLength={100} className={field} placeholder="Bosch, Valeo, OEM…" /></label>
              <label className={label}>Référence OEM<input name="oem_reference" maxLength={100} className={field} placeholder="Numéro gravé sur la pièce" /></label>
            </div>
            <label className={label}>Description détaillée *<textarea required name="description" minLength={20} maxLength={4000} rows={5} className={field + ' h-auto py-3'} placeholder="Provenance, kilométrage connu, fonctionnement, ce qui est fourni…" /></label>
            <label className={label}>Défauts connus / réparations nécessaires<textarea name="defects" rows={2} className={field + ' h-auto py-3'} placeholder="Soyez transparent, même pour les petits défauts." /></label>
          </section>
          <section className="space-y-5 rounded-3xl border border-white/10 bg-[#1a1b1d] p-6">
            <h2 className="text-lg font-bold text-white">02 · Compatibilité véhicule</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={label}>Constructeur compatible *<input required name="compatible_make" maxLength={100} className={field} placeholder="Toyota" /></label>
              <label className={label}>Modèle compatible *<input required name="compatible_model" maxLength={100} className={field} placeholder="Auris" /></label>
              <label className={label}>Carburant compatible
                <select name="compatible_fuel" className={field}>
                  <option value="">Non précisé</option>
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Essence</option>
                  <option value="hybrid">Hybride</option>
                  <option value="phev">Hybride rechargeable</option>
                  <option value="electric">Électrique</option>
                  <option value="lpg">GPL</option>
                  <option value="other">Autre</option>
                </select>
              </label>
              <label className={label}>Code moteur compatible<input name="compatible_engine_code" maxLength={60} className={field} placeholder="Ex. 1ND-TV (facultatif)" /></label>
              <label className={label}>De l’année<input name="compatible_year_from" type="number" min={1950} max={2100} className={field} placeholder="2013" /></label>
              <label className={label}>À l’année<input name="compatible_year_to" type="number" min={1950} max={2100} className={field} placeholder="2018" /></label>
            </div>
            <p className="flex items-start gap-2 text-xs leading-5 text-amber-200/80"><Info className="mt-0.5 h-4 w-4 shrink-0" />La compatibilité est déclarée par le vendeur. Aucun contrôle OEM officiel n’est encore connecté. Les acheteurs doivent confirmer la référence de la pièce auprès du vendeur avant toute transaction.</p>
          </section>
          <section className="space-y-5 rounded-3xl border border-white/10 bg-[#1a1b1d] p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Camera className="h-5 w-5 text-orange-400" /> 03 · Photos de la pièce</h2>
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center hover:border-orange-400/70">
              <Camera className="h-7 w-7 text-orange-400" />
              <span className="text-sm font-semibold text-white">Ajouter 1 à 8 photos</span><span className="text-xs text-zinc-400">JPG, PNG, WebP · 5 Mo maximum par photo</span>
              <input required={photos.length === 0} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => setPhotos(Array.from(e.target.files || []))} />
            </label>
            {photos.length > 0 && <p className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" /> {photos.length} photo(s) sélectionnée(s) : {photos.map((item) => item.name).join(', ')}</p>}
          </section>
          <section className="space-y-5 rounded-3xl border border-white/10 bg-[#1a1b1d] p-6">
            <h2 className="text-lg font-bold text-white">04 · Prix & remise</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className={label}>Prix en DH *<input required name="price_mad" type="number" min={10} max={10000000} step={1} className={field} placeholder="450" /></label>
              <label className={label}>Quantité *<input required name="quantity" type="number" min={1} max={100} defaultValue={1} className={field} /></label>
              <label className={label}>Ville *<input required name="city" maxLength={100} className={field} placeholder="Casablanca" /></label>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-zinc-200">
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} className="accent-orange-500" /> Livraison possible</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} className="accent-orange-500" /> Remise en main propre</label>
            </div>
            <p className="flex gap-2 text-xs leading-5 text-zinc-400"><ShieldCheck className="h-4 w-4 shrink-0 text-orange-400" />Les demandes de commande seront enregistrées. L’encaissement et la réservation de transport automatiques ne sont pas encore connectés.</p>
          </section>
          {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
          <button type="submit" disabled={submitting || authLoading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-base font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Publication…</> : 'Publier mon annonce'}
          </button>
        </form>
      )}
    </div>
  );
}