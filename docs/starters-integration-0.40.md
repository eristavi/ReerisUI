# Reeris UI 0.40 — Official starters & integration acceptance

Reeris 0.40 introduces five official reference starters built entirely from the feature-frozen Core public API:

- Dashboard
- Data management
- Authentication
- Settings
- Marketing / landing page

## Acceptance contract

The starters are integration fixtures, not a separate template framework. They intentionally have no starter-specific CSS file and no required JavaScript. `tooling/starters-integration-audit.mjs` verifies that each starter:

- links the production Reeris Core stylesheet;
- uses only classes present in the public Core selector inventory;
- uses only known Reeris-owned `data-reeris-*` attributes;
- contains no embedded `<style>` block;
- contains no inline event handlers;
- contains no runtime `<script>` dependency;
- limits inline style declarations to public `--reeris-*` custom properties;
- includes basic document and landmark metadata;
- contains the expected Reeris composition anchors for its starter type.

This is a composition/integration gate. It does not replace the open manual browser/device acceptance matrix documented in the browser and accessibility reports.
