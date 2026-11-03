import {createExportImage,COPERNICUS_LIABILITY} from './export-image.mjs';
import {dataUrl,loadGaugeSnapshot} from './static-data.mjs';
import './irrigation-evidence.css';
import {renderGaugeFreshness,storageComposition} from './project-visuals.mjs';
import {initKaleshwaram} from './kaleshwaram.mjs';
import * as THREE from 'three';
import {TerrainDetail} from './terrain-detail.js';
import {Line2} from 'three/addons/lines/Line2.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {rawTrace,conditionedTrace,pondAtSink,routeStats} from './hydrology.mjs';
import {CONTEXT_BUFFER_KM,displayMask} from './terrain-context.mjs';
const $=id=>document.getElementById(id),fmt=(n,d=1)=>Number(n).toLocaleString('en-GB',{maximumFractionDigits:d});
let projectLayer;
let terrainDetail,redrapeTimer,currentTerrainStatus;
let data,scene,camera,renderer,orbit,terrain,group,riverGroup,channelGroup,routeGroup,seedMarker,seed=0,layer='elevation',routeMode='conditioned',exaggeration=15,volume=1e6,topDown=false,gauges=null,labels=[],lastTrace=null,fallback=false;
const presets={hyderabad:[17.385,78.4867],adilabad:[19.6641,78.532],warangal:[17.9689,79.5941],nalgonda:[17.0575,79.2684]};
const colors={elevation:[[0,'#174e46'],[.3,'#65915c'],[.58,'#b4bd7b'],[.8,'#d8ce96'],[1,'#a57b4d']],slope:[[0,'#e6eacb'],[.18,'#c3c58c'],[.45,'#af8b5b'],[1,'#793b38']],drainage:[[0,'#e3e8d4'],[.35,'#abcab2'],[.65,'#4b9e9c'],[1,'#006a86']]};
function ramp(t){const stops=colors[layer];t=Math.max(0,Math.min(1,t));let k=1;while(k<stops.length-1&&t>stops[k][0])k++;const a=stops[k-1],b=stops[k];return new THREE.Color(a[1]).lerp(new THREE.Color(b[1]),(t-a[0])/(b[0]-a[0]));}
function lonLat(i){const {width:w,height:h,bounds:[west,south,east,north]}=data.meta;return [west+(i%w)/(w-1)*(east-west),north-Math.floor(i/w)/(h-1)*(north-south)];}
function gridIndex(lat,lon){const {width:w,height:h,bounds:[west,south,east,north]}=data.meta;const x=Math.round((lon-west)/(east-west)*(w-1)),y=Math.round((north-lat)/(north-south)*(h-1));return x<0||x>=w||y<0||y>=h?-1:y*w+x;}
function xyz(lon,lat,offset=0){const i=gridIndex(lat,lon),[west,south,east,north]=data.meta.bounds;return new THREE.Vector3((lon-(west+east)/2)*111.32*Math.cos((north+south)/2*Math.PI/180),((terrainDetail?.heightAt(lon,lat)??(i>=0?data.elevation[i]:0))/1000)+offset,((north+south)/2-lat)*111.32);}
function vertex(i,offset=0){const [lon,lat]=lonLat(i);return xyz(lon,lat,offset);}
function disposeChildren(g){while(g.children.length){const o=g.children[0];g.remove(o);o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();}}
function makeLine(points,color,opacity=1){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));}
const contextTint=new THREE.Color('#cdd4c5');
function surfaceColor(v,inside){const c=ramp(v);return inside?c:c.lerp(contextTint,.65);}
function ensureContext(){if(!data.displayMask){const m=data.meta;data.displayMask=displayMask(data.mask,m.width,m.height,m.cellWidthM,m.cellHeightM);} $('scene').dataset.contextBufferKm=String(CONTEXT_BUFFER_KM);}
function densify(coords){const result=[];for(let k=1;k<coords.length;k++){const a=coords[k-1],b=coords[k],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.003));for(let j=0;j<n;j++)result.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);}result.push(coords.at(-1));return result;}
function referenceLine(coords,color,width,{dashed=false,order=3}={}){
 const geometry=new LineGeometry();geometry.setPositions(coords.flatMap(([lon,lat])=>xyz(lon,lat,.004).toArray()));
 const material=new LineMaterial({color,linewidth:width,depthTest:false,depthWrite:false,dashed,dashSize:1.8,gapSize:1});material.resolution.set($('scene').clientWidth,$('scene').clientHeight);
 const line=new Line2(geometry,material);line.computeLineDistances();line.renderOrder=order;line.userData.geoPoints=coords;return line;
}
function recolor(){if(fallback){drawFallback();return;}const arr=terrain.geometry.attributes.color;for(let i=0;i<data.elevation.length;i++){const v=layer==='elevation'?data.elevation[i]/1000:layer==='slope'?data.slope[i]/25:Math.log10(Math.max(1,data.accumulation[i]))/4.8;const c=surfaceColor(v,data.mask[i]);arr.setXYZ(i,c.r,c.g,c.b);}arr.needsUpdate=true;terrainDetail?.recolor();}
function createTerrain(){ensureContext();const {width:w,height:h}=data.meta;const pos=new Float32Array(w*h*3),col=new Float32Array(w*h*3),indices=[];for(let i=0;i<w*h;i++)vertex(i).toArray(pos,i*3);for(let y=0;y<h-1;y++)for(let x=0;x<w-1;x++){const a=y*w+x,b=a+1,c=a+w,d=c+1;if(data.displayMask[a]&&data.displayMask[b]&&data.displayMask[c])indices.push(a,c,b);if(data.displayMask[b]&&data.displayMask[c]&&data.displayMask[d])indices.push(b,c,d);}const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.BufferAttribute(pos,3));geom.setAttribute('color',new THREE.BufferAttribute(col,3));geom.setIndex(indices);geom.computeVertexNormals();terrain=new THREE.Mesh(geom,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.98,metalness:0,side:THREE.DoubleSide}));group.add(terrain);recolor();
riverGroup=new THREE.Group();let outside=0;for(const f of data.rivers.features){let run=[];const flush=()=>{if(run.length>1){riverGroup.add(referenceLine(run,0xf6f9ef,4.8,{order:2}),referenceLine(run,0x00577a,2.6,{order:3}));}run=[];};for(const [lon,lat]of densify(f.geometry.coordinates)){const i=gridIndex(lat,lon);if(i>=0&&data.displayMask[i]){run.push([lon,lat]);if(!data.mask[i])outside++;}else flush();}flush();}group.add(riverGroup);$('scene').dataset.outsideRiverSamples=String(outside);
const lines=[];for(let i=0;i<data.receiver.length;i++){const j=data.receiver[i];if(data.mask[i]&&j>=0&&data.mask[j]&&data.accumulation[i]>=80){vertex(i,.017).toArray(lines,lines.length);vertex(j,.017).toArray(lines,lines.length);}}channelGroup=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(lines,3)),new THREE.LineBasicMaterial({color:0x4ca59e,transparent:true,opacity:.6}));group.add(channelGroup);routeGroup=new THREE.Group();group.add(routeGroup);group.scale.y=exaggeration;
seedMarker=new THREE.Mesh(new THREE.SphereGeometry(2.1,16,12),new THREE.MeshBasicMaterial({color:0xd97632}));scene.add(seedMarker);
}
function updateLabels(){projectLayer?.update();if(fallback)return;const occupied=[];for(const l of labels){const v=xyz(l.lon,l.lat,.04);v.y*=exaggeration;v.project(camera);l.el.style.left=`${(v.x+1)/2*$('scene').clientWidth}px`;l.el.style.top=`${(-v.y+1)/2*$('scene').clientHeight}px`;const box={x:(v.x+1)/2*$('scene').clientWidth,y:(-v.y+1)/2*$('scene').clientHeight,w:l.el.textContent.length*5.5+10};const visible=$('cities').checked&&Math.abs(v.x)<.98&&Math.abs(v.y)<.9&&v.z<1&&!occupied.some(b=>Math.abs(b.x-box.x)<(b.w+box.w)/2&&Math.abs(b.y-box.y)<14);l.el.style.display=visible?'block':'none';if(visible)occupied.push(box);}const dir=camera.position.clone().sub(orbit.target);$('north').style.transform=`rotate(${Math.atan2(dir.x,dir.z)*180/Math.PI}deg)`;}
function addLabels(){for(const l of labels)l.el.remove();labels=[];const list=Object.entries(presets).map(([name,[lat,lon]])=>({name:name[0].toUpperCase()+name.slice(1),lat,lon}));list.push({name:'Godavari',lat:18.72,lon:79.8,river:true},{name:'Krishna',lat:16.5,lon:79.5,river:true});for(const s of gauges?.sources.flatMap(s=>s.stations)||[])list.push({name:s.name,lat:s.lat,lon:s.lon,gauge:true});for(const l of list){const el=document.createElement('div');el.className='place-label'+(l.river?' river-label':'')+(l.gauge?' gauge':'');el.textContent=l.name.replace('Sripada Yellampalli Project','Yellampalli').replace('Sriram Sagar Reservoir','Sriram Sagar');$('labels').append(el);labels.push({...l,el});}updateLabels();}
// Sliders and touch gestures share one camera orientation, around the current panned target.
function syncCameraControls(){
 if(!orbit)return;
 const bearing=Math.round(THREE.MathUtils.radToDeg(orbit.getAzimuthalAngle()));
 const tilt=Math.round(90-THREE.MathUtils.radToDeg(orbit.getPolarAngle()));
 $('bearing').value=bearing;$('bearing-value').textContent=bearing+'°';
 $('tilt').value=tilt;$('tilt-value').textContent=tilt+'°';
 topDown=tilt>=89;
}
function applyCameraAngles(bearing,tilt){
 if(!orbit||fallback)return;
 const distance=camera.position.distanceTo(orbit.target);
 const offset=new THREE.Vector3().setFromSphericalCoords(distance,THREE.MathUtils.degToRad(90-Math.min(89.9999,tilt)),THREE.MathUtils.degToRad(bearing));
 camera.position.copy(orbit.target).add(offset);orbit.update();syncCameraControls();
}
function resetCamera(){topDown=$('scene').clientWidth<600;camera.position.set(0,topDown?900:530,topDown?.01:625);camera.up.set(0,1,0);orbit.target.set(0,0,0);camera.zoom=1;camera.updateProjectionMatrix();orbit.update();}
function initThree(){const mount=$('scene');scene=new THREE.Scene();scene.background=new THREE.Color('#e8ecdf');camera=new THREE.OrthographicCamera(-320,320,320,-320,.1,3000);renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;mount.append(renderer.domElement);orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.dampingFactor=.12;orbit.maxPolarAngle=THREE.MathUtils.degToRad(85);
 orbit.mouseButtons.LEFT=THREE.MOUSE.PAN;orbit.mouseButtons.RIGHT=THREE.MOUSE.PAN;
 orbit.touches.ONE=THREE.TOUCH.PAN;orbit.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;
 orbit.screenSpacePanning=true;orbit.enableRotate=false;
 // Mouse modifiers must not turn a pan into an orbit. Rotation gestures are touch-only.
 renderer.domElement.addEventListener('pointerdown',e=>{orbit.enableRotate=e.pointerType==='touch';},{capture:true});orbit.minDistance=100;orbit.maxDistance=1800;orbit.minZoom=.5;orbit.maxZoom=64;orbit.addEventListener('change',()=>{updateLabels();syncCameraControls();});scene.add(new THREE.HemisphereLight(0xffffff,0x9dba8a,1.6));const sun=new THREE.DirectionalLight(0xffffff,1.8);sun.position.set(-250,500,-200);scene.add(sun);group=new THREE.Group();scene.add(group);createTerrain();resetCamera();const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;renderer.setSize(w,h);const aspect=w/h;const half=aspect<1?260/aspect:305;camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();for(const layerGroup of [routeGroup,riverGroup])layerGroup?.traverse(line=>line.material?.resolution?.set(w,h));};new ResizeObserver(resize).observe(mount);resize();// A pan, cancelled pointer or multi-touch gesture must never release water.
