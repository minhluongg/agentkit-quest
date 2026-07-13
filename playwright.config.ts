import { defineConfig, devices } from '@playwright/test';

/**
 * Tests run against the production build, not `next dev`.
 *
 * Everything worth asserting here — the robots meta tag, the canonical, the sitemap —
 * is emitted at build time by `generateMetadata`. A dev-server run would prove nothing
 * about what actually ships.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    // `next start`, so the assertions run against the same prerendered HTML a crawler
    // would receive.
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
