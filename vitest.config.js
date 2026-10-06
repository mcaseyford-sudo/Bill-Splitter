import { defineConfig } from 'vitest/config';

// Separate from vite.config.js so unit tests don't spin up the Worker runtime.
export default defineConfig({
  test: {
    include: ['src/**/*.test.js'],
  },
});
