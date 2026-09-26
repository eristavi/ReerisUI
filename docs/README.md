# Reeris UI documentation architecture

Documentation checked into the repository uses the canonical source entrypoint:

`../packages/core/src/reeris.css`

This keeps a fresh clone browsable without requiring generated `dist/` files.

The published documentation site is built with:

`npm run docs:site`

The site is published to GitHub Pages on pushes to `main` through `.github/workflows/docs-pages.yml`. Configure the repository's **Settings → Pages → Build and deployment → Source** as **GitHub Actions**. The project URL is `https://eristavi.github.io/ReerisUI/`.

The home page offers a three-step introduction and a page finder. Search is an optional enhancement; every category and link remains browsable without JavaScript. The published component demos include a return link to the docs home.

That command first builds Reeris, then creates `.reeris-docs-site/`. During that build, documentation pages are rewritten to use a self-contained `docs/assets/reeris.css` copied from the production `packages/core/dist/reeris.css`.

This deliberately separates concerns:

- repository docs validate the standards-native source modules;
- package/release tests validate `dist/reeris.css`;
- published docs consume a self-contained copy of the tested distribution build.
