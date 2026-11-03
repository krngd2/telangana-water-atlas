import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome', baseURL: 'http://127.0.0.1:5173' });

for (const width of [1440, 390]) {
  test(`sidebar tabs work immediately after loading at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await page.locator('#scene[data-ready="true"]').waitFor();

    // Do not change map layers first: that previously masked uninitialized tabs.
    const water = page.getByRole('tab', { name: 'Add water', exact: true });
    const visualisation = page.getByRole('tab', { name: 'Visualisation', exact: true });
    await water.click();
    await expect(page.locator('#panel-water')).toBeVisible();
    await expect(page.locator('#panel-visualisation')).toBeHidden();
    await expect(water).toHaveAttribute('aria-selected', 'true');

    await page.locator('#volume').focus();
    await page.keyboard.press('End');
    await visualisation.click();
    await expect(page.locator('#panel-visualisation')).toBeVisible();
    await visualisation.press('ArrowRight');
    await expect(water).toBeFocused();
    await expect(page.locator('#panel-water')).toBeVisible();
    await expect(page.locator('#volume')).toHaveValue('100');
  });
}

for(const width of [1440,390]) {
  test(`Kaleshwaram markers and details at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize({width,height:1000});
    await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
    await expect(page).toHaveTitle('Telangana / Water atlas');
    const marker=page.locator('[data-project="medigadda"]');
    const card=page.locator('#project-card');
    const seed=await page.evaluate(()=>window.__atlasState.seed);
    await marker.hover();await expect(card).toBeVisible();
    await expect(card.getByRole('heading',{name:'Medigadda',exact:true})).toBeVisible();
    await expect(card.locator('.project-flow')).toContainText('Unavailable');
    await expect(card.locator('.project-observation')).toContainText('Stale');
    await marker.click();await page.mouse.move(10,10);await expect(card).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>window.__atlasState.seed)).toBe(seed);
    await page.screenshot({path:`/tmp/telangana-project-${width}.png`});
    await page.keyboard.press('Escape');await expect(card).toBeHidden();
    await page.locator('#project-site').selectOption('yellampalli');
    await expect(card.getByRole('heading',{name:'Sripada Yellampalli',exact:true})).toBeVisible();
    await expect(card).toContainText('Site water-level observation');
    await page.locator('#projects').uncheck();await expect(card).toBeHidden();
    await expect(marker).toBeHidden();await page.locator('#projects').check();
    await page.locator('#cities').uncheck();await expect(marker).toBeVisible();
    await marker.focus();await expect(card).toBeVisible();
    await page.getByRole('button',{name:'Close project details'}).click();await expect(card).toBeHidden();
    expect(errors).toEqual([]);
    expect(await page.locator('vite-error-overlay').count()).toBe(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}

test('project reload retains observations when published JSON is unavailable',async({page})=>{
  await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
  await page.locator('#project-site').selectOption('medigadda');
  const card=page.locator('#project-card');
  await page.route('**/data/gauges-snapshot.json',r=>r.fulfill({status:404,body:'Unavailable'}));
  await card.getByRole('button',{name:'Reload published readings'}).click();
  await expect(card.locator('#project-refresh-status')).toContainText('Reload failed');
  await expect(card.locator('.project-observation')).toContainText('94.781 m');
  await expect(card.locator('.project-flow')).toContainText('Unavailable');
});

test('touch selection and newly published water-level snapshot',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:1000},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
  await page.locator('[data-project="medigadda"]').tap();
  const card=page.locator('#project-card');await expect(card).toBeVisible();
  await page.route('**/data/gauges-snapshot.json',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({fetchedAt:new Date().toISOString(),sources:[{basin:'Godavari',stations:[{name:'Kaleswaram',river:'Godavari',basin:'Godavari',lat:18.82,lon:79.91,level:95.123,observedAt:new Date().toISOString()}]}]})}));
  await card.getByRole('button',{name:'Reload published readings'}).tap();
  await expect(card.locator('.project-observation')).toContainText('95.123 m');
  await expect(card.locator('.project-observation')).toContainText('Within 24 hours');
  await expect(card.locator('.project-flow')).toContainText('Unavailable');
  await card.getByText('All seven distribution links',{exact:true}).tap();
  await expect(card.locator('.project-links li')).toHaveCount(7);
  await page.screenshot({path:'/tmp/telangana-project-touch.png'});
  await card.getByRole('button',{name:'Close project details'}).tap();await expect(card).toBeHidden();
  await context.close();
});

