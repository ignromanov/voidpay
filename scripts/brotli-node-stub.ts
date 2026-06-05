/**
 * Node.js stub for brotli-wasm used only in the prebuild script.
 * Wraps Node's built-in zlib brotli so the codec runs without a WASM fetch.
 * Output is standard RFC 7932 Brotli — byte-compatible with brotli-wasm output.
 */
import { brotliCompressSync, brotliDecompressSync } from 'node:zlib'

const nodeBrotli = {
  compress: (data: Uint8Array, _opts?: { quality?: number }): Uint8Array => {
    return new Uint8Array(brotliCompressSync(Buffer.from(data)))
  },
  decompress: (data: Uint8Array): Uint8Array => {
    return new Uint8Array(brotliDecompressSync(Buffer.from(data)))
  },
}

// Match the brotli-wasm default export shape: default is a Promise resolving to the API
export default Promise.resolve(nodeBrotli)
export const compress = nodeBrotli.compress
export const decompress = nodeBrotli.decompress
