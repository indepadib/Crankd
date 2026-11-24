'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CarFront, Check, ChevronRight, GitCompareArrows, Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Brand={id:string;name:string};
type Model={id:string;name:string;segment:string|null;brand_id:string;starting_price_mad:number|null;starting_price_source_url:string|null;starting_price_verified_at:string|null};
type Version={id:string;model_id:string;name:string;model_year:number|null;engine:string|null;gearbox:string|null;fuel:string|null;power_hp:number|null;price_mad:number|null;price_type:string|null;availability:string;source_url:string|null;verified_at:string|null};
const segments=['Tous','Citadine','Berline','Compacte','SUV','Crossover','Monospace','Utilitaire'];
const money=(n:number|null)=>n===null?'Prix à confirmer':new Intl.NumberFormat('fr-MA').format(n)+' DH';
export default function NewCarsPage(){
  const [brands,setBrands]=useState<Brand[]>([]);
  const [models,setModels]=useState<Model[]>([]);
  const [versions,setVersions]=useState<Version[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);
  const [query,setQuery]=useState('');
  const [brand,setBrand]=useState('all');
  const [segment,setSegment]=useState('Tous');
  const [sort,setSort]=useState('brand');
  const [selected,setSelected]=useState<string[]>([]);
  const [onlyPriced,setOnlyPriced]=useState(false);
  useEffect(()=>{let live=true;(async()=>{
    const [b,m,v]=await Promise.all([
      supabase.from('new_car_brands').select('id,name').order('name').limit(500),
      supabase.from('new_car_models').select('id,name,segment,brand_id,starting_price_mad,starting_price_source_url,starting_price_verified_at').eq('active',true).order('name').limit(2000),
      supabase.from('new_car_versions').select('id,model_id,name,model_year,engine,gearbox,fuel,power_hp,price_mad,price_type,availability,source_url,verified_at').not('source_url','is',null).not('verified_at','is',null).limit(5000)
    ]);
    if(!live)return;
    if(b.error||m.error||v.error)setError(true);
    else{setBrands(b.data||[]);setModels(m.data||[]);setVersions(v.data||[]);}
    setLoading(false);
  })();return()=>{live=false};},[]);
  const brandName=(id:string)=>brands.find(b=>b.id===id)?.name||'';
  const modelById=(id:string)=>models.find(m=>m.id===id);
  const visible=useMemo(()=>{
    const q=query.trim().toLocaleLowerCase('fr');
    return models.filter(m=>{
      const associated=versions.filter(v=>v.model_id===m.id);
      return (brand==='all'||m.brand_id===brand)&&(segment==='Tous'||m.segment===segment)&&(!onlyPriced||m.starting_price_mad!=null||associated.some(v=>v.price_mad!==null))&&(!q||[brandName(m.brand_id),m.name,...associated.map(v=>v.name)].join(' ').toLocaleLowerCase('fr').includes(q));
    }).sort((a,b)=>{
      if(sort==='versions')return versions.filter(v=>v.model_id===b.id).length-versions.filter(v=>v.model_id===a.id).length;
      if(sort==='price'){const min=(id:string)=>Math.min(...versions.filter(v=>v.model_id===id&&v.price_mad!==null).map(v=>v.price_mad as number),Infinity);return (a.starting_price_mad??min(a.id))-(b.starting_price_mad??min(b.id));}
      return (brandName(a.brand_id)+' '+a.name).localeCompare(brandName(b.brand_id)+' '+b.name,'fr');
    });
  },[models,versions,brands,query,brand,segment,sort,onlyPriced]);
  const compare=versions.filter(v=>selected.includes(v.id));
  return <main className="mx-auto max-w-7xl pb-36 text-white">
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black px-6 py-12 md:px-12 md:py-16">
      <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"/>
      <div className="relative max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-zinc-300"><CarFront size={15}/> VROOQ AUTO · MAROC</div>
        <h1 className="text-4xl font-black leading-[1.08] tracking-[-.045em] md:text-6xl">La bonne voiture.<br/><span className="text-orange-400">La bonne version.</span></h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400">Explorez les marques, modèles et finitions du marché marocain. Chaque tarif publié doit être daté et relié à une source. Aucune fausse remise, aucun prix inventé.</p>
        <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 border-t border-white/10 pt-6">
          <div><strong className="block text-2xl font-black">{brands.length}</strong><span className="text-xs text-zinc-500">Marques référencées</span></div>
          <div><strong className="block text-2xl font-black">{models.length}</strong><span className="text-xs text-zinc-500">Modèles</span></div>
          <div><strong className="block text-2xl font-black">{versions.length}</strong><span className="text-xs text-zinc-500">Versions vérifiées</span></div>
        </div>
      </div>
    </section>
    <section className="sticky top-0 z-20 mt-6 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl md:p-5" aria-label="Recherche et filtres">
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
        <label className="relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/><input aria-label="Rechercher une marque, un modèle ou une version" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Marque, modèle, finition…" className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none focus:border-orange-400"/></label>
        <select aria-label="Marque" value={brand} onChange={e=>setBrand(e.target.value)} className="h-12 rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm"><option value="all">Toutes les marques</option>{brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select aria-label="Segment" value={segment} onChange={e=>setSegment(e.target.value)} className="h-12 rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm">{segments.map(s=><option key={s}>{s}</option>)}</select>
        <button type="button" onClick={()=>{setQuery('');setBrand('all');setSegment('Tous');setOnlyPriced(false);setSort('brand');}} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-zinc-300 hover:bg-white/10"><X size={16}/> Effacer</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={onlyPriced} onChange={e=>setOnlyPriced(e.target.checked)} className="accent-orange-500"/> Prix renseigné uniquement</label>
        <label className="flex items-center gap-2 text-xs text-zinc-400"><SlidersHorizontal size={15}/> Trier<select value={sort} onChange={e=>setSort(e.target.value)} className="bg-transparent font-semibold text-white"><option className="bg-zinc-900" value="brand">Marque A–Z</option><option className="bg-zinc-900" value="versions">Nombre de versions</option><option className="bg-zinc-900" value="price">Prix croissant</option></select></label>
      </div>
    </section>
    <section className="mt-9">
      <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">Catalogue Maroc</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Explorer les modèles</h2></div><p className="text-sm text-zinc-400">{visible.length} résultat{visible.length>1?'s':''}</p></div>
      {loading?<div role="status" className="rounded-2xl border border-white/10 p-12 text-center text-zinc-400">Chargement du catalogue…</div>:error?<div role="alert" className="rounded-2xl border border-amber-500/20 p-10 text-center text-amber-200">Impossible de charger le catalogue pour le moment. Réessayez ultérieurement.</div>:visible.length===0?<div className="rounded-3xl border border-dashed border-white/20 bg-white/[.025] px-6 py-16 text-center"><CarFront className="mx-auto text-zinc-500" size={34}/><h3 className="mt-4 text-xl font-bold">Aucun modèle publié pour ces critères</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-400">Le référentiel des marques, modèles et finitions est en cours d'alimentation et de vérification. Nous n'affichons pas de fiches fictives pour remplir le catalogue.</p><button onClick={()=>{setQuery('');setBrand('all');setSegment('Tous');setOnlyPriced(false)}} className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">Réinitialiser les filtres</button></div>:<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(m=>{const trims=versions.filter(v=>v.model_id===m.id);const prices=trims.map(v=>v.price_mad).filter((p):p is number=>p!==null);return <article key={m.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70 transition hover:border-white/25"><div className="flex items-center justify-between border-b border-white/10 bg-white/[.025] px-6 py-4"><span className="text-xs font-bold uppercase tracking-widest text-zinc-300">{brandName(m.brand_id)}</span><span className="text-xs text-zinc-500">{m.segment||'Automobile'}</span></div><div className="p-6"><div className="flex items-center gap-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5"><CarFront size={28} className="text-zinc-400"/></div><div><h3 className="text-2xl font-black">{m.name}</h3><p className="text-xs text-zinc-400">{trims.length} version{trims.length>1?'s':''} vérifiée{trims.length>1?'s':''}</p></div></div><div className="mt-6 border-t border-white/10 pt-4"><p className="text-xs text-zinc-500">À partir de</p><p className="mt-1 text-xl font-bold">{m.starting_price_mad!=null?money(m.starting_price_mad):prices.length?money(Math.min(...prices)):'Prix non disponible'}</p>{m.starting_price_source_url&&m.starting_price_mad!=null&&<a href={m.starting_price_source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-orange-300 hover:underline">Tarif constructeur · {m.starting_price_verified_at?.slice(0,10)} <ArrowUpRight size={13}/></a>}</div><div className="mt-4 space-y-2">{trims.map(v=><div key={v.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold">{v.name}</p><p className="mt-1 text-xs text-zinc-400">{[v.engine,v.gearbox,v.fuel].filter(Boolean).join(' · ')||'Détails à compléter'}</p></div><button aria-label={selected.includes(v.id)?'Retirer du comparatif':'Ajouter au comparatif'} disabled={!selected.includes(v.id)&&selected.length>=3} onClick={()=>setSelected(old=>old.includes(v.id)?old.filter(x=>x!==v.id):[...old,v.id])} className={`rounded-lg border p-2 disabled:opacity-30 ${selected.includes(v.id)?'border-orange-400 bg-orange-500/15 text-orange-300':'border-white/15 text-zinc-300'}`}>{selected.includes(v.id)?<Check size={16}/>:<GitCompareArrows size={16}/>}</button></div><p className="mt-2 text-sm font-bold">{money(v.price_mad)} <span className="text-xs font-normal text-zinc-500">{v.price_type==='turnkey'?'clé en main':v.price_type==='showroom'?'showroom':''}</span></p>{v.source_url&&<a href={v.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-orange-300 hover:underline">Source · {v.verified_at?.slice(0,10)} <ArrowUpRight size={13}/></a>}</div>)}</div></div></article>})}</div>}
    </section>
    {selected.length>0&&<section className="fixed bottom-20 left-1/2 z-30 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-orange-500/30 bg-zinc-900 p-4 shadow-2xl md:bottom-6"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold">Comparateur · {selected.length}/3 versions</p><p className="text-xs text-zinc-400">{compare.map(v=>v.name).join(' · ')}</p></div><button onClick={()=>setSelected([])} className="text-xs text-zinc-400 underline">Effacer</button></div><div className="mt-3 grid gap-2 sm:grid-cols-3">{compare.map(v=><div key={v.id} className="rounded-xl bg-white/5 p-3 text-xs"><p className="font-bold">{brandName(modelById(v.model_id)?.brand_id||'')} {modelById(v.model_id)?.name}</p><p className="mt-1 text-zinc-400">{v.name}</p><p className="mt-2 font-bold">{money(v.price_mad)}</p><p className="mt-1 text-zinc-400">{v.power_hp?v.power_hp+' ch · ':''}{v.fuel||'Motorisation à compléter'}</p></div>)}</div></section>}
    <footer className="mt-12 border-t border-white/10 pt-6 text-xs leading-6 text-zinc-500">Les versions publiées nécessitent une source vérifiable. Les prix et disponibilités peuvent changer sans préavis ; confirmer le devis auprès du distributeur. VROOQ ne reproduit pas les bases propriétaires de tiers.</footer>
  </main>;
}
