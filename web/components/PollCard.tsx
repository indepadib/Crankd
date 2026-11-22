'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

export function PollCard({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [options, setOptions] = useState<string[]>([]);
  const [votes, setVotes] = useState<{user_id:string;option_index:number}[]>([]);
  const [mine, setMine] = useState<number | null>(null);
  const [close, setClose] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refresh = async () => {
    const [p,v] = await Promise.all([
      supabase.from('vrooq_polls').select('options,closes_at').eq('post_id',postId).maybeSingle(),
      supabase.from('vrooq_poll_votes').select('user_id,option_index').eq('post_id',postId)
    ]);
    if(p.data){setOptions(p.data.options as string[]);setClose(p.data.closes_at);}
    if(v.data){setVotes(v.data);setMine(v.data.find(x=>x.user_id===user?.id)?.option_index ?? null);}
  };
  useEffect(()=>{void refresh();},[postId,user?.id]);
  if(!options.length)return null;
  const closed=Boolean(close && new Date(close).getTime()<=Date.now());
  const total=votes.length;
  const vote=async(index:number)=>{
    if(!user){setError('Connecte-toi pour voter.');return;}
    if(mine!==null||busy||closed)return;
    setBusy(true);setError('');
    const {error:e}=await supabase.from('vrooq_poll_votes').insert({post_id:postId,user_id:user.id,option_index:index});
    if(e)setError('Vote non enregistré : '+e.message);
    await refresh();setBusy(false);
  };
  return <section className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4" onClick={e=>e.stopPropagation()}>
    <p className="text-xs font-bold uppercase tracking-wider text-orange-400">Sondage · {total} vote{total!==1?'s':''}</p>
    {options.map((option,i)=>{const count=votes.filter(v=>v.option_index===i).length;const pct=total?Math.round(count*100/total):0;return <button key={i} type="button" disabled={mine!==null||busy||closed} onClick={()=>void vote(i)} className="relative block w-full overflow-hidden rounded-xl border border-white/15 p-3 text-left text-sm text-white disabled:cursor-default">
      {(mine!==null||closed)&&<span className="absolute inset-y-0 left-0 bg-orange-500/25" style={{width:pct+'%'}}/>}
      <span className="relative flex justify-between gap-2"><span>{option}{mine===i?' ✓':''}</span>{(mine!==null||closed)&&<span>{pct}%</span>}</span>
    </button>;})}
    {close&&<p className="text-xs text-zinc-400">{closed?'Sondage terminé':'Clôture : '+new Date(close).toLocaleString('fr-MA')}</p>}
    {error&&<p role="alert" className="text-xs text-red-400">{error}</p>}
  </section>;
}
