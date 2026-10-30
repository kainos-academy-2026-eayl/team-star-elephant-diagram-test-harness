import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: './features/**/*.feature',
  steps: ['./steps/**/*.ts'],
});

export default defineConfig({
  testDir,
  projects: [
    { name: 'bdd' },
    { name: 'tests', testDir: './tests' },
  ],
  use: {
    baseURL: 'http://0.0.0.0:3000/',
    testIdAttribute: 'id',
    ignoreHTTPSErrors: true
  },
});
