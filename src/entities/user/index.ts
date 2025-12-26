/**
 * User Entity - Public API
 *
 * Exposes user-related state management for payer information.
 */

// Payer store (from model layer)
export { usePayerStore } from './model/payer-store'

// Types
export type { PayerStoreState, PayerStoreActions } from './model/payer-store'
