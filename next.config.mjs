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
    // Optimize memory usage
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
    ],
    // Use SWC for faster minification
    swcMinify: true,
  },

  webpack: (config) => {
    // Polyfills for Web3 libraries in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // Optimize for development
    if (process.env.NODE_ENV === 'development') {
      // Reduce concurrent module processing to save memory
      config.parallelism = 1
    }

    // Suppress warnings for optional dependencies not needed in browser
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    }

    return config
  },
}

export default nextConfig
