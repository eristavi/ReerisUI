# Reeris UI documentation architecture

Documentation checked into the repository uses the canonical source entrypoint:

`../packages/core/src/reeris.css`

This keeps a fresh clone browsable without requiring generated `dist/` files.

The published documentation site is built with:

`npm run docs:site`

That command first builds Reeris, then creates `.reeris-docs-site/`. During that build, documentation pages are rewritten to use a self-contained `docs/assets/reeris.css` copied from the production `packages/core/dist/reeris.css`.

This deliberately separates concerns:

- repository docs validate the standards-native source modules;
- package/release tests validate `dist/reeris.css`;
- published docs consume a self-contained copy of the tested distribution build.
