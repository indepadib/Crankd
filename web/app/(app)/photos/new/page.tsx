'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {supabase} from '@/lib/supabase';
import {useAuth} from '@/context/AuthProvider';

export default function NewGalleryPage(){
 const {user}=useAuth();const router=useRouter();
 const [title,setTitle]=useState('');const [body,setBody]=useState('');
 const [files,setFiles]=useState<File[]>([]);const [previews,setPreviews]=useState<string[]>([]);
 useEffect(()=>{const urls=files.map(f=>URL.createObjectURL(f));setPreviews(urls);return()=>urls.forEach(url=>URL.revokeObjectURL(url));},[files]);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const submit=async(e:React.FormEvent)=>{
 e.preventDefault();setError('');
 if(!user){setError('Connecte-toi pour publier.');return;}
 if(!files.length){setError('Ajoute au moins une photo.');return;}
 setBusy(true);const paths:string[]=[];let postId:string|undefined;
 try{
  const urls:string[]=[];
  for(const file of files){
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Formats acceptés : JPG, PNG, WebP (5 Mo par photo).');
   const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const path=user.id+'/'+crypto.randomUUID()+'.'+ext;
   const {error:uploadError}=await supabase.storage.from('vrooq-post-media').upload(path,file,{contentType:file.type});
   if(uploadError)throw uploadError;
   paths.push(path);urls.push(supabase.storage.from('vrooq-post-media').getPublicUrl(path).data.publicUrl);
  }
  const {data,error:postError}=await supabase.from('posts').insert({author_id:user.id,title:title.trim(),body:body.trim(),image_url:urls[0],content_type:'media',tags:['photos']}).select('id').single();
  if(postError||!data)throw new Error(postError?.message||'Publication impossible');
  postId=data.id;
  const {error:galleryError}=await supabase.from('vrooq_post_media').insert(urls.map((url,position)=>({post_id:postId,position,url})));
  if(galleryError)throw galleryError;
  router.push('/feed?post='+postId);
 }catch(e){if(postId)await supabase.from('posts').delete().eq('id',postId);if(paths.length)await supabase.storage.from('vrooq-post-media').remove(paths);setError(e instanceof Error?e.message:'Erreur de publication');setBusy(false);}
 };
 return <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 text-white">
 <Link href="/feed" className="text-sm text-zinc-400">← Retour au fil</Link>
 <header><p className="text-xs font-bold uppercase tracking-widest text-orange-400">VROOQ Photos</p><h1 className="mt-2 text-3xl font-black">Publier des photos</h1><p className="mt-2 text-zinc-400">Jusqu’à 10 photos par publication, dans l’ordre choisi.</p></header>
 <form onSubmit={submit} className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
 <label className="block text-sm font-semibold">Titre<input required maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3"/></label>
 <label className="block text-sm font-semibold">Description<textarea value={body} onChange={e=>setBody(e.target.value)} rows={4} maxLength={5000} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3"/></label>
 <label className="block text-sm font-semibold">Photos (10 maximum)<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e=>{const list=Array.from(e.target.files||[]);if(list.length>10){setError('Maximum 10 photos.');return;}if(list.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>5*1024*1024)){setError('JPG, PNG ou WebP, 5 Mo maximum par image.');return;}setFiles(list);setError('');}} className="mt-2 block w-full text-sm"/></label>
 {files.length>0&&<div className="grid grid-cols-3 gap-3">{files.map((file,i)=><div key={i} className="rounded-xl border border-white/10 p-2 text-xs">{previews[i]&&<img src={previews[i]} alt={'Aperçu '+(i+1)} className="mb-2 aspect-square w-full rounded-lg object-cover"/>}<p className="truncate">{i+1}. {file.name}</p><button type="button" className="mt-1 text-orange-400" onClick={()=>setFiles(v=>v.filter((_,j)=>j!==i))}>Retirer</button></div>)}</div>}
 {error&&<p role="alert" className="text-sm text-red-400">{error}</p>}
 <button disabled={busy||!user} className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-black disabled:opacity-50">{busy?'Publication…':'Publier les photos'}</button>
 </form></main>;
}
