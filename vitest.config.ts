import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Detection modules talk to browser globals directly, which the tests stub
    // per-case. A real DOM would get in the way rather than help.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
