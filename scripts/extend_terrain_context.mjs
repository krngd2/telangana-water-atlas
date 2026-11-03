import fs from 'node:fs/promises';
import {getTerrainTile,tileKey} from '../src/terrain-source.mjs';
import {CONTEXT_BUFFER_KM} from '../src/terrain-context.mjs';
const root=new URL('../',import.meta.url),manifestFile=new URL('public/data/terrain/manifest.json',root);
const manifest=JSON.parse(await fs.readFile(manifestFile));
// These two additional geocells intersect the ~8 km halo of the bundled state
// outline. All other required geocells were already cached for Telangana.
const extra=[{lat:18,lon:81},{lat:19,lon:80}];
for(const {lat,lon}of extra){
  const name=`Copernicus_DSM_COG_10_N${String(lat).padStart(2,'0')}_00_E${String(lon).padStart(3,'0')}_00_DEM`;
  const file=new URL(`.cache/copernicus/${name}.tif`,root);
  try{await fs.access(file);}catch{
    const response=await fetch(`https://copernicus-dem-30m.s3.amazonaws.com/${name}/${name}.tif`,{signal:AbortSignal.timeout(180000)});
    if(!response.ok)throw new Error('Copernicus source HTTP '+response.status);
    const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length<1024)throw new Error('Invalid source raster');
    await fs.writeFile(new URL(file.href+'.tmp'),bytes);await fs.rename(new URL(file.href+'.tmp'),file);
    console.log(`Source ${lat},${lon}: ${Math.round(bytes.length/1048576)} MiB cached`);
  }
}
const jobs=[];for(const cell of extra)for(let level=0;level<=4;level++)for(let y=0;y<2**level;y++)for(let x=0;x<2**level;x++)jobs.push({...cell,level,x,y});
let next=0,done=0;
await Promise.all(Array.from({length:3},async()=>{while(next<jobs.length){await getTerrainTile(jobs[next++],{updateManifest:false});done++;if(done%100===0)console.log(`Context tiles ${done}/${jobs.length}`);}}));
for(const cell of extra)if(!manifest.roots.some(r=>r.lat===cell.lat&&r.lon===cell.lon))manifest.roots.push(cell);
manifest.cachedTiles=(await fs.readdir(new URL('public/data/terrain/tiles/',root))).filter(n=>n.endsWith('.bin')).map(n=>n.slice(0,-4)).sort();
const cached=new Set(manifest.cachedTiles);
for(const cell of manifest.roots)for(let level=0;level<=4;level++)for(let y=0;y<2**level;y++)for(let x=0;x<2**level;x++)if(!cached.has(tileKey({...cell,level,x,y})))throw new Error('Incomplete context terrain');
manifest.contextBufferKm=CONTEXT_BUFFER_KM;manifest.completeThroughLevel=4;manifest.preparedAt=new Date().toISOString();
await fs.writeFile(new URL(manifestFile.href+'.tmp'),JSON.stringify(manifest,null,2));await fs.rename(new URL(manifestFile.href+'.tmp'),manifestFile);
console.log(`${manifest.roots.length} geocells ready through native level 4; ~${CONTEXT_BUFFER_KM} km display buffer`);
