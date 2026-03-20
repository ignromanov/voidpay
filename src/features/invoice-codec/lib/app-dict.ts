/**
 * Application-level text dictionary — pre-Brotli substitution for common patterns.
 *
 * Replaces common patterns with 1-byte control chars (0x02-0x1F range),
 * which are unused in valid UTF-8 invoice text. Applied before compression
 * to improve compression ratio on repetitive strings.
 *
 * Sorted by length descending (longest match first) to avoid partial replacements.
 *
 * Selection criteria (from research):
 * - Patterns ≥ 4 bytes: Brotli static dict starts at length 4, shorter patterns
 *   are efficiently handled by LZ77 alone
 * - ROI = (pattern.length - 1) × expected_frequency — higher is better
 * - Avoid patterns that break longer Brotli matches (e.g., short suffixes)
 *
 * Removed: '0x' (2 chars, ROI ~0.15 — too short), '.eth' (ROI 0.2 — Brotli handles it)
 * Added: 'INV-' (ROI 2.4), 'development' (ROI 2.0), '@hotmail.com' (ROI 1.1), 'consulting' (ROI 0.5)
 */

// Sorted by length descending (longest match first)
const DICT_ENTRIES: [string, number][] = [
  ['@outlook.com', 0x02],
  ['@hotmail.com', 0x0c],
  ['development', 0x0d],
  ['consulting', 0x0e],
  ['@gmail.com', 0x03],
  ['@yahoo.com', 0x04],
  ['https://', 0x05],
  ['Invoice', 0x06],
  ['Payment', 0x07],
  ['.com', 0x09],
  ['INV-', 0x0f],
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
  if (text.length > 4096) {
    throw new Error(`Dictionary expansion exceeds maximum field size: ${text.length}`)
  }
  return new TextEncoder().encode(text)
}
