import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {fromFile} from 'geotiff';import {fileURLToPath} from 'node:url';import {validateTile} from '../src/terrain-source.mjs';
const root=new URL('../public/data/terrain/',import.meta.url);const manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',root)));
const read=key=>{const b=fs.readFileSync(new URL(`tiles/${key}.bin`,root));return new Int16Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
test('all statewide overview tiles are cached and all completed tile hashes verify',()=>{
 for(const r of manifest.roots)assert.ok(fs.existsSync(new URL(`tiles/${r.lat}_${r.lon}_0_0_0.bin`,root)));
 for(const name of fs.readdirSync(new URL('tiles/',root)).filter(f=>f.endsWith('.json'))){const m=JSON.parse(fs.readFileSync(new URL('tiles/'+name,root))),bytes=fs.readFileSync(new URL('tiles/'+name.replace(/json$/,'bin'),root));assert.equal(bytes.length,226*226*2);assert.equal(createHash('sha256').update(bytes).digest('hex'),m.sha256);assert.equal(m.gridStepArcSeconds,16/2**m.level);assert.match(m.sourceUrl,/^https:\/\/copernicus-dem-30m.s3.amazonaws.com\//);}
});
test('geocell seams use the same measured border samples',()=>{
 const left=read('18_78_0_0_0'),right=read('18_79_0_0_0'),bottom=read('17_78_0_0_0');for(let i=0;i<226;i++){assert.equal(left[i*226+225],right[i*226]);assert.equal(left[225*226+i],bottom[i]);}
});
const original=new URL('../.cache/copernicus/Copernicus_DSM_COG_10_N17_00_E078_00_DEM.tif',import.meta.url);
test('native leaf matches 51,076 original 1-arc-second samples within packing tolerance',{skip:!fs.existsSync(original)},async()=>{
 const tiff=await fromFile(fileURLToPath(original));try{const image=await tiff.getImage();assert.equal(image.getWidth(),3600);assert.deepEqual(image.getOrigin(),[78,18,0]);assert.ok(Math.abs(image.getResolution()[0]-1/3600)<1e-12);const source=await image.readRasters({window:[1800,1575,2026,1801],interleave:true}),packed=read('17_78_4_8_7');for(let i=0;i<source.length;i++)assert.ok(Math.abs(source[i]-packed[i]/10)<=.0501);}finally{await tiff.close();}
});
test('terrain preparation rejects unbounded zoom, invalid coordinates and fractional indices',()=>{
 for(const t of [{lat:17,lon:79,level:5,x:0,y:0},{lat:14,lon:79,level:1,x:0,y:0},{lat:17,lon:79,level:4,x:16,y:0},{lat:17,lon:79,level:4,x:.5,y:0}])assert.throws(()=>validateTile(t));
});
