import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// Use import.meta.dirname for worktree compatibility (Node 20+)
const rootDir = import.meta.dirname

export default defineConfig({
  plugins: [react(), tsconfigPaths({ root: rootDir })],
  test: {
    // Explicitly define single project to prevent IDE from discovering worktree configs
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          root: rootDir,
          environment: 'jsdom',
          globals: true,
          setupFiles: [path.join(rootDir, 'vitest.setup.ts')],
          exclude: ['**/node_modules/**', '**/dist/**', '**/worktrees/**', '**/assets/**'],
        },
      },
    ],
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
