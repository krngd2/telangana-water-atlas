import {dataUrl} from './static-data.mjs';
import * as THREE from 'three';
import {CONTEXT_BUFFER_KM} from './terrain-context.mjs';

// One degree -> 1/16 degree quadtree; each patch has 225 segments.
// Native leaves retain the provider's 1-arc-second sample locations.
export class TerrainDetail {
 constructor({parent,camera,boundary,position,color,onChange,onStatus}){
  Object.assign(this,{parent,camera,boundary,position,color,onChange,onStatus});
  this.container=new THREE.Group();parent.add(this.container);this.container.visible=false;
  this.nodes=new Map();this.roots=[];this.queue=[];this.running=0;this.enabled=true;
  this.ready=false;this.dirty=true;this.lastUpdate=0;this.clock=0;this.failed=0;
  this.frustum=new THREE.Frustum();this.matrix=new THREE.Matrix4();
  this.maskCanvas=document.createElement('canvas');this.maskCanvas.width=this.maskCanvas.height=226;
  this.maskContext=this.maskCanvas.getContext('2d',{willReadFrequently:true});
 }
 async init(){
  const response=await fetch(dataUrl('terrain/manifest.json'));if(!response.ok)throw new Error('Copernicus terrain manifest unavailable');
  this.manifest=await response.json();this.cached=new Set(this.manifest.cachedTiles);
  this.roots=this.manifest.roots.map(t=>this.node({...t,level:0,x:0,y:0}));
  await Promise.all(this.roots.map(n=>this.load(n)));
  this.ready=this.roots.every(n=>n.heights);
  if(!this.ready)throw new Error('Some Copernicus overview tiles are unavailable. Regional terrain retained.');
  this.container.visible=this.enabled;this.dirty=true;this.onChange?.();
 }
 node(t){
  const key=`${t.lat}_${t.lon}_${t.level}_${t.x}_${t.y}`;
  if(this.nodes.has(key))return this.nodes.get(key);
  const span=1/2**t.level,w=t.lon+t.x*span,n=t.lat+1-t.y*span;
  const node={...t,key,w,e:w+span,n,s:n-span,state:'new',used:0};this.nodes.set(key,node);return node;
 }
 children(node){return node.children??=Array.from({length:4},(_,i)=>this.node({lat:node.lat,lon:node.lon,level:node.level+1,x:node.x*2+i%2,y:node.y*2+Math.floor(i/2)}));}
 load(node){
  if(node.heights)return Promise.resolve(node);
  if(node.promise)return node.promise;
  node.promise=new Promise(resolve=>{this.queue.push({node,resolve});this.pump();});return node.promise;
 }
 pump(){
  while(this.running<3&&this.queue.length){
   const {node,resolve}=this.queue.shift();this.running++;node.state='loading';
   const url=dataUrl(`terrain/tiles/${node.key}.bin`);
   fetch(url,{signal:AbortSignal.timeout(90000)}).then(async response=>{
    if(!response.ok)throw new Error('Terrain request HTTP '+response.status);
    const buffer=await response.arrayBuffer();if(buffer.byteLength!==226*226*2)throw new Error('Invalid elevation tile length');
    if(node.error){this.failed=Math.max(0,this.failed-1);node.error=null;}node.heights=new Int16Array(buffer);node.state='ready';this.cached.add(node.key);this.dirty=true;
   }).catch(error=>{console.warn('Copernicus tile',node.key,error.message);node.state='error';if(!node.error)this.failed++;node.error=error.message;node.retries=(node.retries||0)+1;node.retryAt=performance.now()+5000*node.retries;this.onStatus?.('Terrain detail unavailable here; retained coarser terrain.');})
   .finally(()=>{this.running--;if(node.state==='error')node.promise=null;resolve(node);this.pump();});
  }
 }
 makeMask(node){
  const ctx=this.maskContext,N=226;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,N,N);ctx.beginPath();
  const kmLon=111.32*Math.cos((node.n+node.s)/2*Math.PI/180);
  ctx.setTransform((N-1)/((node.e-node.w)*kmLon),0,0,(N-1)/((node.n-node.s)*111.32),.5,.5);
  const polys=this.boundary.geometry.type==='Polygon'?[this.boundary.geometry.coordinates]:this.boundary.geometry.coordinates;
  for(const poly of polys)for(const ring of poly){ring.forEach(([lon,lat],i)=>{const x=(lon-node.w)*kmLon,y=(node.n-lat)*111.32;ctx[i?'lineTo':'moveTo'](x,y);});ctx.closePath();}
  ctx.fillStyle='#fff';ctx.fill('evenodd');ctx.strokeStyle='#fff';ctx.lineWidth=CONTEXT_BUFFER_KM*2;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();ctx.setTransform(1,0,0,1,0,0);
  const pixels=ctx.getImageData(0,0,N,N).data;
  const mask=new Uint8Array(N*N);for(let i=0;i<mask.length;i++)mask[i]=pixels[i*4+3]>100&&node.heights[i]!==-32768?1:0;
  return mask;
 }
 mesh(node){
  if(node.mesh)return node.mesh;
  const N=226,H=node.heights,mask=this.makeMask(node),positions=[],colors=[],indices=[],skirtSources=[];
  const sx=(node.e-node.w)/225*111320*Math.cos((node.n+node.s)/2*Math.PI/180),sy=(node.n-node.s)/225*111320;
  node.slopes=new Float32Array(N*N);
  let min=Infinity,max=-Infinity;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
   const i=y*N+x,h=H[i]===-32768?0:H[i]/10,lon=node.w+x/225*(node.e-node.w),lat=node.n-y/225*(node.n-node.s);
   this.position(lon,lat,h).toArray(positions,i*3);
   if(mask[i]){min=Math.min(min,h);max=Math.max(max,h);}
   const west=x>0&&H[i-1]!==-32768?H[i-1]/10:h,east=x<225&&H[i+1]!==-32768?H[i+1]/10:h;
   const north=y>0&&H[i-N]!==-32768?H[i-N]/10:h,south=y<225&&H[i+N]!==-32768?H[i+N]/10:h;
   node.slopes[i]=Math.atan(Math.hypot((east-west)/((x>0&&x<225?2:1)*sx),(south-north)/((y>0&&y<225?2:1)*sy)))*180/Math.PI;
   const c=this.color(h,node.slopes[i],lon,lat);colors.push(c.r,c.g,c.b);
  }
  for(let y=0;y<225;y++)for(let x=0;x<225;x++){
   const a=y*N+x,b=a+1,c=a+N,d=c+1;
   if(mask[a]&&mask[b]&&mask[c])indices.push(a,c,b);
   if(mask[b]&&mask[c]&&mask[d])indices.push(b,c,d);
  }
  if(!indices.length){node.empty=true;return null;}
  // Narrow downward skirts hide cracks between different overview levels.
  const skirtEdge=(a,b)=>{
   if(!mask[a]||!mask[b])return;
   const c=positions.length/3;
   // Separate skirt vertices keep wall normals out of the terrain's edge normals.
   for(const drop of [0,.10])for(const i of [a,b]){skirtSources.push(i);positions.push(positions[i*3],positions[i*3+1]-drop,positions[i*3+2]);colors.push(colors[i*3],colors[i*3+1],colors[i*3+2]);}
   indices.push(c,c+2,c+1,c+1,c+2,c+3);
  };
  for(let i=0;i<225;i++){skirtEdge(i,i+1);skirtEdge(225*N+i,225*N+i+1);skirtEdge(i*N,(i+1)*N);skirtEdge(i*N+225,(i+1)*N+225);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();
  node.box=geometry.boundingBox.clone();node.min=min;node.max=max;node.skirtSources=skirtSources;
  node.mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));node.mesh.visible=false;this.container.add(node.mesh);return node.mesh;
 }
 inView(node){
  const a=this.position(node.w,node.s,node.min??0),b=this.position(node.e,node.n,node.max??1100);
  const box=new THREE.Box3(new THREE.Vector3(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.min(a.z,b.z)),new THREE.Vector3(Math.max(a.x,b.x),Math.max(a.y,b.y),Math.max(a.z,b.z)));
  box.applyMatrix4(this.parent.matrixWorld);return this.frustum.intersectsBox(box);
 }
 update(now,width){
  if(!this.enabled||!this.ready)return;
  if(!this.dirty&&now-this.lastUpdate<350)return;
  if(now-this.lastUpdate<100)return;
  this.lastUpdate=now;this.dirty=false;this.clock++;
  this.parent.updateMatrixWorld();this.camera.updateMatrixWorld();
  this.matrix.multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse);this.frustum.setFromProjectionMatrix(this.matrix);
  const pixelsPerKm=width/((this.camera.right-this.camera.left)/this.camera.zoom);
  const selected=[];
  const select=node=>{
   if(node.empty||!this.inView(node))return;
   const projected=(node.e-node.w)*111.32*Math.cos((node.n+node.s)/2*Math.PI/180)*pixelsPerKm;
   if(projected>340&&node.level<4){
    const children=this.children(node);
    for(const child of children)if(child.state==='new'||(child.state==='error'&&child.retries<3&&now>=child.retryAt))this.load(child);
    if(children.every(c=>c.heights)){for(const child of children)select(child);return;}
   }
   if(node.heights){const mesh=this.mesh(node);if(mesh)selected.push(node);}
  };
  for(const root of this.roots)select(root);
  for(const node of this.nodes.values())if(node.mesh)node.mesh.visible=false;
  for(const node of selected){node.mesh.visible=true;node.used=this.clock;}
  const meshes=[...this.nodes.values()].filter(n=>n.mesh&&!n.mesh.visible).sort((a,b)=>a.used-b.used);
  const limit=width<600?24:48;
  let count=meshes.length+selected.length;
  for(const node of meshes){if(count<=limit)break;this.container.remove(node.mesh);node.mesh.geometry.dispose();node.mesh.material.dispose();node.mesh=null;node.slopes=null;count--;}
  const levels=selected.map(n=>n.level),lo=levels.length?Math.min(...levels):0,hi=levels.length?Math.max(...levels):0;
  this.visibleLevels=[lo,hi];this.visibleCount=selected.length;
  const sample=hi===4?'30':Math.round(494/2**hi),coarse=Math.round(494/2**lo);
  this.onStatus?.(`Copernicus GLO-30 · mesh ~${sample}${lo!==hi?'–'+coarse:''} m · source ~30 m${this.running||this.queue.length?' · refining…':this.failed?' · some tiles unavailable':''}`);
  const key=selected.map(n=>n.key).join(',');if(key!==this.lastSelection){this.lastSelection=key;this.onChange?.();}
 }
 heightAt(lon,lat){
  if(!this.enabled||!this.ready)return null;
  const root=this.roots.find(n=>lon>=n.w&&lon<n.e&&lat>n.s&&lat<=n.n);if(!root)return null;
  for(let level=4;level>=0;level--){const span=1/2**level,x=Math.min(2**level-1,Math.floor((lon-root.lon)/span)),y=Math.min(2**level-1,Math.floor((root.lat+1-lat)/span));const n=this.nodes.get(`${root.lat}_${root.lon}_${level}_${x}_${y}`);if(!n?.heights)continue;
   const gx=(lon-n.w)/(n.e-n.w)*225,gy=(n.n-lat)/(n.n-n.s)*225,ix=Math.max(0,Math.min(224,Math.floor(gx))),iy=Math.max(0,Math.min(224,Math.floor(gy))),dx=gx-ix,dy=gy-iy;
   const a=n.heights[iy*226+ix],b=n.heights[iy*226+ix+1],c=n.heights[(iy+1)*226+ix],d=n.heights[(iy+1)*226+ix+1];if([a,b,c,d].some(v=>v===-32768))continue;
   return (a*(1-dx)*(1-dy)+b*dx*(1-dy)+c*(1-dx)*dy+d*dx*dy)/10;
  }return null;
 }
 recolor(){for(const node of this.nodes.values()){
  if(!node.mesh)continue;const attr=node.mesh.geometry.attributes.color,N=226;
  for(let i=0;i<N*N;i++){const lon=node.w+(i%N)/225*(node.e-node.w),lat=node.n-Math.floor(i/N)/225*(node.n-node.s);const c=this.color(node.heights[i]/10,node.slopes[i],lon,lat);attr.setXYZ(i,c.r,c.g,c.b);}
  for(let i=N*N;i<attr.count;i++){const source=node.skirtSources[i-N*N];attr.setXYZ(i,attr.getX(source),attr.getY(source),attr.getZ(source));}
  attr.needsUpdate=true;
 }}
 meshes(){return this.enabled&&this.ready?[...this.nodes.values()].filter(n=>n.mesh?.visible).map(n=>n.mesh):[];}
 setEnabled(enabled){this.enabled=enabled;this.container.visible=enabled&&this.ready;this.dirty=true;this.onChange?.();}
}
