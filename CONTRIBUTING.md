# Contributing

Thank you for helping make Telangana's water systems easier to understand.
Code, accessibility improvements, careful data corrections, Telugu translation,
and technical review are all welcome. This is an educational community project.

## Start locally

Use Node.js 24 LTS (or Node.js 22.12+ in the 22.x line) and npm:

```sh
git clone https://github.com/krngd2/telangana-water-atlas.git
cd telangana-water-atlas
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Bundled terrain makes the checkout approximately
684 MiB before dependencies; no API key or Python installation is needed.
See [data and methods](docs/data-and-method.md) for optional data regeneration.

## Choose a contribution

- Use a **bug report** for incorrect interactions, rendering or accessibility.
- Use a **data correction** for a disputed number, location, source or label.
- Use a **feature request** to explain a question the atlas could answer better.
- Discuss substantial changes before implementing them. Small fixes can go
  straight to a pull request.

For a factual correction, include the exact label, proposed wording, source
URL, publication date, page/table reference, units and vertical datum if known.
Prefer signed technical documents and official datasets. Identify secondary
reporting as such. Separate design capacity, dated observation, reported claim
and missing evidence. Political disagreement alone is not a data correction.

## Make a change

Create a branch, keep the change focused, and explain the resulting behavior.
Preserve existing data hashes unless the data are deliberately regenerated.
Document source versions and licences for new data; never assume the code's
MIT licence covers an upstream dataset. Do not commit `.cache/`, credentials,
personal information, browser traces, `node_modules/` or `dist/`.

For user-facing changes, check desktop and a narrow touch viewport. Essential
information must work without hover; preserve keyboard access, visible focus,
dated observations and the distinction between display and routing resolution.
Update README screenshots when the visible experience materially changes.

## Verify

```sh
npm test
npm run build
npx playwright install chrome
npm run test:browser
```

Playwright starts Vite automatically, or reuses a local server outside CI.
On Linux, install browser system dependencies with
`npx playwright install --with-deps chrome`. The native-source comparison test
is skipped if its optional original GeoTIFF is absent; bundled tile hashes,
seams and routing checks still run. Browsers use real local static assets.

Add a meaningful regression test for a behavior or data-contract change.
Documentation-only fixes usually need link and rendering checks instead.
The production build's existing large Three.js chunk warning is informational.

## Pull requests and review

Describe the problem, the final behavior, evidence sources, and validation.
Include desktop/mobile screenshots for visual changes. Maintainers may request
clearer evidence, smaller scope or a test. There is no guaranteed review time.

Your original code and documentation contributions are submitted under the
[MIT licence](LICENSE). Third-party materials keep their upstream terms in
[DATA_LICENSES.md](DATA_LICENSES.md). Contributing does not require a CLA.
Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).
