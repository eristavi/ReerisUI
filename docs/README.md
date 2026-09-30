# Reeris UI documentation in Astro

The public documentation and API reference are built with **Astro** and hosted on GitHub Pages at <https://eristavi.github.io/ReerisUI/docs/index.html>.

## Local workflow

Use Node.js **22.12 or later** (GitHub Pages CI uses Node 24) and install the locked documentation tooling with `npm ci`.

| Command | Purpose |
| --- | --- |
| `npm run docs:dev` | Build Core, regenerate the API inventory, prepare assets and start Astro development. |
| `npm run docs:site` | Build and audit the static site in `.reeris-docs-site/`. |
| `npm run docs:preview` | Preview the production build under `/ReerisUI/`. |
| `npm run docs:test` | Run Chromium browser checks against the production preview. Install its browser first with `npx playwright install chromium`. |
| `npm run audit:docs` | Check source documentation coverage and stylesheet architecture. |

The home page is `site/src/components/DocumentationHome.astro`; the API page is `site/src/pages/docs/api-reference.astro`. Shared navigation, theme controls and document metadata live in `site/src/components/` and `site/src/layouts/`. `site/astro.config.mjs` defines static output, the GitHub project base and file routes.

## Content and API authoring

Component demos remain maintained in `docs/*.html`, and official starters in `examples/starters/*.html`. Astro prerenders these through shared layouts with their existing styles, attributes and demo scripts preserved. A new maintained HTML demo automatically becomes an Astro route; add its directory entry in `tooling/documentation-config.mjs` to show it on the home page.

Keep the canonical source stylesheet `../packages/core/src/reeris.css` in repository demos so they remain browsable from a clone. The published layout loads the tested distribution copy at `docs/assets/reeris.css`. Astro is documentation tooling and does not become a dependency of the CSS or optional JavaScript packages.

`npm run docs:api` scans Core CSS and optional JavaScript sources to produce `docs/api-manifest.json` and the standalone repository reference. Astro renders its public API page directly from that inventory, including classes, custom properties, data attributes, modules and exports. Update the source contract and regenerate; do not edit generated inventory rows by hand.

Sections marked `data-docs-example` receive Preview and HTML radio views. `tooling/demo-code-tabs.mjs` derives the code view from the same example markup during prerendering. Give each marked section an `h2` first child, and keep example radio names and IDs distinct from generated `docs-example-*` names. Switching these views works with JavaScript disabled.

The optional documentation script provides the page finder, API filters and System / Light / Dark / Glass theme selection. Every category, page link and API row remains present without JavaScript. The shared Astro layout adds a keyboard skip link and canonical metadata.

## GitHub Pages deployment

`.github/workflows/docs-pages.yml` installs locked dependencies, builds Astro, checks links and API coverage, then runs desktop/phone Chromium checks. Pull requests validate the site without deploying it. Pushes to `main` publish the tested `.reeris-docs-site/` artifact through GitHub Actions.

The repository's **Settings → Pages → Source** stays **GitHub Actions**. Existing `docs/*.html` and `examples/starters/*.html` URLs are preserved. No domain/DNS change is part of this migration.

This site migration does not close the remaining real-device or assistive-technology release gates, and does not publish packages to npm.
