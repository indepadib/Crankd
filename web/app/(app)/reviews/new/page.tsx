'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {useAuth} from '@/context/AuthProvider';
import {supabase} from '@/lib/supabase';
import {ImageUpload} from '@/components/ui/ImageUpload';

export default function NewReviewPage(){
 const {user}=useAuth();const router=useRouter();
 const [make,setMake]=useState('');const [model,setModel]=useState('');const [year,setYear]=useState('');
 const [engine,setEngine]=useState('');const [rating,setRating]=useState(4);
 const [pros,setPros]=useState('');const [cons,setCons]=useState('');const [verdict,setVerdict]=useState('');
 const [image,setImage]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const publish=async(e:React.FormEvent)=>{
 e.preventDefault();setError('');
 if(!user){setError('Connecte-toi pour publier.');return;}
 if(!make.trim()||!model.trim()||verdict.trim().length<30){setError('Renseigne la voiture et un avis détaillé (30 caractères minimum).');return;}
 setBusy(true);
 let uploadedPath:string|undefined;
 try{
  let url=image;
  if(image.startsWith('data:image/')){
   const blob=await (await fetch(image)).blob();
   if(blob.size>5*1024*1024)throw new Error('Image trop volumineuse (5 Mo maximum).');
   uploadedPath=user.id+'/'+crypto.randomUUID()+'.jpg';
   const {error:uploadError}=await supabase.storage.from('vrooq-post-media').upload(uploadedPath,blob,{contentType:'image/jpeg'});
   if(uploadError)throw uploadError;
   url=supabase.storage.from('vrooq-post-media').getPublicUrl(uploadedPath).data.publicUrl;
  }
  const title='Essai & avis · '+make.trim()+' '+model.trim()+(year?' ('+year+')':'');
  const body=['⭐ '+rating+'/5',engine?'Motorisation : '+engine:'','POINTS FORTS',pros.trim()||'Non renseignés','POINTS À AMÉLIORER',cons.trim()||'Non renseignés','MON AVIS',verdict.trim()].filter(Boolean).join('\n\n');
  const {data,error:insertError}=await supabase.from('posts').insert({author_id:user.id,title,body,image_url:url||null,content_type:'media',tags:['review',make.trim(),model.trim()]}).select('id').single();
  if(insertError||!data)throw new Error(insertError?.message||'Publication impossible');
  router.push('/feed?post='+data.id);
 }catch(e){if(uploadedPath)await supabase.storage.from('vrooq-post-media').remove([uploadedPath]);setError(e instanceof Error?e.message:'Publication impossible');setBusy(false);}
 };
 const input='mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-white';
 return <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 text-white">
  <Link href="/feed" className="text-sm text-zinc-400">← Retour au fil</Link>
  <header><p className="text-xs font-bold uppercase tracking-widest text-orange-400">VROOQ Reviews</p><h1 className="mt-2 text-3xl font-black">Partager un avis automobile</h1><p className="mt-2 text-zinc-400">Une vraie expérience, un modèle précis et un verdict utile à la communauté.</p></header>
  <form onSubmit={publish} className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
   <div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Marque<input required maxLength={60} value={make} onChange={e=>setMake(e.target.value)} placeholder="Toyota" className={input}/></label><label className="text-sm font-semibold">Modèle<input required maxLength={80} value={model} onChange={e=>setModel(e.target.value)} placeholder="Auris" className={input}/></label></div>
   <div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Année<input type="number" min="1950" max="2028" value={year} onChange={e=>setYear(e.target.value)} className={input}/></label><label className="text-sm font-semibold">Motorisation<input maxLength={100} value={engine} onChange={e=>setEngine(e.target.value)} placeholder="1.4 D-4D" className={input}/></label></div>
   <label className="block text-sm font-semibold">Note : {rating}/5<input aria-label="Note sur cinq" type="range" min="1" max="5" step="1" value={rating} onChange={e=>setRating(Number(e.target.value))} className="mt-3 w-full accent-orange-500"/></label>
   <label className="block text-sm font-semibold">Points forts<textarea value={pros} onChange={e=>setPros(e.target.value)} rows={2} maxLength={1200} className={input}/></label>
   <label className="block text-sm font-semibold">Points faibles<textarea value={cons} onChange={e=>setCons(e.target.value)} rows={2} maxLength={1200} className={input}/></label>
   <label className="block text-sm font-semibold">Votre avis détaillé<textarea required minLength={30} value={verdict} onChange={e=>setVerdict(e.target.value)} rows={5} maxLength={5000} placeholder="Confort, fiabilité, consommation, coût d'entretien, comportement routier…" className={input}/></label>
   <ImageUpload value={image} onChange={setImage} label="Photo personnelle du véhicule (facultative)"/>
   {error&&<p role="alert" className="text-sm text-red-400">{error}</p>}
   <button disabled={busy||!user} className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-black disabled:opacity-50">{busy?'Publication…':'Publier mon avis'}</button>
  </form>
 </main>;
}
