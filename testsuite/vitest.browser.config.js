import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/utils/setup.js'],
    include: ['test/*.js'],
    testTimeout: 10000,
    reporters: ['verbose'],
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium', headless: true }],
    },
  },
});
