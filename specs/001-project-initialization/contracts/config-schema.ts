/**
 * Configuration Schema Contracts
 *
 * This file defines TypeScript interfaces that act as contracts between
 * different layers of the VoidPay application. These schemas ensure type
 * safety and consistency across the codebase.
 *
 * Constitutional Compliance:
 * - Principle I: No backend state (configs are static or client-side only)
 * - Principle IV: Schema versioning (future invoice schemas will extend this pattern)
 * - Technology Stack: TypeScript strict mode (all fields explicitly typed)
 */

// ============================================================================
// Network Configuration
// ============================================================================

/**
 * Represents a supported blockchain network
 * Location: src/entities/network/model/types.ts
 */
export interface NetworkConfig {
  /** Chain ID (Ethereum: 1, Arbitrum: 42161, Optimism: 10, Polygon: 137) */
  chainId: number

  /** Human-readable network name */
  name: string

  /** Native currency details */
  nativeCurrency: {
    name: string      // e.g., "Ether", "MATIC"
    symbol: string    // e.g., "ETH", "MATIC"
    decimals: number  // Always 18 for MVP networks
  }

  /** Block explorer configuration */
  blockExplorer: {
    name: string      // e.g., "Etherscan", "Arbiscan"
    url: string       // Base URL (e.g., "https://etherscan.io")
  }

  /** Visual theme for network display */
  theme: {
    color: string     // Hex color (e.g., "#627EEA" for Ethereum)
    icon?: string     // Optional network logo URL or path
  }
}

// ============================================================================
// User Preferences (LocalStorage)
// ============================================================================

/**
 * User-configurable settings persisted in browser LocalStorage
 * Location: src/entities/user/model/types.ts
 */
export interface UserPreferences {
  /** Default network chain ID (references NetworkConfig.chainId) */
  defaultNetwork: number

  /** Preferred token symbol (e.g., "USDC", "USDT") */
  defaultCurrency: string

  /** UI theme preference (MVP: dark only, future: light mode) */
  theme: 'dark' | 'light'

  /** Language/region code (BCP 47, e.g., "en-US") */
  locale: string

  /** Currency formatting preferences */
  currencyFormat: {
    decimals: number           // Decimal places (0-18)
    thousandsSeparator: string // "," or "."
    decimalSeparator: string   // "." or ","
  }
}

/**
 * Default user preferences (fallback when LocalStorage is empty)
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultNetwork: 1, // Ethereum
  defaultCurrency: 'USDC',
  theme: 'dark',
  locale: 'en-US',
  currencyFormat: {
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
}

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Required environment variables for RPC providers and app configuration
 * Location: Environment variables (.env.local, Vercel dashboard)
 *
 * NOTE: This is a TypeScript representation of env vars, not runtime config.
 * Actual validation happens in src/shared/lib/env.ts
 */
export interface EnvironmentConfig {
  // RPC Endpoints - Alchemy (Primary)
  NEXT_PUBLIC_ALCHEMY_ETH_URL: string
  NEXT_PUBLIC_ALCHEMY_ARB_URL: string
  NEXT_PUBLIC_ALCHEMY_OPT_URL: string
  NEXT_PUBLIC_ALCHEMY_POLY_URL: string

  // RPC Endpoints - Infura (Fallback, server-only)
  ALCHEMY_ETH_URL?: string  // Server-only (no NEXT_PUBLIC prefix)
  ALCHEMY_ARB_URL?: string
  ALCHEMY_OPT_URL?: string
  ALCHEMY_POLY_URL?: string

  INFURA_ETH_URL?: string
  INFURA_ARB_URL?: string
  INFURA_OPT_URL?: string
  INFURA_POLY_URL?: string

  // App Configuration
  NEXT_PUBLIC_APP_URL?: string      // Base URL (defaults to localhost in dev)
  NEXT_PUBLIC_VERCEL_ENV?: string   // Vercel environment (production, preview, development)
}

/**
 * Validated and typed environment variables
 * Location: src/shared/lib/env.ts
 */
export interface ValidatedEnv {
  rpcUrls: {
    [chainId: number]: {
      alchemy: string
      infura?: string  // Optional fallback
    }
  }
  appUrl: string
  isDevelopment: boolean
  isProduction: boolean
  isPreview: boolean
}

// ============================================================================
// Font Configuration
// ============================================================================

/**
 * Geist font family configuration
 * Location: app/layout.tsx (imported from 'geist/font')
 *
 * NOTE: This is a TypeScript representation. Actual font config is handled
 * by Next.js font optimization (`next/font`).
 */
export interface FontConfig {
  /** Geist Sans (UI text, headings) */
  sans: {
    variable: string  // CSS variable name (e.g., "--font-geist-sans")
  }

  /** Geist Mono (addresses, amounts, code) */
  mono: {
    variable: string  // CSS variable name (e.g., "--font-geist-mono")
  }
}

// ============================================================================
// Build Configuration
// ============================================================================

/**
 * TypeScript compiler options
 * Location: tsconfig.json
 */
