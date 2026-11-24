// Discover public catalog links; no bypass of access controls.
import {writeFile} from 'node:fs/promises';
const sources=[['Dacia','https://www.dacia.ma/'],['Renault','https://www.renault.ma/'],['Toyota','https://www.toyota.co.ma/'],['Peugeot','https://www.peugeot.ma/'],['Volkswagen','https://www.volkswagen.ma/'],["Hyundai","https://www.hyundai.ma/"],["Kia","https://www.kia.ma/"],["Citroën","https://www.citroen.ma/"],["Opel","https://www.opel.ma/"],["Fiat","https://www.fiat.ma/"],["Jeep","https://www.jeep.ma/"],["Škoda","https://www.skoda.ma/"],["Seat","https://www.seat.ma/"],["Cupra","https://www.cupra.ma/"],["BMW","https://www.bmw.ma/"],["Mercedes-Benz","https://www.mercedes-benz.ma/"],["Audi","https://www.audi.ma/"],["Ford","https://www.ford.ma/"],["Nissan","https://www.nissan.ma/"],["Suzuki","https://www.suzuki.ma/"]];
const results=[];
for(const [brand,source] of sources){
 try{
 const base=new URL(source);
 const res=await fetch(new URL('/robots.txt',base),{signal:AbortSignal.timeout(15000),redirect:'error'});
 if(!res.ok)throw Error('robots HTTP '+res.status);
 const robots=await res.text();
 if(/<html/i.test(robots))throw Error('robots returned HTML');
 const maps=[...robots.matchAll(/^\s*Sitemap:\s*(https:\/\/\S+)\s*$/gim)].map(m=>m[1]).filter(x=>new URL(x).origin===base.origin);
 results.push({brand,source,sitemaps:[...new Set(maps)],status:maps.length?'discovered':'manual_review'});
 }catch(e){results.push({brand,source,status:'manual_review',error:String(e.message)});}
}
await writeFile(process.argv[2]||'catalog-sources-report.json',JSON.stringify({checked_at:new Date().toISOString(),results},null,2));
console.log(JSON.stringify(results,null,2));
