import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// Use import.meta.dirname for worktree compatibility (Node 20+)
const rootDir = import.meta.dirname

export default defineConfig({
  plugins: [react(), tsconfigPaths({ root: rootDir })],
  test: {
    root: rootDir,
    // happy-dom is 2-3x lighter than jsdom
    environment: 'happy-dom',
    globals: true,
    setupFiles: [path.join(rootDir, 'vitest.setup.ts')],
    exclude: ['**/node_modules/**', '**/dist/**', '**/worktrees/**', '**/assets/**'],
    // Use forks pool for better memory isolation between workers
    pool: 'forks',
    // Limit parallelism to reduce CPU/memory pressure
    maxWorkers: 4,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules',
        'coverage',
        'assets',
        '.next',
        '**/*.config.*',
        '**/*.d.ts',
        '.specify/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
