import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://eristavi.github.io',
  base: '/ReerisUI',
  output: 'static',
  outDir: '../.reeris-docs-site',
  publicDir: '../.reeris-docs-public',
  build: { format: 'file' },
  devToolbar: { enabled: false }
});
