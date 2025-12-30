/**
 * Base62 Encoding/Decoding
 * Alphabet: 0-9a-zA-Z (62 chars, URL-safe without special chars)
 * More compact than Base64 for URLs
 */

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Encodes a Uint8Array to Base62 string
 */
export function encodeBase62(bytes: Uint8Array): string {
  if (bytes.length === 0) return ''

  // Convert byte array to BigInt
  let num = BigInt(0)
  for (let i = 0; i < bytes.length; i++) {
    num = num * BigInt(256) + BigInt(bytes[i]!)
  }

  // Convert to base62
  if (num === BigInt(0)) return ALPHABET[0]!

  let result = ''
  while (num > BigInt(0)) {
    const digit = ALPHABET[Number(num % BigInt(62))]
    result = (digit ?? '') + result
    num = num / BigInt(62)
  }

  // Preserve leading zeros
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result = ALPHABET[0]! + result
  }

  return result
}

/**
 * Decodes a Base62 string to Uint8Array
 */
export function decodeBase62(str: string): Uint8Array {
  if (str.length === 0) return new Uint8Array(0)

  // Count leading zeros
  let leadingZeros = 0
  for (let i = 0; i < str.length && str[i] === ALPHABET[0]; i++) {
    leadingZeros++
  }

  // Convert from base62 to BigInt
  let num = BigInt(0)
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const digit = ALPHABET.indexOf(char!)
    if (digit === -1) {
      throw new Error(`Invalid Base62 character: ${char}`)
    }
    num = num * BigInt(62) + BigInt(digit)
  }

  // Convert to bytes
  const bytes: number[] = []
  while (num > BigInt(0)) {
    bytes.unshift(Number(num % BigInt(256)))
    num = num / BigInt(256)
  }

  // Add leading zeros
  for (let i = 0; i < leadingZeros; i++) {
    bytes.unshift(0)
  }

  return new Uint8Array(bytes)
}
