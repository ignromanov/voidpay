/**
 * Custom Transport Re-export
 *
 * @deprecated Import from '@/shared/lib' instead
 *
 * This file re-exports transport functions from shared for backward compatibility.
 * All new code should import directly from shared.
 */

export {
  createCustomTransport,
  createChainTransport,
  createTransportsForChains,
} from '@/shared/lib'
