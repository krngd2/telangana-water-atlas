import {test,expect} from '@playwright/test';

for(const fallback of [false,true])test(`PNG retains credits and model context in ${fallback?'mobile 2D':'desktop 3D'}`,async({page})=>{
  await page.setViewportSize({width:fallback?390:1440,height:1000});
  await page.addInitScript(({fallback})=>{
    if(fallback){const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args);};}
    const fill=CanvasRenderingContext2D.prototype.fillText;
    window.__canvasText=[];
    CanvasRenderingContext2D.prototype.fillText=function(text,...args){window.__canvasText.push(String(text));return fill.call(this,text,...args);};
  },{fallback});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
  if(!fallback)await page.locator('#scene[data-terrain-ready="true"]').waitFor();
  await expect(page).toHaveTitle('Telangana / Water atlas');
  const original=await page.locator(fallback?'#fallback':'#scene canvas').first().evaluate(c=>({width:c.width,height:c.height}));
  await page.evaluate(()=>window.__canvasText=[]);
  await page.locator('#export').click();
  await expect(page.locator('#export-dialog')).toBeVisible();
  await expect(page.locator('#download-image')).toHaveAttribute('download','telangana-elevation.png');
  const image=page.locator('#export-image');
  await expect.poll(()=>image.evaluate(i=>i.complete&&i.naturalHeight>0)).toBe(true);
  const size=await image.evaluate(i=>({width:i.naturalWidth,height:i.naturalHeight}));
  expect(size.width).toBe(original.width);expect(size.height).toBeGreaterThan(original.height);
  const text=await page.evaluate(()=>window.__canvasText.join(' '));
  expect(text).toContain('water routing ~900 m');expect(text).toContain('No flood forecast');
  expect(text).toContain('CC BY 2.5 IN');expect(text).toContain('Natural Earth');
  expect(text).toContain(fallback?'Mapzen / Tilezen':'Produced using Copernicus WorldDEM-30');
  if(!fallback)expect(text).toContain('do not incur any liability');
  await page.locator('#close-export').click();await expect(page.locator('#export-dialog')).toBeHidden();
  expect(errors).toEqual([]);expect(await page.locator('vite-error-overlay').count()).toBe(0);
});
