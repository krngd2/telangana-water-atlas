import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const base='http://127.0.0.1:5173',out=new URL('../docs/screenshots/',import.meta.url);
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),errors=[];
try{
  for(const mobile of [false,true]){
    const context=await browser.newContext({viewport:{width:mobile?390:1440,height:1000},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()}: ${r.url()}`);});
    await page.goto(base);await page.locator('#scene[data-ready="true"]').waitFor();
    await page.locator('#scene[data-terrain-ready="true"]').waitFor();
    await expect(page).toHaveTitle('Telangana / Water atlas');
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    await page.evaluate(()=>document.fonts.ready);
    await expect.poll(async()=>Number(await page.locator('#scene').getAttribute('data-terrain-patches'))).toBeGreaterThan(0);
    await page.mouse.move(0,0);
    await page.screenshot({path:fileURLToPath(new URL(mobile?'atlas-mobile.png':'atlas-overview.png',out)),fullPage:false});
    if(!mobile){
      await page.locator('#explain-water').click();await expect(page.locator('#water-evidence')).toBeVisible();
      await page.locator('#evidence-panel').evaluate(el=>{const target=el.querySelector('.evidence-two');el.scrollTop+=target.getBoundingClientRect().top-el.getBoundingClientRect().top-18;});
      await page.screenshot({path:fileURLToPath(new URL('intake-explainer.png',out))});
      await page.locator('[data-evidence-topic="chain"][role="tab"]').click();
      await expect(page.locator('#evidence-panel')).toContainText('Yellampalli');
      await page.locator('#evidence-panel').evaluate(el=>{const target=el.querySelector('.evidence-section');el.scrollTop+=target.getBoundingClientRect().top-el.getBoundingClientRect().top-18;});
      await page.screenshot({path:fileURLToPath(new URL('lift-chain.png',out))});
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await context.close();
  }
  if(errors.length)throw Error(errors.join('\n'));
  console.log('Four real app screenshots captured; identity, console, asset and overflow checks passed.');
}finally{await browser.close();}
