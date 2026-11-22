'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { PART_REQUEST_TAXONOMY,partTypes,totalPartTypes } from '@/lib/parts-taxonomy';

type Props={category:string;partName:string;onCategoryChange:(v:string)=>void;onPartNameChange:(v:string)=>void};
const field='mt-2 w-full rounded-xl border border-white/15 bg-[#242527] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none';
function normalize(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();}
export function PartTypePicker({category,partName,onCategoryChange,onPartNameChange}:Props){
  const [open,setOpen]=useState(false);
  const wrapper=useRef<HTMLDivElement>(null);
  const matches=useMemo(()=>partTypes(category).filter(n=>normalize(n).includes(normalize(partName))).slice(0,40),[category,partName]);
  const known=partTypes(category).some(x=>normalize(x)===normalize(partName));
  useEffect(()=>{
    function outside(e:PointerEvent){if(wrapper.current&&!wrapper.current.contains(e.target as Node))setOpen(false);}
    document.addEventListener('pointerdown',outside);
    return()=>document.removeEventListener('pointerdown',outside);
  },[]);
  return <div className="space-y-3">
    <div><label htmlFor="rfq-category" className="block text-sm font-semibold text-zinc-200">Famille de pièce *</label>
      <select id="rfq-category" required className={field} name="category" value={category} onChange={e=>{onCategoryChange(e.target.value);onPartNameChange('');setOpen(false);}}>
        <option value="">Choisir une famille</option>
        {PART_REQUEST_TAXONOMY.map(group=><option key={group.value} value={group.value}>{group.label}</option>)}
      </select>
    </div>
    <div className="relative" ref={wrapper}>
      <label htmlFor="rfq-part" className="block text-sm font-semibold text-zinc-200">Quelle pièce recherches-tu ? *</label>
      <div className="relative">
        <input id="rfq-part" className={field+' pr-10'} role="combobox"
          aria-expanded={open} aria-autocomplete="list" aria-controls="rfq-parts-list"
          required name="part_name" value={partName} disabled={!category}
          minLength={3} maxLength={140} autoComplete="off"
          placeholder={category?'Ex. Alternateur, enjoliveur, courroie…':'Choisis d’abord une catégorie'}
          onFocus={()=>setOpen(true)} onChange={e=>{onPartNameChange(e.target.value);setOpen(true);}}
          onKeyDown={e=>{if(e.key==='Escape')setOpen(false);if(e.key==='Enter'&&open&&matches.length){e.preventDefault();onPartNameChange(matches[0]);setOpen(false);}}}/>
        <Search aria-hidden className="pointer-events-none absolute right-3 top-[50%] mt-0.5 h-4 w-4 text-orange-400"/>
      </div>
      {open&&category&&<div id="rfq-parts-list" role="listbox" className="absolute z-40 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-white/15 bg-[#202124] p-1 text-sm text-white shadow-2xl">
        {matches.map(label=><button key={label} type="button" role="option" aria-selected={normalize(label)===normalize(partName)} onClick={()=>{onPartNameChange(label);setOpen(false);}}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-orange-500/15">{label}{normalize(label)===normalize(partName)&&<Check className="h-4 w-4 text-orange-400"/>}</button>)}
        {!matches.length&&<p className="p-3 text-xs text-zinc-400">Introuvable ? Tu peux garder le nom saisi et préciser les caractéristiques.</p>}
      </div>}
    </div>
    <p className="text-[11px] leading-5 text-zinc-500">{totalPartTypes} types de pièces classés dans {PART_REQUEST_TAXONOMY.length} familles. Tu peux demander une pièce rare ou importée même si elle n’est pas dans cette liste.</p>
    {partName&&!known&&<p className="text-xs leading-5 text-amber-200">Demande personnalisée : indique une référence OEM ou des précisions pour aider les vendeurs.</p>}
  </div>;
}
