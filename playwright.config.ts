import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import type { TestOptions } from '@fixtures/pages';

// Load environment variables from .env before anything else reads them.
dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';
const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

const isCI = !!process.env.CI;

/**
 * Browser matrix.
 * Locally we only run chromium for speed; CI fans out across firefox, webkit
 * and one mobile viewport. Each browser yields a `no-auth` and `authenticated`
 * project (the two-project split is replicated per browser).
 */
// const browsers = isCI
//   ? [
//       { name: 'chromium', use: devices['Desktop Chrome'] },
//       { name: 'firefox', use: devices['Desktop Firefox'] },
//       { name: 'webkit', use: devices['Desktop Safari'] },
//       { name: 'mobile-chrome', use: devices['Pixel 5'] },
//     ]
//   : [{ name: 'chromium', use: devices['Desktop Chrome'] }];

const browsers =
   [
     { name: 'chromium', use: devices['Desktop Chrome'] },
     { name: 'firefox', use: devices['Desktop Firefox'] },
     { name: 'webkit', use: devices['Desktop Safari'] },
     { name: 'mobile-Mozilla', use: devices['iPhone 15'] },
    ]
 
const testProjects = browsers.flatMap((browser) => [
  {
    name: `no-auth-${browser.name}`,
    testDir: './tests/public',
    use: { ...browser.use },
  },
  {
    name: `authenticated-${browser.name}`,
    testDir: './tests/authenticated',
    dependencies: ['setup'],
    use: { ...browser.use, storageState: '.auth/customer.json' },
  },
]);

export default defineConfig<TestOptions>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  globalSetup: './global.setup.ts',
  reporter: isCI
    ? [['list'], ['blob'], ['junit', { outputFile: 'test-results/junit.xml' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    apiURL: API_URL,
    testIdAttribute: 'data-test',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testDir: './tests',
      testMatch: /.*\.setup\.ts/,
    },
    ...testProjects,
  ],
});
