// Historical proposal, not an additional stage of the Medigadda lift chain.
export const TUMMIDIHATTI_SOURCES={
  location:'https://environmentclearance.nic.in/writereaddata/Online/TOR/27_Jul_2016_1614224038GMPSEB7BriefSummaryoftheproject.pdf',
  audit:'https://cag.gov.in/uploads/download_audit_report/2024/06_Chapter-III_Re-Engineering-of-PCSS-Project-065cdab56237fe3.51374325.pdf',
  state:'https://www.ecostat.telangana.gov.in/PDF/PUBLICATIONS/Socio_Economic_2019.pdf'
};
export const TUMMIDIHATTI={
  id:'tummidihatti',name:'Tummidihatti',type:'Earlier Pranahita–Chevella intake proposal',
  lat:19+35/60+45/3600,lon:79+47/60,historical:true,
  // The 2016 document locates the retained Pranahita proposal; the original
  // alignment changed. Do not present this point as a surveyed 2008 dam axis.
  locationNote:'Regional proposal locator from the Telangana-side coordinate in the 2016 pre-feasibility summary; not a surveyed original PCSS alignment.'
};
const ref=(key,label)=>`<a href="${TUMMIDIHATTI_SOURCES[key]}" target="_blank" rel="noreferrer">${label} ↗</a>`;
export function tummidihattiMarkup(){
  return `<div class="project-card-heading"><div><span class="project-eyebrow historical-eyebrow">PRANAHITA · GODAVARI BASIN</span><h2 id="project-card-title">Tummidihatti</h2><p>${TUMMIDIHATTI.type}</p></div><button id="close-project" aria-label="Close project details">×</button></div>
    <p class="historical-badge">Historical proposal · outside the KLIP lift sequence</p>
    <p class="site-description">The earlier Pranahita–Chevella concept used a Pranahita intake near the Wardha–Wainganga confluence. Re-engineering moved KLIP’s source downstream to Medigadda on the Godavari.</p>
    <div class="intake-choice" aria-label="Historical change of intake, not a water conveyance route"><strong>Tummidihatti</strong><span>↓ Intake choice changed · not a canal</span><button data-select-project="medigadda">Compare with Medigadda →</button></div>
    <section class="historical-evidence"><h3>Availability · estimates, not current flows</h3><dl class="project-specs"><div><dt>Earlier DPR estimate</dt><dd>236.53 TMC</dd></div><div><dt>CWC · March 2015</dt><dd>165.38 TMC</dd></div><div><dt>Included upstream perceived surpluses</dt><dd>63 TMC</dd></div><div><dt>After deducting those surpluses</dt><dd>~102 TMC</dd></div></dl><p>CAG records CWC’s warning that those upstream surpluses might not remain available. Compare dependability, period and deductions before comparing yields. ${ref('audit','CAG 2024 · table 3.3 & §3.3.3')}</p></section>
    <section class="historical-evidence"><h3>Stated reasons & audit findings</h3><p><strong>Government rationale:</strong> water availability, reservoir storage and Maharashtra submergence concerns; the proposed FRL was reduced from 152 to 148 m. ${ref('state','State Socio Economic Outlook 2019 · p.57')}</p><p><strong>CAG finding:</strong> no documented assessment of diversion at 148 m was supplied. The government said alternatives were evaluated; Audit found no supporting evidence. ${ref('audit','CAG 2024 · §3.3.3, p.30')}</p></section>
    <section class="historical-evidence"><h3>Prior works, lift & energy</h3><p>CAG attributes ₹767.78 crore of redundant prior works and an additional 48 m lift to Yellampalli to re-engineering. Its full-scheme annual energy comparison rises by 5,643.39 MU. ${ref('audit','CAG 2024 · pp.9, 22–23')}</p><p>That energy difference covers changed scheme scope and pumping assumptions, not just intake elevation. It is not measured annual electricity use.</p></section>
    <details><summary>Would an alternative have been more usable?</summary><p>CAG identified scope to examine reduced-FRL diversion and possible reductions in Medigadda pumping. That is an audit recommendation to evaluate an alternative, not a completed alternative design.</p><p>A fair comparison needs the same delivered-water target, dependable inflows, seasonal storage, interstate limits, pump efficiency, safety and full lifecycle cost. This atlas does not establish a cheaper or more usable winner.</p></details>
    <section class="project-flow"><span class="project-eyebrow">SITE OBSERVATIONS</span><strong>Unavailable <span aria-hidden="true">—</span></strong><p>No site gauge, discharge or present project-status feed is connected. Kaleswaram readings are not assigned to Tummidihatti.</p></section>
    <button class="explain-water" id="project-explain-water">Water system explained <span>Hydrology, availability & source comparisons ↗</span></button>
    <details><summary>Location & sources</summary><p>${TUMMIDIHATTI.lat.toFixed(5)}° N, ${TUMMIDIHATTI.lon.toFixed(5)}° E. ${TUMMIDIHATTI.locationNote}</p><p>The 2016 location document describes the retained 20 TMC Pranahita proposal, not the full earlier PCSS scheme. Its design figures must not be substituted for the original scheme’s figures.</p><p>${ref('location','EPTRI / environmental-clearance filing · 2016, p.1')}<br>${ref('state','Telangana government · stated re-engineering rationale')}<br>${ref('audit','CAG 2024 · chapter III')}</p><p>References checked 3 November 2026. Some official PDF downloads may be temporarily unavailable.</p></details>`;
}
