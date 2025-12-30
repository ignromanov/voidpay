/**
 * Network Entity - Public API
 *
 * Exposes network configuration and types for blockchain networks
 * supported by VoidPay.
 */

// Network chain configuration (from config layer)
export { NETWORKS, NETWORK_CODES, NETWORK_CODES_REVERSE } from './config/networks'
export type { NetworkId } from './config/networks'

// Network UI configuration (from config layer)
export { NETWORK_CONFIG } from './config/ui-config'
export type { NetworkConfig } from './config/ui-config'

// Network helper functions (from lib layer)
export { getExplorerUrl, getNetworkName } from './lib/helpers'
