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

        // === Type definitions only (no runtime code) ===
        '**/types.ts',
        '**/model/types.ts',

        // === Static constants (no logic to test) ===
        '**/constants.ts',
        '**/constants/**',
        'src/shared/ui/constants/**',
        'src/widgets/landing/constants/**',
        'src/widgets/network-background/lib/constants.ts',
        'src/entities/invoice/lib/constants.ts',

        // === Test infrastructure (testing the tests) ===
        'src/shared/test-utils/**',
        'src/shared/lib/test-utils/**',
        '**/invoice-fixtures.ts',
        '**/invoice-generator.ts',

        // === Environment config (env vars, URLs) ===
        'src/shared/config/env.ts',
        'src/shared/config/urls.ts',
        'src/shared/config/storage-keys.ts',

        // === Next.js pages (tested via E2E/Playwright) ===
        'src/app/**/page.tsx',
        'src/app/layout.tsx',
        'src/app/error.tsx',

        // === OG image generation (edge runtime, Vercel-specific) ===
        'src/app/og-image-utils.tsx',
        'src/app/opengraph-image.tsx',
        'src/app/twitter-image.tsx',

        // === SVG generators (visual output, no logic) ===
        'src/widgets/network-background/lib/svg-generators.ts',

        // PixiJS/WebGL code - requires canvas environment, tested via E2E
        '**/network-background/lib/pixi/**',
        '**/network-background/lib/generate-shapes.ts',
        '**/network-background/lib/calculate-shapes.ts',
        '**/network-background/NetworkBackground.tsx',
        '**/network-background/PageLayout.tsx',
        '**/network-background/PixiBackground.tsx',
        // Complex landing components with dynamic imports
        '**/landing/ui/AnimatedBackground.tsx',
        '**/landing/ui/LandingContent.tsx',
        '**/landing/ui/BelowFoldSections.tsx',
        // Shape generators (canvas-dependent)
        '**/network-background/lib/shape-generators.ts',
        // Hook using matchMedia (testing environment limitations)
        '**/hooks/use-reduced-motion.ts',
      ],
    },
  },
})
