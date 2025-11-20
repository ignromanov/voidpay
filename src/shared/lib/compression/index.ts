import * as lzString from 'lz-string';

/**
 * Compresses a string using LZ-based compression optimized for URLs.
 * Uses lz-string's compressToEncodedURIComponent.
 */
export const compress = (data: string): string => {
  return lzString.compressToEncodedURIComponent(data);
};

/**
 * Decompresses a string compressed with compress().
 * Returns null if decompression fails or input is invalid.
 */
export const decompress = (compressed: string): string | null => {
  return lzString.decompressFromEncodedURIComponent(compressed);
};

