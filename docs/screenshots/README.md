# Screenshots

These are unretouched browser captures of the actual atlas, not concept art.
They use the repository's bundled, dated observation snapshot. A screenshot's
capture date does not make an observation current or verify an operating status.

| Image | State | Viewport |
| --- | --- | --- |
| `atlas-overview.png` | Adaptive terrain, rivers and intake callouts | 1440 × 1000 |
| `intake-explainer.png` | Reported intake-level illustration and evidence notes | 1440 × 1000 |
| `lift-chain.png` | Staged lift reference profile | 1440 × 1000 |
| `atlas-mobile.png` | Terrain and project controls on a touch viewport | 390 × 1000 |

Regenerate after changing the app:

```sh
npx playwright install chrome
npm run dev
# In another terminal:
npm run docs:screenshots
```

The capture script waits for terrain readiness, checks page identity and console
health, and saves images here. Browser/plugin availability and review notes are
recorded in [release QA](../open-source-qa.md).

Composition and original app UI: MIT. Underlying terrain, geometry, river lines
and fonts retain their upstream terms in [DATA_LICENSES.md](../../DATA_LICENSES.md).

Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence
and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and
ESA; all rights reserved.

The organisations in charge of the Copernicus programme by law or by delegation
do not incur any liability for any use of the Copernicus WorldDEM-30.

Boundary: DataMeet / Election Commission of India via geoBoundaries, CC BY 2.5 IN.
Rivers: Natural Earth, public domain. Observations: CWC / NWIC, publisher label
“Other (Open)”. Fonts: DM Sans and Libre Caslon Text, SIL OFL 1.1.
No source organisation endorses this atlas.
