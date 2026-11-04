import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './fixtures/env';

const testDir = defineBddConfig({
  features: './features/**/*.feature',
  steps: ['./steps/**/*.ts'],
});

export default defineConfig({
  testDir,
  // Each test registers its own customer, so tests can run in parallel without sharing baskets.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    { name: 'bdd' },
    { name: 'tests', testDir: './tests' },
  ],
  use: {
    // Login cookies are Secure, which browsers only accept over plain HTTP on localhost.
    baseURL: `${env.frontendUrl}/`,
    testIdAttribute: 'id',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
  },
});
