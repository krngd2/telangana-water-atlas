// Dated evidence, missing telemetry, and illustrative scenarios are separate data types.
export const EVIDENCE_SOURCES = {
  introduction: {label:'CAG 2024 · chapter I, p.1',url:'https://saiindia.gov.in/uploads/download_audit_report/2024/04_Chapter-I_Introduction-065cdab561dca65.95697792.pdf',basis:'Design scope and endpoint elevations'},
  planning: {label:'CAG 2024 · chapter IV, pp.54, 76–78',url:'https://saiindia.gov.in/uploads/download_audit_report/2024/07_Chapter-IV_Planning-for-Kaleshwaram-Project-065cdab562898a9.68735858.pdf',basis:'Water budget and design pumping / power figures'},
  barrages: {label:'CAG 2024 · chapter III, p.16',url:'https://cag.gov.in/uploads/download_audit_report/2024/06_Chapter-III_Re-Engineering-of-PCSS-Project-065cdab56237fe3.51374325.pdf',basis:'Barrage design FRL, storage and gate specifications'},
  pumpTable: {label:'CAG 2024 · appendix 4.8',url:'https://cag.gov.in/uploads/download_audit_report/2024/11_Appendices-065cdab56438c52.37859111.pdf',basis:'Pump-capacity and installed-power analysis, including additional capacity'},
  yellampalli: {label:'I&CAD · Sripada Sagar project profile',url:'https://irrigation.telangana.gov.in/img/projectspdf/syp.pdf',basis:'Yellampalli design FRL 148 m and storage 20.175 TMC'},
  mallanna: {label:'I&CAD submission to NGT · annexure 6, 21 February 2024',url:'https://www.greentribunal.gov.in/sites/default/files/news_updates/OA%20120%20of%202024%20Additional%20Report%20by%20R4.pdf',basis:'Mallanna Sagar design FRL 557 m and storage 50 TMC'},
  prlis: {label:'I&CAD · PRLIS environmental submission, 2023',url:'https://environmentclearance.nic.in/writereaddata/Online/EDS/0_0_07_Jun_2023_1823478671PRLISProject_FinalEIAEMPReport_ADSReply-compressed.pdf',basis:'Palamuru–Rangareddy source at Srisailam'},
  godavariSchemes: {label:'Telangana Socio Economic Outlook 2020 · p.78',url:'https://des.telangana.gov.in/publications/Socio_Economic_2020.pdf',basis:'Separate Godavari sources of Devadula and Sita Rama'},
  execution: {label:'CAG 2024 · chapter V, pp.124, 129–134',url:'https://saiindia.gov.in/uploads/download_audit_report/2024/08_Chapter-V_Execution-of-Kaleshwaram-Project-065cdab5633b085.36569039.pdf',basis:'Network and dated command-area progress'},
  command: {label:'I&CAD · Kaleshwaram district ayacut table',url:'https://irrigation.telangana.gov.in/img/projectspdf/kaleshwaram.pdf',basis:'Historical intended acreage; blank source cells are not zeros'},
  basins: {label:'Telangana government · irrigation project reference',url:'https://brahminparishad.telangana.gov.in/resources/downloads/Details_of_Irrigation_Projects.pdf',basis:'River sources and scheme descriptions'},
  outlook: {label:'Telangana Socio Economic Outlook 2021',url:'https://telangana.gov.in/wp-content/uploads/2023/05/Telangana-Socio-Economic-Outlook-2021.pdf',basis:'District and project context'},
  inspection: {label:'Department of Water Resources · annual report 2023–24',url:'https://cdnbbsr.s3waas.gov.in/s3a70dc40477bc2adceef4d2c90f47eb82/uploads/2024/07/202407241362014549.pdf',basis:'NDSA / CWC October 2023 inspection'},
  restoration: {label:'Telangana government · 20 April 2026',url:'https://www.telangana.gov.in/news/press-releases/2026/04/honble-cm-sri-a-revanth-reddy-inspects-medigadda-barrage-site-and-reviews-restoration-plans-for-the-damaged-kaleshwaram-lift-irrigation-project/',basis:'Investigations and required approvals'},
  safetyReported: {label:'The New Indian Express · 25 April 2025',url:'https://www.newindianexpress.com/states/telangana/2025/Apr/25/ndsa-recommends-rehabilitation-of-kaleshwaram-barrages-cites-irreversible-damage-to-medigadda-block-7',basis:'Secondary reporting of NDSA findings; original report not available here'},
  repairsReported: {label:'The New Indian Express · 28 September 2026',url:'https://www.newindianexpress.com/states/telangana/2026/Sep/28/end-to-end-diaphragm-wall-may-be-needed-to-save-medigadda-minister-uttam-kumar-reddy',basis:'Minister’s proposed repairs and June 2027 target; not certified completion'},
  annualReported: {label:'Deccan Chronicle · 7 June 2025',url:'https://www.deccanchronicle.com/southern-states/telangana/kaleshwaram-row-heats-up-as-uttam-harish-trade-charges-over-project-failures-1883938',basis:'Minister’s reported annual Medigadda lifts; rounded, not an audited series'},
  intakeReported: {label:'The New Indian Express · 27 October 2026',url:'https://www.newindianexpress.com/states/telangana/2026/Oct/27/ktr-harish-spreading-false-info-on-godavari-waters-congress',basis:'Political statement of a 93.5 m intake requirement; technical verification unavailable'},
  gauges: {label:'CWC / NWIC · hourly water-level telemetry',url:'https://nwdp.nwic.gov.in/en/dataset/river-water-level-telemetry-hourly-central-water-commission-cwc',basis:'Provider levels; datum unverified; no discharge or gate feed'}
};
export const WATER_SOURCES=[['Medigadda diversion',195],['Yellampalli contribution',20],['Groundwater supplementation',25]];
export const WATER_USES=[['New irrigation',134.5],['Stabilisation',34.5],['Hyderabad drinking water',30],['Village drinking water',10],['Industry',16],['Evaporation',12],['Unexplained in DPR',3]];
export const REPORTED_LIFTS=[['2019–20',61],['2020–21',31.82],['2021–22',33],['2022–23',25.97],['2023–24',8.93]];
// Approximate district headquarters are locators, not district centroids or command boundaries.
export const COMMAND_DISTRICTS=[
  {id:'kamareddy',name:'Kamareddy',acres:184108,lat:18.32,lon:78.34},
  {id:'sangareddy',name:'Sangareddy',acres:269744,lat:17.62,lon:78.08},
  {id:'medak',name:'Medak',acres:247418,lat:18.05,lon:78.26},
  {id:'medchal',name:'Medchal',acres:29473,lat:17.63,lon:78.48},
  {id:'yadadri',name:'Yadadri',acres:249105,lat:17.51,lon:78.89},
  {id:'nalgonda',name:'Nalgonda',acres:29169,lat:17.06,lon:79.27},
  {id:'sircilla',name:'Rajanna Sircilla',acres:153539,lat:18.39,lon:78.81},
  {id:'siddipet',name:'Siddipet',acres:329616,lat:18.10,lon:78.85},
  {id:'jagityal',name:'Jagityal',acres:19979,lat:18.79,lon:78.91},
  {id:'karimnagar',name:'Karimnagar',acres:800,lat:18.44,lon:79.13},
  {id:'peddapalli',name:'Peddapalli',acres:30000,lat:18.62,lon:79.38},
  {id:'nirmal',name:'Nirmal',acres:100000,lat:19.10,lon:78.34},
  {id:'nizamabad',name:'Nizamabad',acres:182749,lat:18.67,lon:78.10}
];
export const INTAKE_REFERENCE=93.5;
export function intakeScenario(value){
  const level=Math.max(88,Math.min(100,Number.isFinite(Number(value))?Number(value):90));
  return {level,delta:Math.round((level-INTAKE_REFERENCE)*10)/10};
}
export const cusecsFromTmcPerDay=value=>value*1e9/86400;
export const CHAIN_REFERENCES=[
  {name:'Medigadda',level:100,storage:16.17,source:'barrages'},
  {name:'Annaram',level:119,storage:10.87,source:'barrages'},
  {name:'Sundilla',level:130,storage:8.83,source:'barrages'},
  {name:'Yellampalli',level:148,storage:20.175,source:'yellampalli'},
  {name:'Medaram',level:233,storage:0.78,source:'execution',note:'Intended level; historical filling constraints recorded by CAG'},
  {name:'Mid Manair',level:318,storage:25.875,source:'execution'},
  {name:'Ananthagiri',level:397,storage:3.5,source:'execution'},
  {name:'Ranganayaka Sagar',level:null,storage:null,source:'execution'},
  {name:'Mallanna Sagar',level:557,storage:50,source:'mallanna'},
  {name:'Kondapochamma Sagar',level:618,storage:null,source:'introduction'}
];
const fmt=(n,d=2)=>Number(n).toLocaleString('en-GB',{maximumFractionDigits:d});
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const source=id=>{const s=EVIDENCE_SOURCES[id];return `<a href="${s.url}" target="_blank" rel="noreferrer">${s.label} ↗</a>`;};
const note=(text,id)=>`<p class="evidence-note">${text}${id?' · '+source(id):''}</p>`;
const intro=(kicker,title,text)=>`<div class="evidence-intro"><span class="project-eyebrow">${kicker}</span><h3 tabindex="-1">${title}</h3><p>${text}</p></div>`;
const unavailable=text=>`<span class="evidence-badge missing">${text||'Unavailable'}</span>`;
const svg=(label,body,view='0 0 800 250')=>`<svg viewBox="${view}" role="img" aria-label="${label}">${body}</svg>`;
const TOPICS=[['intake','Intake & levels'],['chain','Lift chain'],['hydrology','Hydrology'],['basins','Basin connections'],['command','Command areas'],['safety','Safety & timeline'],['numbers','Numbers & sources']];

