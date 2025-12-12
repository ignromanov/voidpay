import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Detect if running in worktree and use parent directory as root
const isWorktree = __dirname.includes('/worktrees/')
const projectRoot = isWorktree ? resolve(__dirname, '../..') : __dirname

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features for better performance
  experimental: {
    // Optimize memory usage and tree-shaking for large dependencies
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      'wagmi',
      'viem',
      '@rainbow-me/rainbowkit',
    ],
  },

  // Turbopack configuration
  turbopack: {
    // Set workspace root to project root (supports worktrees with symlinked node_modules)
    root: projectRoot,
  },

  // Webpack fallback for production builds (still uses webpack)
  webpack: (config) => {
    // Polyfills for Web3 libraries in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },
}

export default nextConfig
