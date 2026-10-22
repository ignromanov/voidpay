import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Detect if running in worktree and use parent directory as root
const isWorktree = __dirname.includes('/worktrees/')
const projectRoot = isWorktree ? resolve(__dirname, '../..') : __dirname

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Shade S3 (spec 095): allow WalletConnect verify iframe — pinned host, no wildcard.
            // frame-ancestors intentionally omitted (leaving it unchanged prevents /pay clickjacking).
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://verify.walletconnect.com",
          },
        ],
      },
    ]
  },

  reactStrictMode: true,
  typedRoutes: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features for better performance
  experimental: {
    // Inline critical CSS into <head> to eliminate render-blocking stylesheet requests
    inlineCss: true,
    // Optimize memory usage and tree-shaking for large dependencies
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      'wagmi',
      'viem',
      '@rainbow-me/rainbowkit',
      'framer-motion',
      '@web3icons/react',
      'lucide-react',
      'react-hook-form',
    ],
  },

  // Turbopack configuration
  turbopack: {
    // Set workspace root to project root (supports worktrees with symlinked node_modules)
    root: projectRoot,
  },

  // Webpack fallback for production builds (still uses webpack)
  webpack: (config) => {
    // Enable WebAssembly for brotli-wasm (codec compression)
    config.experiments = { ...config.experiments, asyncWebAssembly: true }

    // Polyfills for Web3 libraries in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      // Suppress MetaMask SDK React Native import warnings
      '@react-native-async-storage/async-storage': false,
      // Suppress WalletConnect pino-pretty import warnings
      'pino-pretty': false,
    }

    return config
  },
}

export default nextConfig
