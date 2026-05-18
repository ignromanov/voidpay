import path from 'node:path'
import { Config } from '@remotion/cli/config'
import { enableTailwind } from '@remotion/tailwind-v4'

// R23-T6 audit hardening (2026-05-18):
// - codec/pixelFormat/muted/openGlRenderer made explicit for social/CI compatibility
// - concurrency=4 per render so that parallel video:render:all (4 simultaneous)
//   saturates 16 logical cores cleanly (4 renders × 4 workers = 16 threads)

// Remotion's config loader compiles to CJS — import.meta is unavailable.
// CLI always runs from project root, so process.cwd() is the repo root.
const ROOT = process.cwd()

Config.setCodec('h264') // explicit — Twitter/Telegram require h264
Config.setChromiumOpenGlRenderer('swangle') // cross-env render stability (local ↔ future CI)
Config.setConcurrency(4) // 4 renders × 4 workers = 16 threads (matches 16 logical cores)
Config.setMuted(true) // no audio yet; remove when voiceover (ElevenLabs) lands
Config.setPixelFormat('yuv420p') // only format guaranteed compatible with social/iOS hardware decoders

Config.setEntryPoint('src/video/src/Root.tsx')
// Unified public dir — same /textures/*, /fonts/* paths as Next.js,
// so widgets imported from @/widgets/* resolve assets identically.
Config.setPublicDir('public')
Config.setVideoImageFormat('jpeg')

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
