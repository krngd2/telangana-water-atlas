import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {fromUrl,fromFile} from 'geotiff';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const OUT=path.join(ROOT,'public/data/terrain');
const sources=new Map(),pending=new Map();
let manifestWrites=Promise.resolve();
export const tileKey=({lat,lon,level,x,y})=>`${lat}_${lon}_${level}_${x}_${y}`;
export function validateTile(t){
 if(!Object.values(t).every(Number.isInteger)||t.lat<15||t.lat>19||t.lon<77||t.lon>81||t.level<0||t.level>4||t.x<0||t.y<0||t.x>=2**t.level||t.y>=2**t.level)throw new Error('Invalid terrain tile');
 return t;
}
async function getSource(lat,lon){
 const key=`${lat}_${lon}`;
 if(!sources.has(key)){
  const name=`Copernicus_DSM_COG_10_N${String(lat).padStart(2,'0')}_00_E${String(lon).padStart(3,'0')}_00_DEM`;
  const promise=(async()=>{const local=path.join(ROOT,'.cache/copernicus',name+'.tif');let tiff;try{await fs.access(local);tiff=await fromFile(local);}catch{tiff=await fromUrl(`https://copernicus-dem-30m.s3.amazonaws.com/${name}/${name}.tif`,{blockSize:65536,cacheSize:512,allowFullFile:false});}tiff.cache=true;return tiff;})();
  sources.set(key,promise);promise.catch(()=>sources.delete(key));
 }
 return sources.get(key);
}
// Read edge samples from adjacent geocells: endpoints coincide exactly in WGS84.
async function readWindow(lat,lon,imageIndex,x0,y0,length){
 const tiff=await getSource(lat,lon),image=await tiff.getImage(imageIndex),size=image.getWidth();
 const result=new Float32Array(length*length);result.fill(NaN);
 const read=async(dl,do_,sx,sy,w,h,dx,dy)=>{
  if(w<=0||h<=0)return;
  const t=await getSource(lat+dl,lon+do_),im=await t.getImage(imageIndex);
  const r=await im.readRasters({window:[sx,sy,sx+w,sy+h],samples:[0],interleave:true});
  for(let row=0;row<h;row++)result.set(r.subarray(row*w,(row+1)*w),(row+dy)*length+dx);
 };
 const w=Math.min(length,size-x0),h=Math.min(length,size-y0);
 await read(0,0,x0,y0,w,h,0,0);
 if(w<length)await read(0,1,0,y0,length-w,h,w,0);
 if(h<length)await read(-1,0,x0,0,w,length-h,0,h);
 if(w<length&&h<length)await read(-1,1,0,0,length-w,length-h,w,h);
 return result;
}
async function recordTile(key,metadata,updateManifest=true){
 await fs.writeFile(path.join(OUT,'tiles',key+'.json'),JSON.stringify(metadata,null,2));
 if(!updateManifest)return;
 manifestWrites=manifestWrites.catch(()=>{}).then(async()=>{
  const manifest=JSON.parse(await fs.readFile(path.join(OUT,'manifest.json')));
  manifest.cachedTiles=(await fs.readdir(path.join(OUT,'tiles'))).filter(n=>n.endsWith('.bin')).map(n=>n.slice(0,-4)).sort();
  const tmp=path.join(OUT,'manifest.json.tmp');await fs.writeFile(tmp,JSON.stringify(manifest,null,2));await fs.rename(tmp,path.join(OUT,'manifest.json'));
 });
 await manifestWrites;
}
export async function getTerrainTile(input,{updateManifest=true}={}){
 const tile=validateTile(input),key=tileKey(tile),filename=path.join(OUT,'tiles',key+'.bin');
 try{return await fs.readFile(filename);}catch{}
 if(pending.has(key))return pending.get(key);
 const task=(async()=>{
  const imageIndex=tile.level===0?3:4-tile.level;
  const stride=tile.level===0?2:1;
  const span=225*stride,x0=tile.x*225,y0=tile.y*225;
  const source=await readWindow(tile.lat,tile.lon,imageIndex,x0,y0,span+1);
  const packed=new Int16Array(226*226);let min=Infinity,max=-Infinity,valid=0;
  for(let y=0;y<226;y++)for(let x=0;x<226;x++){
   const h=source[(y*stride)*(span+1)+x*stride];const good=Number.isFinite(h)&&h>=-500&&h<3000;
   packed[y*226+x]=good?Math.round(h*10):-32768;
   if(good){valid++;min=Math.min(min,h);max=Math.max(max,h);}
  }
  if(!valid)throw new Error('No valid elevation samples in provider tile');
  const body=Buffer.from(packed.buffer);await fs.mkdir(path.dirname(filename),{recursive:true});await fs.writeFile(filename+'.tmp',body);await fs.rename(filename+'.tmp',filename);
  await recordTile(key,{...tile,sha256:createHash('sha256').update(body).digest('hex'),sourceUrl:`https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_N${String(tile.lat).padStart(2,'0')}_00_E${String(tile.lon).padStart(3,'0')}_00_DEM/Copernicus_DSM_COG_10_N${String(tile.lat).padStart(2,'0')}_00_E${String(tile.lon).padStart(3,'0')}_00_DEM.tif`,source:'Copernicus GLO-30',sourceImageIndex:imageIndex,sourceOverviewFactor:2**imageIndex,gridStepArcSeconds:16/2**tile.level,quantizationM:.1,minElevation:min,maxElevation:max,fetchedAt:new Date().toISOString(),validSamples:valid,verticalDatum:'EGM2008'},updateManifest);
  return body;
 })().finally(()=>pending.delete(key));pending.set(key,task);return task;
}