function intakeMarkup(sites,level){
  return intro('01 / THE INTAKE','Flowing water needs enough depth at the intake.','A river can carry water downstream while the water surface at a pump inlet is too low. Barrage pools provide the level and submergence each lift needs; safe storage and pump readiness are separate requirements.')+
    `<div class="evidence-key"><span>→ Lifted water travels upstream</span><span>← Natural Godavari flow travels downstream</span></div><div class="evidence-figure">${svg('Design full reservoir levels, Medigadda 100 m, Annaram 119 m, Sundilla 130 m. Upstream lift direction is opposite to natural river flow.',
    [90,100,110,120,130].map(v=>`<line x1="65" x2="760" y1="${210-(v-85)*3.5}" y2="${210-(v-85)*3.5}" class="ev-grid"/><text x="12" y="${214-(v-85)*3.5}">${v} m</text>`).join('')+
    sites.slice(0,3).map((s,i)=>{const x=170+i*240,y=210-(s.frl-85)*3.5;return `<line x1="${x-65}" x2="${x+65}" y1="${y}" y2="${y}" class="ev-water"/><text x="${x}" y="${y-14}" text-anchor="middle" class="ev-value">${s.frl} m FRL</text><text x="${x}" y="240" text-anchor="middle">${s.name}</text>${i<2?`<path d="M${x+75} ${y-5} L${x+150} ${y-35} l-12 0 m12 0 l-6 10" class="ev-lift"/>`:''}`;}).join(''))}</div>`+
    `<div class="evidence-mobile intake-level-list">${sites.slice(0,3).map(s=>`<div><strong>${s.name}</strong><span>${s.frl} m design FRL</span></div>`).join('')}</div>`+
    note('FRL = design full reservoir level. Spacing is schematic. These are not river-bed, crest, actual water heights, or pump heads.','barrages')+
    `<div class="evidence-two"><section><h4>Kannepalli / Lakshmi intake illustration</h4><label class="scenario-label" for="intake-level">Illustrative pool level <output id="intake-level-value">${fmt(level,1)} m</output></label><input id="intake-level" type="range" min="88" max="100" step="0.1" value="${level}" aria-describedby="scenario-caveat"><div class="endpoints"><span>88 m</span><span>100 m</span></div><div id="intake-scenario-chart"></div><p id="intake-result" role="status"></p><p id="scenario-caveat" class="evidence-note">Scenario only. The ~93.5 m requirement is a reported claim, not a verified operating limit. Datum and intake drawings are not available. Crossing this line does not establish safe pump operation. ${source('intakeReported')}</p></section><section><h4>What is actually known at the sites?</h4><dl class="evidence-facts"><div><dt>Medigadda / Annaram / Sundilla FRL</dt><dd>100 / 119 / 130 m · design</dd></div><div><dt>River bed & crest elevations</dt><dd>${unavailable('Survey not connected')}</dd></div><div><dt>Current site water-surface elevations</dt><dd>${unavailable()}</dd></div><div><dt>Gate openings & safe storage clearance</dt><dd>${unavailable()}</dd></div><div><dt>Actual lift flow / river discharge</dt><dd>${unavailable('No cusec observations')}</dd></div></dl>${note('Kaleswaram is a nearby upstream gauge, with an unverified datum. It cannot be substituted for an intake water-surface elevation.','gauges')}</section></div>`;
}

