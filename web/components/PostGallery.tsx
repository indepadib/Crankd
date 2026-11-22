'use client';
import {useEffect,useState} from 'react';
import {supabase} from '@/lib/supabase';
export function PostGallery({postId,cover}:{postId:string;cover?:string}){
 const [urls,setUrls]=useState<string[]>(cover?[cover]:[]);
 const [active,setActive]=useState(0);
 useEffect(()=>{let live=true;supabase.from('vrooq_post_media').select('url').eq('post_id',postId).order('position').then(({data})=>{if(live&&data?.length)setUrls(data.map(x=>x.url));});return()=>{live=false;};},[postId]);
 if(!urls.length)return null;
 return <div className="relative overflow-hidden rounded-2xl bg-black/40" onClick={e=>e.stopPropagation()}>
  <img src={urls[active]} alt={'Photo '+(active+1)+' de la publication'} loading="lazy" className="max-h-[550px] w-full object-contain"/>
  {urls.length>1&&<><button type="button" aria-label="Photo précédente" onClick={()=>setActive(v=>(v-1+urls.length)%urls.length)} className="absolute left-3 top-1/2 rounded-full bg-black/70 px-3 py-2 text-white">‹</button><button type="button" aria-label="Photo suivante" onClick={()=>setActive(v=>(v+1)%urls.length)} className="absolute right-3 top-1/2 rounded-full bg-black/70 px-3 py-2 text-white">›</button><div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">{active+1}/{urls.length}</div></>}
 </div>;
}
