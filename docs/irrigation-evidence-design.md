# Irrigation evidence expansion

Analytical job: explain hydraulic constraints, trace a staged network, and locate intended command areas. Extend the existing atlas with one native dialog, seven URL-addressable topics, and a compact entry in the site inspector and sidebar. Existing Three.js terrain owns geography; dependency-free DOM/SVG owns explanatory figures. No new packages or live services.

| Layer | Encoding / reading path | Evidence and QA |
| --- | --- | --- |
| Intake inset | Two directly labeled SVG profiles: design barrage levels and an adjustable intake illustration; opposite river/lift directions | Never put the nearby gauge on a site-elevation axis. Missing bed, crest, gates and site water heights stay missing. Reference 93.5 m is unverified. Test slider changes, defaults and bounds. |
| Lift network | Ordered stage cards plus a sparse elevation plot; unknown heights are gaps | Design capacities and installed power are distinct from observed flow. Endpoint elevation difference is not total dynamic pump head. Test source arithmetic and node selection. |
| Hydrology | Gauge locator map and timestamped table; separate dated reported annual lift bars | No derived discharge, sea-flow estimate or sum of sequential pump volumes. Test refresh and offline retained observations. |
| Basins | Two labeled source networks, separate colors and text labels | Source basin does not necessarily equal the receiving command basin. No implied cross-basin transfer. |
| Command geography | Thirteen numbered district-town locators, selectable intended-acreage list, separate stabilization table | Official historical planning nomenclature; positions are approximate town locators, not ayacut polygons. Present status unknown. Dated link status separated from district status. Test district selection coordination. |
| Safety | Chronological dated events; reported proposals distinct from official restoration instructions | No inference of current operating clearance. Label secondary reporting and missing primary report. |
| Quantities | Two 240 TMC composition views with visible numeric labels and definitions | Allocation accounting reconciles the 3 TMC DPR gap. Test conservation. |

Primary specialist passes: D3/SVG for explanatory diagrams and geospatial/cartographic for locator geometry, performed locally (delegation not authorized). Neutral green context; purple project/design; blue water; amber dated/reported/constraint; gray missing. Text and patterns retain meaning without color.

One topic panel mounted at once; fewer than 250 marks; no animation, added WebGL or runtime fetches beyond the existing refresh. Wide figures have compact mobile arrangements or text/table equivalents; hit targets at least 44 px. Native dialog supplies focus containment, Escape, and focus restoration. Tab arrows/Home/End supported. URL `explain` retains the open topic and `district` retains command selection; existing parameters preserved. Invalid state normalizes to the intake topic. Back/forward synchronizes the dialog. No persistent storage required.

Validation flow: atlas -> site / sidebar explanation button -> topic -> slider, district selection, refresh -> Escape returns focus. Check build, unit data invariants, existing browser flows, new desktop/mobile/touch interaction flows, no overflow, visible labels, console health, and 2D fallback. Browser plugin absent; use installed Playwright/Chrome. Screenshots saved outside the repository.
