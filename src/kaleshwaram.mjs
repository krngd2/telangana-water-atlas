import {comparisonMarkup,designProfile,ageTimeline,conveyanceBreakdown,METRICS} from './project-visuals.mjs';
import {initIrrigationEvidence,COMMAND_DISTRICTS} from './irrigation-evidence.mjs';
import {TUMMIDIHATTI,tummidihattiMarkup} from './tummidihatti.mjs';
import {CONTEXT_SITES,shortCallout,calloutMarkup,contextMarkup} from './map-callouts.mjs';
// Coordinates: Telangana I&CAD brief project profile; specifications: CAG 2024, p.16.
export const PROJECT_SOURCES = {
  study: 'https://zenodo.org/records/8133534/files/ISB-Report-Kaleshwaram%20%28Latest%29.pdf?download=1',
  profile: 'https://irrigation.telangana.gov.in/uploadedFiles/circ988.pdf',
  links: 'https://irrigation.telangana.gov.in/img/projectspdf/kaleshwaram.pdf',
  audit: 'https://cag.gov.in/uploads/download_audit_report/2024/06_Chapter-III_Re-Engineering-of-PCSS-Project-065cdab56237fe3.51374325.pdf',
  status: 'https://www.telangana.gov.in/news/press-releases/2026/04/honble-cm-sri-a-revanth-reddy-inspects-medigadda-barrage-site-and-reviews-restoration-plans-for-the-damaged-kaleshwaram-lift-irrigation-project/',
  gauges: 'https://nwdp.nwic.gov.in/en/dataset/river-water-level-telemetry-hourly-central-water-commission-cwc'
};
export const PROJECT_SITES = [
  {id:'medigadda',name:'Medigadda',type:'Barrage · Godavari intake',lat:18+42/60+48/3600,lon:80+4/60+37/3600,storage:16.17,frl:100,length:1632,gates:85,designDischarge:80000,description:'Source barrage downstream of the Pranahita–Godavari confluence. The planned lift sequence carries water upstream to Annaram.'},
  {id:'annaram',name:'Annaram',type:'Barrage · intermediate lift',lat:18+44/60+41/3600,lon:79+49/60+2/3600,storage:10.87,frl:119,length:1270,gates:66,designDischarge:65000,description:'Intermediate barrage in Link I. Water is intended to be lifted onward toward Sundilla.'},
  {id:'sundilla',name:'Sundilla',type:'Barrage · upstream lift',lat:18+45/60+50/3600,lon:79+34/60+14/3600,storage:8.83,frl:130,length:1426,gates:74,designDischarge:57000,description:'Upstream barrage in Link I. The next planned lift delivers water to Sripada Yellampalli.'},
  {id:'yellampalli',name:'Sripada Yellampalli',type:'Reservoir · Link I / II connection',lat:18.84416667,lon:79.37277778,gauge:'Sripada Yellampalli Project',description:'Receives the Link I lift system. Link II conveys water toward Mid Manair, feeding Medaram tank along the way; further links distribute it across the project command.'}
];
export const COMMAND_SITES=COMMAND_DISTRICTS.map((d,i)=>({...d,id:'command-'+d.id,district:d.id,command:true,view:'command',basin:'Godavari',symbol:String(i+1),tone:'command',label:`${num(d.acres)} acres · intended`,alias:'Intended new ayacut · delivery unverified'}));
export const MAP_SITES=[...PROJECT_SITES,...CONTEXT_SITES,...COMMAND_SITES,TUMMIDIHATTI];
function num(n){return n.toLocaleString('en-GB');}
const date=t=>new Date(t).toLocaleString('en-GB',{timeZone:'Asia/Kolkata',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
export function projectObservation(site,gauges,now=Date.now()){
  if(site.historical||(!PROJECT_SITES.includes(site)&&!site.gauge))return {station:null,freshness:'No site observation available'};
  // An upstream river gauge cannot stand in for discharge at a barrage.
  const name=site.gauge||'Kaleswaram';
  const station=gauges?.sources.filter(s=>s.basin==='Godavari').flatMap(s=>s.stations).find(s=>s.name===name);
  if(!station)return {station:null,freshness:'No observation available'};
  const age=(now-Date.parse(station.observedAt))/36e5;
  return {station,freshness:!Number.isFinite(age)?'Invalid observation time':age<0?'Future timestamp · unverified':age<=24?'Within 24 hours · unverified':`Stale · ${Math.floor(age/24)} days old`};
}
export function initKaleshwaram({project,getGauges,refresh,boundary}){
  const overlay=document.getElementById('project-overlay'),card=document.getElementById('project-card'),toggle=document.getElementById('projects');
  let selected=null,pinned=false,timer,opener,lastProjection,suppressFocus=false,evidence;
  const query=new URLSearchParams(location.search);let metric=METRICS[query.get('compare')]?query.get('compare'):'storage';
  let view=['network','command'].includes(query.get('mapview'))?query.get('mapview'):'intakes';
  const inspector=document.createElement('section');inspector.className='project-inspector';inspector.setAttribute('aria-label','Kaleshwaram project inspector');
  const empty=document.createElement('div');empty.className='inspector-empty';empty.innerHTML='<span class="project-eyebrow">KALESHWARAM</span><h2>Follow water uphill.</h2><p>Three barrages. One upstream reservoir. Select a numbered stage to inspect it, or the amber Tummidihatti marker for the earlier intake proposal.</p><button id="inspect-project">Explore the project</button>';inspector.append(empty,card);document.querySelector('.workspace').append(inspector);
  const dock=document.createElement('section');dock.id='project-dock';dock.className='project-dock';dock.setAttribute('aria-label','Kaleshwaram lift sequence');
  dock.innerHTML=`<div class="dock-heading"><h3>Kaleshwaram lift sequence</h3><span>Schematic · not to scale</span></div><div class="project-stages">${PROJECT_SITES.map((s,i)=>`<button data-select-project="${s.id}" aria-pressed="false"><span class="stage-number">${i+1}</span><span>${s.name.replace('Sripada ','')}<small>${s.storage?'Barrage':'Reservoir'}</small></span></button>`).join('')}</div><div id="design-profile"></div><p class="chart-note dock-note">Design levels ≠ current water heights or pump lift. Yellampalli level unspecified. · <a href="${PROJECT_SOURCES.audit}" target="_blank" rel="noreferrer">CAG 2024, p.16 ↗</a></p>`;
  document.querySelector('.map-shell').append(dock);
  const summary=document.createElement('div');summary.className='project-view-summary';summary.hidden=true;dock.append(summary);
  const persist=()=>{const url=new URL(location.href);selected?url.searchParams.set('project',selected.id):url.searchParams.delete('project');url.searchParams.set('compare',metric);if(view==='intakes')url.searchParams.delete('mapview');else url.searchParams.set('mapview',view);history.replaceState(null,'',url);};
  function coordinateSelection(){for(const b of dock.querySelectorAll('[data-select-project]'))b.setAttribute('aria-pressed',String(b.dataset.selectProject===selected?.id));document.getElementById('design-profile').innerHTML=designProfile(PROJECT_SITES,selected?.id)+designProfile(PROJECT_SITES,selected?.id,true);}
  function choose(site,button){
    toggle.checked=true;
    if(site.command){view='command';viewSelect.value=view;update();persist();evidence.openDistrict(site.district,button);return;}
    if(!inView(site)){view=site.view||'intakes';viewSelect.value=view;}
    pinned=true;update();open(site,button);
  }
  dock.addEventListener('click',e=>{const b=e.target.closest('[data-select-project]');if(b)choose(PROJECT_SITES.find(s=>s.id===b.dataset.selectProject),b);const info=e.target.closest('[data-explanation]');if(info)evidence.open(info.dataset.explanation,info);});
  empty.querySelector('button').onclick=e=>choose(PROJECT_SITES[0],e.currentTarget);
  card.addEventListener('click',e=>{const b=e.target.closest('[data-select-project]');if(b)choose(MAP_SITES.find(s=>s.id===b.dataset.selectProject),buttons.find(x=>x.dataset.project===b.dataset.selectProject));});
  card.addEventListener('change',e=>{if(e.target.id==='compare-metric'){metric=e.target.value;persist();const panel=card.querySelector('.barrage-comparison');panel.outerHTML=comparisonMarkup(PROJECT_SITES,selected.id,metric);card.querySelector('#compare-metric').focus();}});
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('project-network');svg.setAttribute('aria-hidden','true');overlay.append(svg);
  const buttons=MAP_SITES.map((site,index)=>{
    const c=shortCallout(site),button=document.createElement('button');button.className='project-marker'+(site.historical?' historical-marker':'')+(c.label?' annotated-marker tone-'+c.tone:'');button.dataset.project=site.id;button.setAttribute('aria-label',site.historical?`${site.name}: earlier Pranahita–Chevella intake proposal`:site.command?`${site.name}: intended command area`:`${site.basin||'Godavari'} project: ${site.name}`);button.setAttribute('aria-controls',site.command?'water-evidence':'project-card');button.setAttribute('aria-expanded','false');button.innerHTML=`<span aria-hidden="true">${site.historical?'P':site.symbol||index+1}</span><b>${site.name.replace('Sripada ','')}</b>${site.historical?'<small>Earlier proposal</small>':c.label?`<small>${c.label}</small>`:''}`;
    button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!pinned&&!site.command)open(site,button);});
    button.addEventListener('focus',()=>{if(!pinned&&!suppressFocus&&!site.command)open(site,button);});
    button.addEventListener('pointerleave',scheduleClose);button.addEventListener('blur',scheduleClose);
    button.addEventListener('click',()=>choose(site,button));overlay.append(button);return button;
  });
  const select=document.getElementById('project-site');
  for(const site of MAP_SITES.filter(s=>!s.command)){const option=document.createElement('option');option.value=site.id;option.textContent=site.name+(site.historical?' · earlier proposal':site.basin?' · '+site.basin:'');select.append(option);}
  const viewLabel=document.createElement('label');viewLabel.className='small-label';viewLabel.htmlFor='project-view';viewLabel.textContent='Project map focus';
  const viewSelect=document.createElement('select');viewSelect.id='project-view';viewSelect.innerHTML='<option value="intakes">Intakes & barrage constraints</option><option value="network">Wider reservoir / basin network</option><option value="command">13 intended-command districts</option>';viewSelect.value=view;
  document.querySelector('.project-controls').prepend(viewLabel,viewSelect);
  const key=document.createElement('p');key.className='map-evidence-key';key.innerHTML='<span class="tone-constrained">Orange: dated storage constraint</span><span class="tone-storage">Green: separate Godavari storage / source</span><span class="tone-krishna">Blue: Krishna source system</span><span>Colours do not certify current operation.</span>';document.querySelector('.project-controls').append(key);
  const viewNote=document.createElement('p');viewNote.className='project-view-note';viewNote.setAttribute('role','status');viewSelect.after(viewNote);
  viewSelect.onchange=()=>{view=viewSelect.value;if(selected&&!inView(selected))close();toggle.checked=true;update();persist();};
  function inView(s){return s.command?view==='command':s.view==='network'?view==='network':view==='intakes'||(view==='network'&&s.id==='yellampalli');}
  function close(restore=false){clearTimeout(timer);card.hidden=true;pinned=false;selected=null;buttons.forEach(b=>b.setAttribute('aria-expanded','false'));coordinateSelection();persist();if(restore){suppressFocus=true;opener?.focus();suppressFocus=false;}}
  function scheduleClose(){if(matchMedia('(min-width:1101px)').matches)return;clearTimeout(timer);timer=setTimeout(()=>{if(!pinned&&!card.matches(':hover')&&!card.contains(document.activeElement)&&!buttons.some(b=>b.matches(':hover')||b===document.activeElement))close();},350);}
  function open(site,button){clearTimeout(timer);selected=site;opener=button;card.hidden=false;positionCard(button);buttons.forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.project===site.id)));render();coordinateSelection();persist();}
  function positionCard(){card.style.top='';card.style.maxHeight='';}
  function render(){if(!selected)return;const s=selected,{station,freshness}=projectObservation(s,getGauges());
    if(s.historical){
      card.innerHTML=tummidihattiMarkup();
      document.getElementById('close-project').onclick=()=>close(true);
      document.getElementById('project-explain-water').onclick=e=>evidence.open('hydrology',e.currentTarget);
      return;
    }
    if(CONTEXT_SITES.includes(s)){
      card.innerHTML=contextMarkup(s);
      document.getElementById('close-project').onclick=()=>close(true);
      document.getElementById('project-explain-water').onclick=e=>evidence.open(s.topic,e.currentTarget);
      return;
    }
    card.innerHTML=`<div class="project-card-heading"><div><span class="project-eyebrow">KALESHWARAM · GODAVARI BASIN</span><h2 id="project-card-title">${s.name}</h2><p>${s.type}</p></div><button id="close-project" aria-label="Close project details">×</button></div>
    ${calloutMarkup(s)}<button class="site-info" data-open-intake aria-label="Explain water levels at ${s.name}">ⓘ Why flow does not guarantee pumping</button>
    ${comparisonMarkup(PROJECT_SITES,s.id,metric)}${s.gauge?'<p class="chart-note">Comparison shows the three barrages; Yellampalli reservoir specifications are not available in this source.</p>':''}<p class="site-description">${s.description}</p>
    <section class="project-observation"><h3>${s.gauge?'Site water-level observation':'Nearby river observation · Kaleswaram'}</h3>${station?`<strong>${station.level.toFixed(3)} m <span class="observation-age">${freshness}</span></strong><p>Observed ${date(station.observedAt)} IST</p><p>${s.gauge?'Provider water level; vertical datum unverified.':'Upstream CWC river gauge, not a measurement at this barrage.'} Water level is not discharge.</p>${ageTimeline(station.observedAt)}`:'<p>No matching CWC water-level reading available.</p>'}<button id="project-refresh">Reload published readings</button><p id="project-refresh-status" role="status"></p></section>
    <button class="explain-water" id="project-explain-water">Water system explained <span>Why flowing water may not be pumpable ↗</span></button>
    ${s.id==='medigadda'?'<button class="earlier-intake-link" data-select-project="tummidihatti">Earlier intake: Tummidihatti →</button>':''}
    <section class="project-flow"><span class="project-eyebrow">CURRENT WATER FLOW</span><strong>Unavailable <span aria-hidden="true">—</span></strong><p>No verified discharge, inflow, outflow or pump-flow feed is connected for this site.</p></section>
    ${s.storage?`<h3>Barrage specifications · CAG 2024</h3><dl class="project-specs"><div><dt>Storage capacity</dt><dd>${s.storage} TMC</dd></div><div><dt>Full reservoir level</dt><dd>${s.frl} m</dd></div><div><dt>Barrage length</dt><dd>${num(s.length)} m</dd></div><div><dt>Gates</dt><dd>${s.gates}</dd></div><div><dt>Design flood discharge</dt><dd>${num(s.designDischarge)} m³/s</dd></div></dl><p class="project-caveat">Design capacity is not current flow. TMC = billion cubic feet. Historic design storage does not indicate present usable storage.</p>`:''}
    <details><summary>Project overview & design targets</summary><p>Multi-stage lift irrigation on the Godavari, operated by Telangana I&CAD. Water is pumped against the natural river gradient.</p><dl class="project-specs"><div><dt>Planned diversion</dt><dd>180 TMC</dd></div><div><dt>New command area</dt><dd>18.25 lakh acres</dd></div><div><dt>Distribution links</dt><dd>7</dd></div><div><dt>Conveyor system</dt><dd>1,832 km</dd></div><div><dt>Power requirement</dt><dd>4,627 MW</dd></div><div><dt>Profile project cost</dt><dd>₹80,499.71 crore</dd></div></dl><p>These are the I&CAD brief profile’s planning figures, not current expenditure, achieved irrigation or operating capacity. Its historical storage figures differ from the CAG 2024 values used above.</p>${conveyanceBreakdown()}<p>Link I: Medigadda → Annaram → Sundilla → Yellampalli. Link II: Yellampalli → Medaram → Mid Manair, with onward distribution through other links. The map shows the verified Link I sites; connecting lines are schematic, not surveyed canals or pipelines.</p></details>
    <details><summary>All seven distribution links</summary><ol class="project-links"><li><strong>Link I</strong><div><span class="link-stations"><span>Medigadda</span><span class="link-direction" aria-label="to">→</span><span>Yellampalli</span></span><small>Via Annaram and Sundilla</small></div></li><li><strong>Link II</strong><div><span class="link-stations"><span>Yellampalli</span><span class="link-direction" aria-label="to">→</span><span>Mid Manair</span></span><small>Via Medaram · packages 6–8</small></div></li><li><strong>Link III</strong><div><span class="link-stations"><span>Mid Manair</span><span class="link-direction" aria-label="to">→</span><span>Upper Manair</span></span><small>Package 9</small></div></li><li><strong>Link IV</strong><div><span class="link-stations"><span>Mid Manair</span><span class="link-direction" aria-label="to">→</span><span>Kondapochamma</span></span><small>Via Mallanna Sagar · packages 10–14</small></div></li><li><strong>Link V</strong><div><span class="link-stations"><span>Mallanna Sagar</span><span class="link-direction" aria-label="to">→</span><span>Chityala area</span></span><small>Packages 15–16</small></div></li><li><strong>Link VI</strong><div><span class="link-stations"><span>Mallanna Sagar</span><span class="link-direction" aria-label="to">→</span><span>Singur</span></span><small>Packages 17–19</small></div></li><li><strong>Link VII</strong><div><span class="link-stations"><span>SRSP foreshore</span><span class="link-direction" aria-label="to">→</span><span>Nizam Sagar & other command areas</span></span><small>Separate branch · packages 20–22, 27–28</small></div></li></ol><p>Planning network from the ISB study’s table 3, citing I&amp;CAD 2022. Only Link I sites are mapped here; these descriptions do not confirm present operating status.</p><a href="${PROJECT_SOURCES.study}" target="_blank" rel="noreferrer">ISB study · seven-link network ↗</a></details>
    <details><summary>Restoration context · dated source</summary><p>The Telangana government reported restoration investigations and review of Medigadda, Annaram and Sundilla on 20 April 2026, with works subject to technical findings and NDSA guidelines. This is a dated update, not live operating status.</p><a href="${PROJECT_SOURCES.status}" target="_blank" rel="noreferrer">Government restoration update ↗</a></details>
    <details><summary>Location & sources</summary><p>${s.lat.toFixed(5)}° N, ${s.lon.toFixed(5)}° E. ${s.gauge?'Location from CWC station metadata.':'Location from the I&CAD project profile.'}</p><p><a href="${PROJECT_SOURCES.audit}" target="_blank" rel="noreferrer">CAG 2024 · chapter III, p.16 ↗</a><br><a href="${PROJECT_SOURCES.profile}" target="_blank" rel="noreferrer">I&CAD brief project profile ↗</a><br><a href="${PROJECT_SOURCES.links}" target="_blank" rel="noreferrer">I&CAD link descriptions ↗</a><br><a href="${PROJECT_SOURCES.gauges}" target="_blank" rel="noreferrer">CWC / NWIC observations ↗</a></p><p>Project references checked 29 October 2026. Some department PDF URLs may be temporarily unavailable.</p></details>`;
    document.getElementById('close-project').onclick=()=>{close(true);};
    document.getElementById('project-explain-water').onclick=e=>evidence.open('intake',e.currentTarget);
    card.querySelector('[data-open-intake]').onclick=e=>evidence.open('intake',e.currentTarget);
    document.getElementById('project-refresh').onclick=async e=>{const b=e.currentTarget;b.disabled=true;await refresh();if(selected){render();document.getElementById('project-refresh-status').textContent=document.getElementById('gauge-status').textContent;}};
  }
  card.addEventListener('pointerenter',()=>clearTimeout(timer));card.addEventListener('pointerleave',scheduleClose);card.addEventListener('focusout',scheduleClose);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('water-evidence')?.open&&!card.hidden){e.preventDefault();close(true);}});
  select.onchange=()=>{const site=MAP_SITES.find(s=>s.id===select.value);if(site)choose(site,select);select.value='';};
  toggle.onchange=()=>{if(!toggle.checked)close();dock.hidden=!toggle.checked;inspector.hidden=!toggle.checked;document.querySelector('.workspace').classList.toggle('projects-hidden',!toggle.checked);update();};
  function update(){overlay.hidden=!toggle.checked;dock.hidden=!toggle.checked;inspector.hidden=!toggle.checked;document.querySelector('.workspace').classList.toggle('projects-hidden',!toggle.checked);document.querySelector('.map-shell').dataset.projectView=view;
    viewNote.innerHTML=view==='command'?'Intended new ayacut, not delivered irrigation. CAG reports 40,888 acres created by March 2022 against 18.26 lakh acres planned; chapter V also prints 40,288. <a href="https://cag.gov.in/webroot/uploads/download_audit_report/2024/03_Executive-Summary-065cdab561be1e6.64616893.pdf" target="_blank" rel="noreferrer">CAG 2024 ↗</a>':view==='network'?'Green and blue identify separate sources / reservoirs. No current operational clearance is inferred. Shared-source points are regional locators.':'Flowing water does not establish intake depth or safe storage. Notes show dated reports; gate status is not live.';
    dock.querySelector('.dock-heading>span').textContent={intakes:'Schematic · not to scale',network:'Source systems · operation unverified',command:'District targets · delivery unverified'}[view];
    if(dock.dataset.view!==view){
      dock.dataset.view=view;dock.querySelector('h3').textContent={intakes:'Kaleshwaram lift sequence',network:'Basin sources & connections',command:'Intended command districts'}[view];
      dock.querySelector('.project-stages').hidden=view!=='intakes';document.getElementById('design-profile').hidden=view!=='intakes';summary.hidden=view==='intakes';dock.querySelector('.dock-note').hidden=view!=='intakes';
      if(view==='network')summary.innerHTML='<div><strong>Godavari sources</strong><p>KLIP · Sita Rama · Devadula · SRSP</p></div><div><strong>Krishna sources</strong><p>Srisailam lifts · Jurala lifts · Nagarjuna Sagar</p></div><p class="chart-note">Largely separate systems. Water is not freely transferable between basins. Green does not mean verified operational.</p><button data-explanation="basins">Inspect basin connections →</button>';
      if(view==='command')summary.innerHTML='<strong>13 districts · 18.26 lakh acres intended new command</strong><p>CAG: 40,888 acres created by March 2022; chapter V also prints 40,288. Construction is not proof of delivered irrigation.</p><p class="chart-note">District markers show planning targets, not irrigated polygons or current service status.</p><button data-explanation="command">Inspect district targets & dated evidence →</button>';
    }
    if(!toggle.checked)return;const positions=MAP_SITES.map(s=>{const p=project(s.lon,s.lat);return {...p,visible:p.visible&&inView(s)};});const w=overlay.clientWidth,h=overlay.clientHeight;
    const projection=JSON.stringify([w,h,...positions.map(p=>[Math.round(p.x*10),Math.round(p.y*10),p.visible])]);if(projection===lastProjection)return;lastProjection=projection;if(selected)positionCard(opener);
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.replaceChildren();const defs=document.createElementNS(svg.namespaceURI,'defs');defs.innerHTML='<marker id="kalesh-lift-arrow" viewBox="0 0 10 10" refX="17" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L8 5 L1 9" fill="none" stroke="#77589b" stroke-width="1.5"/></marker>';svg.append(defs);
    function line(a,b,leader=false){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',`M${a.x} ${a.y} L${b.x} ${b.y}`);path.setAttribute('class',leader?'project-leader':'project-link');if(!leader)path.setAttribute('marker-end','url(#kalesh-lift-arrow)');svg.append(path);}
    for(let i=0;i<PROJECT_SITES.length-1;i++){if(positions[i].visible&&positions[i+1].visible)line(positions[i],positions[i+1]);}
    const occupied=[];
    buttons.forEach((b,i)=>b.hidden=!positions[i].visible);
    const visible=positions.map((p,i)=>({p,i,desired:p.y+([30,-30,65,-65][i]??28)})).filter(item=>item.p.visible).sort((a,b)=>a.desired-b.desired);
    visible.forEach(({p,i,desired},rank)=>{
      const button=buttons[i];button.hidden=!p.visible;if(!p.visible)return;
      const half=button.offsetWidth/2+3,height=button.offsetHeight;
      let x=Math.max(half+5,Math.min(w-half-5,p.x));
      const minY=115,maxY=Math.max(minY,h-90),base=Math.max(minY,Math.min(maxY,desired));
      let y=base,best=Infinity;
      const originX=x;
      if(w<480){
        // A numbered annotation grid preserves touch targets; leader lines keep
        // exact projected anchors visible when nearby sites cannot fit inline.
        const rows=Math.ceil(visible.length/2),step=Math.min(80,(h-270)/Math.max(1,rows-1));
        x=w*(rank%2===0?.25:.75);y=170+Math.floor(rank/2)*step;
      }else for(const dy of [0,64,-64,128,-128,192,-192,256,-256,320,-320,384,-384,448,-448,512,-512,576,-576])for(const dx of [0,48,-48,96,-96,144,-144,192,-192,240,-240,288,-288]){
        const cy=base+dy,cx=originX+dx,score=Math.abs(dy)+Math.abs(dx)*1.2;
        if(cy<minY||cy>maxY||cx<half+5||cx>w-half-5||score>=best)continue;
        if(!occupied.some(b=>Math.abs(cx-b.x)<half+b.half&&Math.abs(cy-b.y)<(height+b.height)/2+6)){x=cx;y=cy;best=score;}
      }
      occupied.push({x,y,half,height});button.style.left=`${x}px`;button.style.top=`${y}px`;
      const tone=shortCallout(MAP_SITES[i]).tone;line(p,{x,y},true);if(tone)svg.lastChild.classList.add('tone-'+tone);if(MAP_SITES[i].historical)svg.lastChild.classList.add('historical-leader');const dot=document.createElementNS(svg.namespaceURI,'circle');dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('r',4);if(tone)dot.classList.add('tone-'+tone);if(MAP_SITES[i].historical)dot.classList.add('historical-point');svg.append(dot);
    });
  }
  dock.querySelector('.dock-note').innerHTML='Design endpoints 100 → 618 m: 518 m elevation gain, not total pump head. Upper lifts can also draw on Yellampalli inflows. <a href="'+PROJECT_SOURCES.audit+'" target="_blank" rel="noreferrer">Design source ↗</a>';
  coordinateSelection();const initial=MAP_SITES.find(s=>s.id===query.get('project')&&!s.command)||(view==='intakes'?PROJECT_SITES[0]:null);if(initial){if(!inView(initial)){view=initial.view||'intakes';viewSelect.value=view;}open(initial,buttons.find(b=>b.dataset.project===initial.id));}
  evidence=initIrrigationEvidence({sites:PROJECT_SITES,getGauges,refresh,boundary,onSelectSite:id=>choose(MAP_SITES.find(s=>s.id===id),select)});
  document.fonts?.ready.then(()=>{lastProjection=null;update();});
  return {update,refresh:()=>{render();coordinateSelection();evidence.refresh();}};
}
