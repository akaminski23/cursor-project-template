import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/__tests__/setup.ts'],
    passWithNoTests: true,
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app')
    }
  }
});