const pointers=new Set();let tap=null;
renderer.domElement.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);if(pointers.size===1&&e.button===0)tap={id:e.pointerId,x:e.clientX,y:e.clientY};else tap=null;});
renderer.domElement.addEventListener('pointermove',e=>{if(tap&&tap.id===e.pointerId&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>5)tap=null;});
renderer.domElement.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);tap=null;});
renderer.domElement.addEventListener('pointerup',e=>{const select=tap&&tap.id===e.pointerId&&pointers.size===1&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<=5;pointers.delete(e.pointerId);tap=null;if(!select)return;const r=renderer.domElement.getBoundingClientRect();const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const fine=terrainDetail?.meshes()||[];const hit=(fine.length?ray.intersectObjects(fine):ray.intersectObject(terrain))[0];if(hit){const p=group.worldToLocal(hit.point.clone()),[west,south,east,north]=data.meta.bounds;setSeed((north+south)/2-p.z/111.32,(west+east)/2+p.x/(111.32*Math.cos((north+south)/2*Math.PI/180)),true);}});renderer.setAnimationLoop(()=>{if(document.hidden)return;orbit.update();seedMarker.scale.setScalar(1/camera.zoom);terrainDetail?.update(performance.now(),mount.clientWidth);renderer.render(scene,camera);updateLabels();});}
function showTerrainStatus(status){
 currentTerrainStatus=status;
 $('resolution').textContent=status+` · ${exaggeration}× relief`;
 $('scene').dataset.terrainLevel=String(terrainDetail?.visibleLevels?.[1]??0);
 $('scene').dataset.terrainPatches=String(terrainDetail?.visibleCount??0);
}
function redrapeContext(){
 clearTimeout(redrapeTimer);
 redrapeTimer=setTimeout(()=>{
  const active=terrainDetail?.enabled&&terrainDetail?.ready;
  terrain.visible=!active;
  for(const object of group.children){
   if(object.isMesh&&object!==terrain)object.visible=!active;
  }
  const [west,south,east,north]=data.meta.bounds;
  const drape=(object,offset)=>{
   if(object.userData.geoPoints){object.geometry.setPositions(object.userData.geoPoints.flatMap(([lon,lat])=>xyz(lon,lat,.004).toArray()));object.computeLineDistances();return;}
   if(!object.isLine||!object.geometry?.attributes.position)return;
   const position=object.geometry.attributes.position;
   for(let i=0;i<position.count;i++){
    const lon=(west+east)/2+position.getX(i)/(111.32*Math.cos((north+south)/2*Math.PI/180)),lat=(north+south)/2-position.getZ(i)/111.32;
    const point=xyz(lon,lat,offset);position.setY(i,point.y);
   }
   position.needsUpdate=true;object.geometry.computeBoundingSphere();
  };
  riverGroup.traverse(object=>drape(object,.004));drape(channelGroup,.017);
  const point=vertex(seed,.12);point.y*=exaggeration;seedMarker.position.copy(point);
  trace();updateLabels();
 },150);
}
function attachTerrainDetail(){
 terrainDetail=new TerrainDetail({parent:group,camera,boundary:data.boundary,
  position:(lon,lat,h)=>{const [w,s,e,n]=data.meta.bounds;return new THREE.Vector3((lon-(w+e)/2)*111.32*Math.cos((n+s)/2*Math.PI/180),h/1000,((n+s)/2-lat)*111.32);},
  color:(height,slope,lon,lat)=>{const i=gridIndex(lat,lon);return surfaceColor(layer==='elevation'?height/1000:layer==='slope'?slope/25:Math.log10(Math.max(1,i>=0?data.accumulation[i]:1))/4.8,i>=0&&data.mask[i]);},
  onStatus:showTerrainStatus,onChange:redrapeContext});
 showTerrainStatus('Loading Copernicus GLO-30 · regional terrain retained');
 terrainDetail.init().then(()=>{
  $('scene').dataset.terrainReady='true';
  $('terrain-attribution').textContent=terrainDetail.manifest.attribution+'. '+COPERNICUS_LIABILITY;
 }).catch(error=>{
  showTerrainStatus('Copernicus unavailable · regional ~900 m terrain retained');
  $('terrain-detail-status').textContent=error.message;
 });
}
function initFallback(error){fallback=true;console.warn('WebGL fallback:',error);$('scene').innerHTML='<canvas id="fallback"></canvas>';drawFallback();$('map-help')?.remove();$('resolution').textContent='WebGL unavailable · 2D elevation fallback';$('fallback').onclick=e=>{const rect=e.target.getBoundingClientRect(),i=Math.floor((e.clientY-rect.top)/rect.height*data.meta.height)*data.meta.width+Math.floor((e.clientX-rect.left)/rect.width*data.meta.width);if(data.mask[i]){const [lon,lat]=lonLat(i);setSeed(lat,lon,true);}};for(const id of ['top','zoom-in','zoom-out','reset','bearing','tilt','focus-terrain','terrain-detail'])$(id).disabled=true;}
function drawFallback(){const c=$('fallback');if(!c)return;ensureContext();c.width=data.meta.width;c.height=data.meta.height;c.style.width='100%';c.style.height='100%';const ctx=c.getContext('2d'),image=ctx.createImageData(c.width,c.height);for(let i=0;i<data.elevation.length;i++){const color=surfaceColor(layer==='elevation'?data.elevation[i]/1000:layer==='slope'?data.slope[i]/25:Math.log10(Math.max(1,data.accumulation[i]))/4.8,data.mask[i]);image.data.set(data.displayMask[i]?[color.r*255,color.g*255,color.b*255,255]:[232,236,223,255],i*4);}ctx.putImageData(image,0,0);
 const [west,south,east,north]=data.meta.bounds,toPixel=([lon,lat])=>[(lon-west)/(east-west)*(c.width-1),(north-lat)/(north-south)*(c.height-1)];ctx.lineCap=ctx.lineJoin='round';
 if($('rivers').checked){ctx.beginPath();let outside=0;for(const f of data.rivers.features){let drawing=false;for(const p of densify(f.geometry.coordinates)){const i=gridIndex(p[1],p[0]);if(i<0||!data.displayMask[i]){drawing=false;continue;}ctx[drawing?'lineTo':'moveTo'](...toPixel(p));drawing=true;if(!data.mask[i])outside++;}}ctx.strokeStyle='#f6f9ef';ctx.lineWidth=4.8;ctx.stroke();ctx.strokeStyle='#00577a';ctx.lineWidth=2.6;ctx.stroke();$('scene').dataset.outsideRiverSamples=String(outside);}
 if(lastTrace){ctx.strokeStyle='#d97632';ctx.lineWidth=2.5;ctx.beginPath();lastTrace.path.forEach((i,k)=>ctx[k?'lineTo':'moveTo'](i%data.meta.width,Math.floor(i/data.meta.width)));ctx.stroke();}}
