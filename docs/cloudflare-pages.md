# Cloudflare Pages deployment

Live atlas: **https://telangana-water-atlas.pages.dev/**

The production project is `telangana-water-atlas`, with production branch `main`.
It uses **Wrangler direct upload** of a locally built site. There is no Cloudflare
Git build or automatic deployment on a Git push. No Worker entry point or
application server is required.

## Deploy an update

For a maintainer with access to the Cloudflare account, run from the repository
root, where `package.json` is located:

```sh
wrangler login
npm ci
npm run build
wrangler pages deploy dist --project-name telangana-water-atlas --branch main
```

Wrangler 4.141.0 was used for the first deployment on 3 November 2026. An existing
login can be checked with `wrangler whoami`. Keep OAuth credentials in Wrangler's
local credential store; never copy them into the repository. The first Pages
project has already been created, so subsequent deployments only need the upload
command. Use the **Pages** deploy command for this established Pages project.

`dist/` is the generated output, not the source root. The initial upload contains
13,668 files, approximately 676 MiB, with a largest file of 1 MiB. Upload the
complete folder so terrain tile metadata, binary samples, fonts and licence
notices remain together. Wrangler checks which assets need uploading.

## Verify after deployment

- Open the stable URL above and check terrain and river rendering.
- Use **30 m close-up at release point** and confirm native terrain loads.
- Open **Water system explained** and navigate between topics.
- Export a PNG and confirm source credits and model limits travel with it.
- Check a narrow mobile viewport and reload the published gauge JSON.

The first deployment was checked on desktop and mobile, including byte-for-byte
comparison of a published native terrain tile with the local build. A new
deployment does not make old gauge observations current. Update the snapshot
with `npm run data:gauges`, rebuild and upload if newer readings are required.

The repository's GitHub Actions account restriction is separate from this
direct-upload deployment. A successful Wrangler deployment does not imply that
hosted GitHub CI ran.

[Cloudflare Direct Upload documentation](https://developers.cloudflare.com/pages/get-started/direct-upload/)
· [Back to README](../README.md)
