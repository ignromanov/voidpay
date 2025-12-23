'use client'

/**
 * Application Providers Re-export
 *
 * @deprecated Import from '@/shared/providers' instead
 *
 * This file re-exports Web3Provider from shared for backward compatibility.
 * All new code should import directly from shared.
 */

export { Web3Provider } from '@/shared/providers'

/**
 * Providers - Alias for Web3Provider
 *
 * Used in layout.tsx for consistent naming.
 */
export { Web3Provider as Providers } from '@/shared/providers'
