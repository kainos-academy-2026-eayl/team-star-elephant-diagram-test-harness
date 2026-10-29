
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: './day-2/features/**/*.feature',
  steps: ['./day-2/steps/**/*.ts'],
});

export default defineConfig({
  testDir,
  projects: [
    { name: 'bdd' },
    { name: 'tests', testDir: './tests' },
  ],
  use: {
    baseURL: 'https://practice.expandtesting.com/',
    testIdAttribute: 'id',
    ignoreHTTPSErrors: true
  },
});
