# Data, methods & reproducibility

[Back to the atlas README](../README.md) · [Data licences](../DATA_LICENSES.md)

## Static deployment

```sh
npm ci
npm run build
npm run preview
```

Publish the complete **`dist/`** folder to an HTTP(S) static host. `npm run preview` is only a local preview. The build verifies every terrain tile, its metadata, the gauge JSON, and local fonts before packaging. The complete 20-geocell terrain pyramid contains **6,820 files of elevation samples** across levels 0–4, retaining native ~30 m coverage. The larger static dataset loads incrementally; visitors do not download every terrain tile on startup. Keep all files when uploading the site.

The default build assumes deployment at the site root. For a subdirectory, build with `npm run build -- --base=/atlas/`; data and font URLs follow Vite’s base. Font files and their OFL licences are in `public/fonts/`. Source-document links remain external, opened only when clicked. Static hosting still serves files over HTTP(S); an installable offline/PWA cache is not included.

### Publish newer gauge readings

```sh
npm run data:gauges
npm run build
```

Republish `dist/`. The preparation script queries the official sources once, validates the observations, and atomically writes `public/data/gauges-snapshot.json`. Total provider failure leaves the previous file intact; partial failures retain that basin’s previous observations with a retained-source timestamp. This can also be run by your publishing/CI workflow, but no recurring job is created by this project.

**Reload published readings** checks the hosted JSON for a newer published snapshot. It does not query CWC and cannot make an old observation current. Optional 15-minute checks reload the same file while the page is visible. Failed or invalid reloads preserve the last valid readings. Configure the host to revalidate `data/gauges-snapshot.json` (for example, `Cache-Control: no-cache`); terrain files may use a longer cache lifetime. Observation timestamps determine freshness.

### Rebuild static terrain

```sh
npm run data:terrain
npm run build
```

This preparation step needs internet access and caches original public Copernicus GeoTIFFs under ignored `.cache/copernicus/`. It resumes from completed tiles, generates every level through native detail, and publishes the terrain manifest only after processing. `node scripts/cache_terrain.mjs --overview` is a preparation/debug option; an overview-only dataset cannot pass the production build guard.

### Verify static operation

```sh
npm test
npm run test:static
```

`test:static` serves `dist/` through a basic file server, blocks external requests and `/api/` calls, and checks desktop/mobile native-detail terrain, JSON reloads, and retention after malformed JSON. With the local preview running, `npm run test:ui` and `npm run test:terrain` cover the existing controls and terrain interactions.

## Explore

- Drag with the mouse or swipe with one finger to pan. Use the **3D rotation** and **View tilt** sliders, or drag with two fingers on a touchscreen, to rotate around the current panned view; pinch or scroll to zoom. The header sits inside the left panel, and the explorer fills the first viewport edge to edge. Pick a release point on the map, use a named place, or enter coordinates.
- In **Visualisation**, leave **Copernicus · adaptive** selected. Zoom/pan to refine the mesh progressively, or use **30 m close-up at release point** to focus on a ~15 km-wide area with up to 5× relief. The source is a 1-arc-second (~29 × 31 m) digital surface model. The scene header reports the actual displayed mesh spacing separately from source spacing. Regional mode restores the original ~900 m terrain.
- Switch between elevation, slope, and contributing drainage area. Reference river lines and derived drainage have separate toggles.
- **First collection** traces unmodified steepest descent to the first sink. **Fill & spill route** shows the potential downstream path after terrain depressions are filled, terminating when it leaves Telangana. It is independent of the added volume.
- Add **0.01–100 million m³** to estimate storage at the first natural depression. The model fills connected grid cells to the first downstream spill saddle (or the conditioned spill level). Surplus is reported, not propagated as a flood wave. No travel time or discharge is estimated.
- View the real elevation profile; preview and save a PNG with terrain, source credits and model limits (DOM map labels/legends are not included). Release coordinates are retained in the URL.
- Read the published Godavari / Krishna station snapshot and optionally check its JSON every 15 minutes. The actual observation timestamp determines freshness. These are **water levels, not discharge**.

## Data and reproducibility

Bundled `public/data/` contains the complete static terrain, geometry, hydrology and observation inputs; browsing the deployed site requires no data-provider connection. No API key is needed.