function scenarioMarkup(value){
  const s=intakeScenario(value),y=n=>195-(n-85)*10;
  return svg(`Illustrative water level ${s.level} metres; reported intake reference 93.5 metres. Not a current measurement or operating clearance.`,
    `<rect x="64" y="25" width="265" height="170" fill="#f1f2eb"/><rect x="64" y="${y(s.level)}" width="265" height="${195-y(s.level)}" fill="#c5e2e6"/><line x1="64" x2="329" y1="${y(s.level)}" y2="${y(s.level)}" class="ev-water"/><text x="75" y="${y(s.level)-9}" class="ev-value">Scenario ${fmt(s.level,1)} m</text><line x1="50" x2="470" y1="${y(INTAKE_REFERENCE)}" y2="${y(INTAKE_REFERENCE)}" class="ev-reference"/><text x="345" y="${y(INTAKE_REFERENCE)-9}">93.5 m</text><text x="345" y="${y(INTAKE_REFERENCE)+18}">Reported reference</text><text x="64" y="220">Assumed common datum · bed / crest not drawn</text>`, '0 0 500 240');
}

function chainMarkup(sites){
  const stages=[
    {name:'Medigadda → Annaram',pump:'Kannepalli / Lakshmi',id:'medigadda',level:'100 → 119 m FRL',storage:'16.17 → 10.87 TMC',capacity:3.10,mw:680},
    {name:'Annaram → Sundilla',pump:'Saraswati',id:'annaram',level:'119 → 130 m FRL',storage:'10.87 → 8.83 TMC',capacity:3.01,mw:480},
    {name:'Sundilla → Yellampalli',pump:'Parvati',id:'sundilla',level:'130 → 148 m FRL',storage:'8.83 → 20.175 TMC',capacity:3.12,mw:560},
    {name:'Yellampalli → Medaram → Mid Manair',pump:'Nandi & Gayatri · Link II',id:'yellampalli',level:'148 → 233 (intended) → 318 m',storage:'20.175 → 0.78 → 25.875 TMC',capacity:1.9},
    {name:'Mid Manair → Ananthagiri → Ranganayaka Sagar',pump:'Link IV · packages 10–11',level:'318 → 397 m; Ranganayaka not verified here'},
    {name:'Ranganayaka Sagar → Mallanna Sagar',pump:'Link IV · package 12',level:'557 m Mallanna Sagar FRL',storage:'Mallanna Sagar: 50 TMC'},
    {name:'Mallanna Sagar → Kondapochamma Sagar',pump:'Link IV · package 14',level:'618 m highest design endpoint'}
  ];
  return intro('02 / THE LIFT CHAIN','A series of lifts, with more than one water source.','Follow the main path to the higher reservoirs. Barrage-dependent supply must pass all three Link I lifts. Link II can also draw from Yellampalli’s own available Godavari water; that does not establish today’s operating status.')+
    `<div class="evidence-stat-strip"><div><strong>100 → 618 m</strong><span>Design start / highest endpoint</span></div><div><strong>518 m</strong><span>Endpoint elevation difference</span></div><div><strong>7 links</strong><span>Branches extend beyond this main path</span></div></div>`+
    note('518 m is not the sum of pump heads: friction, operating levels and intervening descents also matter.','introduction')+chainProfile()+
    `<ol class="evidence-chain">${stages.map((s,i)=>`<li><span class="chain-index">${i+1}</span><div><h4>${s.name}</h4><p>${s.pump}</p><span class="evidence-badge ${i<3?'reported':'design'}">${i<3?'Barrage-dependent supply':i===3?'Also Yellampalli-source supply':'Depends on upstream supply'}</span><p>${s.level||'Stage elevations not verified here'}</p>${s.storage?`<p>Design storage: ${s.storage}</p>`:''}${s.capacity?`<p>Design ${fmt(s.capacity)} TMC/day ≈ ${fmt(cusecsFromTmcPerDay(s.capacity),0)} cusecs${s.mw?` · ${s.mw} MW pump capacity`:''}</p>`:''}${s.id?`<button data-evidence-site="${s.id}">Locate ${sites.find(x=>x.id===s.id).name} on atlas ↗</button>`:''}</div></li>`).join('')}</ol>`+
    note('Link I capacities and MW: CAG appendix, including added capacity. These are design-analysis figures, not present pump availability, actual flow or power draw.','pumpTable')+note('Link II 1.9 TMC/day: completed base conveyance as of March 2022, excluding additional 1.1 TMC/day works. Source for link topology and Link II base capacity. A reservoir’s total design storage is not its live storage or present available water.','execution');
}

