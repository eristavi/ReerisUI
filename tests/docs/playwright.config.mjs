import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  outputDir: '../../test-results/docs',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4321/ReerisUI/', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run docs:preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321/ReerisUI/docs/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
