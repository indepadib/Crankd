'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';

type Tribe = { id: string; name: string; description: string; city: string | null; owner_id: string };

export default function TribesPage() {
  const { user } = useAuth();
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [feedback, setFeedback] = useState('');
  const [joined, setJoined] = useState<string[]>([]);
  async function load() {
    const { data, error } = await supabase.from('vrooq_tribes').select('id,name,description,city,owner_id').order('created_at', { ascending: false }).limit(100);
    if (error) setFeedback('Clubs temporairement indisponibles.');
    setTribes(data || []);
  }
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!user) { setJoined([]); return; }
    let active = true;
    void supabase.from('vrooq_tribe_members').select('tribe_id').eq('user_id',user.id).then(({data})=>{if(active)setJoined((data||[]).map(x=>x.tribe_id));});
    return ()=>{active=false;};
  }, [user]);
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {setFeedback('Connectez-vous pour créer un club.');return;}
    const {error} = await supabase.from('vrooq_tribes').insert({owner_id:user.id,name:name.trim(),city:city.trim()||null});
    if(error){setFeedback('Création impossible : '+error.message);return;}
    setName('');setCity('');setFeedback('Club créé.');await load();
  }
  async function toggle(tribeId:string){
    if(!user){setFeedback('Connectez-vous pour rejoindre un club.');return;}
    const isMember=joined.includes(tribeId);
    const result=isMember ? await supabase.from('vrooq_tribe_members').delete().eq('tribe_id',tribeId).eq('user_id',user.id)
      : await supabase.from('vrooq_tribe_members').insert({tribe_id:tribeId,user_id:user.id});
    if(result.error){setFeedback('Action impossible : '+result.error.message);return;}
    setJoined(old=>isMember?old.filter(id=>id!==tribeId):[...old,tribeId]);
  }
  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 text-white">
    <header><p className="text-xs font-bold uppercase tracking-widest text-orange-400">VROOQ Community</p><h1 className="mt-3 text-4xl font-black">Tribes & Clubs</h1><p className="mt-3 text-zinc-400">Créez votre club automobile ou rejoignez une communauté réelle. Aucun membre fictif.</p></header>
    <form onSubmit={create} className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-3">
      <label className="text-sm">Nom du club<input required minLength={3} maxLength={100} value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl bg-zinc-800 p-3" /></label>
      <label className="text-sm">Ville<input value={city} onChange={e=>setCity(e.target.value)} className="mt-2 w-full rounded-xl bg-zinc-800 p-3" /></label>
      <button className="self-end rounded-xl bg-orange-500 p-3 font-bold text-black">Créer mon club</button>
    </form>
    {feedback && <p role="status" className="text-sm text-orange-200">{feedback}</p>}
    {tribes.length===0?<p className="rounded-2xl border border-dashed border-white/20 p-8 text-zinc-400">Aucun club publié. Lancez la première Tribe VROOQ.</p>:<div className="grid gap-4 md:grid-cols-2">{tribes.map(tribe=><article key={tribe.id} className="rounded-2xl border border-white/10 bg-zinc-900 p-6"><h2 className="text-xl font-bold">{tribe.name}</h2><p className="mt-2 text-sm text-zinc-400">{tribe.city||'Ville non précisée'}</p><button onClick={()=>void toggle(tribe.id)} className="mt-5 rounded-xl border border-orange-500/40 px-4 py-3 text-sm font-semibold text-orange-300">{joined.includes(tribe.id)?'Quitter le club':'Rejoindre le club'}</button></article>)}</div>}
  </main>;
}
