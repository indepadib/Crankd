'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Box, MapPin, PackageSearch, Plus, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { PART_CATEGORIES, PART_CONDITIONS, PartListing, moneyMAD, partConditionLabel } from '@/lib/parts';

export default function PartsMarketplacePage() {
  const { user } = useAuth();
  const [garageVehicles, setGarageVehicles] = useState<{ id: string; make: string; model: string; year: number }[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [parts, setParts] = useState<PartListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    let active = true;
    async function loadParts() {
      const { data, error: fetchError } = await supabase.from('part_listings')
        .select('*').eq('status', 'active').gt('quantity', 0)
        .order('created_at', { ascending: false }).limit(150);
      if (!active) return;
      if (fetchError) {
        console.warn('[VROOQ Parts] Catalogue non disponible:', fetchError.code);
        setError('Notre catalogue de pièces est temporairement indisponible. Le service est en cours de configuration.');
      }
      else setParts((data || []) as PartListing[]);
      setLoading(false);
    }
    void loadParts();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void supabase.from('vehicles').select('id,make,model,year').eq('owner_id', user.id).then(({ data }) => {
      if (active) setGarageVehicles((data || []) as { id: string; make: string; model: string; year: number }[]);
    });
    return () => { active = false; };
  }, [user]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const garageVehicle = user ? garageVehicles.find((vehicle) => vehicle.id === selectedVehicle) : undefined;
    const results = parts.filter((part) => {
      const matchesVehicle = !garageVehicle || (
        part.compatible_make.toLocaleLowerCase() === garageVehicle.make.toLocaleLowerCase() &&
        (part.compatible_model.toLocaleLowerCase().includes(garageVehicle.model.toLocaleLowerCase()) || garageVehicle.model.toLocaleLowerCase().includes(part.compatible_model.toLocaleLowerCase())) &&
        (!part.compatible_year_from || garageVehicle.year >= part.compatible_year_from) &&
        (!part.compatible_year_to || garageVehicle.year <= part.compatible_year_to)
      );
      const searchable = [part.title, part.description, part.part_brand, part.oem_reference, part.compatible_make, part.compatible_model].join(' ').toLocaleLowerCase();
      return (!needle || searchable.includes(needle)) &&
        (!category || part.category === category) &&
        (!condition || part.part_condition === condition) &&
        (!city || part.city.toLocaleLowerCase().includes(city.toLocaleLowerCase())) && matchesVehicle;
    });
    if (sort === 'price-asc') results.sort((a, b) => a.price_mad - b.price_mad);
    if (sort === 'price-desc') results.sort((a, b) => b.price_mad - a.price_mad);
    return results;
  }, [parts, query, category, condition, city, sort, garageVehicles, selectedVehicle, user]);

  const field = 'h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/60';

  return (
    <div className="space-y-8 pb-12">
      <header className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#211810] via-[#191919] to-[#111213] p-7 md:p-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
            <Box className="h-4 w-4" /> VROOQ PARTS · MAROC
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">La bonne pièce.<br /><span className="text-orange-400">La bonne voiture.</span></h1>
          <p className="max-w-xl text-sm leading-6 text-zinc-300 md:text-base">Pièces automobiles d’occasion entre passionnés : trouvez une référence compatible, vérifiez son état et commandez sans quitter votre espace VROOQ.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/marketplace/parts/new" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-orange-400"><Plus className="h-4 w-4" /> Vendre une pièce</Link>
            <Link href="/marketplace/parts/orders" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">Mes commandes <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/marketplace/parts/mine" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">Mes annonces <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rounded-full bg-orange-600/10 blur-3xl" />
      </header>

      <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
        <p><strong className="text-white">Phase pilote :</strong> annonces et demandes de commande disponibles une fois la base configurée. Paiement sécurisé, collecte et livraison automatique <strong>pas encore activés</strong> ; aucun débit n’est effectué sur ce parcours.</p>
      </div>

      <section aria-label="Rechercher des pièces" className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white"><SlidersHorizontal className="h-4 w-4 text-orange-400" /> Trouver une pièce</div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <label className="relative lg:col-span-2">
            <span className="sr-only">Référence, pièce, marque ou modèle</span>
            <Search className="absolute left-4 top-4 h-4 w-4 text-zinc-400" />
            <input className={field + ' pl-11'} placeholder="Ex. alternateur, 1K0 903, Toyota Auris…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select aria-label="Catégorie" className={field} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Toutes catégories</option>{PART_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <select aria-label="État" className={field} value={condition} onChange={(e) => setCondition(e.target.value)}><option value="">Tous états</option>{PART_CONDITIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <input className={field} aria-label="Ville" placeholder="Ville (Casablanca…)" value={city} onChange={(e) => setCity(e.target.value)} />
          <select aria-label="Filtrer par voiture de mon garage" className={field} disabled={!user || !garageVehicles.length} value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}><option value="">{garageVehicles.length ? "Mon garage : toutes" : "Mon garage : vide"}</option>{garageVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} {vehicle.year}</option>)}</select>
        </div>
        <p className="text-xs text-zinc-500">Le filtre garage utilise la compatibilité déclarée par le vendeur ; confirmez la référence OEM avant achat.</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">{loading ? 'Chargement…' : error ? 'Catalogue indisponible' : filtered.length + ' pièce(s) trouvée(s)'}</p>
          <select aria-label="Trier les résultats" className="rounded-lg border border-white/10 bg-[#202020] px-3 py-2 text-xs text-white" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Plus récentes</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option>
          </select>
        </div>
      </section>

      {error ? (
        <div role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          Impossible de charger les pièces : {error}. Le schéma de la marketplace doit être déployé sur le bon projet Supabase.
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-zinc-400">Chargement des pièces disponibles…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center">
          <PackageSearch className="mx-auto mb-4 h-10 w-10 text-orange-400" />
          <h2 className="text-xl font-bold text-white">Aucune pièce pour cette recherche</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">Modifiez vos filtres ou soyez parmi les premiers à publier une annonce. Nous n’affichons pas de fausses annonces.</p>
          <Link href="/marketplace/parts/new" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">Déposer une annonce</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((part) => (
            <Link key={part.id} href={'/marketplace/parts/' + part.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#1b1c1e] transition hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#262626]">
                {part.images?.[0] ? <Image src={part.images[0]} alt={part.title} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className="object-cover transition duration-500 group-hover:scale-105" /> : <Box className="h-12 w-12 text-zinc-600" />}
                <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{partConditionLabel(part.part_condition)}</span>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3"><h3 className="line-clamp-2 min-h-12 text-base font-bold text-white">{part.title}</h3><span className="whitespace-nowrap text-base font-black text-orange-400">{moneyMAD(part.price_mad)}</span></div>
                <p className="text-xs text-zinc-400">Compatible : {part.compatible_make} {part.compatible_model}{part.compatible_year_from ? ' · ' + part.compatible_year_from : ''}{part.compatible_year_to ? '–' + part.compatible_year_to : ''}</p>
                {part.oem_reference && <p className="truncate text-xs text-zinc-400">Réf. OEM : {part.oem_reference}</p>}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-zinc-400"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {part.city}</span><span className="flex items-center gap-1 font-bold text-orange-300">Voir la pièce <ArrowRight className="h-3 w-3" /></span></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}