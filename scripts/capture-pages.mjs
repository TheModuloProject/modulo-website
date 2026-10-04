import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
await mkdir('docs/previews/pages',{recursive:true});
const browser=await chromium.launch({});
const records=[];
try{
 for(const [name,width,height] of [['desktop',1440,960],['tablet',834,1194],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},colorScheme:'light'});
  const page=await context.newPage();
  await page.addInitScript(()=>{window.__cls=0;new PerformanceObserver(list=>list.getEntries().forEach(entry=>{if(!entry.hadRecentInput)window.__cls+=entry.value;})).observe({type:'layout-shift',buffered:true});});
  for(const path of ['/','/work/','/services/','/about/','/contact/','/privacy/','/terms/','/work/fieldnotes/','/work/invoiceit/','/work/interval/']){
   await page.goto(`http://127.0.0.1:3000${path}`);
   await page.waitForFunction(()=>!document.documentElement.classList.contains('motion-ready'));
   await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=innerHeight){scrollTo({top:y,behavior:"instant"});await new Promise(resolve=>setTimeout(resolve,100));}scrollTo({top:0,behavior:"instant"});});
   await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'&&!a.pending));
   const slug=path==='/'?'home':path.split('/').filter(Boolean).join('-');
   for(const theme of ['light','dark']){
    if(await page.locator('html').getAttribute('data-theme')!==theme){await page.locator('.theme-toggle').click();await page.waitForFunction(()=>!document.documentElement.classList.contains('theme-changing'));}
    await page.locator('.footer-location img').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('.footer-location img').complete&&document.querySelector('.footer-location img').naturalWidth>0);
    await page.evaluate(()=>{document.activeElement.blur();scrollTo({top:0,behavior:'instant'});});
    const png=await page.screenshot({fullPage:true});
    await sharp(png).webp({quality:80}).toFile(`docs/previews/pages/${name}-${slug}-${theme}.webp`);
   }
   records.push({name,path,cls:await page.evaluate(()=>window.__cls),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  }
  await context.close();
 }
 await writeFile('docs/pages-measurements.json',JSON.stringify(records,null,2)+'\n');
 console.log(JSON.stringify(records,null,2));
}finally{await browser.close();}
