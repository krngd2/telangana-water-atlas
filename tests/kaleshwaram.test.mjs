import test from 'node:test';
import assert from 'node:assert/strict';
import {PROJECT_SITES,MAP_SITES,projectObservation} from '../src/kaleshwaram.mjs';
import {TUMMIDIHATTI,tummidihattiMarkup} from '../src/tummidihatti.mjs';
import {CONTEXT_SITES,SITE_CALLOUTS,calloutMarkup} from '../src/map-callouts.mjs';
const now=Date.parse('2026-10-29T12:00:00Z');
const river={name:'Kaleswaram',level:94.781,observedAt:'2026-02-18T11:30:00+05:30'};
const reservoir={name:'Sripada Yellampalli Project',level:138.45,observedAt:'2026-10-29T11:00:00Z'};
const data={sources:[{basin:'Godavari',stations:[river,reservoir]}]};
test('barrage cards distinguish nearby river levels from site observations',()=>{
  for(const site of PROJECT_SITES.slice(0,3)){
    const reading=projectObservation(site,data,now);
    assert.equal(reading.station,river);
    assert.match(reading.freshness,/Stale/);
    assert.equal(reading.station.discharge,undefined);
  }
  const reading=projectObservation(PROJECT_SITES[3],data,now);
  assert.equal(reading.station,reservoir);
  assert.match(reading.freshness,/Within 24 hours/);
});
test('missing, future and invalid observation times never appear current',()=>{
  assert.equal(projectObservation(PROJECT_SITES[0],null,now).station,null);
  assert.equal(projectObservation(PROJECT_SITES[3],{sources:[{basin:'Godavari',stations:[river]}]},now).station,null);
  for(const [time,label] of [['2026-11-01T12:00:00Z',/Future/],['invalid',/Invalid/]]){
    assert.match(projectObservation(PROJECT_SITES[0],{sources:[{basin:'Godavari',stations:[{...river,observedAt:time}]}]},now).freshness,label);
  }
});
test('historical intake uses sourced coordinates without joining the lift chain or borrowing a gauge',()=>{
  assert.ok(Math.abs(TUMMIDIHATTI.lat-19.5958333333)<1e-8);
  assert.ok(Math.abs(TUMMIDIHATTI.lon-79.7833333333)<1e-8);
  assert.equal(MAP_SITES.at(-1),TUMMIDIHATTI);
  assert.equal(PROJECT_SITES.length,4);
  assert.ok(PROJECT_SITES.every(s=>!s.historical));
  assert.equal(projectObservation(TUMMIDIHATTI,data,now).station,null);
  const markup=tummidihattiMarkup();
  assert.match(markup,/regional proposal locator/i);
  assert.match(markup,/not a surveyed original PCSS alignment/);
  assert.match(markup,/165\.38 TMC/);
  assert.doesNotMatch(markup,/id="compare-metric"|class="project-observation"/);
});
test('map callouts separate dated statements, capacities and live operating data',()=>{
  assert.equal(new Set(MAP_SITES.map(s=>s.id)).size,MAP_SITES.length);
  for(const id of ['medigadda','annaram','sundilla']){
    assert.equal(SITE_CALLOUTS[id].tone,'constrained');
    assert.match(calloutMarkup(PROJECT_SITES.find(s=>s.id===id)),/dated/);
  }
  const intake=CONTEXT_SITES.find(s=>s.id==='kannepalli');
  assert.equal(projectObservation(intake,data,now).station,null);
  assert.match(calloutMarkup(intake),/93\.5 m/);
  assert.match(calloutMarkup(intake),/89\.9 m · not a typical range or live reading/);
  for(const s of CONTEXT_SITES.filter(s=>['mid-manair','mallanna-sagar','kondapochamma'].includes(s.id))){
    assert.match(calloutMarkup(s),/not verified live storage/);
  }
});

import {comparisonMarkup,ageGeometry,designProfile,storageComposition} from '../src/project-visuals.mjs';
test('design comparisons use zero-baseline, common-unit scales',()=>{
  const storage=comparisonMarkup(PROJECT_SITES,'medigadda','storage');
  assert.ok(Math.abs(Number(storage.match(/width:([\d.]+)%/)[1])-80.85)<1e-9);
  assert.match(storage,/16\.17/);
  assert.match(storage,/20 TMC/);
  assert.doesNotMatch(storage,/data-select-project="yellampalli"/);
  const gates=comparisonMarkup(PROJECT_SITES,'sundilla','gates');
  assert.match(gates,/Number of barrage gates/);
  assert.match(gates,/width:74%/);
});
test('observation-age geometry preserves time order including future records',()=>{
  for(const timestamp of ['2026-02-18T06:00:00Z','2026-10-29T12:00:00Z','2026-11-01T12:00:00Z']){
    const g=ageGeometry(timestamp,now);assert.equal(g.valid,true);
    assert.ok(g.observed>=0&&g.observed<=1);assert.ok(g.now>=0&&g.now<=1);
    assert.equal(Math.sign(g.observed-g.now),Math.sign(Date.parse(timestamp)-now));
  }
  assert.equal(ageGeometry('invalid',now).valid,false);
});
test('design profiles omit unverified reservoir height and volume split conserves totals',()=>{
  const profile=designProfile(PROJECT_SITES,'annaram',true);
  assert.match(profile,/100 metres, Annaram 119 metres, Sundilla 130 metres/);
  assert.match(profile,/Yellampalli design level not specified/);
  assert.doesNotMatch(profile,/138\.45/);
  const split=storageComposition(250000,750000);
  assert.match(split,/width:25%/);assert.match(split,/Total 1 million/);
});
