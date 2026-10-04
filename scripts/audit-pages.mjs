import {chromium} from '@playwright/test';
import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import {writeFile,mkdir} from 'node:fs/promises';
await mkdir('docs/audits',{recursive:true});
const chrome=await launch({chromePath:process.env.MODULO_BROWSER_PATH || chromium.executablePath(),chromeFlags:['--headless','--disable-background-networking']});
const summaries=[];
try{
 for(const path of (process.argv.slice(2).length ? process.argv.slice(2) : ['/','/work/','/services/','/about/','/contact/','/privacy/','/terms/','/work/fieldnotes/','/work/common-ground/','/work/interval/'])){
  const result=await lighthouse(`http://127.0.0.1:3000${path}`,{port:chrome.port,output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'});
  const slug=path==='/'?'home':path.split('/').filter(Boolean).join('-');
  await writeFile(`docs/audits/${slug}-mobile.json`,result.report);
  const report=result.lhr;
  const summary={path,categories:Object.fromEntries(Object.entries(report.categories).map(([id,item])=>[id,Math.round(item.score*100)])),metrics:Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(id=>[id,report.audits[id].displayValue])),failedAudits:Object.values(report.audits).filter(a=>a.score!==null&&a.score<1&&!['manual','informative','notApplicable'].includes(a.scoreDisplayMode)).map(a=>({id:a.id,title:a.title,value:a.displayValue}))};
  summaries.push(summary);console.log(JSON.stringify(summary));
 }
 if(process.argv.length===2) await writeFile('docs/audits/summary.json',JSON.stringify(summaries,null,2)+'\n');
}finally{await chrome.kill();}
