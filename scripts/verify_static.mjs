import fs from 'node:fs/promises';
import {validateGaugeSnapshot} from '../src/static-data.mjs';
const root=new URL('../public/',import.meta.url),manifest=JSON.parse(await fs.readFile(new URL('data/terrain/manifest.json',root)));
if(manifest.completeThroughLevel!==manifest.maxLevel||manifest.delivery!=='static-files')throw new Error('Static terrain is incomplete. Run npm run data:terrain before building.');
const cached=new Set(manifest.cachedTiles);let count=0;
for(let level=0;level<=manifest.maxLevel;level++)for(const cell of manifest.roots)for(let y=0;y<2**level;y++)for(let x=0;x<2**level;x++){
 const key=`${cell.lat}_${cell.lon}_${level}_${x}_${y}`;
 if(!cached.has(key))throw new Error('Missing static terrain key: '+key);
 const [stat,metadata]=await Promise.all([fs.stat(new URL(`data/terrain/tiles/${key}.bin`,root)),fs.readFile(new URL(`data/terrain/tiles/${key}.json`,root),'utf8').then(JSON.parse)]);
 if(stat.size!==226*226*2||!/^[a-f0-9]{64}$/.test(metadata.sha256))throw new Error('Invalid static terrain tile: '+key);
 count++;
}
const snapshot=validateGaugeSnapshot(JSON.parse(await fs.readFile(new URL('data/gauges-snapshot.json',root))));
const css=await fs.readFile(new URL('../src/style.css',root),'utf8');
if(/@import\s+url\(['"]?https?:/.test(css))throw new Error('Remote runtime stylesheet detected');
const fonts=[...css.matchAll(/url\(['"]?\/fonts\/([^)'"\s]+)['"]?\)/g)].map(m=>m[1]);
if(!fonts.length)throw new Error('Local fonts are missing');
for(const font of new Set(fonts))await fs.access(new URL('fonts/'+font,root));
for(const notice of ['NOTICE.txt','licenses/atlas-MIT.txt','licenses/three-MIT.txt','licenses/Copernicus-DEM-GLO-30.pdf','licenses/cwc-license-metadata.json','fonts/DM-Sans-OFL.txt','fonts/Libre-Caslon-Text-OFL.txt'])await fs.access(new URL(notice,root));
if(await fs.readFile(new URL('licenses/atlas-MIT.txt',root),'utf8')!==await fs.readFile(new URL('../LICENSE',root),'utf8'))throw new Error('Distributed project licence does not match LICENSE.');
console.log(`Static assets verified: ${count} terrain tiles, ${snapshot.sources.reduce((n,s)=>n+s.stations.length,0)} gauge observations, ${new Set(fonts).size} local font files.`);