export interface TypeScriptConfig {
  strict: true  // Constitutional requirement
  noUncheckedIndexedAccess: true
  exactOptionalPropertyTypes: true
  noImplicitReturns: true
  noFallthroughCasesInSwitch: true
  paths: {
    '@/*': ['./src/*']
  }
}

/**
 * Next.js configuration
 * Location: next.config.mjs
 */
export interface NextConfig {
  experimental?: {
    typedRoutes?: boolean  // Type-safe routing
  }
  compiler?: {
    removeConsole?: boolean  // Remove console.* in production
  }
}

/**
 * Tailwind CSS configuration
 * Location: tailwind.config.ts
 */
export interface TailwindConfig {
  darkMode: 'class' | 'media'
  content: string[]
  theme: {
    extend: {
      colors: {
        'electric-violet': string
        background: string
        foreground: string
        primary: {
          DEFAULT: string
          foreground: string
        }
        // ... other shadcn/ui color tokens
      }
      fontFamily: {
        sans: string[]
        mono: string[]
      }
    }
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Supported chain IDs (constitutional lock)
 */
export const SUPPORTED_CHAIN_IDS = [1, 42161, 10, 137] as const
export type SupportedChainId = typeof SUPPORTED_CHAIN_IDS[number]

/**
 * Type guard for chain ID validation
 */
export function isSupportedChainId(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as SupportedChainId)
}

/**
 * Type guard for user preferences validation
 */
export function isValidUserPreferences(data: unknown): data is UserPreferences {
  if (typeof data !== 'object' || data === null) return false

  const pref = data as Partial<UserPreferences>

  return (
    typeof pref.defaultNetwork === 'number' &&
    isSupportedChainId(pref.defaultNetwork) &&
    typeof pref.defaultCurrency === 'string' &&
    (pref.theme === 'dark' || pref.theme === 'light') &&
    typeof pref.locale === 'string' &&
    typeof pref.currencyFormat === 'object' &&
    pref.currencyFormat !== null &&
    typeof pref.currencyFormat.decimals === 'number' &&
    pref.currencyFormat.decimals >= 0 &&
    pref.currencyFormat.decimals <= 18 &&
    typeof pref.currencyFormat.thousandsSeparator === 'string' &&
    typeof pref.currencyFormat.decimalSeparator === 'string'
  )
}

// ============================================================================
// RPC Proxy Types (corresponds to /api/rpc endpoint)
// ============================================================================

/**
 * JSON-RPC 2.0 request format
 * Endpoint: POST /api/rpc
 */
export interface JsonRpcRequest {
  jsonrpc: '2.0'
  method: string
  params: unknown[]
  id: number | string
  chainId: SupportedChainId
}

/**
 * JSON-RPC 2.0 success response
 */
export interface JsonRpcSuccessResponse<T = unknown> {
  jsonrpc: '2.0'
  result: T
  id: number | string
}

/**
 * JSON-RPC 2.0 error response
 */
export interface JsonRpcErrorResponse {
  jsonrpc: '2.0'
  error: {
    code: number
    message: string
    data?: unknown
  }
  id: number | string
}

/**
 * Union type for all possible RPC responses
 */
export type JsonRpcResponse<T = unknown> =
  | JsonRpcSuccessResponse<T>
  | JsonRpcErrorResponse

/**
 * Proxy-level error (validation, missing env vars, etc.)
 */
export interface RpcProxyError {
  error: string
  chainId?: number
}

// ============================================================================
// Wagmi Configuration Types
// ============================================================================

/**
 * Network configuration for Wagmi (extends NetworkConfig with RPC URLs)
 * Location: src/shared/config/wagmi.ts
 */
export interface WagmiNetworkConfig extends NetworkConfig {
  rpcUrls: {
    alchemy: string  // From environment variables
    infura?: string  // Optional fallback
  }
}

// ============================================================================
// Exports Summary
// ============================================================================

/**
 * This module exports:
 *
 * Configuration Schemas:
 * - NetworkConfig: Blockchain network configuration
 * - UserPreferences: Client-side user settings (LocalStorage)
 * - EnvironmentConfig: Required environment variables
 * - ValidatedEnv: Typed and validated env vars
 * - FontConfig: Geist font configuration
 * - TypeScriptConfig: Compiler options
 * - NextConfig: Next.js settings
 * - TailwindConfig: Tailwind CSS theme
 *
 * RPC Types:
 * - JsonRpcRequest: Request format for /api/rpc
 * - JsonRpcResponse: Response format (success or error)
 * - RpcProxyError: Proxy-level errors
 *
 * Validation:
 * - SUPPORTED_CHAIN_IDS: Allowed chain IDs
 * - isSupportedChainId: Type guard for chain validation
 * - isValidUserPreferences: Type guard for user pref validation
 *
 * Defaults:
 * - DEFAULT_USER_PREFERENCES: Fallback user settings
 *
 * Usage:
 * Import these types in relevant modules to ensure type safety and
 * consistency across the application. All configuration changes should
 * be reflected in these schemas first, then propagated to implementation.
 */
