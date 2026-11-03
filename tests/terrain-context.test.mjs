import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CONTEXT_BUFFER_KM,displayMask} from '../src/terrain-context.mjs';

test('display buffer uses physical distances without changing the study mask',()=>{
  const mask=new Uint8Array(21*21);mask[10*21+10]=1;
  const buffered=displayMask(mask,21,21,1000,2000,4);
  assert.equal(mask.reduce((a,b)=>a+b),1);
  assert.equal(buffered[10*21+14],1);
  assert.equal(buffered[12*21+10],1);
  assert.equal(buffered[13*21+10],0);
  assert.equal(buffered[12*21+14],0);
  assert.equal(buffered[10*21+15],0);
});

test('buffered statewide cells have full native-detail source coverage',()=>{
  const dir=new URL('../public/data/',import.meta.url);
  const meta=JSON.parse(fs.readFileSync(new URL('metadata.json',dir)));
  const manifest=JSON.parse(fs.readFileSync(new URL('terrain/manifest.json',dir)));
  const mask=new Uint8Array(fs.readFileSync(new URL('mask.bin',dir)));
  const original=mask.slice();
  const buffered=displayMask(mask,meta.width,meta.height,meta.cellWidthM,meta.cellHeightM);
  assert.deepEqual(mask,original);
  assert.equal(manifest.contextBufferKm,CONTEXT_BUFFER_KM);
  assert.equal(manifest.completeThroughLevel,4);
  const roots=new Set(manifest.roots.map(r=>`${r.lat}_${r.lon}`));
  let outside=0;
  for(let i=0;i<buffered.length;i++)if(buffered[i]){
    const lon=meta.bounds[0]+(i%meta.width)/(meta.width-1)*(meta.bounds[2]-meta.bounds[0]);
    const lat=meta.bounds[3]-Math.floor(i/meta.width)/(meta.height-1)*(meta.bounds[3]-meta.bounds[1]);
    assert.ok(roots.has(`${Math.floor(lat)}_${Math.floor(lon)}`),'No cached source coverage at '+lon+','+lat);
    if(!mask[i])outside++;
  }
  assert.ok(outside>1000);
});
