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

    // Isolation and determinism for CI compatibility
    pool: 'forks',
    isolate: true, // Enable isolation to reset state between test files
    sequence: {
      shuffle: false, // Deterministic test order
    },
    fileParallelism: true, // Keep parallel but isolated

    // Exclude worktrees from test runs (they have their own test setup)
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/worktrees/**', // Exclude worktrees - they should be tested in their own context
      '**/assets/**',
    ],

    // Auto-mock configuration
    // When a module is imported and __mocks__/<module>.ts exists, use the mock
    alias: {
      'framer-motion': path.resolve(__dirname, '__mocks__/framer-motion.tsx'),
      sonner: path.resolve(__dirname, '__mocks__/sonner.tsx'),
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'dist/',
        'worktrees/',
        '__mocks__/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types.ts',
        '**/index.ts',
        '**/index.tsx',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
    },
  },
})
