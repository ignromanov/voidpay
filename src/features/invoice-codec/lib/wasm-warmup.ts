/**
 * WASM warm-up: pre-instantiate the void_layer_codec WASM module during browser
 * idle time so the first real codec call (encodeInvoiceWire on /create "Generate
 * Link") incurs zero cold-init latency (~37 ms one-time cost).
 *
 * Call scheduleWasmWarmup() once on the /create (and optionally /pay) page mount.
 * Errors are silently swallowed — warm-up is best-effort; the codec still works
 * if it fails.
 */

let warmedUp = false

async function runWarmup(): Promise<void> {
  if (warmedUp) return
  warmedUp = true
  try {
    // A tiny encode call is the minimal trigger that instantiates the WASM
    // module and runs wasm-bindgen glue init. The result is discarded.
    const { encodeInvoiceWire } = await import('@void-layer/codec')
    await encodeInvoiceWire({
      invoice_id: '__warmup__',
      issued_at: 0,
      due_at: 0,
      network_id: 1,
      currency: 'ETH',
      decimals: 18,
      total: '0',
      salt: '00000000000000000000000000000000',
      from: { name: 'w', wallet_address: '0x0000000000000000000000000000000000000001' },
      client: { name: 'w' },
      items: [{ description: 'w', quantity: 1, rate: '0' }],
    })
  } catch {
    // Best-effort — ignore any error (WASM load failure, env restrictions, etc.)
  }
}

/**
 * Schedule a background WASM warm-up using requestIdleCallback (with setTimeout
 * fallback for Safari). Safe to call multiple times — warm-up runs at most once.
 */
export function scheduleWasmWarmup(): void {
  if (typeof window === 'undefined' || warmedUp) return
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => void runWarmup(), { timeout: 3000 })
  } else {
    setTimeout(() => void runWarmup(), 500)
  }
}
