/**
 * Base64url Encoding/Decoding (RFC 4648 §5)
 * Alphabet: A-Za-z0-9-_ (URL-safe, no padding)
 */

/**
 * Encodes a Uint8Array to Base64url string (no padding).
 */
export function encodeBase64url(bytes: Uint8Array): string {
  if (bytes.length === 0) return ''
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Decodes a Base64url string (with or without padding) to Uint8Array.
 */
export function decodeBase64url(str: string): Uint8Array {
  if (str.length === 0) return new Uint8Array(0)
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad === 2) base64 += '=='
  else if (pad === 3) base64 += '='
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
