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
      'framer-motion': path.resolve(__dirname, 'src/shared/lib/test-utils/mocks/framer-motion.tsx'),
      sonner: path.resolve(__dirname, 'src/shared/lib/test-utils/mocks/sonner.tsx'),
      // Force Node.js entry for brotli-wasm (web entry uses fetch for WASM loading)
      'brotli-wasm': path.resolve(__dirname, 'node_modules/brotli-wasm/index.node.js'),
    },

    // Split projects to prevent WASM CPU starvation.
    //
    // Root cause: oracle.test.ts + hardening.test.ts import @void-layer/codec at
    // the top level, which triggers eager WASM initialisation in every parallel
    // fork worker. Under full-suite coverage runs (16 logical cores) this saturates
    // the CPU and starves the module-transform pipeline, causing BelowFoldSections
    // dynamic-import to time out.
    //
    // Fix: isolate WASM-heavy files in a separate project with fileParallelism:false
    // (= maxWorkers:1). One WASM worker runs at a time, leaving CPU headroom for
    // the main project's transform workers. Coverage aggregates across both projects.
    projects: [
      {
        // All tests except WASM-heavy oracle/hardening — full parallelism.
        extends: true,
        test: {
          name: 'main',
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/worktrees/**',
            '**/assets/**',
            '**/oracle.test.ts',
            '**/hardening.test.ts',
          ],
        },
      },
      {
        // oracle.test.ts + hardening.test.ts — real @void-layer/codec, no mocks.
        // fileParallelism:false serialises into 1 worker to cap WASM-init CPU spike.
        extends: true,
        test: {
          name: 'wasm-oracle',
          include: ['**/oracle.test.ts', '**/hardening.test.ts'],
          fileParallelism: false,
        },
      },
    ],

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

        // === Remotion video compositions (visual output, tested via Studio review) ===
        // Scenes/components render Remotion primitives at frame-time; not unit-testable in vitest.
        // Excluding to surface true app-code coverage (~81%) instead of diluted 74% total.
        'src/video/**',

        // WebGL/canvas code - requires canvas environment, tested via E2E
        '**/network-background/lib/generate-shapes.ts',
        '**/network-background/lib/calculate-shapes.ts',
        '**/network-background/NetworkBackground.tsx',
        // Complex landing components with dynamic imports
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
