'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {useAuth} from '@/context/AuthProvider';
import {supabase} from '@/lib/supabase';

export default function NewPollPage(){
 const {user}=useAuth();const router=useRouter();
 const [question,setQuestion]=useState('');const [description,setDescription]=useState('');
 const [options,setOptions]=useState(['','']);const [days,setDays]=useState('7');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const publish=async(e:React.FormEvent)=>{e.preventDefault();setError('');
  const choices=options.map(s=>s.trim());
  if(!user){setError('Connecte-toi avant de publier.');return;}
  if(question.trim().length<8||choices.some(x=>!x)||new Set(choices.map(x=>x.toLowerCase())).size!==choices.length){setError('Question de 8 caractères minimum et réponses distinctes obligatoires.');return;}
  setBusy(true);let postId:string|undefined;
  try{
   const p=await supabase.from('posts').insert({author_id:user.id,title:question.trim(),body:description.trim(),content_type:'poll',tags:['sondage']}).select('id').single();
   if(p.error||!p.data)throw new Error(p.error?.message||'Publication impossible');
   postId=p.data.id;
   const poll=await supabase.from('vrooq_polls').insert({post_id:postId,options:choices,closes_at:new Date(Date.now()+Number(days)*86400000).toISOString()});
   if(poll.error)throw new Error(poll.error.message);
   router.push('/feed?post='+postId);
  }catch(e){if(postId)await supabase.from('posts').delete().eq('id',postId);setError(e instanceof Error?e.message:'Erreur de publication');setBusy(false);}
 };
 return <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 text-white">
  <Link href="/feed" className="text-sm text-zinc-400 hover:text-white">← Retour au fil</Link>
  <header><p className="text-xs font-bold uppercase tracking-widest text-orange-400">VROOQ Community</p><h1 className="mt-2 text-3xl font-black">Créer un sondage</h1><p className="mt-2 text-zinc-400">Une question, des réponses claires et un vote par membre.</p></header>
  <form onSubmit={publish} className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
   <label className="block text-sm font-semibold">Question<input required maxLength={180} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Quelle voiture choisiriez-vous ?" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-white"/></label>
   <label className="block text-sm font-semibold">Contexte (facultatif)<textarea value={description} maxLength={2000} onChange={e=>setDescription(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-white"/></label>
   <fieldset className="space-y-3"><legend className="mb-3 text-sm font-semibold">Réponses</legend>{options.map((o,i)=><div key={i} className="flex gap-2"><input aria-label={'Réponse '+(i+1)} required maxLength={100} value={o} onChange={e=>setOptions(v=>v.map((x,j)=>j===i?e.target.value:x))} placeholder={'Option '+(i+1)} className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 p-3 text-white"/>{options.length>2&&<button type="button" aria-label={'Supprimer option '+(i+1)} onClick={()=>setOptions(v=>v.filter((_,j)=>j!==i))} className="rounded-lg border border-white/15 px-3">×</button>}</div>)}{options.length<6&&<button type="button" onClick={()=>setOptions(v=>[...v,''])} className="text-sm font-semibold text-orange-400">+ Ajouter une réponse</button>}</fieldset>
   <label className="block text-sm font-semibold">Durée<select value={days} onChange={e=>setDays(e.target.value)} className="mt-2 block w-full rounded-xl border border-white/15 bg-zinc-900 p-3"><option value="1">24 heures</option><option value="3">3 jours</option><option value="7">7 jours</option><option value="14">14 jours</option></select></label>
   {error&&<p role="alert" className="text-sm text-red-400">{error}</p>}
   <button disabled={busy||!user} className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-black disabled:opacity-50">{busy?'Publication…':'Publier le sondage'}</button>
   {!user&&<p className="text-sm text-zinc-400">Connecte-toi pour publier.</p>}
  </form>
 </main>;
}