function chainProfile(){
  const x=i=>80+i*72,y=v=>260-(v/650)*225;
  const chart=[0,200,400,600].map(v=>`<line x1="58" x2="760" y1="${y(v)}" y2="${y(v)}" class="ev-grid"/><text x="5" y="${y(v)+4}">${v} m</text>`).join('')+
    CHAIN_REFERENCES.map((s,i)=>`${s.level!==null?`${i&&CHAIN_REFERENCES[i-1].level!==null?`<path d="M${x(i-1)} ${y(CHAIN_REFERENCES[i-1].level)}L${x(i)} ${y(s.level)}" class="ev-lift"/>`:''}<circle cx="${x(i)}" cy="${y(s.level)}" r="5" fill="#775698"/><text x="${x(i)}" y="${y(s.level)-13}" text-anchor="middle">${s.level}</text>`:`<rect x="${x(i)-19}" y="30" width="38" height="232" fill="#f0f1eb"/><text x="${x(i)}" y="145" text-anchor="middle" transform="rotate(-90 ${x(i)} 145)">Unverified</text>`}<text x="${x(i)}" y="286" text-anchor="middle">${i+1}</text>`).join('');
  return `<section class="evidence-section"><h4>Reservoir elevation profile · design references</h4><p class="evidence-note">Numbers 1–10 match the reservoir rows. A shaded gap marks an unverified level. This is not terrain, current water level or cumulative pump head.</p><div class="evidence-figure">${svg('Design reservoir reference elevations in route order; Ranganayaka is unknown and the line is broken there. Not surveyed terrain or cumulative pump head.',chart,'0 0 800 305')}</div><div class="evidence-table-wrap"><table class="chain-reference-table"><thead><tr><th>Reference point</th><th>Design level</th><th>Δ from 100 m</th><th>Design storage</th></tr></thead><tbody>${CHAIN_REFERENCES.map((s,i)=>`<tr><td>${i+1}. ${s.name}<small>${source(s.source)}${s.note?'<br>'+s.note:''}</small></td><td>${s.level!==null?s.level+' m':'Unverified'}</td><td>${s.level!==null?'+'+fmt(s.level-100,0)+' m':'—'}</td><td>${s.storage!==null?fmt(s.storage,3)+' TMC':'Unverified'}</td></tr>`).join('')}</tbody></table></div>${note('Δ is the difference between design water-level references, not cumulative pump lift. Lines connect only adjacent verified reference points and do not depict terrain, canals or an operating water surface. CAG figure 5.9 supplies the Mid Manair / Ananthagiri references.')}</section>`;
}

