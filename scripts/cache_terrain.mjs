import fs from 'node:fs/promises';
import {getTerrainTile,tileKey} from '../src/terrain-source.mjs';
const root=new URL('../',import.meta.url),manifestPath=new URL('public/data/terrain/manifest.json',root);
const manifest=JSON.parse(await fs.readFile(manifestPath));
const args=process.argv.slice(2),maxLevel=args.includes('--overview')?0:4;
const cache=new URL('.cache/copernicus/',root);await fs.mkdir(cache,{recursive:true});
// Keep the public build independent of upstream servers; original COGs are build inputs only.
if(maxLevel===4){
 let next=0;
 await Promise.all(Array.from({length:3},async()=>{while(next<manifest.roots.length){
  const {lat,lon}=manifest.roots[next++],name=`Copernicus_DSM_COG_10_N${String(lat).padStart(2,'0')}_00_E${String(lon).padStart(3,'0')}_00_DEM`,file=new URL(name+'.tif',cache);
  try{await fs.access(file);continue;}catch{}
  for(let attempt=1;;attempt++){
   try{const response=await fetch(`https://copernicus-dem-30m.s3.amazonaws.com/${name}/${name}.tif`,{signal:AbortSignal.timeout(180000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length<1024)throw new Error('Invalid source raster');await fs.writeFile(new URL(name+'.tif.tmp',cache),bytes);await fs.rename(new URL(name+'.tif.tmp',cache),file);console.log(`Source cached: ${lat}, ${lon} (${Math.round(bytes.length/1024/1024)} MiB)`);break;}catch(error){if(attempt>=3)throw error;console.warn(`Retrying source ${lat}, ${lon}: ${error.message}`);}
  }
 }}));
}
const jobs=[];for(let level=0;level<=maxLevel;level++)for(const t of manifest.roots)for(let y=0;y<2**level;y++)for(let x=0;x<2**level;x++)jobs.push({...t,level,x,y});
let next=0,completed=0,failures=0;
console.log(`Preparing ${jobs.length} terrain tiles through level ${maxLevel}`);
await Promise.all(Array.from({length:3},async()=>{while(next<jobs.length){const job=jobs[next++];try{await getTerrainTile(job,{updateManifest:false});completed++;if(completed%100===0||completed===jobs.length)console.log(`Terrain: ${completed}/${jobs.length}`);}catch(error){failures++;console.error(`Failed ${tileKey(job)}: ${error.message}`);}}}));
const current=JSON.parse(await fs.readFile(manifestPath));
current.cachedTiles=(await fs.readdir(new URL('public/data/terrain/tiles/',root))).filter(n=>n.endsWith('.bin')).map(n=>n.slice(0,-4)).sort();
const cached=new Set(current.cachedTiles);current.completeThroughLevel=-1;
for(let level=0;level<=4;level++){
 let complete=true;for(const t of current.roots)for(let y=0;y<2**level;y++)for(let x=0;x<2**level;x++)if(!cached.has(tileKey({...t,level,x,y})))complete=false;
 if(!complete)break;current.completeThroughLevel=level;
}
current.delivery='static-files';current.preparedAt=new Date().toISOString();
await fs.writeFile(new URL('public/data/terrain/manifest.json.tmp',root),JSON.stringify(current,null,2));await fs.rename(new URL('public/data/terrain/manifest.json.tmp',root),manifestPath);
console.log(`Manifest: ${current.cachedTiles.length} tiles; complete through level ${current.completeThroughLevel}`);
if(failures||current.completeThroughLevel<maxLevel)process.exitCode=1;
