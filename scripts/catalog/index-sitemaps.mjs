import {readFile,writeFile} from 'node:fs/promises';
const report=JSON.parse(await readFile(process.argv[2]||'catalog-sources-report.json','utf8'));
const output=[];
for(const s of report.results){
 const origin=new URL(s.source).origin, queue=[...(s.sitemaps||[])], seen=new Set(), pages=new Set(), errors=[];
 while(queue.length&&seen.size<15){
  const url=queue.shift();if(seen.has(url)||new URL(url).origin!==origin)continue;seen.add(url);
  try{
   const res=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(12000)});
   if(!res.ok)throw Error('HTTP '+res.status);
   const xml=await res.text();if(xml.length>5000000)throw Error('oversized sitemap');
   if(!/<(?:urlset|sitemapindex)\b/i.test(xml))throw Error('not sitemap XML');
   const index=/<sitemapindex\b/i.test(xml);
   for(const match of xml.matchAll(/<loc\b[^>]*>([^<]+)<\/loc>/gi)){
    const link=new URL(match[1].trim().replaceAll('&amp;','&'));
    if(link.origin!==origin||link.protocol!=='https:')continue;
    if(index)queue.push(link.href);
    else if(/gamme|model|vehicul|voiture|configur|prix|version|brochure|\.pdf/i.test(link.pathname))pages.add(link.href);
   }
  }catch(e){errors.push({url,error:e.message});}
  await new Promise(r=>setTimeout(r,500));
 }
 output.push({brand:s.brand,pages:[...pages].sort(),sitemaps_checked:seen.size,truncated:queue.length>0,errors});
}
await writeFile('catalog-page-index.json',JSON.stringify(output,null,2));
console.log(JSON.stringify(output.map(x=>({...x,pages:x.pages.length,sample:x.pages.slice(0,10)})),null,2));