function stationStatus(s,now=Date.now()){
  const t=Date.parse(s.observedAt),hours=(now-t)/36e5;
  return !Number.isFinite(hours)?'Invalid timestamp':hours<0?'Future timestamp':hours<=24?'Within 24 hours':`Stale · ${Math.floor(hours/24)} days old`;
}
function locatorMap(boundary,points,label){
  // Same regional equirectangular projection for outline and all points.
  const x=lon=>35+(lon-77.15)*115,y=lat=>385-(lat-15.75)*95;
  const geometry=boundary?.geometry;
  const polygons=geometry?.type==='MultiPolygon'?geometry.coordinates:geometry?.type==='Polygon'?[geometry.coordinates]:[];
  const path=polygons.map(poly=>poly.map(r=>r.map((p,i)=>`${i?'L':'M'}${x(p[0]).toFixed(2)},${y(p[1]).toFixed(2)}`).join(' ')+'Z').join(' ')).join(' ');
  return svg(label,`${path?`<path d="${path}" class="ev-boundary" fill-rule="evenodd"/>`:''}<text x="450" y="30">N ↑</text>${points.map((p,i)=>`<g class="locator ${p.active?'selected':''}"><circle cx="${x(p.lon)}" cy="${y(p.lat)}" r="${p.active?14:11}"/><text x="${x(p.lon)}" y="${y(p.lat)+4}" text-anchor="middle">${i+1}</text></g>`).join('')}<text x="20" y="425">Regional locators · not command boundaries</text>`,'0 0 520 450');
}
function hydrologyMarkup(gauges,boundary){
  const stations=(gauges?.sources||[]).filter(s=>s.basin==='Godavari').flatMap(s=>s.stations);
  return intro('03 / AVAILABILITY','A water level is not an available volume.','Read the gauge, location, time, datum and quantity together. An annual design yield, an instantaneous discharge, a stored volume and a pump-throughput total answer different questions.')+
    `<div class="evidence-two"><div class="evidence-map">${locatorMap(boundary,stations,'Godavari gauge locators; numbered entries match the station table.')}</div><section><h4>Godavari observation layer</h4><ol class="gauge-evidence-list">${stations.map(s=>`<li><strong>${escape(s.name)}</strong><span>${fmt(s.level,3)} m · ${stationStatus(s)}</span><small>${escape(new Date(s.observedAt).toLocaleString('en-GB',{timeZone:'Asia/Kolkata'}))} IST</small><small>Discharge: unavailable · datum unverified</small></li>`).join('')||'<li>No retained observations.</li>'}</ol><button id="evidence-refresh">Reload published readings</button><p id="evidence-refresh-status" role="status"></p></section></div>`+
    note('Kaleswaram provides upstream confluence-area context; Bhadrachalam provides downstream context. No Pranahita-only discharge series or barrage-site inflow feed is connected.','gauges')+
    `<section class="evidence-section"><h4>Historical Medigadda lifts · reported series</h4><p class="evidence-badge reported">Minister’s statement · June 2025 · rounded values</p><div class="lift-bars">${REPORTED_LIFTS.map(([year,n])=>`<div><span>${year}</span><span class="lift-track"><i style="width:${n/195*100}%"></i></span><strong>${fmt(n)} TMC</strong></div>`).join('')}</div><p class="evidence-note">Common scale: 0 → 195 TMC annual design diversion. Listed values sum to ${fmt(REPORTED_LIFTS.reduce((s,r)=>s+r[1],0))} TMC; the source’s headline total is 162 TMC. This discrepancy is unreconciled. This is not an independently audited record; it does not measure water reaching farms. ${source('annualReported')}</p></section>`+
    `<div class="evidence-two evidence-section"><section><h4>Tummidihatti versus Medigadda</h4><p>Compare dependable yield at each site using the same period, reliability and deductions for upstream commitments. The original PCSS and re-engineered KLIP have different source locations and design assumptions. Current comparable yield series are not connected.</p><button data-evidence-site="tummidihatti">Locate Tummidihatti & inspect the source shift →</button></section><section><h4>How much goes to sea?</h4><p>A defensible answer needs downstream discharge integrated over time, plus storage changes, withdrawals and return flows. The connected level-only feed cannot calculate it. Adding sequential pump totals counts some water repeatedly.</p></section></div>`;
}

