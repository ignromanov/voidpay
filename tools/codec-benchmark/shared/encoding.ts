// --- Base62 ---
const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function encodeBase62(bytes: Uint8Array): string {
  if (bytes.length === 0) return ''
  let num = 0n
  for (let i = 0; i < bytes.length; i++) {
    num = num * 256n + BigInt(bytes[i]!)
  }
  if (num === 0n) return BASE62_ALPHABET[0]!
  let result = ''
  while (num > 0n) {
    result = BASE62_ALPHABET[Number(num % 62n)]! + result
    num = num / 62n
  }
  // Preserve leading zeros
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result = BASE62_ALPHABET[0]! + result
  }
  return result
}

// --- Base64url (RFC 4648 §5) ---
export function encodeBase64url(bytes: Uint8Array): string {
  if (bytes.length === 0) return ''
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
