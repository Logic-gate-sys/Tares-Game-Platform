/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        functions: 70,
        lines: 75
      }, // atleast 60% test coverage required
      enabled: true,
      cleanOnRerun: false, // in watch mode 
      clean: true, // clean before running test
      provider: 'v8',
      reportsDirectory: './test/coverage'
    },
    exclude: ["./node_modules", "./dist"],
    globals: true,
    pool: "threads",
    testTimeout: 15_000, 
    globalSetup: './tests/globalSetup.ts',
    projects: [
      {
        test: {
          name: 'unit',
          include: ["./tests/unit/*.{test, spec}.ts"]
        }
      },
      {
        test: {
          name: 'component/integration',
          include: ["./tests/component_integretion/*.{test, spec}.ts(x)?"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{browser: 'chromium', name:'Chrome'}]
          }
        }
      },
      {
        test: {
          name: 'e2e',
          include: ["./tests/e2e/*.{test, spec}.ts(x)?"]
        }
      }
    ]
  }
})
