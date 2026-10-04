import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes=['/work/','/services/','/about/','/contact/','/privacy/','/terms/','/work/fieldnotes/','/work/invoiceit/','/work/interval/'];
const settle = page => expect(page.locator('html')).not.toHaveClass(/motion-ready|theme-changing/);

test('every page has working assets, a single title and a responsive layout',async({page})=>{
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 for(const route of routes){
  const response=await page.goto(route);
  expect(response.status()).toBe(200);
  await settle(page);
  expect(await page.locator('h1').count()).toBe(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://themoduloproject.com${route}`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const stamp=page.getByRole('img',{name:'Vintage Abu Dhabi postage stamp with crossed flags'});
  await stamp.scrollIntoViewIfNeeded();
  await expect.poll(()=>stamp.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  expect(await page.evaluate(()=>document.querySelectorAll('a[href*="undefined"]').length)).toBe(0);
 }
 expect(errors).toEqual([]);
});

test('all new pages are accessible in both themes',async({page},testInfo)=>{
 test.setTimeout(120000);
 test.skip(!['desktop','mobile'].includes(testInfo.project.name),'Axe runs on desktop and mobile; all sizes have separate layout checks.');
 for(const route of routes){
  await page.goto(route);
  await settle(page);
  for(const theme of ['light','dark']){
   if(await page.locator('html').getAttribute('data-theme')!==theme){await page.locator('.theme-toggle').click();await settle(page);}
   const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   expect(result.violations,`${route} ${theme}`).toEqual([]);
  }
 }
});

test('service details are keyboard accessible and expose the correct capabilities',async({page})=>{
 await page.goto('/services/');
 const rows=page.locator('.service-row');
 expect(await rows.count()).toBe(3);
 for(const row of await rows.all()){
  await row.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(row).toHaveAttribute('open','');
  await expect(row.locator('li').first()).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(row).not.toHaveAttribute('open','');
 }
});

test('modulo resolves into the logo and responds to inputs with reduced motion',async({page})=>{
 await page.goto('/about/');
 await page.locator('[data-modulo]').scrollIntoViewIfNeeded();
 await expect(page.getByRole('button',{name:'Run again'})).toBeVisible({timeout:6000});
 await expect(page.locator('[data-remainder-value]')).toHaveText('2');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('#modulo-input').fill('26');
 await expect(page.locator('[data-input-value]')).toHaveText('26');
 await expect(page.locator('[data-remainder-value]')).toHaveText('1');
 await page.getByRole('button',{name:'Run the sequence'}).click();
 await expect(page.locator('.system-modules')).toHaveCSS('opacity','1');
 expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'||a.pending).length)).toBe(0);
 await page.locator('.theme-toggle').scrollIntoViewIfNeeded();
 await page.locator('.theme-toggle').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});

test('contact validates fields and prepares an encoded, editable-by-email enquiry',async({page})=>{
 const posts=[];
 page.on('request',request=>{if(request.method()==='POST')posts.push(request.url());});
 await page.goto('/contact/');
 await page.getByRole('button',{name:'Prepare email',exact:true}).click();
 await expect(page.locator('[data-draft-preview]')).not.toBeVisible();
 await page.getByLabel('Name (required)').fill('Razan');
 await page.getByLabel('Company',{exact:true}).fill('Example & Co');
 await page.getByLabel('Email (required)').fill('razan@example.com');
 await page.getByLabel('What are we building?').fill('A portal for <img src=x onerror=alert(1)> & Arabic content.');
 await page.getByLabel('Web application',{exact:true}).check();
 await page.getByLabel('Approximate budget').selectOption('AED 25,000–50,000');
 await page.getByLabel('Timeline',{exact:true}).selectOption('1–3 months');
 await page.getByRole('button',{name:'Prepare email',exact:true}).click();
 await expect(page.locator('[data-draft-preview]')).toBeVisible();
 const href=await page.getByRole('link',{name:'Open email draft'}).getAttribute('href');
 const url=new URL(href);
 expect(url.pathname).toBe('hello@themoduloproject.com');
 expect(url.searchParams.get('subject')).toBe('Project enquiry — Web application');
 expect(url.searchParams.get('body')).toContain('Example & Co');
 expect(url.searchParams.get('body')).toContain('<img src=x onerror=alert(1)>');
 expect(url.searchParams.get('body')).toContain('AED 25,000–50,000');
 expect(await page.locator('[data-draft-preview] img').count()).toBe(0);
 await expect(page.getByRole('link',{name:'Open email draft'})).toBeFocused();
 expect(posts).toEqual([]);
 expect(await page.evaluate(()=>Object.keys(localStorage))).not.toContain('enquiry');
});

test('concept previews respond to taps without changing real data',async({page})=>{
 await page.goto('/work/fieldnotes/');
 await page.getByRole('button',{name:'Change perspective'}).click();
 await expect(page.locator('[data-example]')).toHaveClass(/is-alternate/);
 await page.goto('/work/interval/');
 await page.getByRole('button',{name:'Today',exact:true}).click();
 await expect(page.locator('[data-filter-output]')).toHaveText('2 tasks in view');
 await expect(page.locator('[data-example] [data-day="tomorrow"]')).not.toBeVisible();
 await page.getByRole('button',{name:'All work'}).click();
 await expect(page.locator('[data-example] [data-day="tomorrow"]')).toBeVisible();
});

test('internal links resolve, placeholder stories stay out of search, and legal pages are linked',async({page,request},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','One route crawl is sufficient.');
 const links=new Set();
 for(const route of ['/',...routes]){
  await page.goto(route);
  for(const href of await page.locator('a[href^="/"]').evaluateAll(items=>items.map(item=>item.getAttribute('href'))))links.add(href.split('#')[0]);
  if(route.startsWith('/work/')&&route!=='/work/'&&route!=='/work/invoiceit/')await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
 }
 for(const path of links)expect((await request.get(path)).status(),path).toBe(200);
 const sitemap=await (await request.get('/sitemap.xml')).text();
 expect(sitemap).toContain('https://themoduloproject.com/privacy/');
 expect(sitemap).toContain('https://themoduloproject.com/work/invoiceit/');
 expect(sitemap).not.toContain('/work/fieldnotes/');
 expect(sitemap).not.toContain('/work/interval/');
 await page.goto('/');
 await page.getByRole('link',{name:'View our work'}).click();
 await expect(page).toHaveURL(/\/work\/$/);
});

test('Fieldnotes leads the portfolio and Invoiceit replaces Common Ground with the supplied image',async({page,request})=>{
 for(const route of ['/','/work/']){
  await page.goto(route);
  await expect(page.locator('.work-item-1').getByRole('heading',{name:'Fieldnotes',exact:true})).toHaveCount(1);
  await expect(page.locator('.work-item-1 .project-link')).toHaveAttribute('href','/work/fieldnotes/');
  const project=page.locator('.work-item-2');
  await expect(project.getByRole('heading',{name:'Invoiceit',exact:true})).toHaveCount(1);
  await expect(project.locator('.project-link')).toHaveAttribute('href','/work/invoiceit/');
  await expect(project.locator('.project-view')).toHaveText('View project');
  await expect(project.locator('img')).toHaveAttribute('src','/assets/invoiceit-cover.webp');
  await expect(page.locator('.work-grid')).not.toContainText('Common Ground');
 }
 const response=await page.goto('/work/invoiceit/');
 expect(response.status()).toBe(200);
 await expect(page.locator('.case-lede')).toContainText('create, manage, update, and generate professional invoices across multiple business licenses');
 await expect(page.locator('.placeholder-note')).toHaveCount(0);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow, max-image-preview:large');
 const link=page.getByRole('link',{name:'Open Invoiceit',exact:true});
 await expect(link).toHaveAttribute('href','https://qaydsoftware.netlify.app/auth/login');
 await expect(link).toHaveAttribute('rel','noopener noreferrer');
 await expect(page.locator('.case-preview img')).toHaveAttribute('src','/assets/invoiceit-cover.webp');
 for(const image of await page.locator('img[src*="invoiceit-login"]').all()){
  await image.scrollIntoViewIfNeeded();
  await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBe(true);
 }
 expect((await request.get('/work/fieldnotes/')).status()).toBe(200);
 expect((await request.get('/work/common-ground/')).status()).toBe(404);
});

test('without JavaScript, content and contact fallback remain available without submitting form data',async({browser},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','JavaScript-disabled content is independent of the project viewport.');
 const context=await browser.newContext({javaScriptEnabled:false});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:3000/contact/');
 await expect(page.getByRole('button',{name:'Prepare email',exact:true})).toBeDisabled();
 await expect(page.getByRole('heading',{name:'Let’s build it.'})).toBeVisible();
 await expect(page.locator('.contact-email')).toHaveAttribute('href','mailto:hello@themoduloproject.com');
 await page.goto('http://127.0.0.1:3000/about/');
 await expect(page.locator('[data-input-value]')).toHaveText('17');
 await expect(page.locator('[data-remainder-value]')).toHaveText('2');
 await context.close();
});
