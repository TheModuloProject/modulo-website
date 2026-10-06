import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes=['/work/','/services/','/about/'];

test('requested pages have an accessible starburst invitation with working contact actions',async({page},testInfo)=>{
 for(const route of routes){
  await page.goto(route);
  const section=page.locator('[data-starburst-invitation]');
  await expect(section).toHaveCount(1);
  await expect(section.getByRole('heading',{name:'Have something worth building?',exact:true})).toHaveCount(1);
  await section.scrollIntoViewIfNeeded();
  const star=section.getByRole('button',{name:'Change the handwritten message'});
  await expect(star).toBeEnabled();
  await star.focus();
  await page.keyboard.press('Enter');
  await expect(section.locator('#invitation-message')).toHaveText('MAKE IT HAPPEN');
  await star.click();
  await expect(section.locator('#invitation-message')).toHaveText('CREATE SOMETHING GREAT');
  await star.click();
  await expect(section.locator('#invitation-message')).toHaveText("LET'S BUILD IT");
  await expect(section.locator('.invitation-message:not([hidden])')).toHaveCount(1);
  await expect(section.locator('.invitation-email')).toHaveAttribute('href','mailto:hello@themoduloproject.com');
  const light=await star.evaluate(el=>getComputedStyle(el).color);
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).not.toHaveClass(/theme-changing/);
  const dark=await star.evaluate(el=>getComputedStyle(el).color);
  expect(dark).not.toBe(light);
  await section.scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(['desktop','mobile'].includes(testInfo.project.name)){
   for(const theme of ['dark','light']){
    if(await page.locator('html').getAttribute('data-theme')!==theme){await page.locator('.theme-toggle').click();await expect(page.locator('html')).not.toHaveClass(/theme-changing/);}
    await section.scrollIntoViewIfNeeded();
    const audit=await new AxeBuilder({page}).include('[data-starburst-invitation]').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    expect(audit.violations,`${route} ${theme}`).toEqual([]);
   }
  }
  await section.getByRole('link',{name:'Start a project',exact:true}).click();
  await expect(page).toHaveURL(/\/contact\/$/);
 }
 for(const route of ['/','/work/invoiceit/']){
  await page.goto(route);
  await expect(page.locator('[data-starburst-invitation]')).toHaveCount(0);
 }
});

test('copy reports success and failure without losing the email link',async({page})=>{
 await page.addInitScript(()=>{
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedInvitationEmail=text;}}});
 });
 await page.goto('/services/');
 const section=page.locator('[data-starburst-invitation]');
 await section.getByRole('button',{name:'Copy email address'}).click();
 await expect(section.locator('.invitation-copy-status')).toHaveText('Email address copied.');
 expect(await page.evaluate(()=>window.copiedInvitationEmail)).toBe('hello@themoduloproject.com');
 await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('Clipboard unavailable');};});
 await section.getByRole('button',{name:'Copy email address'}).click();
 await expect(section.locator('.invitation-copy-status')).toContainText('Use the email link');
 await expect(section.locator('.invitation-email')).toHaveAttribute('href','mailto:hello@themoduloproject.com');
});

test('draw-in runs once and reduced motion cancels star and stroke animations',async({page})=>{
 await page.goto('/services/');
 const section=page.locator('[data-starburst-invitation]');
 await expect(section).toHaveClass(/invitation-draw-ready/);
 await section.scrollIntoViewIfNeeded();
 await expect(section).toHaveClass(/invitation-drawn/);
 await expect.poll(()=>section.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.animationName!=='invitation-pattern-drift'&&a.playState==='running').length)).toBe(0);
 await page.evaluate(()=>scrollTo(0,0));
 await section.scrollIntoViewIfNeeded();
 expect(await section.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.animationName!=='invitation-pattern-drift'&&a.playState==='running').length)).toBe(0);
 await section.getByRole('button',{name:'Change the handwritten message'}).click();
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>section.evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 await section.getByRole('button',{name:'Change the handwritten message'}).click();
 await expect(section.locator('#invitation-message')).toHaveText('CREATE SOMETHING GREAT');
 expect(await section.evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
});

test('the invitation remains readable with contact links when JavaScript is disabled',async({browser},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','One JavaScript-disabled check is sufficient.');
 const context=await browser.newContext({javaScriptEnabled:false});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:3000/about/');
 const section=page.locator('[data-starburst-invitation]');
 await section.scrollIntoViewIfNeeded();
 await expect(section.locator('.invitation-script').first()).toBeVisible();
 await expect(section.getByRole('link',{name:'Start a project',exact:true})).toHaveAttribute('href','/contact/');
 await expect(section.locator('.invitation-email')).toHaveAttribute('href','mailto:hello@themoduloproject.com');
 expect(await section.locator('.invitation-orbit path').evaluate(el=>getComputedStyle(el).strokeDashoffset)).toBe('0px');
 await context.close();
});