function setSeed(lat,lon,custom=false){const i=gridIndex(lat,lon);if(i<0||!data.mask[i]){$('input-status').textContent='Choose a point inside the Telangana outline.';return false;}seed=i;const [actualLon,actualLat]=lonLat(i);$('coordinates').value=`${actualLat.toFixed(4)}, ${actualLon.toFixed(4)}`;if(custom)$('preset').value='custom';if(!fallback){const p=vertex(seed,.12);p.y*=exaggeration;seedMarker.position.copy(p);}$('input-status').textContent=`Routing elevation ${fmt(data.elevation[seed],0)} m · nearest ~900 m cell`;
const url=new URL(location.href);url.searchParams.set('lat',actualLat.toFixed(4));url.searchParams.set('lon',actualLon.toFixed(4));history.replaceState(null,'',url);trace();return true;}
function trace(){if(!data)return;const natural=rawTrace(seed,data),conditioned=conditionedTrace(seed,data),selected=routeMode==='natural'?natural:conditioned;lastTrace=selected;const stats=routeStats(selected.path,data);const pond=natural.end==='depression'?pondAtSink(natural.sink,volume,data):{cells:[],level:data.elevation[natural.sink],stored:0,excess:volume,capacity:0};if(!fallback){disposeChildren(routeGroup);const rg=new LineGeometry();rg.setPositions(selected.path.flatMap(i=>vertex(i,.075).toArray()));const rm=new LineMaterial({color:0xd96a26,linewidth:2.8,depthTest:false});rm.resolution.set($('scene').clientWidth,$('scene').clientHeight);const line=new Line2(rg,rm);line.renderOrder=8;routeGroup.add(line);if(pond.cells.length){const points=[];for(const i of pond.cells){const p=vertex(i);p.y=(Math.max(pond.level,data.elevation[i])/1000)+.035;p.toArray(points,points.length);}routeGroup.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(points,3)),new THREE.PointsMaterial({color:0x28b6d0,size:3.5,sizeAttenuation:false,transparent:true,opacity:.9})));}}else drawFallback();
$('route-summary').innerHTML=`<div class="stat-row"><div><strong>${fmt(stats.distance/1000)} <small>kilometres traced</small></strong></div><div><strong>${fmt(stats.drop,0)} <small>metres net fall</small></strong></div></div><p>${routeMode==='natural'?'Stops at '+(natural.end==='depression'?'the first local depression.':'the Telangana boundary.'):'Potential route to '+selected.end+'. Assumes filled depressions.'}</p>${stats.uphill>1?'<p>Crosses filled depressions; raw terrain rises along parts of this route.</p>':''}`;
$('storage').innerHTML=`<div class="stat-row"><div><strong>${fmt(pond.stored/1e6,3)} <small>Mm³ stored at first sink</small></strong></div><div><strong>${fmt(pond.excess/1e6,3)} <small>Mm³ excess / onward</small></strong></div></div><p>${pond.cells.length?`Connected storage level: ${fmt(pond.level,2)} m. Blue marks identify ${fmt(pond.cells.length,0)} grid cells; pool outline is limited by ~0.9 km sampling.`:'No retained storage at this point at the grid resolution.'} Excess is not routed as a flood wave.</p>`;
$('storage').insertAdjacentHTML('afterbegin',storageComposition(pond.stored,pond.excess));
profile(selected.path);window.__atlasState={ready:true,seed,routeMode,layer,pathLength:selected.path.length,stats,storage:{...pond,cells:pond.cells.length},volume};}
function profile(path){const elevations=path.map(i=>data.elevation[i]);const min=Math.floor(Math.min(...elevations)/50)*50,max=Math.ceil(Math.max(...elevations)/50)*50+10;let dist=0;const ds=[0];for(let k=1;k<path.length;k++){const a=path[k-1],b=path[k];dist+=Math.hypot((a%data.meta.width-b%data.meta.width)*data.meta.cellWidthM,(Math.floor(a/data.meta.width)-Math.floor(b/data.meta.width))*data.meta.cellHeightM);ds.push(dist);}const pts=elevations.map((h,k)=>`${32+ds[k]/Math.max(dist,1)*325},${79-(h-min)/(max-min)*66}`).join(' ');$('profile').innerHTML=`<svg class="profile-chart" viewBox="0 0 370 106" role="img" aria-label="Terrain profile from ${fmt(elevations[0],0)} to ${fmt(elevations.at(-1),0)} metres over ${fmt(dist/1000)} kilometres"><path d="M32 12V80H357" fill="none" stroke="#ccd5c3"/><path d="M${pts.split(' ').join(' L')} L357 80 L32 80 Z" fill="#dce6cf"/><polyline points="${pts}" fill="none" stroke="#4b7954" stroke-width="1.5"/><text x="0" y="17" font-size="9" fill="#7b8872">${max} m</text><text x="0" y="80" font-size="9" fill="#7b8872">${min}</text><text x="31" y="99" font-size="9" fill="#7b8872">0</text><text x="312" y="99" font-size="9" fill="#7b8872">${fmt(dist/1000)} km</text></svg>`;}
function selectLayer(next){layer=next;document.querySelectorAll('[data-layer]').forEach(b=>{b.classList.toggle('active',b.dataset.layer===layer);b.setAttribute('aria-pressed',b.dataset.layer===layer);});$('layer-title').textContent={elevation:'Elevation of Telangana',slope:'Slope of the sampled terrain',drainage:'Where the terrain gathers water'}[layer];$('legend-title').textContent={elevation:'Elevation · metres',slope:'Slope · degrees',drainage:'Contributing area · km² (log scale)'}[layer];$('legend-gradient').style.background=`linear-gradient(90deg,${colors[layer].map(s=>s[1]).join(',')})`;$('legend-ticks').innerHTML={elevation:'<span>0</span><span>500</span><span>1,000</span>',slope:'<span>0°</span><span>12.5°</span><span>25°+</span>',drainage:`<span>~0.8</span><span>~212</span><span>~53,000</span>`}[layer];recolor();if(window.__atlasState)window.__atlasState.layer=layer;}
function renderGauges(){if(!gauges)return;renderGaugeFreshness(gauges);const rows=gauges.sources.flatMap(s=>s.stations);$('gauge-rows').replaceChildren();for(const s of rows.sort((a,b)=>a.basin.localeCompare(b.basin)||a.name.localeCompare(b.name))){const age=(Date.now()-Date.parse(s.observedAt))/36e5;const freshness=age<0?'Future timestamp':age<=24?'Within 24 hours':`Stale · ${Math.floor(age/24)} days old`;const tr=document.createElement('tr');const values=[s.name,`${s.level.toFixed(3)} m`,new Date(s.observedAt).toLocaleString('en-GB',{timeZone:'Asia/Kolkata',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),freshness,'Unavailable'];values.forEach((v,i)=>{const td=document.createElement('td');td.textContent=v;if(i===0){const small=document.createElement('small');small.textContent=`${s.river} · ${s.basin} basin`;td.append(small);}if(i===3)td.className=age>=0&&age<=24?'fresh':'stale';tr.append(td);});$('gauge-rows').append(tr);}const errors=gauges.sources.filter(s=>s.error).map(s=>s.basin);$('gauge-status').textContent=`${rows.length} stations · published JSON · source fetched ${new Date(gauges.fetchedAt).toLocaleString('en-GB')} · ${errors.length?'Partial feed: '+errors.join(', ')+' unavailable.':'Latest screened record per station; values unverified.'}`;if(scene)addLabels();projectLayer?.refresh();}
async function refreshGauges(){
 const btn=$('refresh');btn.disabled=true;btn.textContent='Checking published JSON…';
 try{gauges=await loadGaugeSnapshot();renderGauges();}
 catch(error){$('gauge-status').textContent=`Reload failed. Showing retained snapshot from ${new Date(gauges?.fetchedAt||Date.now()).toLocaleString('en-GB')}. Published JSON could not be loaded.`;}
 finally{btn.disabled=false;btn.textContent='↻ Reload published readings';}
}
async function start(){try{const [meta,boundary,rivers,snapshot]=await Promise.all([...['metadata.json','boundary.geojson','rivers.geojson'].map(f=>fetch(dataUrl(f)).then(r=>{if(!r.ok)throw new Error(f);return r.json();})),loadGaugeSnapshot()]);data={meta,boundary,rivers};gauges=snapshot;await Promise.all(['elevation','filled','receiver','accumulation','slope','mask'].map(async name=>{const r=await fetch(dataUrl(name+'.bin'));if(!r.ok)throw new Error('Missing '+name);const a=await r.arrayBuffer();data[name]=name==='mask'?new Uint8Array(a):name==='receiver'?new Int32Array(a):new Float32Array(a);}));$('resolution').textContent=`Measured DEM · ${fmt(meta.cellWidthM,0)} × ${fmt(meta.cellHeightM,0)} m grid · 15× relief`;$('grid-detail').textContent=`Grid cells are ${fmt(meta.cellWidthM,0)} × ${fmt(meta.cellHeightM,0)} m. ${meta.correctedCells||0} implausible in-state negative source samples were median-repaired; original samples and quality flags are retained.`;document.querySelectorAll('button,input,select').forEach(e=>e.disabled=false);try{initThree();attachTerrainDetail();}catch(e){initFallback(e);}projectLayer=initKaleshwaram({boundary:data.boundary,getGauges:()=>gauges,refresh:refreshGauges,project:(lon,lat)=>{const mount=$('scene');if(fallback){const [west,south,east,north]=data.meta.bounds;return {x:(lon-west)/(east-west)*mount.clientWidth,y:(north-lat)/(north-south)*mount.clientHeight,visible:lon>=west&&lon<=east&&lat>=south&&lat<=north};}const v=xyz(lon,lat,.06);v.y*=exaggeration;v.project(camera);return {x:(v.x+1)/2*mount.clientWidth,y:(1-v.y)/2*mount.clientHeight,visible:Math.abs(v.x)<.98&&Math.abs(v.y)<.9&&v.z>=-1&&v.z<=1};}});new ResizeObserver(()=>projectLayer.update()).observe($('scene'));projectLayer.update();renderGauges();const q=new URLSearchParams(location.search);const lat=Number(q.get('lat')),lon=Number(q.get('lon'));if(!(q.has('lat')&&q.has('lon')&&setSeed(lat,lon,true)))setSeed(...presets.hyderabad);$('loading').style.display='none';$('scene').setAttribute('data-ready','true');
}catch(error){$('loading').textContent='Terrain could not load: '+error.message;console.error(error);}}
// Keep both panels mounted so switching tabs preserves all map and water settings.
const panelTabs=[...document.querySelectorAll('.panel-tabs [role="tab"]')];
function selectControlTab(tab,focus=false){
 for(const item of panelTabs){const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;$(item.getAttribute('aria-controls')).hidden=!selected;}
 if(focus)tab.focus();
}
for(const tab of panelTabs){
 tab.addEventListener('click',()=>selectControlTab(tab));
 tab.addEventListener('keydown',event=>{
  let index=panelTabs.indexOf(tab);
  if(event.key==='ArrowRight')index=(index+1)%panelTabs.length;
  else if(event.key==='ArrowLeft')index=(index-1+panelTabs.length)%panelTabs.length;
  else if(event.key==='Home')index=0;
  else if(event.key==='End')index=panelTabs.length-1;
  else return;
  event.preventDefault();selectControlTab(panelTabs[index],true);
 });
}

document.querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>data&&selectLayer(b.dataset.layer));document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{routeMode=b.dataset.route;document.querySelectorAll('[data-route]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b);});trace();});$('exaggeration').oninput=e=>{exaggeration=+e.target.value;$('exaggeration-value').textContent=exaggeration+'×';if(group){group.scale.y=exaggeration;seedMarker.position.copy(vertex(seed,.12));seedMarker.position.y*=exaggeration;updateLabels();}showTerrainStatus(currentTerrainStatus||`Regional DEM · ${fmt(data.meta.cellWidthM,0)} × ${fmt(data.meta.cellHeightM,0)} m grid`);};$('volume').oninput=e=>{volume=10**(4+ +e.target.value/25);$('volume-value').textContent=(volume/1e6).toFixed(2)+' Mm³';trace();};$('volume').value=50;$('preset').onchange=e=>{if(presets[e.target.value])setSeed(...presets[e.target.value]);};$('set-point').onclick=()=>{const values=$('coordinates').value.split(',').map(Number);if(values.length===2&&values.every(Number.isFinite))setSeed(...values,true);else $('input-status').textContent='Enter latitude, longitude, for example 17.385, 78.4867.';};$('coordinates').addEventListener('keydown',e=>{if(e.key==='Enter')$('set-point').click();});$('trace').onclick=()=>{trace();$('input-status').textContent='Route recalculated from the measured terrain.';};$('terrain-detail').onchange=e=>{
 terrainDetail?.setEnabled(e.target.value==='auto');
 if(e.target.value!=='auto')showTerrainStatus('Regional Mapzen / SRTM · ~900 m mesh');
 else if(!terrainDetail?.ready)showTerrainStatus('Loading Copernicus GLO-30 · regional terrain retained');
};
$('focus-terrain').onclick=()=>{
 exaggeration=Math.min(exaggeration,5);$('exaggeration').value=exaggeration;$('exaggeration-value').textContent=exaggeration+'×';group.scale.y=exaggeration;
 const offset=camera.position.clone().sub(orbit.target),point=vertex(seed);
 point.y*=exaggeration;orbit.target.copy(point);camera.position.copy(point).add(offset);camera.zoom=40;camera.updateProjectionMatrix();orbit.update();
 if(terrainDetail){$('terrain-detail').value='auto';terrainDetail.setEnabled(true);terrainDetail.dirty=true;}
};
$('rivers').onchange=e=>{if(riverGroup)riverGroup.visible=e.target.checked;if(fallback)drawFallback();};$('channels').onchange=e=>{if(channelGroup)channelGroup.visible=e.target.checked;};$('cities').onchange=updateLabels;$('reset').onclick=resetCamera;$('top').onclick=()=>applyCameraAngles(THREE.MathUtils.radToDeg(orbit.getAzimuthalAngle()),topDown?40:90);$('bearing').oninput=e=>applyCameraAngles(+e.target.value,+$('tilt').value);$('tilt').oninput=e=>applyCameraAngles(+$('bearing').value,+e.target.value);$('zoom-in').onclick=()=>{camera.zoom=Math.min(64,camera.zoom*1.25);camera.updateProjectionMatrix();updateLabels();};$('zoom-out').onclick=()=>{camera.zoom=Math.max(.5,camera.zoom/1.25);camera.updateProjectionMatrix();updateLabels();};$('export').onclick=()=>{if(renderer)renderer.render(scene,camera);const c=renderer?.domElement||$('fallback');const image=createExportImage(c,{layer,exaggeration,coordinates:$('coordinates').value,terrainStatus:$('resolution').textContent,regional:fallback||$('terrain-detail').value==='regional'||!terrainDetail?.ready}).toDataURL('image/png');$('export-image').src=image;$('download-image').href=image;$('download-image').download='telangana-'+layer+'.png';$('export-dialog').showModal();};$('close-export').onclick=()=>$('export-dialog').close();$('sources-link').onclick=()=>$('method').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('refresh').onclick=refreshGauges;setInterval(()=>{if($('auto-refresh').checked&&!document.hidden)refreshGauges();},15*60*1000);document.querySelectorAll('button,input,select').forEach(e=>e.disabled=true);start();
