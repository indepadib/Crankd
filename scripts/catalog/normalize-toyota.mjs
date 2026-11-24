import {readFile,writeFile} from 'node:fs/promises';
const rows=JSON.parse(await readFile('catalog-extraction-review.json','utf8'));
const review=[];
for(const page of rows.filter(p=>p.brand==='Toyota'&&p.status==='structured_candidates')){
 for(const record of page.records){
  const offers=Array.isArray(record.offers)?record.offers:[record.offers].filter(Boolean);
  const prices=offers.flatMap(o=>{
   if(o.priceCurrency!=='MAD')return [];
   const raw=o.price??o.lowPrice;
   if(!/^\d+(\.\d+)?$/.test(String(raw))||Number(raw)<=0)return [];
   return [{amount:Number(raw),kind:o.price!=null?'offer':'starting_at',currency:'MAD',offer_name:o.name??null}];
  });
  review.push({brand:page.brand,model_candidate:record.model??record.name??null,source_url:page.url,prices,engine:record.vehicleEngine??null,fuel:record.fuelType??null,transmission:record.vehicleTransmission??null,image_candidate:record.image??null,publication_status:'needs_review'});
 }
}
await writeFile('catalog-toyota-review.json',JSON.stringify(review,null,2));
console.log(JSON.stringify(review.map(({image_candidate,...r})=>r),null,2));
