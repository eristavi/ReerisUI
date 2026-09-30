import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import './prepare-docs-site.mjs';

const cli = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const result = spawnSync(process.execPath, [cli, 'build', '--root', 'site'], {
  cwd: process.cwd(), stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
