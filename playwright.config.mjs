import { defineConfig, devices } from '@playwright/test';

const includeEdge = process.env.REVA_INCLUDE_EDGE === '1';
const projects = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'], browserName: 'chromium' } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'], browserName: 'firefox' } },
  { name: 'webkit', use: { ...devices['Desktop Safari'], browserName: 'webkit' } },
  { name: 'mobile-chromium', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
  { name: 'mobile-webkit', use: { ...devices['iPhone 15'], browserName: 'webkit' } },
];
if (includeEdge) projects.push({ name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } });

export default defineConfig({
  testDir: './tests/rc',
  timeout: 30_000,
  expect: { timeout: 5_000, toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled' } },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: [
    ['list'],
    ['./tooling/rc-playwright-reporter.mjs']
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    reducedMotion: 'no-preference'
  },
  webServer: {
    command: 'node tooling/test-server.mjs',
    url: 'http://127.0.0.1:4173/docs/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 20_000
  },
  snapshotPathTemplate: 'tests/rc/snapshots/{projectName}/{arg}{ext}',
  projects
});
