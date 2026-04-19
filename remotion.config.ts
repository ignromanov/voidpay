import path from 'node:path'
import { Config } from '@remotion/cli/config'
import { enableTailwind } from '@remotion/tailwind-v4'

// Remotion's config loader compiles to CJS — import.meta is unavailable.
// CLI always runs from project root, so process.cwd() is the repo root.
const ROOT = process.cwd()

Config.setEntryPoint('src/video/src/Root.tsx')
// Unified public dir — same /textures/*, /fonts/* paths as Next.js,
// so widgets imported from @/widgets/* resolve assets identically.
Config.setPublicDir('public')
Config.setVideoImageFormat('jpeg')
Config.setConcurrency(4)

Config.overrideWebpackConfig((currentConfiguration) => {
  const tailwindEnabled = enableTailwind(currentConfiguration)
  return {
    ...tailwindEnabled,
    resolve: {
      ...tailwindEnabled.resolve,
      alias: {
        ...tailwindEnabled.resolve?.alias,
        // Match root tsconfig: @/* → src/*
        '@': path.resolve(ROOT, 'src'),
      },
      // Lets webpack resolve absolute `/path/*` asset URLs (e.g.
      // `bg-[url('/textures/cream-pixels.png')]` in widgets imported from the
      // main app) against the public dir, mirroring Next.js convention.
      roots: [path.resolve(ROOT, 'public')],
      fallback: {
        ...tailwindEnabled.resolve?.fallback,
        // Shim Node/Next-only polyfills unused in Remotion's headless Chromium
        fs: false,
        net: false,
        tls: false,
        'pino-pretty': false,
        '@react-native-async-storage/async-storage': false,
      },
    },
  }
})
