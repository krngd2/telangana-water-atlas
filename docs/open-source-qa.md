# Open-source release QA · 3 November 2026

The flow under test is: load the atlas → explore terrain and project evidence →
export a credited PNG → close the preview and continue using the map. Existing
coverage also exercises static hosting, failed observation reloads, saved views,
mobile touch and the 2D fallback.

## Environment and results

Local URL: `http://127.0.0.1:5173`. Installed Google Chrome through Playwright;
Browser plugin not available. Local Node.js 25.8.1. CI is configured for Node.js
24 LTS on Ubuntu; its hosted result is shown by the README workflow badge.

| Check | Result |
| --- | --- |
| Unit and data-contract tests | 27 passed locally, including tile hashes, seams, native source comparison, hydrology invariants and evidence reconciliation |
| Browser suite | 26 passed locally across 1440/1536 px desktop and 390 px mobile/touch flows |
| Production build | Passed; static asset verification passed; existing approximately 547 kB Three.js chunk warning retained |
| Page identity and meaningful rendering | Expected atlas title, terrain-ready state, populated labels and explanation topics |
| Framework overlay and console health | No Vite overlay or page errors in tested flows; screenshot capture also checks console errors and missing assets |
| PNG export | Desktop 3D and mobile 2D images load with original terrain dimensions plus a source/context margin; correct source credit, model caveat, view settings and download name verified |
| Copernicus notices | Full upstream licence PDF, modified-data attribution and required liability notice bundled; notice also shown in the app and native-terrain PNG export |
| Documentation screenshots | Four real captures reviewed; intake scenario and lift profile framed by scrolling the existing panel |
| Dependency audit | `npm audit` reported zero known vulnerabilities at preparation time; not a security guarantee |
| Data reuse scope | Original code/docs MIT; upstream terrain, geometry, observations, fonts and library terms separately documented |

Screenshots are committed under [screenshots/](screenshots/README.md). The capture
script is reproducible and handles repository paths containing spaces. The
README gallery uses real rendered UI and preserves the original documentation's
detailed methods in [data-and-method.md](data-and-method.md).

## Commands

```sh
npm test
npm run build
npm run test:browser
npm run docs:screenshots
npm run docs:check
npm audit
```

`docs:check` verifies local Markdown links and image paths. It does not certify
external source availability or heading anchors. The build also requires the
distributed licence and font notices and checks that its project MIT text
matches the root licence. In a fresh checkout without the ignored source COG,
the optional original-native-pixel comparison skips; bundled hashes still run.

## Remaining limits

Safari and Firefox were not tested. This QA validates software behavior, not
engineering accuracy or present barrage safety. CWC metadata says Public /
Other (Open) and provides no specific licence URL; no additional rights grant
is inferred. Several official report links may be temporarily unavailable.
Observation snapshots can be stale. A screenshot capture date does not update
an observation. The approximately 30 m display and approximately 900 m routing
grid remain separate.
