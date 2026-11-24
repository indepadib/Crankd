// Node 20+, no dependencies. Validate a reviewed JSON batch before import.
import {readFile} from 'node:fs/promises';
const input=JSON.parse(await readFile(process.argv[2],'utf8'));
if(!Array.isArray(input)||!input.length)throw Error('Expected nonempty array');
const seen=new Set();
const quote=x=>x==null?'NULL':"'"+String(x).replaceAll("'","''")+"'";
const num=x=>x==null?'NULL':String(x);
for(const [i,r] of input.entries()){
  for(const k of ['brand','model','version','source_url','verified_at'])if(typeof r[k]!=='string'||!r[k].trim())throw Error('Row '+i+': missing '+k);
  const u=new URL(r.source_url);
  if(u.protocol!=='https:'||u.username||u.password)throw Error('Invalid source '+i);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(r.verified_at)||!Number.isFinite(Date.parse(r.verified_at))||Date.parse(r.verified_at)>Date.now())throw Error('Invalid verification date '+i);
  for(const k of ['price_mad','power_hp'])if(r[k]!=null&&(!Number.isFinite(r[k])||r[k]<=0))throw Error('Invalid '+k+' '+i);
  if(!['showroom','turnkey','unknown'].includes(r.price_type))throw Error('Invalid price type '+i);
  const key=[r.brand,r.model,r.version].map(x=>x.trim().toLowerCase()).join('|');
  if(seen.has(key))throw Error('Duplicate '+key);seen.add(key);
}
const lines=['BEGIN;','LOCK TABLE public.new_car_versions IN SHARE ROW EXCLUSIVE MODE;'];
for(const r of input){
 const b=quote(r.brand.trim()),m=quote(r.model.trim()),v=quote(r.version.trim());
 lines.push(`INSERT INTO public.new_car_brands(name) VALUES (${b}) ON CONFLICT(name) DO NOTHING;`);
 lines.push(`INSERT INTO public.new_car_models(brand_id,name,market,active) SELECT id,${m},'MA',true FROM public.new_car_brands WHERE name=${b} ON CONFLICT(brand_id,name,market) DO UPDATE SET active=true;`);
 const fields=`engine=${quote(r.engine)},gearbox=${quote(r.gearbox)},fuel=${quote(r.fuel)},power_hp=${num(r.power_hp)},price_mad=${num(r.price_mad)},price_type=${quote(r.price_type)},source_url=${quote(r.source_url)},verified_at=${quote(r.verified_at)}`;
 const model=`(SELECT m.id FROM public.new_car_models m JOIN public.new_car_brands b ON b.id=m.brand_id WHERE b.name=${b} AND m.name=${m} AND m.market='MA')`;
 lines.push(`UPDATE public.new_car_versions SET ${fields} WHERE model_id=${model} AND name=${v} AND model_year IS NULL;`);
 lines.push(`INSERT INTO public.new_car_versions(model_id,name,engine,gearbox,fuel,power_hp,price_mad,price_type,source_url,verified_at) SELECT ${model},${v},${quote(r.engine)},${quote(r.gearbox)},${quote(r.fuel)},${num(r.power_hp)},${num(r.price_mad)},${quote(r.price_type)},${quote(r.source_url)},${quote(r.verified_at)} WHERE NOT EXISTS(SELECT 1 FROM public.new_car_versions WHERE model_id=${model} AND name=${v} AND model_year IS NULL);`);
}
lines.push('COMMIT;');console.log(lines.join('\n'));
