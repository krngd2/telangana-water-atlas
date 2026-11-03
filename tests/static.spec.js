import {test,expect} from '@playwright/test';
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));let server,origin;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.geojson':'application/json','.bin':'application/octet-stream','.woff2':'font/woff2'};
test.use({channel:'chrome'});
test.beforeAll(async()=>{
 server=http.createServer(async(req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://static').pathname),file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}try{const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{await new Promise(resolve=>server.close(resolve));});
for(const width of [1440,390])test(`static-only hosting supports native terrain and published gauges at ${width}px`,async({page})=>{
 test.setTimeout(90000);const forbidden=[],errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
 await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==origin||url.pathname.startsWith('/api/')){forbidden.push(url.href);return route.abort();}return route.continue();});
 await page.setViewportSize({width,height:1000});await page.goto(origin+'/?lat=17.5169&lon=79.1396');
 await page.locator('#scene[data-ready="true"]').waitFor();await page.locator('#scene[data-terrain-ready="true"]').waitFor();
 await expect(page).toHaveTitle('Telangana / Water atlas');await expect(page.locator('#gauge-rows tr')).toHaveCount(7);
 await page.locator('#focus-terrain').click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.terrainLevel==='4',null,{timeout:60000});
 await page.locator('#refresh').click();await expect(page.locator('#gauge-status')).toContainText('published JSON');await expect(page.locator('#refresh')).toBeEnabled();
 // Simulate a newer published file; the browser must load it without a backend.
 const snapshot=JSON.parse(await fs.readFile(path.join(root,'data/gauges-snapshot.json'),'utf8'));
 snapshot.fetchedAt=new Date().toISOString();const station=snapshot.sources.find(s=>s.basin==='Godavari').stations.find(s=>s.name==='Kaleswaram');station.level=95.123;station.observedAt=new Date().toISOString();
 await page.route('**/data/gauges-snapshot.json',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(snapshot)}));
 await page.locator('#refresh').click();await expect(page.locator('#gauge-rows')).toContainText('95.123 m');
 // Invalid JSON must leave those successful readings intact.
 await page.route('**/data/gauges-snapshot.json',route=>route.fulfill({contentType:'application/json',body:'{"sources":[]}'}));
 await page.locator('#refresh').click();await expect(page.locator('#gauge-status')).toContainText('Reload failed');await expect(page.locator('#gauge-rows')).toContainText('95.123 m');
 await page.screenshot({path:`/tmp/telangana-static-${width}.png`});
 expect(forbidden).toEqual([]);expect(errors).toEqual([]);expect(missing).toEqual([]);
});