function basinsMarkup(){
  return intro('04 / SOURCES & CONNECTIONS','Keep source basins and transfer routes distinct.','These source networks explain which reservoir feeds which scheme. Receiving command areas can cross a watershed; sharing a district does not prove a hydraulic connection.')+
    `<div class="evidence-two basin-networks"><section class="basin-godavari"><h4>Godavari source network</h4><ol><li><strong>Godavari → KLIP Link I</strong><p>Medigadda → Annaram → Sundilla → Yellampalli</p></li><li><strong>Yellampalli → Mid Manair</strong><p>Link II → higher KLIP reservoirs; Yellampalli also receives its own river inflows.</p></li><li><strong>SRSP / Sriram Sagar ↔ Flood Flow Canal</strong><p>Supplementation / reverse-pumping connection to the KLIP system; direction depends on the named conveyance.</p></li><li><strong>Mid Manair / Mallanna Sagar branches</strong><p>Upper Manair, Kondapochamma, Chityala-area and Singur links. Nizam Sagar supplementation is a separate branch.</p></li><li><strong>Godavari → Devadula / Sita Rama</strong><p>Separate lift schemes. A common river does not make them stages of KLIP.</p></li></ol></section><section class="basin-krishna"><h4>Krishna source network</h4><ol><li><strong>Srisailam → Kalwakurthy</strong><p>Krishna water lifted through its own balancing reservoirs.</p></li><li><strong>Srisailam → Palamuru–Rangareddy</strong><p>Separate Krishna-source lift scheme.</p></li><li><strong>Jurala → Nettempadu / Bhima</strong><p>Separate lifts drawing from the Jurala reservoir system.</p></li><li><strong>Source and allocation matter</strong><p>No direct Godavari-to-Krishna interconnection is asserted by this diagram. Reservoir levels, conveyance capacity and authorised allocations must all be checked.</p></li></ol></section></div>`+
    note('Schematic relationships, not surveyed alignments or present operation.','basins')+note('KLIP linkage and reverse-pumping context.','execution')+note('Palamuru–Rangareddy source.','prlis')+note('Devadula and Sita Rama sources.','godavariSchemes');
}

function commandMarkup(boundary,district){
  const active=COMMAND_DISTRICTS.find(d=>d.id===district)||COMMAND_DISTRICTS[7];
  const points=COMMAND_DISTRICTS.map(d=>({...d,active:d===active}));
  return intro('05 / COMMAND GEOGRAPHY','Intended acreage is a target, not proof of delivery.','Select a numbered district to inspect the historical I&CAD plan. Locations are approximate headquarters; circles do not show irrigated land or district boundaries. Current served / partial / pending district status is unverified.')+
    `<div class="command-layout"><div><div class="evidence-map">${locatorMap(boundary,points,'Thirteen intended new-command districts, numbered to match the selector; selected district '+active.name)}</div><div class="district-detail" aria-live="polite"><span class="project-eyebrow">${active.name.toUpperCase()}</span><strong>${fmt(active.acres,0)} acres</strong><p>Intended new ayacut · historical plan</p>${unavailable('Present delivery status unverified')}<p>Source stages: KLIP’s common conveyance and distribution branches. A district-to-package delivery crosswalk is not verified here.</p><button data-evidence-topic="chain">Trace the source stages →</button></div></div><section><h4>District-wise intended new ayacut</h4><div class="district-list">${COMMAND_DISTRICTS.map((d,i)=>`<button data-evidence-district="${d.id}" aria-pressed="${d===active}"><span>${i+1}. ${d.name}</span><strong>${fmt(d.acres,0)}</strong></button>`).join('')}</div><p class="evidence-note">Total: ${fmt(COMMAND_DISTRICTS.reduce((s,d)=>s+d.acres,0),0)} acres. Source district names retained. Blank rows in the original table are omitted, not interpreted as zero. ${source('command')}</p></section></div>`+
    `<section class="evidence-section"><h4>Existing command identified for stabilisation</h4><div class="evidence-table-wrap"><table><thead><tr><th>Linked system</th><th>Existing command base</th></tr></thead><tbody>${[['SRSP Stage I',968640],['SRSP Stage II',440000],['Flood Flow Canal',200000],['Nizam Sagar',234330],['Singur',40000]].map(([n,v])=>`<tr><td>${n}</td><td>${fmt(v,0)} acres</td></tr>`).join('')}</tbody></table></div><p class="evidence-note">The 18.83 lakh-acre existing command base is distinct from the 4.71 lakh-acre equivalent used by CAG for 25% deficit supplementation. Do not add the full base to new acreage as newly created irrigation. ${source('introduction')}</p></section>`+
    `<section class="evidence-section"><h4>Dated delivery evidence · not today’s district status</h4><div class="evidence-table-wrap"><table><thead><tr><th>Source stages</th><th>March 2022 finding</th><th>Meaning</th></tr></thead><tbody><tr><td>Link I</td><td>30,000 acres targeted; none created</td><td>Pending at that date</td></tr><tr><td>Link IV · packages 10–12</td><td>35,288 of 2.65 lakh acres of network created</td><td>Partial at that date; not served-acreage measurement</td></tr><tr><td>Link II</td><td>No direct command area</td><td>Conveys to downstream distribution</td></tr></tbody></table></div>${note('Network construction is not the same as irrigation delivered. These dated findings cannot classify present district outcomes.','execution')}</section>`;
}

