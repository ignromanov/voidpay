import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      root: __dirname,
      projects: ['./tsconfig.test.json'],
    }),
  ],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    root: __dirname,

    // Isolation
    isolate: true,
    sequence: { shuffle: false },
    fileParallelism: true,

    exclude: ['**/node_modules/**', '**/dist/**', '**/worktrees/**', '**/assets/**'],

    alias: {
      'framer-motion': path.resolve(__dirname, '__mocks__/framer-motion.tsx'),
      sonner: path.resolve(__dirname, '__mocks__/sonner.tsx'),
    },

    // MINIMAL coverage config
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // Simple pattern without **/ prefix
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'node_modules/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/index.ts',
        '**/index.tsx',
      ],
    },
  },
})
