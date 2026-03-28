/**
 * Invoice Feature Exports (FSD Public API)
 *
 * Feature-Sliced Design: Only export entities and components used by other features/widgets
 */

// Network configuration - re-export from entities for backward compatibility
// TODO: Remove after all consumers migrate to @/entities/network
export { NETWORK_CONFIG } from '@/entities/network'
export type { NetworkConfig } from '@/entities/network'

// UI components
export { TokenSelect, type TokenSelectProps } from './ui/TokenSelect'
export { InvoiceItemRow, type InvoiceItemRowProps } from './ui/InvoiceItemRow'