test('Kaleshwaram locations work without WebGL',async({page})=>{
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args);};});
  await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
  await expect(page.locator('#fallback')).toBeVisible();
  await page.locator('#project-site').selectOption('annaram');
  await expect(page.locator('#project-card')).toContainText('Annaram');
  await expect(page.locator('[data-project="annaram"]')).toBeVisible();
});

test('project stages, comparisons, and shareable selection stay coordinated',async({page})=>{
  await page.setViewportSize({width:1536,height:1024});
  await page.goto('/?project=annaram&compare=gates');await page.locator('#scene[data-ready="true"]').waitFor();
  const card=page.locator('#project-card');
  await expect(card.getByRole('heading',{name:'Annaram',exact:true})).toBeVisible();
  await expect(page.locator('#compare-metric')).toHaveValue('gates');
  await expect(page.locator('.project-stages [data-select-project="annaram"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('.project-stages [data-select-project="sundilla"]').click();
  await expect(card.getByRole('heading',{name:'Sundilla',exact:true})).toBeVisible();
  await expect(page.locator('.comparison-row[data-select-project="sundilla"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('#compare-metric').selectOption('length');
  await expect(card).toContainText('Barrage length');await expect(card.locator('.barrage-comparison')).toContainText('1,426');
  await page.locator('.comparison-row[data-select-project="medigadda"]').click();
  await expect(page).toHaveURL(/project=medigadda/);
  await expect(page).toHaveURL(/compare=length/);
  await expect(page.locator('.project-stages [data-select-project="medigadda"]')).toHaveAttribute('aria-pressed','true');
  await page.reload();await page.locator('#scene[data-ready="true"]').waitFor();
  await expect(card.getByRole('heading',{name:'Medigadda',exact:true})).toBeVisible();
  await expect(page.locator('#compare-metric')).toHaveValue('length');
  await expect(page.locator('.freshness-row')).toHaveCount(7);
  await expect(page.locator('.freshness-intro')).toContainText('/ 7 within 24 hours');
  await expect(page.locator('.storage-composition')).toBeVisible();
  await page.locator('#projects').uncheck();
  await page.locator('#project-site').selectOption('annaram');
  await expect(page.locator('.project-inspector')).toBeVisible();
  await expect(page.locator('#project-dock')).toBeVisible();
  await expect(card.getByRole('heading',{name:'Annaram',exact:true})).toBeVisible();
});

for(const width of [1440,390]){
  test(`water explanation topics, intake and command selection at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const consoleErrors=[];page.on('console',m=>{if(m.type()==='error'&&(!m.location().url||m.location().url.startsWith('http://127.0.0.1:5173')))consoleErrors.push({text:m.text(),url:m.location().url});});
    await page.setViewportSize({width,height:1000});
    await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
    await expect(page).toHaveTitle('Telangana / Water atlas');
    const entry=page.locator('#project-explain-water');await entry.click();
    const dialog=page.getByRole('dialog',{name:'Water system explained'});
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading',{name:'Flowing water needs enough depth at the intake.'})).toBeVisible();
    await expect(page).toHaveURL(/explain=intake/);
    await dialog.locator('#intake-level').focus();await page.keyboard.press('End');
    await expect(dialog.locator('#intake-result')).toContainText('6.5 m above');
    await expect(dialog.locator('#intake-result')).toContainText('Safe operation is not established');
    await dialog.locator('#intake-level').press('Home');
    await expect(dialog.locator('#intake-result')).toContainText('5.5 m below');
    for(const name of ['Lift chain','Hydrology','Basin connections','Command areas','Safety & timeline','Numbers & sources']){
      await dialog.getByRole('tab',{name,exact:true}).click();
      await expect(dialog.locator('[role=tabpanel] h3')).toBeVisible();
      expect(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth)).toBe(true);
      expect(await dialog.locator('#evidence-panel').evaluate(p=>p.scrollWidth<=p.clientWidth)).toBe(true);
      if(name==='Lift chain'&&width===1440){
        await dialog.getByRole('heading',{name:'Reservoir elevation profile · design references'}).evaluate(e=>e.scrollIntoView({block:'start'}));
        await page.screenshot({path:'/tmp/telangana-evidence-chain-1440.png'});
      }
    }
    await dialog.getByRole('tab',{name:'Command areas',exact:true}).click();
    await expect(dialog.locator('.evidence-map path')).toHaveCount(1);
    await dialog.locator('[data-evidence-district="karimnagar"]').click();
    await expect(dialog.locator('.district-detail')).toContainText('800 acres');
    await expect(dialog.locator('.district-detail')).toContainText('Present delivery status unverified');
    await expect(page).toHaveURL(/district=karimnagar/);
    await page.screenshot({path:`/tmp/telangana-evidence-command-${width}.png`});
    await page.reload();await page.locator('#scene[data-ready="true"]').waitFor();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-evidence-district="karimnagar"]')).toHaveAttribute('aria-pressed','true');
    await dialog.getByRole('tab',{name:'Intake & levels',exact:true}).click();
    await page.screenshot({path:`/tmp/telangana-evidence-intake-${width}.png`});
    await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
    await expect(page.locator('#project-card')).toBeVisible();
    expect(await page.locator('vite-error-overlay').count()).toBe(0);
    expect(consoleErrors).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('explanation keyboard focus, site navigation and failed observation refresh',async({page})=>{
  await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
  const entry=page.locator('#project-explain-water');await entry.click();
  const dialog=page.locator('#water-evidence');
  const first=dialog.getByRole('tab',{name:'Intake & levels',exact:true});
  await first.focus();await first.press('ArrowRight');
  await expect(dialog.getByRole('tab',{name:'Lift chain',exact:true})).toBeFocused();
  await dialog.locator('[data-evidence-site="annaram"]').click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('#project-card h2')).toHaveText('Annaram');
  await entry.click();await dialog.getByRole('tab',{name:'Hydrology',exact:true}).click();
  await page.route('**/data/gauges-snapshot.json',r=>r.fulfill({status:404,body:'Unavailable'}));
  await dialog.getByRole('button',{name:'Reload published readings'}).click();
  await expect(dialog.locator('#evidence-refresh-status')).toContainText('Reload failed');
  await expect(dialog.locator('.gauge-evidence-list')).toContainText('94.781 m');
  await dialog.getByRole('button',{name:'Close water system explanation'}).click();
  await expect(entry).toBeFocused();
  await expect(page).not.toHaveURL(/explain=/);
});

test('touch explanation works in the 2D fallback and tolerates invalid URL state',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args);};});
  await page.goto('http://127.0.0.1:5173/?explain=invalid&district=invalid');
  await page.locator('#scene[data-ready="true"]').waitFor();
  const dialog=page.locator('#water-evidence');
  await expect(dialog).toBeVisible();await expect(page).toHaveURL(/explain=intake/);
  await dialog.getByRole('tab',{name:'Command areas',exact:true}).tap();
  await dialog.locator('[data-evidence-district="nizamabad"]').tap();
  await expect(dialog.locator('.district-detail')).toContainText('182,749 acres');
  await expect(dialog.locator('.district-detail')).toBeInViewport();
  await dialog.getByRole('button',{name:'Close water system explanation'}).tap();
  await expect(dialog).toBeHidden();await expect(page.locator('#fallback')).toBeVisible();
  await context.close();
});

for(const width of [1440,390]){
  test(`Tummidihatti historical marker and source comparison at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const consoleErrors=[];page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
    await page.setViewportSize({width,height:1000});
    await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
    await expect(page).toHaveTitle('Telangana / Water atlas');
    const marker=page.locator('[data-project="tummidihatti"]'),card=page.locator('#project-card');
    await expect(marker).toBeVisible();await expect(marker).toContainText('Earlier proposal');
    await expect(page.locator('.project-stages button')).toHaveCount(4);
    await expect(page.locator('.project-network .project-link')).toHaveCount(3);
    const seed=await page.evaluate(()=>window.__atlasState.seed);
    await marker.click();
    await expect(card.getByRole('heading',{name:'Tummidihatti',exact:true})).toBeVisible();
    await expect(card.locator('.historical-badge')).toContainText('outside the KLIP lift sequence');
    await expect(card).toContainText('165.38 TMC');await expect(card).toContainText('~102 TMC');
    await expect(card.locator('.project-flow')).toContainText('Unavailable');
    await expect(card.locator('.project-observation')).toHaveCount(0);
    await expect(page).toHaveURL(/project=tummidihatti/);
    await expect.poll(()=>page.evaluate(()=>window.__atlasState.seed)).toBe(seed);
    if(width===390)await card.getByRole('heading',{name:'Tummidihatti',exact:true}).scrollIntoViewIfNeeded();
    await page.screenshot({path:`/tmp/telangana-tummidihatti-${width}.png`});
    await card.getByRole('button',{name:'Compare with Medigadda'}).click();
    await expect(card.getByRole('heading',{name:'Medigadda',exact:true})).toBeVisible();
    await card.getByRole('button',{name:'Earlier intake: Tummidihatti'}).click();
    await page.reload();await page.locator('#scene[data-ready="true"]').waitFor();
    await expect(card.getByRole('heading',{name:'Tummidihatti',exact:true})).toBeVisible();
    await page.locator('#cities').uncheck();await expect(marker).toBeVisible();
    await page.locator('#projects').uncheck();await expect(marker).toBeHidden();
    await page.locator('#project-site').selectOption('tummidihatti');
    await expect(marker).toBeVisible();await expect(card).toBeVisible();
    await page.keyboard.press('Escape');await expect(card).toBeHidden();
    await marker.focus();await expect(card).toBeVisible();
    expect(await page.locator('vite-error-overlay').count()).toBe(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(errors).toEqual([]);expect(consoleErrors).toEqual([]);
  });
}

test('historical intake works on touch without WebGL and from hydrology details',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args);};});
  await page.goto('http://127.0.0.1:5173/?project=tummidihatti');await page.locator('#scene[data-ready="true"]').waitFor();
  await expect(page.locator('#fallback')).toBeVisible();
  await page.locator('#project-explain-water').tap();
  const dialog=page.locator('#water-evidence');
  await expect(dialog.getByRole('tab',{name:'Hydrology',exact:true})).toHaveAttribute('aria-selected','true');
  await dialog.getByRole('button',{name:'Locate Tummidihatti'}).tap();
  await expect(dialog).toBeHidden();
  await expect(page.locator('#project-card h2')).toHaveText('Tummidihatti');
  await page.getByRole('button',{name:'Close project details'}).tap();
  await page.locator('[data-project="tummidihatti"]').tap();
  await expect(page.locator('#project-card h2')).toHaveText('Tummidihatti');
  await context.close();
});

