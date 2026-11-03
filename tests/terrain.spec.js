import {test,expect} from '@playwright/test';
test.use({channel:'chrome',baseURL:'http://127.0.0.1:5173'});
for(const width of [1440,390]){
 test(`Copernicus close-up reaches native resolution at ${width}px`,async({page})=>{
  test.setTimeout(90000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width,height:1000});
  await page.goto('/?lat=17.5169&lon=79.1396');
  await page.locator('#scene[data-terrain-ready="true"]').waitFor({timeout:30000});
  await expect(page.locator('#terrain-detail')).toHaveValue('auto');
  await page.locator('#focus-terrain').click();
  await page.waitForFunction(()=>document.querySelector('#scene').dataset.terrainLevel==='4',null,{timeout:60000});
  await expect(page.locator('#resolution')).toContainText('source ~30 m');
  await expect(page.locator('#exaggeration')).toHaveValue('5');
  await page.locator('#terrain-detail').selectOption('regional');
  await expect(page.locator('#resolution')).toContainText('~900 m');
  await page.locator('#terrain-detail').selectOption('auto');
  await expect(page.locator('#resolution')).toContainText('Copernicus');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
 });
}

for(const width of [1440,390])test(`buffered terrain and rivers cross the state border at ${width}px`,async({page})=>{
 const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
 await page.setViewportSize({width,height:1000});
 await page.goto('/');await page.locator('#scene[data-terrain-ready="true"]').waitFor();
 await expect(page.locator('#scene')).toHaveAttribute('data-context-buffer-km','8');
 expect(Number(await page.locator('#scene').getAttribute('data-outside-river-samples'))).toBeGreaterThan(50);
 await expect(page.locator('.map-caption')).not.toContainText('State boundary');
 await page.locator('#projects').uncheck();await page.locator('#cities').uncheck();
 await page.locator('#scene[data-terrain-patches]').waitFor();
 await page.locator('#scene').scrollIntoViewIfNeeded();
 await page.screenshot({path:`/tmp/telangana-buffer-${width}.png`});
 await page.locator('#rivers').uncheck();await page.locator('#scene').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/telangana-buffer-border-${width}.png`});
 await page.locator('#rivers').check();
 await page.locator('#terrain-detail').selectOption('regional');
 await expect(page.locator('#resolution')).toContainText('~900 m');
 await page.locator('#terrain-detail').selectOption('auto');
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});

test('2D fallback preserves the context halo, border and river toggle',async({page})=>{
 await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args);};});
 await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
 await expect(page.locator('#fallback')).toBeVisible();
 await expect(page.locator('#scene')).toHaveAttribute('data-context-buffer-km','8');
 expect(Number(await page.locator('#scene').getAttribute('data-outside-river-samples'))).toBeGreaterThan(50);
 const before=await page.locator('#fallback').evaluate(c=>c.toDataURL());
 await page.locator('#rivers').uncheck();
 expect(await page.locator('#fallback').evaluate(c=>c.toDataURL())).not.toBe(before);
 await page.locator('#rivers').check();
 await page.getByRole('tab',{name:'Add water',exact:true}).click();
 await page.locator('#coordinates').fill('20.02, 78.5');await page.locator('#set-point').click();
 await expect(page.locator('#input-status')).toContainText('inside the Telangana outline');
});
