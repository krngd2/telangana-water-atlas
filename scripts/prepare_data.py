"""Rebuild the real DEM and derived hydrology. Requires numpy and Pillow."""
import json, math, io, urllib.request, concurrent.futures, heapq, datetime, pathlib, hashlib, unicodedata
import numpy as np
from PIL import Image, ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]; OUT=ROOT/'public/data'; CACHE=ROOT/'.cache'; CACHE.mkdir(exist_ok=True); OUT.mkdir(parents=True,exist_ok=True)
def fetch(url, name):
 p=CACHE/name
 if not p.exists():
  with urllib.request.urlopen(url,timeout=60) as r: p.write_bytes(r.read())
 return p.read_bytes()
def write(name,obj): (OUT/name).write_text(json.dumps(obj,separators=(',',':'),ensure_ascii=False))
meta=json.loads(fetch('https://www.geoboundaries.org/api/current/gbOpen/IND/ADM1/','boundary-meta.json'))
states=json.loads(fetch(meta['simplifiedGeometryGeoJSON'],'states.geojson'))
boundary=next(f for f in states['features'] if 'Telangana' in unicodedata.normalize('NFKD',f['properties']['shapeName']).encode('ascii','ignore').decode())
write('boundary.geojson',boundary)
polys=boundary['geometry']['coordinates']; polys=polys if boundary['geometry']['type']=='MultiPolygon' else [polys]
coords=[p for poly in polys for ring in poly for p in ring]; west=min(p[0] for p in coords)-.12; east=max(p[0] for p in coords)+.12; south=min(p[1] for p in coords)-.12; north=max(p[1] for p in coords)+.12
# Regular local equirectangular grid in WGS84. ~0.85 km spacing; sampled bilinearly from z9 tiles.
W=H=512; Z=9; N=2**Z
lons=np.linspace(west,east,W); lats=np.linspace(north,south,H)
px=(lons+180)/360*N*256; py=(1-np.arcsinh(np.tan(np.radians(lats)))/math.pi)/2*N*256
x0=int(px.min()//256); x1=int(px.max()//256); y0=int(py.min()//256); y1=int(py.max()//256)
jobs=[(x,y) for x in range(x0,x1+1) for y in range(y0,y1+1)]
def tile(job):
 x,y=job; data=fetch(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png',f'{Z}-{x}-{y}.png'); a=np.array(Image.open(io.BytesIO(data))).astype(np.float32); return x,y,a[:,:,0]*256+a[:,:,1]+a[:,:,2]/256-32768
mosaic=np.zeros(((y1-y0+1)*256,(x1-x0+1)*256),dtype=np.float32)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for x,y,a in pool.map(tile,jobs): mosaic[(y-y0)*256:(y-y0+1)*256,(x-x0)*256:(x-x0+1)*256]=a
xx,yy=np.meshgrid(px-x0*256,py-y0*256); ix=xx.astype(int); iy=yy.astype(int); dx=xx-ix; dy=yy-iy
raw=(mosaic[iy,ix]*(1-dx)*(1-dy)+mosaic[iy,ix+1]*dx*(1-dy)+mosaic[iy+1,ix]*(1-dx)*dy+mosaic[iy+1,ix+1]*dx*dy).astype(np.float32)
maskimg=Image.new('L',(W,H)); draw=ImageDraw.Draw(maskimg)
for poly in polys:
 for k,ring in enumerate(poly): draw.polygon([((p[0]-west)/(east-west)*(W-1),(north-p[1])/(north-south)*(H-1)) for p in ring],fill=0 if k else 1)
mask=np.array(maskimg,dtype=np.uint8)
# Preserve source values and flag in-state samples below sea level (implausible here).
original=raw.copy(); quality=((raw<0)&(mask>0)).astype(np.uint8)
for y,x in np.argwhere(quality):
 window=raw[max(0,y-1):min(H,y+2),max(0,x-1):min(W,x+2)]
 raw[y,x]=np.median(window[window>=0])
(OUT/'elevation-original.bin').write_bytes(np.asarray(original,dtype='<f4').tobytes())
(OUT/'quality.bin').write_bytes(quality.tobytes())
# Priority flood: start all rectangular edge cells, fill depressions; retain visitation rank and parent.
filled=raw.copy().ravel(); rawflat=raw.ravel(); seen=np.zeros(W*H,bool); parent=np.full(W*H,-1,np.int32); rank=np.zeros(W*H,np.int32); heap=[]; order=[]
for y in range(H):
 for x in range(W):
  if x in (0,W-1) or y in (0,H-1):
   i=y*W+x; seen[i]=True; heapq.heappush(heap,(float(filled[i]),i))
def neighbors(i):
 y,x=divmod(i,W)
 for dy in (-1,0,1):
  for dx in (-1,0,1):
   if (dx or dy) and 0<=x+dx<W and 0<=y+dy<H: yield (y+dy)*W+x+dx,dx,dy
while heap:
 h,i=heapq.heappop(heap); rank[i]=len(order); order.append(i)
 for j,_,_ in neighbors(i):
  if not seen[j]:
   seen[j]=True; filled[j]=max(filled[j],h); parent[j]=i; heapq.heappush(heap,(float(filled[j]),j))
sx=(east-west)/(W-1)*111320*math.cos(math.radians((north+south)/2)); sy=(north-south)/(H-1)*111320
receiver=parent.copy(); accum=np.ones(W*H,dtype=np.float32)
for i in order:
 best=0
 for j,dx,dy in neighbors(i):
  slope=(filled[i]-filled[j])/math.hypot(dx*sx,dy*sy)
  if rank[j]<rank[i] and slope>best: best=slope; receiver[i]=j
for i in reversed(order):
 if receiver[i]>=0: accum[receiver[i]]+=accum[i]
gy,gx=np.gradient(raw,sy,sx); slope=np.degrees(np.arctan(np.hypot(gx,gy)))
for name,a,dtype in [('elevation',raw,'<f4'),('filled',filled,'<f4'),('receiver',receiver,'<i4'),('accumulation',accum,'<f4'),('slope',slope,'<f4'),('mask',mask,'u1')]: (OUT/(name+'.bin')).write_bytes(np.asarray(a,dtype=dtype).tobytes())
# Preserve sourced geometry, regional subset, no invented tributaries.
rivers=json.loads(fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson','rivers.geojson'))
features=[]
for f in rivers['features']:
 lines=f['geometry']['coordinates'] if f['geometry']['type']=='MultiLineString' else [f['geometry']['coordinates']]
 for line in lines:
  run=[]
  for p in line:
   if west<=p[0]<=east and south<=p[1]<=north: run.append(p)
   else:
    if len(run)>1: features.append({'type':'Feature','properties':{'name':f['properties'].get('name') or 'Unnamed river'},'geometry':{'type':'LineString','coordinates':run}})
    run=[]
  if len(run)>1: features.append({'type':'Feature','properties':{'name':f['properties'].get('name') or 'Unnamed river'},'geometry':{'type':'LineString','coordinates':run}})
write('rivers.geojson',{'type':'FeatureCollection','features':features})
metadata={'width':W,'height':H,'bounds':[west,south,east,north],'cellWidthM':sx,'cellHeightM':sy,'cellAreaM2':sx*sy,'minElevation':float(raw[mask>0].min()),'maxElevation':float(raw[mask>0].max()),'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'tileZoom':Z,'tileCount':len(jobs),'correctedCells':int(quality.sum()),'boundaryMetadata':meta,'rivers':['Natural Earth 1:10 million river centerlines; generalized regional context, not channel survey'],'files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in OUT.glob('*.bin')}}
write('metadata.json',metadata)
print(json.dumps({k:v for k,v in metadata.items() if k not in ('files','boundaryMetadata')},indent=2))