function safetyMarkup(){
  const events=[
    ['October 2023','Damage and inspection','Medigadda piers subsided. A joint NDSA / CWC committee inspected the barrage on 23–26 October 2023.','inspection',false],
    ['April 2025 reporting','NDSA findings reported','Reporting of the final findings describes irreversible Block 7 damage and distress at Annaram and Sundilla, requiring rehabilitation. The original signed report is not available in this atlas.','safetyReported',true],
    ['20 April 2026','Official restoration review','The government described foundation investigations and laboratory studies. Works were to follow test results and NDSA approvals.','restoration',false],
    ['28 September 2026 reporting','Proposed engineering works','The minister described possible diaphragm-wall work and downstream stilling-basin strengthening / extension. Final rehabilitation design was still awaited in that report.','repairsReported',true],
    ['June 2027 target','Stated target, not completion','The same report states a target before the 2027 monsoon, subject to design, approvals and execution. No completion certificate or operating clearance is connected.','repairsReported',true]
  ];
  return intro('06 / SAFETY & TIME','Restoration proposals are not operating clearance.','This dated timeline separates an official investigation update from reported findings and proposed works. It does not certify any barrage as safe to store water today.')+
    `<ol class="safety-timeline">${events.map(([date,title,text,id,reported])=>`<li><time>${date}</time><div><span class="evidence-badge ${reported?'reported':'design'}">${reported?'Reported / proposed':'Official dated record'}</span><h4>${title}</h4><p>${text}</p>${source(id)}</div></li>`).join('')}</ol>`+
    `<section class="evidence-section"><h4>Temporary pumping, bunds or restricted storage</h4><p>Any temporary arrangement still requires a site-specific assessment of intake submergence, foundations, seepage, flood passage, pump readiness and authorised operating limits. This atlas has no approved temporary-operation design or current safety clearance. It therefore does not show a “safe to pump” indicator.</p></section>`;
}

function budgetMarkup(title,parts){
  const total=parts.reduce((n,p)=>n+p[1],0);
  return `<section><h4>${title}</h4><div class="budget-track" role="img" aria-label="${parts.map(p=>p[0]+' '+p[1]+' TMC').join(', ')}. Total ${total} TMC">${parts.map((p,i)=>`<span class="budget-part part-${i}" style="width:${p[1]/total*100}%"></span>`).join('')}</div><dl class="budget-key">${parts.map(([name,n],i)=>`<div><dt><i class="budget-part part-${i}"></i>${name}</dt><dd>${fmt(n)} TMC</dd></div>`).join('')}</dl></section>`;
}
function numbersMarkup(){
  return intro('07 / QUANTITIES & PROVENANCE','Use the same quantity, scope and date.','The CWC-approved water budget described by CAG is a design plan. It is not annual achieved supply, current storage or a guarantee of dependable yield.')+
    `<div class="evidence-stat-strip"><div><strong>240 TMC</strong><span>Planned total water budget</span></div><div><strong>169 TMC</strong><span>Planned irrigation use</span></div><div><strong>195 TMC</strong><span>Annual Medigadda diversion target</span></div></div><div class="evidence-two">${budgetMarkup('Where the planned water comes from',WATER_SOURCES)}${budgetMarkup('Where the planned water goes',WATER_USES)}</div>`+
    note('Uses specified in the DPR total 237 TMC; CAG notes that 3 TMC is unexplained. That gap is shown explicitly, not added to evaporation.','planning')+
    `<section class="evidence-section"><h4>Units and comparisons</h4><dl class="evidence-facts"><div><dt>1 TMC</dt><dd>1 billion ft³ ≈ 28.317 million m³ · volume</dd></div><div><dt>1 cusec</dt><dd>1 ft³/s · instantaneous flow rate</dd></div><div><dt>1 TMC/day</dt><dd>≈ ${fmt(cusecsFromTmcPerDay(1),0)} cusecs if continuous · capacity conversion</dd></div><div><dt>MW versus energy</dt><dd>MW is power; MU is million kWh. Neither measures water delivered.</dd></div><div><dt>Live storage</dt><dd>Usable storage above the minimum drawdown level; not total reservoir capacity. Verified live-storage series unavailable here.</dd></div></dl></section>`+
    `<section class="evidence-section"><h4>Sources and evidence limits</h4><p>Checked 29 October 2026. Primary references are preferred. Some department PDFs are indexed but direct downloads may fail; retain the document title and page reference. Secondary reports are explicitly labeled and do not replace signed technical documents.</p><ul class="evidence-source-list">${Object.entries(EVIDENCE_SOURCES).map(([id,s])=>`<li>${source(id)}<p>${s.basis}</p></li>`).join('')}</ul></section>`;
}

