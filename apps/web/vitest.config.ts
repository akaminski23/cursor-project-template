import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'app/**/*.test.ts'],
    passWithNoTests: true
  },
  resolve: {
    alias: {
      '@/src': path.resolve(__dirname, 'src')
    }
  }
});
