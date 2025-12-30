import * as lzString from 'lz-string'

/**
 * Compresses a string using LZ-based compression optimized for URLs.
 * Uses lz-string's compressToEncodedURIComponent.
 *
 * @deprecated Use Binary V3 codec instead: `encodeBinaryV3` from `@/shared/lib/binary-codec`.
 * Binary V3 provides 40-50% better compression with privacy-preserving hash fragments.
 * This will be removed in v2.0.
 */
export const compress = (data: string): string => {
  return lzString.compressToEncodedURIComponent(data)
}

/**
 * Decompresses a string compressed with compress().
 * Returns null if decompression fails or input is invalid.
 *
 * @deprecated Use Binary V3 codec instead: `decodeBinaryV3` from `@/shared/lib/binary-codec`.
 * This will be removed in v2.0.
 */
export const decompress = (compressed: string): string | null => {
  return lzString.decompressFromEncodedURIComponent(compressed)
}
