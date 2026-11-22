'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PartListing, moneyMAD } from '@/lib/parts';

type PublicSeller = { seller_id: string; shop_name: string; seller_kind: string; city: string; verification_status: string };

export default function PublicSellerPage() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<PublicSeller | null>(null);
  const [listings, setListings] = useState<PartListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      const { data, error: sellerError } = await supabase.rpc('get_public_part_seller', { p_seller_id: id });
      if (!active) return;
      const publicSeller = (Array.isArray(data) ? data[0] : null) as PublicSeller | null;
      if (sellerError || !publicSeller) {
        setError('Cette boutique est indisponible ou n’est pas active.');
        setLoading(false);
        return;
      }
      setSeller(publicSeller);
      const { data: items, error: listingError } = await supabase.from('part_listings')
        .select('*').eq('seller_id', id).eq('status', 'active').gt('quantity', 0)
        .order('created_at', { ascending: false }).limit(100);
      if (!active) return;
      if (listingError) setError('Impossible de charger le catalogue pour le moment.');
      else setListings((items || []) as PartListing[]);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [id]);

  return <main className="mx-auto max-w-5xl space-y-7 pb-16">
    <Link href="/marketplace/parts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4"/> Toutes les pièces</Link>
    {loading ? <p role="status" className="text-zinc-400">Chargement de la boutique…</p> : !seller ?
      <p role="alert" className="rounded-xl border border-white/10 p-6 text-zinc-300">{error}</p> :
      <>
        <header className="rounded-3xl border border-white/10 bg-[#1b1c1e] p-7 md:p-10">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400"><Store className="h-7 w-7"/></div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Boutique VROOQ</p>
          <h1 className="mt-2 break-words text-3xl font-black text-white md:text-4xl">{seller.shop_name}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-zinc-300"><MapPin className="h-4 w-4 text-orange-400"/>{seller.city} · {seller.seller_kind === 'garage' ? 'Garage' : seller.seller_kind === 'professional' ? 'Professionnel' : 'Particulier'}</p>
          <p className="mt-3 text-xs text-zinc-400">{seller.verification_status === 'verified' ? 'Identité professionnelle vérifiée' : 'Identité professionnelle non vérifiée'} · Les échanges et commandes passent par VROOQ.</p>
        </header>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Pièces disponibles ({listings.length})</h2>
          {error && <p role="alert" className="text-amber-300">{error}</p>}
          {!error && listings.length === 0 && <p className="rounded-2xl border border-white/10 p-6 text-sm text-zinc-400">Cette boutique ne propose pas encore de pièce disponible.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map(part => <Link key={part.id} href={'/marketplace/parts/' + part.id} className="rounded-2xl border border-white/10 bg-[#1b1c1e] p-5 transition hover:border-orange-500/40">
              <h3 className="line-clamp-2 font-bold text-white">{part.title}</h3>
              <p className="mt-2 text-xs text-zinc-400">{part.compatible_make} {part.compatible_model}</p>
              <p className="mt-3 text-lg font-black text-orange-400">{moneyMAD(part.price_mad)}</p>
            </Link>)}
          </div>
        </section>
      </>}
  </main>;
}
