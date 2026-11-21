'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Box, Plus, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { PartListing, moneyMAD, readableError } from '@/lib/parts';

export default function MyPartListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<PartListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [changes, setChanges] = useState<Record<string, { price_mad: string; quantity: string; status: string }>>({});

  const refresh = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data, error: fetchError } = await supabase.from('part_listings')
      .select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
    if (fetchError) setError(readableError(fetchError));
    else { setItems((data || []) as PartListing[]); setError(''); }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void supabase.from('part_listings').select('*').eq('seller_id', user.id)
      .order('created_at', { ascending: false }).then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) setError(readableError(fetchError));
        else { setItems((data || []) as PartListing[]); setError(''); }
        setLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  function edit(id: string, key: 'price_mad' | 'quantity' | 'status', value: string, item: PartListing) {
    setChanges((previous) => ({ ...previous, [id]: {
      price_mad: previous[id]?.price_mad ?? String(item.price_mad),
      quantity: previous[id]?.quantity ?? String(item.quantity),
      status: previous[id]?.status ?? item.status,
      [key]: value,
    } }));
  }

  async function save(item: PartListing) {
    if (!user) return;
    const next = changes[item.id];
    if (!next) return;
    const price = Number(next.price_mad);
    const quantity = Number(next.quantity);
    if (!Number.isInteger(price) || price < 10 || price > 10000000 || !Number.isInteger(quantity) || quantity < 0 || quantity > 100) {
      setError('Prix ou quantité invalide.');
      return;
    }
    setBusy(item.id);
    setError('');
    const { error: updateError } = await supabase.from('part_listings')
      .update({ price_mad: price, quantity, status: next.status, updated_at: new Date().toISOString() })
      .eq('id', item.id).eq('seller_id', user.id);
    if (updateError) setError(readableError(updateError));
    else {
      setChanges((previous) => { const copy = { ...previous }; delete copy[item.id]; return copy; });
      await refresh();
    }
    setBusy('');
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      <Link href="/marketplace/parts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Retour aux pièces</Link>
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">Espace vendeur</p><h1 className="mt-2 text-4xl font-black text-white">Mes annonces</h1><p className="mt-2 text-sm text-zinc-400">Pilotez vos prix, disponibilités et annonces.</p></div><div className="flex flex-wrap gap-2"><Link href="/marketplace/parts/sell" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white">Ma boutique</Link><Link href="/marketplace/parts/new" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-black"><Plus className="h-4 w-4" /> Nouvelle pièce</Link></div></div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
      {!authLoading && !user ? <p className="text-zinc-400">Connectez-vous pour gérer vos annonces. <Link className="text-orange-400" href="/login">Connexion</Link></p> :
      loading ? <p className="py-16 text-center text-zinc-400">Chargement…</p> :
      items.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 p-16 text-center"><Box className="mx-auto mb-4 h-10 w-10 text-orange-400" /><p className="text-zinc-300">Vous n’avez encore rien publié.</p></div> :
      <div className="space-y-4">{items.map((item) => {
        const current = changes[item.id] || { price_mad: String(item.price_mad), quantity: String(item.quantity), status: item.status };
        return <article key={item.id} className="grid gap-5 rounded-2xl border border-white/10 bg-[#1b1c1e] p-5 md:grid-cols-[120px_1fr]">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-[#28292b]">{item.images?.[0] ? <Image src={item.images[0]} alt={item.title} fill sizes="120px" unoptimized className="object-cover" /> : <Box className="h-8 w-8 text-zinc-600" />}</div>
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between gap-3"><Link href={'/marketplace/parts/' + item.id} className="font-bold text-white hover:text-orange-400">{item.title}</Link><span className="text-sm font-bold text-orange-400">{moneyMAD(item.price_mad)}</span></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs text-zinc-400">Prix (DH)<input type="number" min={10} step={1} value={current.price_mad} onChange={(e) => edit(item.id, 'price_mad', e.target.value, item)} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#28292b] px-3 text-sm text-white" /></label>
              <label className="text-xs text-zinc-400">Stock disponible<input type="number" min={0} max={100} step={1} value={current.quantity} onChange={(e) => edit(item.id, 'quantity', e.target.value, item)} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#28292b] px-3 text-sm text-white" /></label>
              <label className="text-xs text-zinc-400">Visibilité<select value={current.status} onChange={(e) => edit(item.id, 'status', e.target.value, item)} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#28292b] px-3 text-sm text-white"><option value="active">Active</option><option value="paused">En pause</option><option value="archived">Archivée</option></select></label>
            </div>
            <div className="flex justify-end"><button disabled={!changes[item.id] || busy === item.id} onClick={() => save(item)} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-black disabled:opacity-40"><Save className="h-4 w-4" /> Enregistrer</button></div>
          </div>
        </article>;
      })}</div>}
      <p className="text-xs leading-6 text-zinc-500">Le stock affiché correspond aux quantités disponibles, après les réservations de commandes en cours. Ne rajoutez pas les unités déjà promises à un acheteur.</p>
    </div>
  );
}