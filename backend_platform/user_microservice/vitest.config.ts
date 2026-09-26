import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = resolve(fileURLToPath(new URL('.', import.meta.url)), 'src');

export default defineConfig({
  resolve: {
    alias: {
      '#config': resolve(src, 'config'),
      '#controllers': resolve(src, 'controllers'),
      '#db': resolve(src, 'db'),
      '#middlewares': resolve(src, 'middlewares'),
      '#repositories': resolve(src, 'repositories'),
      '#routes': resolve(src, 'routes'),
      '#schemas': resolve(src, 'schemas'),
      '#services': resolve(src, 'services'),
      '#utils': resolve(src, 'utils'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    globalSetup: './tests/setups/globalSetup.ts',
    setupFiles: ['./tests/setups/setup.ts'],
  },
});