| Layer | Source / license | Treatment |
| --- | --- | --- |
| Display terrain | [Copernicus GLO-30 public AWS archive](https://registry.opendata.aws/copernicus-dem/), 2021 release; Copernicus DEM licence | 20 geocells cover Telangana and its approximately 8 km display buffer. Adaptive 225-segment quadtree patches, from ~494 m overview spacing down to native 1-arc-second samples. Native leaf samples retain original georeferencing. |
| Routing DEM / fallback | [Mapzen / Tilezen Terrain Tiles](https://registry.opendata.aws/terrain-tiles/), SRTM and other public source DEMs; [attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) | 56 zoom-9 Terrarium tiles, decoded as R×256+G+B/256−32768 metres. Bilinear resampling onto a 512×512 grid. |
| Boundary | [geoBoundaries India ADM1](https://www.geoboundaries.org/api/current/gbOpen/IND/ADM1/), derived from DataMeet / Election Commission of India, CC BY 2.5 IN per source metadata | Telangana subset of simplified outline, rasterized for study-area selection. Not a cadastral boundary. |
| Rivers | [Natural Earth 1:10 million](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/), public domain | Regional subset of generalized river centerlines. “10m” means 1:10 million scale, not ten-metre resolution. |
| Drainage | Derived from the bundled DEM | Priority-flood filling, D8 receivers, accumulation. Lines shown above 80 contributing cells (~67.5 km²). |
| Gauges | [NWIC / CWC hourly telemetry](https://nwdp.nwic.gov.in/en/dataset/river-water-level-telemetry-hourly-central-water-commission-cwc), portal license “Other (Open)” | Latest screened Telangana records from Godavari and Krishna 2026–2030 resources. Raw provider metre values; vertical datum unverified. |

The **separate water-routing grid** spacing is **897 × 941 m**, approximately 0.844 km² per cell. Local equirectangular scene coordinates use 111.32 km per latitude degree and cosine of the study midpoint for longitude. Distances and cell areas are regional approximations, not geodetic survey measurements. Vertical exaggeration is display-only, initially 15×.

One in-state sample at approximately **16.0796°N, 78.8347°E** had an implausible source elevation of −411.19 m; a 3×3 valid-neighbour median was substituted. `elevation-original.bin` preserves the source values; `quality.bin` flags the correction. Negative bathymetry outside the Telangana mask is retained. Sampled in-state corrected elevations range approximately 23–906 m; this is the grid's range, not a claim about the state's exact extrema.

`metadata.json` records bounds, cell dimensions, fetch time, source metadata and SHA-256 hashes. Binary arrays are row-major, north-to-south / west-to-east, little-endian Float32 except Int32 `receiver.bin` and Uint8 `mask.bin` / `quality.bin`. Receiver −1 is an outer rectangular boundary outlet. Accumulation counts rectangular-domain contributing cells, including upstream cells outside the state. Raw routing and displayed conditioned traces stop at the state outline.

Regenerate the original regional inputs too (Python 3.10+, NumPy, Pillow; internet required only during preparation). Install the optional Python dependencies with `python3 -m pip install -r requirements-data.txt`:

```sh
python3 scripts/prepare_data.py
npm run data:terrain
npm run data:context
npm run data:gauges
npm test
npm run build
```

Original downloads are cached in ignored `.cache/`; prepared static terrain tiles are in `public/data/terrain/tiles/`. The boundary source revision and original downloads are recorded in metadata. The source service may change when rebuilding; the included hashes identify this delivered artifact.

## High-resolution terrain: source and limits

The old 900 m grid was a deliberate regional simplification, not the best available measurement resolution. The new display uses **Copernicus GLO-30**, derived principally from TanDEM-X acquisitions in 2011–2015; the openly accessible AWS archive is the 2021 release. It is a **digital surface model**, not surveyed bare-earth terrain, so forest canopy and structures can affect heights. Heights use **EGM2008**; they are not directly interchangeable with the older routing DEM or unverified station datums. The surface data are not current imagery and do not resolve culverts or gate operations.

The root mesh has ~16-arc-second spacing, progressively refined through 8, 4, 2, and finally **1 arc second** (~29 m east-west × 31 m north-south). Wide-scale levels use the provider's averaged overviews; close-up leaf patches read native pixels directly. Original points lie at integer geocell origins with 1/3600-degree spacing. Border samples come from adjacent geocells, not duplicated edge values. Each patch has 226 × 226 vertices; transfer heights are Int16 decimetres with a no-data sentinel of −32768. Rounding introduces at most 0.05 m error, which is a storage tolerance, **not measurement accuracy**. Display clipping follows an approximately 8 km buffer around the simplified state boundary; the routing mask is unchanged.

`public/data/terrain/manifest.json` records source, licence notice, coverage, levels, cached keys, and complete-through level. `tiles/*.bin` hold little-endian Int16 heights; matching JSON files record geocell, level, overview factor, sample spacing, fetch time, height range, original source URL, and SHA-256 hash. `src/terrain-source.mjs` is used only by data preparation: it reads original GeoTIFFs and generates static patches. The browser’s `src/terrain-detail.js` fetches those prepared files, retains parent patches until children are ready, and evicts unused GPU meshes. Zooming beyond native detail adds no new information. Original source rasters are retained in ignored `.cache/copernicus/` for repeatable preparation and verification.

Attribution: Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.

[Copernicus specifications and licence](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM), [AWS distribution and overview processing](https://copernicus-dem-30m.s3.amazonaws.com/readme.html).

This was the finest openly accessible statewide elevation source verified for this upgrade. It is not a claim that no finer surveys exist. Copernicus EEA-10 covers Europe; it is not a 10 m Telangana source. NRSC lists finer CartoDEM products with pricing and access/clearance conditions ([policy](https://www.nrsc.gov.in/nrscnew/Dataproducts_Thematic_cartodem.php?lang_code=en)). No paid data, restricted products, or fictional interpolated “10 m detail” have been substituted.

**Hydrology still uses the ~900 m Mapzen/SRTM grid.** Route geometry and markers are draped on the display surface for orientation, but their distances, storage, and elevation profiles are calculated from the original routing grid. Inferred drainage and Natural Earth rivers do not acquire 30 m positional accuracy merely because the display is sharper. Water-cell marks are schematic locators, not native-resolution inundation predictions.

## Border context and river visibility

The map displays approximately **8 km of terrain beyond Telangana** in a muted colour. The colour change identifies the state extent without an overlaid border line. Reference rivers use darker blue, screen-stable 2.6 px strokes with a contrasting casing and continue through the buffer. The 2D fallback uses the same context mask, colour distinction and river toggle.

`src/terrain-context.mjs` builds a physical-distance dilation of the existing regional mask for display only. Native Copernicus patches use a kilometre-scaled canvas fill/stroke of the boundary, with the same nominal buffer radius. The regional mask is sampled at ~900 m, so its display edge can differ from the fine outline by about a grid cell. Outside-state surfaces are intentionally muted; the outer cut edge is the context limit, not another administrative boundary. Regional river centreline accuracy is unchanged.

Two additional Copernicus geocells, N18/E081 and N19/E080, are cached through native level 4, bringing the static archive to 6,820 tiles across 20 geocells. `npm run data:context` reproduces this extension from official public Copernicus COGs and updates the manifest only after all tiles are present. Restart Vite after generating new tiles: its terrain watcher is disabled and its public-file index otherwise retains the old inventory. Production static hosting needs no terrain API or outside network requests.

**This is a display extension.** Release selection, D8 routing, storage calculations and termination still use the original Telangana study mask. A route ending at the state boundary is an end of the modelled study area, not a claim that the river ends there. Original elevation / hydrology arrays and provenance hashes remain unchanged.

## Observation quality

`src/gauges.mjs` contains the official CKAN resource IDs and CSV normalization. Invalid numeric values and inland implausibility outliers (<0 or >1,500 m) are rejected. Positive sensor errors may remain. The latest **screened** reading can predate newer rejected values; records are not independently validated. Observation times are interpreted as IST (+05:30). No gauge-to-discharge rating curve, common vertical datum, or current discharge feed is available in these resources; gauge levels do not control the terrain model.

The publisher’s preparation script uses provider metadata to obtain the official CSV URL, restricts downloads to the official host, and applies request timeouts. There is no runtime proxy. The browser reads the published JSON only. Partial preparation failures retain a basin’s last records with a partial-feed message; complete failure retains the existing file. Optional polling is opt-in and only runs when the page is visible. Freshness: ≤24 hours recent, >24 hours stale, future timestamps flagged.

## Model limits

This is an educational regional terrain/storage model. It omits dam gates, reservoirs' surveyed bathymetry, channel geometry, infiltration, bridges, culverts, rainfall distribution, evapotranspiration, momentum and time-varying hydraulic backwater. DEM pits and generalized river positions may be inaccurate. Artificial filling can produce climbs along the original elevation profile. Excess water is not propagated through subsequent depressions. Pool marks identify sampled cells, not surveyed inundation boundaries. Boundary exits only mean that the displayed study area ends.

For operational flood modeling, replace the regional grid with a conditioned high-resolution DEM and calibrated hydrology / hydraulics plus verified current discharge and reservoir operations. This project does not supply those inputs.

## Validation

`npm test` additionally checks all cached Copernicus tile hashes, exact shared geocell border samples, native pixels against the retained original GeoTIFF, and tile-index bounds. With `npm run dev` running, `npm run test:terrain` verifies desktop/mobile refinement to native detail and switching back to the routing-scale view.

`npm test` verifies routing-source hashes, finite/in-state elevation bounds, the entire receiver graph's acyclicity and filled-surface descent, accumulation conservation at all outlets, sampled natural descent, storage mass balance, a synthetic basin, and official-CSV parsing. Browser QA covers desktop/mobile layout and key controls. The ImageGen layout reference is retained in `docs/layout-concept.png`; source claims and terrain geometry in that concept are illustrative and were replaced with the sourced data and explicit method used here. The actual app adds volume controls, storage results, and the requested observation table.

## Kaleshwaram project layer

The **Project map focus** control separates (1) intake / barrage constraints, including Kannepalli and the Pranahita–Godavari confluence area; (2) wider reservoir / basin sources; and (3) thirteen intended-command district callouts. The chosen focus is retained in `mapview=network|command` (intakes is the default). Orange identifies dated storage constraints, green separate Godavari storages/sources, and blue Krishna sources; colors do not certify present operation. Short site facts appear before the existing detailed inspector, and an info button opens the intake explanation. Mobile labels use two-column annotations with leader lines to the projected point anchors to preserve touch targets and avoid overlapping nearby sites.

`src/map-callouts.mjs` records source links and location precision for these additions. The 93.5 m intake requirement, 89.9 m level, 4–5 TMC storage requirement and 88.5 / 89.5 m bed/crest values are explicitly attributed to a July 2026 government briefing reported in the press. They are not live readings or verified operating rules; a typical 89–89.9 m range is not inferred from that single dated statement. Gate restrictions are dated reports of NDSA findings, with present gate status unavailable. Reported design capacities are not relabeled as live storage; Nagarjuna Sagar's explicitly sourced 2011 live-storage survey is separately dated. No continuous no-impounding record or present operational clearance is asserted.

The wider view includes Mid Manair, Mallanna Sagar, Kondapochamma Sagar, SRSP, Nagarjuna Sagar, Devadula and Sita Rama source areas, plus shared Srisailam (Kalwakurthy / Palamuru–Rangareddy) and Jurala (Nettempadu / Bhima) source callouts. These are regional locators, not surveyed infrastructure alignments. Kaleswaram gauge coordinates locate the confluence *area*; the Srisailam callout uses Kalwakurthy's source coordinate rather than claiming both schemes' pumps are co-located. Capacity, role, location precision and dated sources are inspectable. Command markers open the existing district evidence view; intended acreage, CAG's dated construction outcomes and actual delivered irrigation remain distinct.

An amber **Tummidihatti · Earlier proposal** marker opens the historical Pranahita–Chevella intake context. Its regional locator (19°35′45″ N, 79°47′ E) comes from the Telangana-side coordinate in EPTRI’s 2016 pre-feasibility filing for the retained Pranahita proposal; it does not assert the exact original PCSS barrage alignment. The historical point is separate from the four-stage KLIP sequence and its connecting lines. It is accessible from the site picker, Medigadda’s comparison button, the hydrology explanation, and `?project=tummidihatti`, including keyboard/touch and 2D fallback. Source-linked details distinguish the earlier DPR estimate, CWC’s March 2015 assessment and upstream-surplus deduction, the state’s stated reasons and CAG’s findings. Prior-work and energy figures are attributed to CAG’s re-engineering comparison, not presented as current expenditure or measured electricity use. No alternative is declared the cheaper or more usable winner, and no Kaleswaram gauge reading is assigned to this historical point. Data and markup are in `src/tummidihatti.mjs`; only the map/selection inventory includes it.

Purple markers locate Medigadda, Annaram, Sundilla (I&CAD profile coordinates) and Sripada Yellampalli (CWC station coordinates). Dashed straight connectors illustrate the Link I pumping sequence; they are not surveyed infrastructure alignments. Hover/focus opens a scrollable details card; click/tap pins it, Escape or Close dismisses it. The sidebar site picker works at any zoom; the project toggle is independent of city/gauge labels. Markers also work in the 2D fallback.

`src/kaleshwaram.mjs` records source URLs and separates historic design figures from observations. Barrage specifications use CAG 2024 chapter III p.16; the older I&CAD profile has different storage figures and its planning targets are labeled accordingly. A dated government restoration update is included, not inferred live operational status. Only verified Link I locations are mapped; the complete seven-link network has not been surveyed into this app.

The connected CWC resource supplies **water level only**, not site discharge, gate releases, inflow or pump flow. Cards explicitly report current flow as unavailable. The Kaleswaram river gauge is labeled as a nearby upstream observation for all three barrages, never as site telemetry; Yellampalli uses its own named station. Freshness is calculated from observation time, and reload reads the published static JSON and retains previous readings on failure. No flow is inferred from levels or design capacities.

## Reading the visual evidence

The project inspector, numbered map sites, four-stage selector, and design-level profile share a selection. Click/tap a bar or stage to inspect that site; the comparison selector switches storage, gate count, barrage length and design flood discharge. Each metric uses its own labeled zero-baseline scale. `project` and `compare` URL parameters preserve selection on reload and in copied links. Closing the inspector leaves a project overview; turning off the layer removes the inspector and sequence dock.

The SVG profile compares sourced full-reservoir design levels only (100/119/130 m). It does not show actual pump heads, a terrain cross-section or present water heights. Yellampalli has no design level in this profile source and stays outside the numeric comparison. Mobile uses a separate compact profile and two-column stage selector; the inspector follows the map rather than covering it.

Observation timelines show the gap between observation time and today, never an invented historical trend. A station freshness plot compares observation ages on a common 0–365-day scale (older readings cap at the edge with their full age labeled). Station water levels remain in their sourced table; unverified station datums make ranking levels misleading. The added-water balance bar partitions the simulated volume into retained and excess components. Missing discharge remains explicitly unavailable.

Visualization rendering is dependency-free DOM/SVG in `src/project-visuals.mjs`, with bounded mark counts and no animation or additional data requests. The underlying terrain and its fallback continue to own geography. Visual concepts were reviewed in this chat and implementation was authorized by “continue”; generated satellite imagery and illustrative barrage photos were intentionally excluded in favor of the existing sourced terrain.

## Water system explained

Use **Water system explained** in the site inspector or Visualisation sidebar to open the larger, keyboard-accessible explanation. Seven topics cover intake levels, the longer lift chain, hydrology, basin connections, intended command geography, safety and the water budget. The native dialog contains focus, closes with Escape, and restores focus without dismissing the site inspector. On mobile it fills the screen; topic tabs scroll horizontally, figures have compact text equivalents, and selecting a district brings its details into view.

`src/irrigation-evidence.mjs` owns the evidence records and dependency-free SVG/DOM rendering, with styles in `src/irrigation-evidence.css`. The existing state outline is reused for thirteen approximate district-headquarters locators and the Godavari gauge inset. These are not surveyed command polygons or district boundaries. I&CAD intended new acreage reconciles to 1,825,700 acres. Existing stabilisation-command bases, the CAG deficit-supplementation equivalent and dated construction progress stay distinct. Current district delivery status and district-to-package crosswalks are not verified.

The intake slider is explicitly illustrative. The roughly 93.5 m requirement is a reported political statement, not a verified technical operating limit. No nearby gauge value is drawn as a barrage-site water surface; river-bed and crest surveys, current gate openings, site water heights and safe-operating clearance remain unavailable. The longer design reference profile uses separate official sources for Yellampalli (148 m / 20.175 TMC), Mid Manair (318 m / 25.875 TMC), Ananthagiri (397 m / 3.5 TMC), Mallanna Sagar (557 m / 50 TMC) and the 618 m highest endpoint. Unverified reference points break the line. Differences from the 100 m Medigadda reference are not cumulative dynamic pump heads. Storage figures are design capacities, not live storage or current availability.

The historical lift bars use an explicitly attributed, rounded minister-reported series from June 2025. Its listed values sum to 160.72 TMC, differing from the source's 162 TMC headline; this discrepancy is disclosed. They are not presented as an audited series. Safety reporting and repair targets are dated and identified as secondary where no signed report is available. A June 2027 target is not represented as completion or operating clearance.

The CAG design water budget reconciles to 240 TMC: 195 Medigadda, 20 Yellampalli and 25 groundwater. The uses include the 3 TMC unexplained DPR gap identified by CAG. Every topic links its references; inaccessible department downloads are acknowledged. No unverified discharge is inferred from water levels, and sequential pump totals are never added as independent new water.

`explain=intake|chain|hydrology|basins|command|safety|numbers` retains the open topic, with `district` retaining the selected command district. Existing project, comparison and terrain URL parameters are preserved. Invalid topics normalize to intake. The diagrams work without WebGL. The browser suite covers desktop/mobile topics, slider bounds, URL restoration, keyboard/site navigation, retained readings after refresh failure, touch and 2D fallback. Additional unit checks cover budget/acreage reconciliation, unit conversion, reference missingness and scenario bounds. See `docs/irrigation-evidence-design.md` for the evidence and interaction contracts.
