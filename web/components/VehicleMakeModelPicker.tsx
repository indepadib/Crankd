'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import catalog from '@/data/vehicle-catalog-global.json';

type Make = {id:string;name:string;models:string[]};
type Props = {
  make:string;model:string;onMakeChange:(next:string)=>void;onModelChange:(next:string)=>void;
  makeName?:string;modelName?:string;required?:boolean;className?:string;
};

const makes = catalog.makes as Make[];
const normalized=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();
const inputClass='mt-1.5 w-full rounded-xl border border-white/15 bg-[#242528] px-4 py-3 pr-10 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none';
type ComboboxProps={
 label:string;value:string;name:string;required:boolean;disabled?:boolean;
 options:string[];placeholder:string;onChange:(v:string)=>void;
};
function SearchCombobox({label,value,name,required,disabled,options,placeholder,onChange}:ComboboxProps){
  const ref=useRef<HTMLDivElement>(null);
  const listId=useId();
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(0);
  const inputRef=useRef<HTMLInputElement>(null);
  const matches=useMemo(()=>{
    const q=normalized(value);
    const exact=options.find(s=>normalized(s)===q);
    const candidates=q ? options.filter(s=>normalized(s).includes(q)) : options;
    const sorted=exact?[exact,...candidates.filter(s=>s!==exact)]:candidates;
    return sorted.slice(0,35);
  },[value,options]);
  useEffect(()=>{
    const close=(e:PointerEvent)=>{
      if(ref.current && !ref.current.contains(e.target as Node))setOpen(false);
    };
    document.addEventListener('pointerdown',close);
    return()=>document.removeEventListener('pointerdown',close);
  },[]);
  function choose(option:string){onChange(option);setOpen(false);setActive(0);inputRef.current?.focus();}
  return(
    <div className="relative" ref={ref}>
      <label htmlFor={listId+'-input'} className="block text-sm font-semibold text-zinc-200">{label}{required?' *':''}</label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute right-3 top-[50%] mt-0.5 h-4 w-4 text-orange-400"/>
        <input
          ref={inputRef} id={listId+'-input'} name={name} className={inputClass} autoComplete="off"
          role="combobox" aria-autocomplete="list" aria-expanded={open && !disabled} aria-controls={open && !disabled ? listId+'-options' : undefined}
          aria-activedescendant={open && !disabled && matches.length ? listId+'-'+Math.min(active,matches.length-1) : undefined}
          value={value} placeholder={placeholder} disabled={disabled} required={required} maxLength={90}
          onFocus={()=>setOpen(true)}
          onChange={e=>{onChange(e.target.value);setActive(0);setOpen(true);}}
          onKeyDown={e=>{
            if(e.key==='Escape'){setOpen(false);return;}
            if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);setActive(v=>matches.length ? Math.min(v+1,matches.length-1) : 0);}
            if(e.key==='ArrowUp'){e.preventDefault();setActive(v=>Math.max(0,v-1));}
            if(e.key==='Enter' && open && matches.length){e.preventDefault();choose(matches[Math.min(active,matches.length-1)]||matches[0]);}
          }}
        />
      </div>
      {open && !disabled && (
        <div id={listId+'-options'} role="listbox" className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-white/15 bg-[#202124] p-1.5 text-sm shadow-2xl">
          {matches.length>0?matches.map((option,i)=>(
            <button key={option} id={listId+'-'+i} role="option" aria-selected={normalized(option)===normalized(value)}
              type="button" tabIndex={-1} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(option)}
              className={'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-zinc-100 hover:bg-orange-500/15 '+(active===i?'bg-orange-500/10':'')}>
              <span>{option}</span>{normalized(option)===normalized(value)&&<Check className="h-4 w-4 text-orange-400"/>}
            </button>
          )):<div className="p-3 text-xs text-zinc-400">Aucun résultat dans ce référentiel. Tu peux conserver ta saisie pour un modèle importé ou rare.</div>}
          {options.length>35 && !value && <p className="border-t border-white/10 p-2 text-[11px] text-zinc-500">Tape quelques lettres pour parcourir plus de modèles.</p>}
        </div>
      )}
    </div>
  );
}

export function VehicleMakeModelPicker({make,model,onMakeChange,onModelChange,makeName='make',modelName='model',required=true,className=''}:Props){
  const exactMake=useMemo(()=>makes.find(m=>normalized(m.name)===normalized(make)),[make]);
  const makeOptions=useMemo(()=>makes.map(m=>m.name),[]);
  const modelOptions=useMemo(()=>exactMake?.models||[],[exactMake]);
  const exactModel=Boolean(model&&modelOptions.some(m=>normalized(m)===normalized(model)));
  const custom=Boolean((make&&!exactMake)||(model&&exactMake&&!exactModel));
  return(
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2">
        <SearchCombobox label="Marque" name={makeName} value={make} options={makeOptions}
          onChange={next=>{if(normalized(next)!==normalized(make))onModelChange('');onMakeChange(next);}}
          placeholder="Rechercher une marque…" required={required}/>
        <SearchCombobox label="Modèle" name={modelName} value={model}
          options={modelOptions} onChange={onModelChange} disabled={!make.trim()}
          placeholder={make.trim()?'Rechercher un modèle…':'Choisis d’abord la marque'} required={required}/>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] leading-5 text-zinc-500">
        <ChevronDown className="h-3 w-3 text-orange-400"/>
        <span>{makes.length} marques · {makes.reduce((n,m)=>n+m.models.length,0).toLocaleString('fr-MA')} modèles automobiles et utilitaires, y compris imports.</span>
        <a href="https://vehiclesdb.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-orange-300">Vehicle data by VehiclesDB</a>
        <span>CC BY 4.0 · {catalog.version}</span>
      </div>
      {custom && <p className="mt-1 text-xs leading-5 text-amber-200">Marque/modèle hors référentiel : la saisie libre est acceptée, sans garantie d’identification ou de compatibilité de pièces.</p>}
      <p className="mt-1 text-[11px] leading-4 text-zinc-500">Le catalogue est mondial ; il ne certifie pas qu’un modèle soit commercialisé ou homologué au Maroc.</p>
    </div>
  );
}
