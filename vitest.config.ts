import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts', '**/*.spec.ts', 'src/app/api/e2e.test.ts'],
  },
  css: {
    postcss: {
      plugins: []
    }
  }
});