export function initIrrigationEvidence({sites,getGauges,refresh,boundary,onSelectSite}){
  let topic='intake',district='siddipet',level=90,opener;
  const dialog=document.createElement('dialog');dialog.id='water-evidence';dialog.className='water-evidence';dialog.setAttribute('aria-labelledby','water-evidence-title');
  dialog.innerHTML=`<div class="evidence-header"><div><span class="project-eyebrow">TELANGANA / WATER ATLAS</span><h2 id="water-evidence-title">Water system explained</h2></div><button id="close-evidence" aria-label="Close water system explanation">Close ×</button></div><div class="evidence-shell"><nav class="evidence-nav" role="tablist" aria-label="Water system topics">${TOPICS.map(([id,label],i)=>`<button role="tab" id="evidence-tab-${id}" aria-controls="evidence-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-evidence-topic="${id}"><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${label}</button>`).join('')}</nav><section id="evidence-panel" role="tabpanel" tabindex="0"></section></div><div class="evidence-footer"><span>Design · dated observation · reported claim · missing data</span><button data-evidence-topic="numbers">Sources & definitions ↗</button></div>`;
  document.body.append(dialog);
  const panel=dialog.querySelector('#evidence-panel');
  const validTopic=id=>TOPICS.some(t=>t[0]===id);
  function persist(){const u=new URL(location.href);if(dialog.open){u.searchParams.set('explain',topic);if(topic==='command')u.searchParams.set('district',district);else u.searchParams.delete('district');}else {u.searchParams.delete('explain');u.searchParams.delete('district');}history.replaceState(null,'',u);}
  function updateScenario(){const s=intakeScenario(level);panel.querySelector('#intake-level-value').textContent=fmt(s.level,1)+' m';panel.querySelector('#intake-scenario-chart').innerHTML=scenarioMarkup(level);panel.querySelector('#intake-result').textContent=s.delta<0?`${fmt(Math.abs(s.delta),1)} m below the reported reference in this illustration.`:s.delta===0?'At the reported reference in this illustration.':`${fmt(s.delta,1)} m above the reported reference in this illustration. Safe operation is not established.`;}
  function render(){
    for(const b of dialog.querySelectorAll('[role=tab]')){const active=b.dataset.evidenceTopic===topic;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}
    panel.setAttribute('aria-labelledby','evidence-tab-'+topic);
    panel.innerHTML=({intake:()=>intakeMarkup(sites,level),chain:()=>chainMarkup(sites),hydrology:()=>hydrologyMarkup(getGauges(),boundary),basins:basinsMarkup,command:()=>commandMarkup(boundary,district),safety:safetyMarkup,numbers:numbersMarkup})[topic]();
    if(topic==='intake')updateScenario();panel.scrollTop=0;
  }
  function selectTopic(next){topic=validTopic(next)?next:'intake';render();persist();dialog.querySelector('[role=tab][aria-selected=true]').scrollIntoView({block:'nearest',inline:'nearest'});}
  function open(next='intake',button){opener=button||document.activeElement;topic=validTopic(next)?next:'intake';render();if(!dialog.open)dialog.showModal();persist();dialog.querySelector('#close-evidence').focus();}
  function close(){if(dialog.open)dialog.close();}
  dialog.querySelector('#close-evidence').onclick=close;
  dialog.addEventListener('close',()=>{persist();if(opener?.isConnected)opener.focus();});
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape')e.stopPropagation();});
  dialog.querySelector('[role=tablist]').addEventListener('keydown',e=>{
    const tabs=[...dialog.querySelectorAll('[role=tab]')],index=tabs.indexOf(e.target);if(index<0)return;
    const next={ArrowRight:(index+1)%tabs.length,ArrowDown:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,ArrowUp:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[e.key];
    if(next===undefined)return;e.preventDefault();selectTopic(tabs[next].dataset.evidenceTopic);tabs[next].focus();
  });
  dialog.addEventListener('input',e=>{if(e.target.id==='intake-level'){level=intakeScenario(e.target.value).level;updateScenario();}});
  dialog.addEventListener('click',async e=>{
    const topicButton=e.target.closest('[data-evidence-topic]');if(topicButton){selectTopic(topicButton.dataset.evidenceTopic);if(topicButton.getAttribute('role')!=='tab')panel.querySelector('h3')?.focus();return;}
    const d=e.target.closest('[data-evidence-district]');if(d){district=d.dataset.evidenceDistrict;const scroll=panel.scrollTop;render();persist();panel.querySelector(`[data-evidence-district="${district}"]`).focus({preventScroll:true});if(matchMedia('(max-width:700px)').matches)panel.querySelector('.district-detail').scrollIntoView({block:'start'});else panel.scrollTop=scroll;return;}
    const site=e.target.closest('[data-evidence-site]');if(site){close();onSelectSite(site.dataset.evidenceSite);return;}
    if(e.target.id==='evidence-refresh'){
      const button=e.target;button.disabled=true;button.textContent='Checking published JSON…';await refresh();
      if(topic==='hydrology'&&dialog.open){render();panel.querySelector('#evidence-refresh-status').textContent=document.getElementById('gauge-status').textContent;panel.querySelector('#evidence-refresh').focus();}
    }
  });
  const sidebar=document.querySelector('.project-controls');
  const entry=document.createElement('button');entry.id='explain-water';entry.className='explain-water';entry.innerHTML='Water system explained <span>Intakes, lifts, basins & evidence ↗</span>';entry.onclick=()=>open('intake',entry);sidebar.append(entry);
  const sync=()=>{const q=new URLSearchParams(location.search);const requested=q.get('explain');if(requested){district=COMMAND_DISTRICTS.some(d=>d.id===q.get('district'))?q.get('district'):'siddipet';if(!dialog.open)open(requested,entry);else selectTopic(requested);}else close();};
  window.addEventListener('popstate',sync);sync();
  return {open,openDistrict:(id,button)=>{district=COMMAND_DISTRICTS.some(d=>d.id===id)?id:'siddipet';open('command',button);},refresh:()=>{if(dialog.open&&topic==='hydrology')render();}};
}
