# Data licences & attribution

The [MIT licence](LICENSE) covers this project's original code and documentation.
It does **not** relicense third-party data, fonts, library code, cited reports or
the underlying map content in screenshots. Those retain the terms below.
This is an independent educational project; source organisations do not endorse it.

| Material / repository paths | Rights and source | Changes made here |
| --- | --- | --- |
| Display terrain: `public/data/terrain/` | Copernicus WorldDEM-30 / GLO-30 Public, 2021 AWS release; [upstream licence, bundled PDF](public/licenses/Copernicus-DEM-GLO-30.pdf), [official copy](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/DEM/resources/license/License-COPDEM-30.pdf), [AWS distribution](https://registry.opendata.aws/copernicus-dem/) | Regional subset; overview pyramid; native georeferencing retained; Int16 decimetre packing; display clipping and colour |
| Regional DEM and derived arrays: `public/data/*.bin` | Mapzen / Tilezen Terrain Tiles, [upstream source and attribution terms](https://github.com/tilezen/joerd/blob/master/docs/attribution.md), [archive](https://registry.opendata.aws/terrain-tiles/) | 56 Terrarium tiles sampled to 512 × 512; one flagged elevation correction; derived slope, mask, priority-flood surface, D8 receivers and accumulation |
| State geometry: `public/data/boundary.geojson` | DataMeet India community / Election Commission of India via geoBoundaries; **CC BY 2.5 India**, [licence](https://creativecommons.org/licenses/by/2.5/in/), [DataMeet source](https://github.com/datameet/maps), [pinned geoBoundaries revision](https://github.com/wmgeolab/geoBoundaries/tree/9469f09/releaseData/gbOpen/IND/ADM1) | Telangana subset of simplified ADM1 geometry; raster mask and approximately 8 km display buffer derived from it |
| Rivers: `public/data/rivers.geojson` | Natural Earth 1:10 million river centre lines; [public domain terms](https://www.naturalearthdata.com/about/terms-of-use/), [source](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/) | Regional subset and display styling; not a channel survey |
| Observations: `data/raw/cwc-*.csv`, `data/raw/*-resource.json`, `public/data/gauges-snapshot.json` | Central Water Commission / NWIC, [official dataset](https://nwdp.nwic.gov.in/en/dataset/river-water-level-telemetry-hourly-central-water-commission-cwc), dataset code WQT00003; publisher metadata: **Public**, **Other (Open)** (`other-open`) | Telangana filtering, plausibility screening, latest screened record per station; source CSV snapshots retained |
| Fonts: `public/fonts/` | DM Sans and Libre Caslon Text; **SIL OFL 1.1**, [DM Sans notice](public/fonts/DM-Sans-OFL.txt), [Libre Caslon Text notice](public/fonts/Libre-Caslon-Text-OFL.txt) | Bundled WOFF2 assets; upstream copyright and licence notices retained |
| Runtime library: Three.js and its addons | **MIT**, [bundled notice](public/licenses/three-MIT.txt), [upstream](https://github.com/mrdoob/three.js) | Bundled by Vite; original library licence retained |
| Original app code, prose, tests, diagrams and documentation image composition | **MIT**, [project licence](LICENSE) | Screenshots contain third-party terrain, geometry and fonts; the underlying materials keep their separate terms |

## Copernicus: notices that travel with the data

Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence
and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and
ESA; all rights reserved.

The organisations in charge of the Copernicus programme by law or by delegation
do not incur any liability for any use of the Copernicus WorldDEM-30.

The upstream licence allows reproduction, distribution, public communication,
adaptation and combination subject to its conditions. Preserve the attribution,
liability notice, non-endorsement and downstream obligations in article 6 when
redistributing the terrain or a derivative. The full licence is included in
`public/licenses/`, which also ships in `dist/`. The DEM is a surface model;
its approximately 30 m sampling is not a claim of 30 m measurement accuracy.

## Regional terrain sources

Mapzen / Tilezen describes a blend of upstream elevation datasets. Global SRTM
and GMTED2010 terrain data are courtesy of the U.S. Geological Survey; global
ETOPO1 terrain data are from the U.S. National Oceanic and Atmospheric
Administration. The original per-pixel blend has not been independently
reconstructed for this subset. Preserve the provider's applicable source
credits and [attribution guidance](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).
Our sampling, correction and derived hydrology are documented in
[data and methods](docs/data-and-method.md); they are not provider-approved results.

## CWC / NWIC: retain the publisher's terms

Checked 3 November 2026 against the official CKAN `package_show` metadata for
dataset `68600163-c5a0-4327-aa1a-fa7157b86cce`. The publisher marks this dataset
`other-open` / “Other (Open)” and its access control “Public”; the returned
metadata provides no specific licence URL. A small record of this check is
bundled as [CWC licence metadata](public/licenses/cwc-license-metadata.json).

This project does **not** claim that these observations are MIT, CC0, or covered
by the Government Open Data License solely because the portal is governmental.
Retain CWC / NWIC credit, resource IDs and observation timestamps. Anyone needing
precise commercial, sublicensing or onward-redistribution permissions should
confirm the applicable terms with NWIC / CWC. The `other-open` label is the
publisher's description, not a new licence granted by this repository.

Godavari resource: `c6f31452-b416-4599-a6ae-07ad4217cdf4`.
Krishna resource: `d80798b9-4b11-4626-8b63-964202ba7216`.
Water levels are dated observations with an unverified vertical datum, not
discharge, live reservoir storage or operating clearance.

## Reports, images and contributions

Official technical reports and news articles are cited through external links;
their copyright is not reassigned by this project. Quotations should remain
brief and necessary. Added data require a source, version/date, transformation
record and compatible reuse terms. Do not copy an entire report into the repo
just because it is publicly readable.

README screenshots are captures of the actual app; their source credits are
listed here and in [the screenshot guide](docs/screenshots/README.md).
`docs/layout-concept.png` is an AI-generated design reference, not a screenshot
or factual source. Preserve attribution when sharing map images. PNG exports
include credits, the Copernicus liability notice and the model limitation.

The original project code and prose may be reused under MIT. No blanket
MIT grant is made over the combined data archive.
