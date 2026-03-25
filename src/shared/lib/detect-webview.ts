/**
 * Detects if the current browser is an in-app WebView
 * (Telegram, Instagram, Facebook, etc.) where wallet extensions
 * are unavailable and WalletConnect may not work properly.
 */

const WEBVIEW_PATTERNS = [
  /Telegram/i,
  /Instagram/i,
  /FBAN/i, // Facebook
  /FBAV/i, // Facebook
  /Line\//i,
  /Twitter/i,
  /Snapchat/i,
  /WeChat/i,
  /MicroMessenger/i,
] as const

export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return WEBVIEW_PATTERNS.some((pattern) => pattern.test(ua))
}
