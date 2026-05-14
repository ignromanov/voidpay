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

/**
 * Detects Telegram WebView via runtime globals injected by Telegram itself.
 *
 * UA-based detection misses iOS Telegram entirely (it strips the UA token).
 * These globals are present in both Mini App and chat-link WebView contexts.
 *
 * References:
 *   - TelegramMessenger/Telegram-iOS#736
 *   - https://github.com/shalanah/inapp-spy (MIT)
 */
export function isTelegramWebView(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'TelegramWebviewProxy' in window ||
    'TelegramWebviewProxyProto' in window ||
    'TelegramWebview' in window
  )
}
