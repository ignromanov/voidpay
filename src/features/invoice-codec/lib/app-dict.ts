/**
 * Application-level text dictionary — pre-Brotli substitution for common patterns.
 *
 * Replaces common patterns with 1-byte control chars (0x02-0x0A range),
 * which are unused in valid UTF-8 invoice text. Applied before compression
 * to improve compression ratio on repetitive strings.
 *
 * Sorted by length descending (longest match first) to avoid partial replacements.
 */

// Sorted by length descending (longest match first)
const DICT_ENTRIES: [string, number][] = [
  ['@outlook.com', 0x02],
  ['@gmail.com', 0x03],
  ['@yahoo.com', 0x04],
  ['https://', 0x05],
  ['Invoice', 0x06],
  ['Payment', 0x07],
  ['.eth', 0x08],
  ['.com', 0x09],
  ['0x', 0x0A],
]

/** Substitute known patterns with 1-byte codes before compression */
export function applyDict(input: Uint8Array): Uint8Array {
  let text = new TextDecoder().decode(input)
  for (const [pattern, code] of DICT_ENTRIES) {
    text = text.replaceAll(pattern, String.fromCharCode(code))
  }
  return new TextEncoder().encode(text)
}

/** Reverse substitution after decompression */
export function reverseDict(input: Uint8Array): Uint8Array {
  let text = new TextDecoder().decode(input)
  for (const [pattern, code] of [...DICT_ENTRIES].reverse()) {
    text = text.replaceAll(String.fromCharCode(code), pattern)
  }
  return new TextEncoder().encode(text)
}
