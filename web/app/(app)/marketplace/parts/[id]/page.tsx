'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Box, Check, MapPin, Package, ShieldAlert, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { PartListing, moneyMAD, partCategoryLabel, partConditionLabel, readableError } from '@/lib/parts';

export default function PartDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const requestId = useRef<string | null>(null);
  const [part, setPart] = useState<PartListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState<'delivery' | 'pickup'>('delivery');
  const [mainImage, setMainImage] = useState(0);
  const [paymentChannel, setPaymentChannel] = useState<'card' | 'wallet'>('card');
  const [carrierChoice, setCarrierChoice] = useState<'cathedis' | 'amana'>('cathedis');

  useEffect(() => {
    let active = true;
    async function load() {
      const { data, error: fetchError } = await supabase.from('part_listings')
        .select('*').eq('id', params.id).single();
      if (!active) return;
      if (fetchError) setError('Annonce introuvable ou indisponible.');
      else {
        const listing = data as PartListing;
        setPart(listing);
        setShipping(listing.offers_delivery ? 'delivery' : 'pickup');
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [params.id]);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!part || !user || submitting) return;
    setError('');
    setSubmitting(true);
    const fields = new FormData(event.currentTarget);
    const contact = {
      name: String(fields.get('name') || '').trim(),
      phone: String(fields.get('phone') || '').trim(),
      city: String(fields.get('city') || '').trim(),
      address: String(fields.get('address') || '').trim(),
    };
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || auth.user?.id !== user.id) throw new Error('Veuillez vous reconnecter.');
      if (!requestId.current) requestId.current = crypto.randomUUID();
      const { data, error: orderError } = await supabase.rpc('request_part_order_v2', {
        p_listing_id: part.id,
        p_client_request_id: requestId.current,
        p_shipping_method: shipping,
        p_buyer_contact: contact,
        p_payment_channel: paymentChannel,
        p_carrier: shipping === 'pickup' ? 'pickup' : carrierChoice,
      });
      if (orderError) throw orderError;
      if (!data) throw new Error('Aucune commande créée.');
      router.push('/marketplace/parts/orders');
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  const field = 'mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#242528] px-4 text-sm text-white outline-none focus:border-orange-500/60';
  if (loading) return <div className="py-20 text-center text-zinc-400">Chargement de la pièce…</div>;
  if (!part) return <div className="space-y-5 py-12"><p role="alert" className="text-zinc-300">{error}</p><Link className="text-orange-400" href="/marketplace/parts">Retour aux pièces</Link></div>;

  const isSeller = user?.id === part.seller_id;
  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-16">
      <Link href="/marketplace/parts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Toutes les pièces</Link>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#242424]">
            {part.images?.[mainImage] ? <Image src={part.images[mainImage]} alt={part.title} fill sizes="(max-width: 1024px) 100vw, 60vw" unoptimized className="object-contain" /> : <Box className="h-16 w-16 text-zinc-600" />}
          </div>
          {part.images?.length > 1 && <div className="flex flex-wrap gap-3">{part.images.map((src, index) => <button aria-label={'Photo ' + (index + 1)} aria-pressed={mainImage === index} key={src} onClick={() => setMainImage(index)} className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/20 focus:border-orange-500"><Image src={src} alt="" fill sizes="80px" unoptimized className="object-cover" /></button>)}</div>}
          <section className="rounded-2xl border border-white/10 bg-[#1b1c1e] p-6">
            <h2 className="mb-3 text-lg font-bold text-white">Description du vendeur</h2>
            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{part.description}</p>
            {part.defects && <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4"><p className="mb-1 text-sm font-bold text-amber-200">Défauts déclarés</p><p className="whitespace-pre-wrap text-sm text-amber-100/80">{part.defects}</p></div>}
          </section>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#1b1c1e] p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-orange-400">{partCategoryLabel(part.category)} · {partConditionLabel(part.part_condition)}</p>
            <h1 className="text-3xl font-black leading-tight text-white">{part.title}</h1>
            <p className="mt-4 text-3xl font-black text-orange-400">{moneyMAD(part.price_mad)}</p>
            <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm text-zinc-300">
              <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" /> Compatible (déclaré) : {part.compatible_make} {part.compatible_model}{part.compatible_year_from ? ' · ' + part.compatible_year_from : ''}{part.compatible_year_to ? '–' + part.compatible_year_to : ''}</p>
              {part.oem_reference && <p><strong className="text-white">Référence OEM :</strong> {part.oem_reference}</p>}
              {part.part_brand && <p><strong className="text-white">Marque :</strong> {part.part_brand}</p>}
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-400" /> {part.city}</p>
              <p className="flex items-center gap-2"><Package className="h-4 w-4 text-orange-400" /> {part.quantity > 0 ? part.quantity + ' disponible(s)' : 'Stock épuisé'}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1b1c1e] p-6">
            <h2 className="text-xl font-bold text-white">Commander cette pièce</h2>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-xs leading-5 text-orange-100">
              <ShieldAlert className="h-5 w-5 shrink-0 text-orange-400" />
              <span><strong>Commande pilote, sans débit.</strong> Le vendeur recevra une demande et pourra la confirmer. Aucun paiement en ligne, enlèvement ni livraison n’est automatiquement déclenché à cette étape.</span>
            </div>
            {isSeller ? <p className="mt-5 text-sm text-zinc-400">C’est votre annonce. Vous ne pouvez pas vous acheter cette pièce.</p> :
            part.quantity <= 0 || part.status !== 'active' ? <p className="mt-5 text-sm text-amber-200">Pièce indisponible.</p> :
            !user ? <Link href="/login" className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">Se connecter pour commander</Link> :
            <form className="mt-5 space-y-4" onSubmit={placeOrder}>
              <div className="grid gap-3 sm:grid-cols-2">
                {part.offers_delivery && <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 p-3 text-sm text-white"><input checked={shipping === 'delivery'} onChange={() => setShipping('delivery')} type="radio" name="shipping" className="accent-orange-500" /><Truck className="h-4 w-4" /> Livraison à organiser</label>}
                {part.offers_pickup && <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 p-3 text-sm text-white"><input checked={shipping === 'pickup'} onChange={() => setShipping('pickup')} type="radio" name="shipping" className="accent-orange-500" /><MapPin className="h-4 w-4" /> Remise en main propre</label>}
              </div>
              {shipping === 'delivery' && (
                <fieldset className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <legend className="px-1 text-sm font-bold text-white">Transporteur souhaité</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 p-3 text-sm text-white">
                      <input type="radio" name="preferred_carrier" checked={carrierChoice === 'cathedis'} onChange={() => setCarrierChoice('cathedis')} className="accent-orange-500" />
                      Cathedis
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 p-3 text-sm text-white">
                      <input type="radio" name="preferred_carrier" checked={carrierChoice === 'amana'} onChange={() => setCarrierChoice('amana')} className="accent-orange-500" />
                      Amana
                    </label>
                  </div>
                  <p className="text-xs leading-5 text-zinc-400">Ce choix est indicatif : aucun transporteur n’est encore connecté. Frais, enlèvement et bordereau devront être confirmés sur VROOQ avant paiement.</p>
                </fieldset>
              )}
              <fieldset className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <legend className="px-1 text-sm font-bold text-white">Mode de paiement souhaité</legend>
                <div className="grid gap-2">
                  {([
                    ['card', 'Carte bancaire', 'Carte marocaine / internationale'],
                    ['wallet', 'Wallet numérique', 'Sous réserve de la passerelle sélectionnée'],
                  ] as const).map(([value, title, subtitle]) => (
                    <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-white hover:border-orange-400/40">
                      <input type="radio" name="preferred_payment" checked={paymentChannel === value} onChange={() => setPaymentChannel(value)} className="mt-1 accent-orange-500" />
                      <span><span className="block text-sm font-bold">{title}</span><span className="block text-xs text-zinc-400">{subtitle}</span></span>
                    </label>
                  ))}
                </div>
                <p className="text-xs leading-5 text-orange-200">Le paiement se fera uniquement dans le parcours VROOQ avec un prestataire agréé. Cette demande est une réservation non payée, sans débit et sans validation du transport.</p>
              </fieldset>
              <label className="block text-xs font-semibold text-zinc-200">Nom complet *<input required minLength={3} maxLength={120} name="name" className={field} placeholder="Votre nom" /></label>
              <label className="block text-xs font-semibold text-zinc-200">Téléphone *<input required minLength={9} maxLength={20} name="phone" autoComplete="tel" className={field} placeholder="+212 6…" /></label>
              <label className="block text-xs font-semibold text-zinc-200">Ville *<input required minLength={2} maxLength={100} name="city" autoComplete="address-level2" className={field} placeholder="Casablanca" /></label>
              <label className="block text-xs font-semibold text-zinc-200">{shipping === 'pickup' ? 'Adresse / quartier de référence *' : 'Adresse de livraison *'}<textarea required minLength={5} maxLength={300} name="address" rows={2} className={field + ' h-auto py-3'} placeholder="Quartier, rue, immeuble, indications utiles…" /></label>
              <p className="text-xs text-zinc-500">Aucun frais de livraison n’est encore calculé ou encaissé. Vérifiez la compatibilité et l’état de la pièce avant de confirmer ultérieurement le paiement.</p>
              {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
              <button disabled={submitting} type="submit" className="w-full rounded-xl bg-orange-500 px-5 py-4 text-sm font-black text-black hover:bg-orange-400 disabled:opacity-50">{submitting ? 'Enregistrement…' : 'Réserver sans paiement · VROOQ'}</button>
            </form>}
          </div>
        </div>
      </div>
    </div>
  );
}