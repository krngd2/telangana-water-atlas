# Water system explanation QA · 29 October 2026

Summary: the existing hover inspector now opens a larger seven-topic explanation. New SVG figures, a scenario slider, district selection, dated evidence and a source register work with the existing terrain, gauge refresh and 2D fallback.

Environment: `http://127.0.0.1:5173`; installed Chrome through Playwright. Browser plugin not available. Desktop 1440 × 1000, mobile 390 × 1000, touch 390 × 844; existing regression coverage also includes 1536 × 1024. Safari and Firefox were not tested.

| Check | Result | Evidence |
| --- | --- | --- |
| Page identity | Pass | Expected atlas title and local entry route |
| Meaningful rendering | Pass | Terrain-ready state, explanation heading and seven populated topics |
| Framework error overlay | Pass | No Vite error overlay |
| Console health | Pass | No local application console errors or uncaught page errors in desktop/mobile topic flows; fixed missing favicon discovered by this check |
| Screenshot evidence | Pass | Desktop intake, lift reference profile, command map and mobile intake/command screenshots reviewed |
| Interaction proof | Pass | Slider bounds, topic changes, district selection, URL reload, keyboard navigation, close/focus return, source-site navigation and retained observations after failed refresh |
| Responsive layout | Pass | No dialog/panel horizontal overflow at either tested width; wide reference tables scroll within their own wrapper |
| Touch / fallback | Pass | Explanation opens from URL without WebGL, handles invalid topic state, and reveals selected district details after tapping |

Interaction loop: load atlas → open explanation from site inspector → adjust intake illustration → traverse all topics → select district → reload saved URL → close with Escape. Separate flow: arrow-key topic change → locate Annaram → reopen → simulate failed official refresh → retain old observation → close and return focus. Touch flow: disable WebGL → open invalid URL → normalize to intake → tap command district → close to the 2D atlas.

Commands: `npm test` (20 passing), `npm run test:ui` (12 passing), and `npm run build` (passing). Focused desktop/mobile topic checks were repeated after adding strict console assertions and refining the missing-elevation annotation. Build retains the existing warning for the approximately 547 kB Three.js chunk.

Evidence files outside the repository:

- `/tmp/telangana-evidence-intake-1440.png`
- `/tmp/telangana-evidence-chain-1440.png`
- `/tmp/telangana-evidence-command-1440.png`
- `/tmp/telangana-evidence-intake-390.png`
- `/tmp/telangana-evidence-command-390.png`

Remaining limits: no verified current barrage-site water surface, bed/crest survey, gate-opening feed, discharge, live-storage series or current district delivery classification. The 93.5 m line is explicitly a reported reference, not validated operating clearance. Annual lift figures and restoration proposals are attributed secondary reports. Live provider availability and the accuracy of those reports were not certified. District locations represent approximate headquarters, not ayacut polygons.
