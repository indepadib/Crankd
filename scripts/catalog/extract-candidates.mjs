import {readFile,writeFile} from 'node:fs/promises';
const index=JSON.parse(await readFile('catalog-page-index.json','utf8'));
const out=[];
const allowed=/prix-version|compare-specifications|\/models\/[^/]+\/?$|\/nos-modeles\/[^/]+\.html$|\/configurator\.html\/finitions$/i;
const excluded=/anciens-modeles|concept|accessoir|contact|categories|newsletter|occasion/i;
function walk(x,found){if(!x||typeof x!=='object')return;if(Array.isArray(x)){for(const v of x)walk(v,found);return;}const types=[x['@type']].flat();if(types.some(t=>['Car','Vehicle','Product'].includes(t)))found.push(x);for(const v of Object.values(x))if(typeof v==='object')walk(v,found);}
async function extractBrand(brand){
 const extra=/\/modeles\/[^/]+\/?$|\/models\/[^/]+\/[^/]+\/?$|\/vehicules\/[^/]+\/overview[^/]*\.html$/i;
 const candidates=brand.pages.filter(u=>{const p=new URL(u).pathname;return (allowed.test(p)||extra.test(p))&&!excluded.test(p)&&! /(?:-old|actualite|news|entretenir)/i.test(p)}).slice(0,24);
 for(const url of candidates){
  try{
   const res=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(12000)});
   if(res.status>=300&&res.status<400)throw Error('Redirect '+res.status+' '+(res.headers.get('location')||''));
   if(!res.ok)throw Error('HTTP '+res.status);
   const html=await res.text(),found=[];
   const diagnostics={title:html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1],jsonScripts:[...html.matchAll(/<script\b[^>]*type=["']application\/json["'][^>]*>/gi)].length,hasNextData:html.includes('__NEXT_DATA__'),hasInitialState:/__INITIAL_STATE__|__PRELOADED_STATE__/.test(html),priceMentions:(html.match(/\b(?:MAD|DH|Dhs)\b/gi)||[]).length};
   for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{walk(JSON.parse(m[1]),found);}catch{}}
   out.push({brand:brand.brand,url,status:found.length?'structured_candidates':'manual_review',diagnostics,records:found.map(x=>({name:x.name,model:x.model,offers:x.offers,vehicleEngine:x.vehicleEngine,fuelType:x.fuelType,vehicleTransmission:x.vehicleTransmission,image:x.image}))});
  }catch(e){out.push({brand:brand.brand,url,status:'error',error:e.message});}
  await new Promise(r=>setTimeout(r,1000));
 }
}
for(let i=0;i<index.length;i+=4)await Promise.all(index.slice(i,i+4).map(extractBrand));
out.sort((a,b)=>a.brand.localeCompare(b.brand)||a.url.localeCompare(b.url));
await writeFile('catalog-extraction-review.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out.map(x=>({brand:x.brand,url:x.url,status:x.status,records:x.records?.length,diagnostics:x.diagnostics,error:x.error,review:x.brand==='Toyota'?x.records?.map(r=>({name:r.name,model:r.model,offers:r.offers,vehicleEngine:r.vehicleEngine,fuelType:r.fuelType,vehicleTransmission:r.vehicleTransmission})):undefined})),null,2));
