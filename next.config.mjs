import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Detect if running in worktree and use parent directory as root
const isWorktree = __dirname.includes('/worktrees/')
const projectRoot = isWorktree ? resolve(__dirname, '../..') : __dirname

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/v/:match*',
        destination: 'https://m.voidpay.xyz/:match*',
      },
    ]
  },

  // Single source of truth for response headers (Cloudflare Workers has no vercel.json).
  // Values are ported verbatim from the former vercel.json; changes need a security review.
  async headers() {
    // Build-time switch: the dev deploy (dev.voidpay.xyz) must never be indexed.
    const devNoindex =
      process.env.DEPLOY_ENV === 'dev'
        ? [{ source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
        : []
    return [
      ...devNoindex,
      {
        source: '/pay/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/invoice/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/history/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/og-image/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/api/rpc',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/api/transfers',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), accelerometer=(), gyroscope=(), magnetometer=(), usb=(), serial=(), hid=(), display-capture=(), autoplay=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.walletconnect.com https://api.web3modal.org; font-src 'self' data:; connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://api.web3modal.org https://formspree.io; frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'",
          },
        ],
      },
    ]
  },

  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
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
