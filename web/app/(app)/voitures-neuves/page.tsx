'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Model = { make: string; model: string; segment: string; energy: string; note: string; official: string };
const models: Model[] = [
  {make:'Renault',model:'Clio',segment:'Citadine',energy:'Essence / hybride selon version',note:'Vérifier finition, motorisation et tarif actualisés auprès du constructeur.',official:'https://www.renault.ma/vehicules-hybrides/nouvelle-clio.html'},
  {make:'Dacia',model:'Sandero',segment:'Citadine',energy:'Essence selon version',note:'Comparer les équipements de sécurité et le coût total.',official:'https://www.dacia.ma/'},
  {make:'Dacia',model:'Duster',segment:'SUV',energy:'Selon version',note:'Comparer usage urbain, route et chemins avant de choisir.',official:'https://www.dacia.ma/'},
  {make:'Hyundai',model:'Tucson',segment:'SUV',energy:'Selon version',note:'Comparer consommation, garantie et équipements.',official:'https://www.hyundai.com/ma/'},
  {make:'Kia',model:'Sportage',segment:'SUV',energy:'Selon version',note:'Comparer espace, motorisation et coût de possession.',official:'https://www.kia.com/ma/'},
  {make:'Toyota',model:'Corolla',segment:'Berline',energy:'Selon version',note:'Comparer la disponibilité locale et les finitions.',official:'https://www.toyota.co.ma/'},
  {make:'Volkswagen',model:'Golf',segment:'Compacte',energy:'Selon version',note:'Vérifier la disponibilité et les motorisations au Maroc.',official:'https://www.volkswagen.ma/'},
  {make:'Peugeot',model:'208',segment:'Citadine',energy:'Selon version',note:'Comparer boîte de vitesses, équipements et garantie.',official:'https://www.peugeot.ma/'}
];
export default function NewCarsPage() {
  const [price,setPrice]=useState('');
  const [discount,setDiscount]=useState('0');
  const [registration,setRegistration]=useState('');
  const [paint,setPaint]=useState('0');
  const [luxuryTax,setLuxuryTax]=useState('0');
  const [otherFees,setOtherFees]=useState('0');
  const numeric=(value:string)=>Number(value)||0;
  const total=numeric(price)-numeric(discount)+numeric(registration)+numeric(paint)+numeric(luxuryTax)+numeric(otherFees);
  const [search,setSearch]=useState('');
  const [segment,setSegment]=useState('Tous');
  const [selected,setSelected]=useState<string[]>([]);
  const filtered=useMemo(()=>models.filter(m=>(segment==='Tous'||m.segment===segment)&&`${m.make} ${m.model}`.toLowerCase().includes(search.toLowerCase())),[search,segment]);
  const comparison=models.filter(m=>selected.includes(`${m.make} ${m.model}`));
  return <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 text-white">
    <header className="space-y-3"><p className="text-xs font-bold uppercase tracking-[.25em] text-orange-400">VROOQ • Guide d'achat</p><h1 className="text-4xl font-black tracking-tight md:text-6xl">Quelle voiture neuve choisir au Maroc ?</h1><p className="max-w-3xl text-zinc-400">Explorez une première sélection de modèles et comparez vos favoris. Catalogue en construction : prix, disponibilité, équipements et avis propriétaires ne sont pas encore vérifiés pour toutes les versions. Aucun témoignage inventé.</p></header>
    <section className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-zinc-300">Rechercher une marque ou un modèle<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ex. Clio, Duster…" className="mt-2 w-full rounded-xl border border-white/15 bg-zinc-900 p-3 text-white"/></label><label className="text-sm text-zinc-300">Catégorie<select value={segment} onChange={e=>setSegment(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-zinc-900 p-3 text-white">{['Tous','Citadine','Compacte','Berline','SUV'].map(v=><option key={v}>{v}</option>)}</select></label></section>
    <div className="grid gap-4 md:grid-cols-2">{filtered.map(m=>{const key=`${m.make} ${m.model}`;return <article key={key} className="flex flex-col justify-between gap-5 rounded-3xl border border-white/10 bg-zinc-900/70 p-6"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">{m.segment}</p><h2 className="mt-2 text-2xl font-black">{key}</h2><p className="mt-2 text-sm text-zinc-300">{m.energy}</p><p className="mt-3 text-sm text-zinc-400">{m.note}</p></div><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={()=>setSelected(old=>old.includes(key)?old.filter(v=>v!==key):old.length<3?[...old,key]:old)} disabled={!selected.includes(key)&&selected.length>=3} className="rounded-xl bg-orange-500 px-4 py-2 font-bold text-black disabled:opacity-40">{selected.includes(key)?'Retirer du comparatif':'Comparer'}</button><a href={m.official} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold">Site constructeur</a></div></article>})}</div>
    {filtered.length===0&&<p className="rounded-2xl border border-white/15 p-8 text-zinc-400">Aucun modèle dans cette sélection. Le catalogue sera progressivement enrichi.</p>}
    <section className="space-y-5 rounded-3xl border border-white/10 bg-zinc-900/70 p-6"><div><h2 className="text-2xl font-black">Simulateur de prix clé en main</h2><p className="mt-2 text-sm text-zinc-400">Renseignez les montants de votre devis concessionnaire en dirhams. Aucun montant n'est inventé ni prérempli comme tarif officiel. La simulation ne constitue pas une offre commerciale.</p></div><div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">{([{label:'Prix showroom (DH)',value:price,set:setPrice},{label:'Remise (DH)',value:discount,set:setDiscount},{label:'Immatriculation (DH)',value:registration,set:setRegistration},{label:'Peinture (DH)',value:paint,set:setPaint},{label:'Taxe de luxe (DH)',value:luxuryTax,set:setLuxuryTax},{label:'Autres frais (DH)',value:otherFees,set:setOtherFees}]).map(item=><label key={item.label} className="text-sm text-zinc-300">{item.label}<input type="number" min="0" step="1" value={item.value} onChange={e=>item.set(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-zinc-950 p-3 text-white"/></label>)}</div><div className="rounded-2xl bg-orange-500/10 p-5"><p className="text-sm text-zinc-300">Total estimé, clé en main</p><p className="mt-1 text-3xl font-black text-orange-300">{price.trim()&&registration.trim()&&total>=0?total.toLocaleString('fr-MA')+' DH':'Renseignez prix et immatriculation'}</p><p className="mt-2 text-xs text-zinc-400">Calcul : showroom − remise + immatriculation + peinture + taxe + autres frais. Confirmer tous les frais et promotions auprès du concessionnaire.</p></div></section>
    <section className="space-y-4 rounded-3xl border border-orange-500/30 bg-orange-500/5 p-6"><h2 className="text-2xl font-black">Mon comparatif ({selected.length}/3)</h2>{comparison.length===0?<p className="text-zinc-400">Choisissez jusqu'à trois modèles pour commencer.</p>:<div className="grid gap-3 md:grid-cols-3">{comparison.map(m=><div key={m.model} className="rounded-2xl bg-zinc-900 p-4"><h3 className="font-bold">{m.make} {m.model}</h3><p className="mt-2 text-sm text-zinc-400">{m.segment} • {m.energy}</p><p className="mt-3 text-xs text-amber-300">Prix et avis vérifiés : à venir</p></div>)}</div>}<p className="text-sm text-zinc-400">Pour un conseil fiable, nous distinguerons les données constructeur, les retours propriétaires vérifiés et les discussions publiques citées. Aucun avis Facebook privé ne sera copié sans autorisation.</p><Link href="/garage" className="inline-block text-sm font-bold text-orange-300 underline underline-offset-4">Déjà propriétaire ? Ouvrir mon Garage</Link></section>
  </main>;
}
