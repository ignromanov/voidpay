/**
 * ShareModal Widget - Public API
 *
 * Modal for sharing generated invoice links via URL, QR code, or social platforms.
 */

export { ShareModal } from './ui/ShareModal'
// LinkTab is exposed so non-modal surfaces (video demo, OG previews, etc.)
// can reuse the real URL/copy/share block without the Radix Dialog wrapper.
export { LinkTab } from './ui/LinkTab'
export type { ShareModalProps, ShareTab } from './lib/types'