for(const width of [1440,390])test(`short map callouts and focus layers at ${width}px`,async({page})=>{
  const errors=[],logs=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')logs.push(m.text());});
  await page.setViewportSize({width,height:1000});
  await page.goto('/');await page.locator('#scene[data-ready="true"]').waitFor();
  const card=page.locator('#project-card');
  await expect(card.locator('.site-callout')).toContainText('Block 7');
  await expect(card.locator('.site-callout')).toContainText('~88.5 / ~89.5 m');
  await page.locator('[data-project="kannepalli"]').click();
  await expect(card.locator('#project-card-title')).toHaveText('Kannepalli');
  await expect(card).toContainText('93.5 m');await expect(card).toContainText('4–5 TMC');
  await expect(card.locator('.project-observation')).toHaveCount(0);
  await page.screenshot({path:`/tmp/telangana-intake-labels-${width}.png`});
  await page.locator('#project-view').selectOption('network');
  await expect(page.locator('[data-project="kannepalli"]')).toBeHidden();
  await expect(page.locator('[data-project="nagarjuna-sagar"]')).toBeVisible();
  await expect(page.locator('[data-project="mid-manair"]')).toBeVisible();
  const overlaps=await page.locator('.project-marker:not([hidden])').evaluateAll(nodes=>{
    const boxes=nodes.map(n=>({name:n.dataset.project,r:n.getBoundingClientRect()}));const pairs=[];
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(Math.min(a.r.right,b.r.right)>Math.max(a.r.left,b.r.left)&&Math.min(a.r.bottom,b.r.bottom)>Math.max(a.r.top,b.r.top))pairs.push([a.name,b.name]);}
    return pairs;
  });
  expect(overlaps).toEqual([]);
  await page.locator('#project-site').selectOption('mid-manair');
  await expect(card).toContainText('25.875 TMC');await expect(card).toContainText('not verified live storage');
  await page.locator('#project-site').selectOption('nagarjuna-sagar');
  await expect(card).toContainText('KRISHNA BASIN');
  await expect(page).toHaveURL(/mapview=network/);
  await page.reload();await page.locator('#scene[data-ready="true"]').waitFor();
  await expect(page.locator('#project-view')).toHaveValue('network');
  await expect(card.locator('#project-card-title')).toHaveText('Nagarjuna Sagar');
  await page.screenshot({path:`/tmp/telangana-network-labels-${width}.png`});
  await page.locator('#project-view').selectOption('command');
  await expect(page.locator('.project-view-note')).toContainText('40,888');
  await expect(page.locator('[data-project="command-siddipet"]')).toBeVisible();
  await page.locator('[data-project="command-siddipet"]').click();
  const dialog=page.locator('#water-evidence');await expect(dialog).toBeVisible();
  await expect(dialog.locator('.district-detail')).toContainText('329,616 acres');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('vite-error-overlay').count()).toBe(0);
  expect(errors).toEqual([]);expect(logs).toEqual([]);
});
