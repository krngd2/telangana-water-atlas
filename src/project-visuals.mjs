// Small, independent DOM/SVG views. Purple = project/selection, amber = stale,
// teal = recent. Design, observed and missing values never share a numeric scale.
export const METRICS={storage:{label:'Storage',title:'Design storage capacity',unit:'TMC',max:20},gates:{label:'Gates',title:'Number of barrage gates',unit:'gates',max:100},length:{label:'Length',title:'Barrage length',unit:'m',max:2000},designDischarge:{label:'Design flood',title:'Design flood discharge',unit:'m³/s',max:100000}};
const fmt=n=>n.toLocaleString('en-GB',{maximumFractionDigits:2});
export function comparisonMarkup(sites,selected,metric='storage'){
  const m=METRICS[metric]||METRICS.storage;
  return `<section class="barrage-comparison" aria-label="Barrage comparison"><div class="chart-heading"><h3>${m.title}</h3><label><span class="sr-only">Compare barrage metric</span><select id="compare-metric">${Object.entries(METRICS).map(([key,v])=>`<option value="${key}" ${key===metric?'selected':''}>${v.label}</option>`).join('')}</select></label></div><div class="comparison-rows">${sites.filter(s=>Number.isFinite(s[metric])).map((s,i)=>`<button class="comparison-row ${s.id===selected?'is-selected':''}" data-select-project="${s.id}" aria-pressed="${s.id===selected}" aria-label="${s.name}: ${fmt(s[metric])} ${m.unit}"><span class="comparison-label">${s.name}</span><span class="comparison-track" aria-hidden="true"><span style="width:${s[metric]/m.max*100}%"></span></span><strong>${fmt(s[metric])}<small>${m.unit}</small></strong></button>`).join('')}</div><div class="comparison-axis" aria-hidden="true"><span>0</span><span>${fmt(m.max/2)}</span><span>${fmt(m.max)} ${m.unit}</span></div><p class="chart-note">CAG 2024 · Design specifications, not present operation.</p></section>`;
}
export function ageGeometry(observedAt,now=Date.now()){
  const observed=Date.parse(observedAt),valid=Number.isFinite(observed)&&Number.isFinite(now);
  const start=valid?Math.min(observed,now)-7*864e5:now-365*864e5;
  const end=valid?Math.max(observed,now)+7*864e5:now;
  const span=Math.max(end-start,1);
  return {valid,ageDays:valid?Math.floor((now-observed)/864e5):null,start,end,observed:valid?(observed-start)/span:null,now:(now-start)/span};
}
export function ageTimeline(observedAt,now=Date.now()){
  const g=ageGeometry(observedAt,now);if(!g.valid)return '<p class="chart-note">Observation time unavailable.</p>';
  const stamp=t=>new Date(t).toLocaleDateString('en-GB',{timeZone:'Asia/Kolkata',day:'2-digit',month:'short',year:'numeric'});
  const x=t=>16+t*268,future=Date.parse(observedAt)>now;
  const firstLabel=future?'Today':'Observed',lastLabel=future?'Observed · future':'Today';
  const firstDate=stamp(Math.min(Date.parse(observedAt),now)),lastDate=stamp(Math.max(Date.parse(observedAt),now));
  return `<div class="age-timeline"><div class="timeline-labels"><span>${firstLabel}<br><strong>${firstDate}</strong></span><span>${lastLabel}<br><strong>${lastDate}</strong></span></div><svg viewBox="0 0 300 34" role="img" aria-label="Observation age: ${g.ageDays<0?'future timestamp':g.ageDays+' days old'}. Observation date ${stamp(Date.parse(observedAt))}; today ${stamp(now)}."><line x1="16" x2="284" y1="16" y2="16" stroke="#d9ddd5" stroke-width="2"/><line x1="${x(Math.min(g.observed,g.now))}" x2="${x(Math.max(g.observed,g.now))}" y1="16" y2="16" stroke="#b3a2c4" stroke-width="2" stroke-dasharray="3 4"/><circle cx="${x(g.observed)}" cy="16" r="5" fill="#77589b"/><circle cx="${x(g.now)}" cy="16" r="5" fill="#fffef9" stroke="#294e41" stroke-width="2"/></svg><span class="chart-note">${g.ageDays<0?'Future timestamp — check provider clock':g.ageDays===0?'Less than 24 hours since observation':g.ageDays+' days between observation and today'} · no trend inferred</span></div>`;
}
export function designProfile(sites,selected,compact=false){
  const barrages=sites.filter(s=>Number.isFinite(s.frl));
  return `<svg class="design-profile ${compact?'profile-compact':'profile-wide'}" viewBox="0 0 ${compact?340:600} 120" role="img" aria-label="Design full reservoir levels: ${barrages.map(s=>s.name+' '+s.frl+' metres').join(', ')}. Not current water heights or pump lift. Yellampalli design level not specified in this source."><text x="10" y="15" class="profile-note">Design full-reservoir levels · metres</text>${[100,120,140].map(v=>`<line x1="43" x2="${compact?325:426}" y1="${88-(v-90)*1.1}" y2="${88-(v-90)*1.1}" class="profile-grid"/><text x="9" y="${92-(v-90)*1.1}" class="profile-tick">${v}</text>`).join('')}${barrages.map((s,i)=>{const x=(compact?65:90)+i*(compact?100:140),y=88-(s.frl-90)*1.1;return `<g class="${selected===s.id?'profile-selected':''}"><line x1="${x}" x2="${x}" y1="88" y2="${y}" class="profile-stem"/><circle cx="${x}" cy="${y}" r="5" class="profile-point"/><text x="${x}" y="${y-12}" text-anchor="middle" class="profile-value">${s.frl} m</text><text x="${x}" y="110" text-anchor="middle" class="profile-name">${s.name}</text></g>`;}).join('')}${compact?'':`<line x1="450" x2="450" y1="26" y2="110" class="profile-grid"/><circle cx="505" cy="53" r="5" fill="none" stroke="#aab4a4" stroke-width="2"/><text x="515" y="57" class="profile-note">Not specified</text><text x="510" y="110" text-anchor="middle" class="profile-name">Yellampalli</text>`}</svg>`;
}
export function renderGaugeFreshness(gauges){
  const root=document.getElementById('gauge-freshness');if(!root)return;
  const stations=gauges?.sources.flatMap(s=>s.stations)||[],now=Date.now();
  root.replaceChildren();
  const intro=document.createElement('div');intro.className='freshness-intro';
  const recent=stations.filter(s=>{const a=now-Date.parse(s.observedAt);return a>=0&&a<=864e5;}).length;
  intro.innerHTML=`<h3>How recent are these readings?</h3><strong>${recent}<span> / ${stations.length} within 24 hours</span></strong><p>Position shows observation age. Levels have different station datums and are not ranked against one another.</p>`;root.append(intro);
  const list=document.createElement('div');list.className='freshness-stations';
  const max=365,barLabel=document.createElement('div');barLabel.className='freshness-scale';barLabel.innerHTML='<span>Today</span><span>6 months</span><span>1 year+</span>';list.append(barLabel);
  for(const s of stations){
    const g=ageGeometry(s.observedAt,now),recent=g.valid&&g.ageDays>=0&&(now-Date.parse(s.observedAt))<=864e5;
    const row=document.createElement('div');row.className='freshness-row';
    const name=document.createElement('span');name.className='freshness-name';name.textContent=s.name.replace('Sripada Yellampalli Project','Yellampalli').replace('Sriram Sagar Reservoir','Sriram Sagar');
    const track=document.createElement('span');track.className='freshness-track';track.setAttribute('aria-hidden','true');const point=document.createElement('i');point.className=recent?'recent':'dated';point.style.left=`${g.valid?Math.max(0,Math.min(1,g.ageDays/max))*100:0}%`;track.append(point);
    const label=document.createElement('span');label.className=recent?'freshness-value fresh':'freshness-value stale';label.textContent=!g.valid?'Invalid date':g.ageDays<0?'Future date':recent?'Within 24h':`${g.ageDays}d old`;
    row.append(name,track,label);list.append(row);
  }root.append(list);
}
export function storageComposition(stored,excess){
  const total=stored+excess,share=total>0?stored/total:0;
  return `<div class="storage-composition" role="img" aria-label="Added water: ${fmt(stored/1e6)} million cubic metres stored; ${fmt(excess/1e6)} million cubic metres excess. Total ${fmt(total/1e6)} million cubic metres."><div class="storage-balance-track"><span style="width:${share*100}%"></span></div><div class="storage-balance-labels"><span><i></i>${fmt(stored/1e6)} Mm³ stored</span><span><i></i>${fmt(excess/1e6)} Mm³ excess</span></div></div>`;
}
export function conveyanceBreakdown(){
  const parts=[{name:'Canals',km:1531,color:'#65917b'},{name:'Tunnels',km:203,color:'#77589b'},{name:'Pumping mains',km:98,color:'#b49e78'}],total=parts.reduce((n,p)=>n+p.km,0);
  return `<section class="conveyance-chart" aria-label="Planned conveyor system: ${fmt(total)} kilometres"><h3>How the planned ${fmt(total)} km is built</h3><div class="conveyance-track" aria-hidden="true">${parts.map(p=>`<span style="width:${p.km/total*100}%;background:${p.color}"></span>`).join('')}</div><div class="conveyance-key">${parts.map(p=>`<div><span><i style="background:${p.color}"></i>${p.name}</span><strong>${fmt(p.km)} km</strong></div>`).join('')}</div><p class="chart-note">I&CAD brief profile · planning lengths, not surveyed operating infrastructure.</p></section>`;
}
