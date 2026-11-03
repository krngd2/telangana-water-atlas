import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dataUrl,validateGaugeSnapshot} from '../src/static-data.mjs';
const saved=JSON.parse(fs.readFileSync(new URL('../public/data/gauges-snapshot.json',import.meta.url)));
test('published snapshot is usable without an observation API',()=>{
 assert.equal(validateGaugeSnapshot(saved),saved);assert.equal(dataUrl('gauges-snapshot.json'),'/data/gauges-snapshot.json');
});
test('malformed and empty snapshots cannot replace retained observations',()=>{
 for(const s of [null,{}, {...saved,sources:[]},{...saved,fetchedAt:'invalid'}])assert.throws(()=>validateGaugeSnapshot(s));
 for(const [key,value] of [['level',null],['level',Infinity],['lat',NaN],['observedAt','invalid']]){
  const s=structuredClone(saved);s.sources[0].stations[0][key]=value;assert.throws(()=>validateGaugeSnapshot(s));
 }
 const stale=structuredClone(saved);stale.sources[0].stations[0].observedAt='2000-01-01T00:00:00Z';assert.doesNotThrow(()=>validateGaugeSnapshot(stale));
});
test('browser data consumers have no API fallback or remote font import',()=>{
 for(const name of ['main.js','terrain-detail.js','static-data.mjs'])assert.doesNotMatch(fs.readFileSync(new URL('../src/'+name,import.meta.url),'utf8'),/\/api\//);
 assert.doesNotMatch(fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8'),/@import\s+url\(['"]?https?:/);
});
