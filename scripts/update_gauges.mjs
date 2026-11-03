import fs from 'node:fs/promises';
import {fetchGauges} from '../src/gauges.mjs';
import {validateGaugeSnapshot} from '../src/static-data.mjs';
const target=new URL('../public/data/gauges-snapshot.json',import.meta.url),temporary=new URL('../public/data/gauges-snapshot.json.tmp',import.meta.url);
const previous=validateGaugeSnapshot(JSON.parse(await fs.readFile(target)));
const fresh=await fetchGauges();
if(!fresh.sources.some(s=>s.stations.length))throw new Error('Official data unavailable; previous static snapshot retained.');
for(const source of fresh.sources)if(source.error){source.stations=previous.sources.find(p=>p.basin===source.basin)?.stations||[];source.retainedFrom=previous.fetchedAt;}
fresh.generatedAt=new Date().toISOString();fresh.delivery='static-json';
validateGaugeSnapshot(fresh);
await fs.writeFile(temporary,JSON.stringify(fresh,null,2));await fs.rename(temporary,target);
console.log('Static gauge snapshot prepared:',fresh.fetchedAt,fresh.sources.map(s=>`${s.basin}: ${s.stations.length} stations${s.error?' (retained)':''}`).join(', '));
console.log('Run npm run build, then publish dist/ to make this snapshot available to visitors.');
