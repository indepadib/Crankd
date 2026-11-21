'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Box, Check, ClipboardList, Loader2, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { PartOrder, moneyMAD, readableError } from '@/lib/parts';

const ORDER_LABELS: Record<PartOrder['order_status'], string> = {
  pending_seller: 'En attente du vendeur',
  accepted: 'Acceptée · remise à organiser',
  shipped: 'Expédiée (déclarée par le vendeur)',
  delivered: 'Réception confirmée par l’acheteur',
  cancelled: 'Annulée',
};

export default function PartOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<PartOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [shippingInputs, setShippingInputs] = useState<Record<string, { carrier: string; tracking: string }>>({});

  const refresh = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data, error: fetchError } = await supabase.from('part_orders').select('*')
      .or('buyer_id.eq.' + user.id + ',seller_id.eq.' + user.id)
      .order('created_at', { ascending: false }).limit(100);
    if (fetchError) setError(readableError(fetchError));
    else { setOrders((data || []) as PartOrder[]); setError(''); }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void supabase.from('part_orders').select('*')
      .or('buyer_id.eq.' + user.id + ',seller_id.eq.' + user.id)
      .order('created_at', { ascending: false }).limit(100).then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) setError(readableError(fetchError));
        else { setOrders((data || []) as PartOrder[]); setError(''); }
        setLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  async function transition(id: string, next: string) {
    if (busy) return;
    setBusy(id);
    setError('');
    try {
      const inputs = shippingInputs[id];
      const { error: updateError } = await supabase.rpc('transition_part_order', {
        p_order_id: id,
        p_next_status: next,
        p_carrier: inputs?.carrier || null,
        p_tracking_number: inputs?.tracking || null,
      });
      if (updateError) throw updateError;
      await refresh();
    } catch (caught) { setError(readableError(caught)); }
    finally { setBusy(''); }
  }

  function changeShipping(id: string, key: 'carrier' | 'tracking', value: string) {
    setShippingInputs((previous) => ({
      ...previous, [id]: { carrier: previous[id]?.carrier || '', tracking: previous[id]?.tracking || '', [key]: value },
    }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      <Link href="/marketplace/parts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Retour à la marketplace</Link>
      <header className="space-y-2"><p className="text-xs font-bold uppercase tracking-widest text-orange-400">Mes achats & mes ventes</p><h1 className="text-4xl font-black text-white">Commandes de pièces</h1><p className="text-sm text-zinc-400">Suivez les demandes reçues et envoyées sans perdre le fil des étapes.</p></header>
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
        <ClipboardList className="mt-1 h-5 w-5 shrink-0" />
        <p>VROOQ enregistre pour l’instant les demandes et le suivi déclaratif. <strong>Ni encaissement, ni génération de bordereau, ni preuve de livraison transporteur</strong> ne sont disponibles tant que les prestataires ne sont pas connectés. Un statut « livré » ne signifie pas « payé ».</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
      {!authLoading && !user ? <div className="rounded-2xl border border-white/10 bg-[#1c1d1f] p-8 text-center"><p className="mb-5 text-zinc-300">Connectez-vous pour retrouver vos commandes.</p><Link href="/login" className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">Se connecter</Link></div> :
      loading ? <p className="py-16 text-center text-zinc-400">Chargement des commandes…</p> :
      orders.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 p-16 text-center"><Box className="mx-auto mb-4 h-10 w-10 text-orange-400" /><h2 className="text-lg font-bold text-white">Pas encore de commandes</h2><p className="mt-2 text-sm text-zinc-400">Les prochaines demandes de pièces apparaîtront ici.</p><Link href="/marketplace/parts" className="mt-5 inline-flex text-sm font-bold text-orange-400">Explorer les pièces</Link></div> :
      <div className="space-y-5">
        {orders.map((order) => {
          const isSeller = user?.id === order.seller_id;
          const isBuyer = user?.id === order.buyer_id;
          const input = shippingInputs[order.id] || { carrier: '', tracking: '' };
          return (
            <article key={order.id} className="space-y-5 rounded-2xl border border-white/10 bg-[#1b1c1e] p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">{isSeller ? 'Vente' : 'Achat'} · {new Date(order.created_at).toLocaleDateString('fr-MA')}</p>
                  <Link href={'/marketplace/parts/' + order.listing_id} className="mt-2 block text-xl font-bold text-white hover:text-orange-400">{order.item_title}</Link>
                  <p className="mt-2 text-sm text-zinc-400">Réf. commande {order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right"><p className="text-xl font-black text-white">{moneyMAD(order.item_price_mad)}</p><p className="mt-2 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-300">{ORDER_LABELS[order.order_status]}</p></div>
              </div>
              <div className="grid gap-4 border-t border-white/10 pt-4 text-sm md:grid-cols-2">
                <div><p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">Remise</p><p className="text-white">{order.shipping_method === 'delivery' ? 'Livraison à organiser' : 'Remise en main propre'}</p><p className="mt-1 text-zinc-400">{order.buyer_contact.city} · {order.buyer_contact.address}</p></div>
                <div><p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">Coordonnées acheteur</p><p className="text-white">{order.buyer_contact.name}</p><p className="text-zinc-400">{order.buyer_contact.phone}</p></div>
              </div>
              {order.tracking_number && <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 text-sm text-zinc-300"><Truck className="h-4 w-4 text-orange-400" /> Suivi déclaré : {order.carrier} · {order.tracking_number}</div>}
              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                {isSeller && order.order_status === 'pending_seller' && <button disabled={busy === order.id} onClick={() => transition(order.id, 'accepted')} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-black"><Check className="h-4 w-4" /> Accepter</button>}
                {isSeller && order.order_status === 'accepted' && order.shipping_method === 'delivery' && <div className="flex w-full flex-wrap items-center gap-2">
                  <input aria-label="Transporteur" placeholder="Transporteur" maxLength={80} value={input.carrier} onChange={(e) => changeShipping(order.id, 'carrier', e.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#292a2d] px-3 text-sm text-white" />
                  <input aria-label="Numéro de suivi" placeholder="N° de suivi réel" maxLength={120} value={input.tracking} onChange={(e) => changeShipping(order.id, 'tracking', e.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#292a2d] px-3 text-sm text-white" />
                  <button disabled={busy === order.id || input.carrier.trim().length < 2 || input.tracking.trim().length < 4} onClick={() => transition(order.id, 'shipped')} className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50">Marquer expédié</button>
                </div>}
                {isBuyer && (order.order_status === 'shipped' || (order.order_status === 'accepted' && order.shipping_method === 'pickup')) && <button disabled={busy === order.id} onClick={() => transition(order.id, 'delivered')} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-black">Confirmer la réception</button>}
                {(isBuyer || isSeller) && ['pending_seller','accepted'].includes(order.order_status) && <button disabled={busy === order.id} onClick={() => { if (window.confirm('Annuler cette demande ? Le stock sera restitué.')) void transition(order.id, 'cancelled'); }} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-zinc-300 hover:text-white">{isSeller ? 'Refuser / annuler' : 'Annuler la demande'}</button>}
                {busy === order.id && <Loader2 className="h-4 w-4 animate-spin text-orange-400" />}
              </div>
              <p className="text-xs text-zinc-500">Paiement : non initié · Transport : non intégré à un opérateur · VROOQ ne confirme pas les encaissements sur cette version.</p>
            </article>
          );
        })}
      </div>}
    </div>
  );
}