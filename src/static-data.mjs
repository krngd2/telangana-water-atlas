// BASE_URL keeps static data working at / and beneath a configured hosting subpath.
export const dataUrl=name=>`${import.meta.env?.BASE_URL||'/'}data/${name}`;
export function validateGaugeSnapshot(snapshot){
 if(!snapshot||!Number.isFinite(Date.parse(snapshot.fetchedAt))||!Array.isArray(snapshot.sources))throw new Error('Invalid published snapshot');
 let count=0;
 for(const source of snapshot.sources){
  if(typeof source.basin!=='string'||!Array.isArray(source.stations))throw new Error('Invalid snapshot source');
  for(const station of source.stations){
   if(typeof station.name!=='string'||!station.name.trim()||typeof station.basin!=='string'||typeof station.river!=='string'||!Number.isFinite(station.level)||station.level<0||station.level>1500||!Number.isFinite(station.lat)||!Number.isFinite(station.lon)||Math.abs(station.lat)>90||Math.abs(station.lon)>180||!Number.isFinite(Date.parse(station.observedAt)))throw new Error('Invalid snapshot observation');
   count++;
  }
 }
 if(!count)throw new Error('Published snapshot has no observations');
 return snapshot;
}
export async function loadGaugeSnapshot(){
 const response=await fetch(dataUrl('gauges-snapshot.json'),{cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(`Published snapshot HTTP ${response.status}`);
 return validateGaugeSnapshot(await response.json());
}
