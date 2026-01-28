/**
 * Social Share Link Utilities
 *
 * Generates share URLs for various social platforms.
 */

/** Default share message for social platforms */
const SHARE_TEXT = 'I just sent you a crypto invoice via VoidPay.'

/**
 * Generate Telegram share URL
 *
 * @param invoiceUrl - The invoice URL to share
 * @param text - Optional custom share text
 * @returns Telegram share URL
 */
export function getTelegramShareUrl(invoiceUrl: string, text: string = SHARE_TEXT): string {
  return `https://t.me/share/url?url=${encodeURIComponent(invoiceUrl)}&text=${encodeURIComponent(text)}`
}

/**
 * Generate Twitter/X share URL
 *
 * @param invoiceUrl - The invoice URL to share
 * @param text - Optional custom share text
 * @returns Twitter share URL
 */
export function getTwitterShareUrl(invoiceUrl: string, text: string = SHARE_TEXT): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(invoiceUrl)}&text=${encodeURIComponent(text)}`
}

/**
 * Check if Web Share API is supported
 *
 * @returns true if native share is available
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/**
 * Share using native Web Share API
 *
 * @param invoiceUrl - The invoice URL to share
 * @param title - Share dialog title
 * @returns Promise that resolves when share completes or rejects on error
 */
export async function nativeShare(
  invoiceUrl: string,
  title: string = 'VoidPay Invoice'
): Promise<void> {
  if (!isWebShareSupported()) {
    throw new Error('Web Share API is not supported')
  }

  await navigator.share({
    title,
    text: SHARE_TEXT,
    url: invoiceUrl,
  })
}
