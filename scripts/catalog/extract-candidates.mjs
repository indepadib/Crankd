import {readFile,writeFile} from 'node:fs/promises';
const index=JSON.parse(await readFile('catalog-page-index.json','utf8'));
const out=[];
const allowed=/prix-version|compare-specifications|\/models\/[^/]+\/?$|\/nos-modeles\/[^/]+\.html$|\/configurator\.html\/finitions$/i;
const excluded=/anciens-modeles|concept|accessoir|contact|categories|newsletter|occasion/i;
function walk(x,found){if(!x||typeof x!=='object')return;if(Array.isArray(x)){for(const v of x)walk(v,found);return;}const types=[x['@type']].flat();if(types.some(t=>['Car','Vehicle','Product'].includes(t)))found.push(x);for(const v of Object.values(x))if(typeof v==='object')walk(v,found);}
for(const brand of index){
 const candidates=brand.pages.filter(u=>allowed.test(new URL(u).pathname)&&!excluded.test(new URL(u).pathname)).slice(0,12);
 for(const url of candidates){
  try{
   const res=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(12000)});
   if(!res.ok)throw Error('HTTP '+res.status);
   const html=await res.text(),found=[];
   for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{walk(JSON.parse(m[1]),found);}catch{}}
   out.push({brand:brand.brand,url,status:found.length?'structured_candidates':'manual_review',records:found.map(x=>({name:x.name,model:x.model,offers:x.offers,vehicleEngine:x.vehicleEngine,fuelType:x.fuelType,vehicleTransmission:x.vehicleTransmission,image:x.image}))});
  }catch(e){out.push({brand:brand.brand,url,status:'error',error:e.message});}
  await new Promise(r=>setTimeout(r,1000));
 }
}
await writeFile('catalog-extraction-review.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out.map(x=>({brand:x.brand,url:x.url,status:x.status,records:x.records?.length,error:x.error})),null,2));
