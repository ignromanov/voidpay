/**
 * Block-time drift diagnostic
 *
 * Measures real avgBlockTime and current block number for every supported chain
 * via Alchemy `eth_blockNumber` + `eth_getBlockByNumber`, then compares against the
 * hardcoded values in `src/entities/network/lib/block-estimates.ts`.
 *
 * Reports forward drift that would cause `estimateFromBlockHex` to return a block
 * above the real chain head (the bug class that triggered this script).
 *
 * Anchors (REFERENCE_BLOCKS) are intentionally NOT updated by this script — they
 * are frozen pre-v1.0 release. If drift is detected, update only AVG_BLOCK_TIME_MS.
 *
 * Run:  npx tsx scripts/measure-block-times.ts
 * Env:  ALCHEMY_API_KEY (loaded from .env.local if present)
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ---------------------------------------------------------------------------
// Chain config — mirrors src/entities/network + block-estimates.
// ---------------------------------------------------------------------------

interface ChainSpec {
  chainId: number
  slug: string
  label: string
  codedAvgMs: number
  codedRefBlock: number
  codedRefTimestampIso: string
  sampleSize: number
}

// Sample size per chain (~30 min to several hours of real data).
// Slow chains get small samples; fast chains get large samples.
const CHAINS: readonly ChainSpec[] = [
  { chainId: 1, slug: 'eth-mainnet', label: 'Ethereum', codedAvgMs: 12_000, codedRefBlock: 24_580_000, codedRefTimestampIso: '2026-03-09T00:00:00Z', sampleSize: 7_200 },
  { chainId: 42161, slug: 'arb-mainnet', label: 'Arbitrum', codedAvgMs: 250, codedRefBlock: 439_760_000, codedRefTimestampIso: '2026-03-09T00:00:00Z', sampleSize: 345_600 },
  { chainId: 10, slug: 'opt-mainnet', label: 'Optimism', codedAvgMs: 2_000, codedRefBlock: 148_670_000, codedRefTimestampIso: '2026-03-09T00:00:00Z', sampleSize: 43_200 },
  { chainId: 137, slug: 'polygon-mainnet', label: 'Polygon', codedAvgMs: 2_000, codedRefBlock: 83_950_000, codedRefTimestampIso: '2026-03-09T00:00:00Z', sampleSize: 43_200 },
  { chainId: 8453, slug: 'base-mainnet', label: 'Base', codedAvgMs: 2_000, codedRefBlock: 44_192_000, codedRefTimestampIso: '2026-04-03T00:00:00Z', sampleSize: 43_200 },
  { chainId: 11155111, slug: 'eth-sepolia', label: 'Sepolia', codedAvgMs: 13_000, codedRefBlock: 10_416_000, codedRefTimestampIso: '2026-03-09T00:00:00Z', sampleSize: 6_650 },
  { chainId: 421614, slug: 'arb-sepolia', label: 'Arbitrum Sepolia', codedAvgMs: 286, codedRefBlock: 248_490_000, codedRefTimestampIso: '2026-03-09T00:00:00Z', sampleSize: 302_400 },
  { chainId: 11155420, slug: 'opt-sepolia', label: 'Optimism Sepolia', codedAvgMs: 2_000, codedRefBlock: 40_410_000, codedRefTimestampIso: '2026-03-09T00:00:00Z', sampleSize: 43_200 },
  { chainId: 80002, slug: 'polygon-amoy', label: 'Polygon Amoy', codedAvgMs: 2_000, codedRefBlock: 34_960_000, codedRefTimestampIso: '2026-03-09T00:00:00Z', sampleSize: 43_200 },
  { chainId: 84532, slug: 'base-sepolia', label: 'Base Sepolia', codedAvgMs: 2_000, codedRefBlock: 39_880_000, codedRefTimestampIso: '2026-04-06T00:00:00Z', sampleSize: 43_200 },
]

// Must match FROM_BLOCK_BUFFER in block-estimates.ts.
const FROM_BLOCK_BUFFER = 5_000
const TWO_DAYS_SEC = 2 * 86_400

// ---------------------------------------------------------------------------
// Env loading (minimal .env.local parser — avoids adding dotenv as a dep)
// ---------------------------------------------------------------------------

function loadAlchemyKey(): string {
  if (process.env.ALCHEMY_API_KEY) return process.env.ALCHEMY_API_KEY
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
    const match = envFile.match(/^ALCHEMY_API_KEY=(.+)$/m)
    if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, '')
  } catch {
    // fall through
  }
  throw new Error('ALCHEMY_API_KEY not found in env or .env.local')
}

// ---------------------------------------------------------------------------
// RPC helpers
// ---------------------------------------------------------------------------

interface JsonRpcResponse<T> {
  result?: T
  error?: { code: number; message: string }
}

async function rpcCall<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  if (!res.ok) throw new Error(`RPC ${method} HTTP ${res.status}`)
  const json = (await res.json()) as JsonRpcResponse<T>
  if (json.error) throw new Error(`RPC ${method} error: ${json.error.message}`)
  if (json.result === undefined) throw new Error(`RPC ${method} returned no result`)
  return json.result
}

interface BlockHeader {
  number: string
  timestamp: string
}

async function measureChain(spec: ChainSpec, apiKey: string): Promise<ChainMeasurement> {
  const url = `https://${spec.slug}.g.alchemy.com/v2/${apiKey}`

  const latestHex = await rpcCall<string>(url, 'eth_blockNumber', [])
  const latestDec = parseInt(latestHex, 16)
  const earlierDec = latestDec - spec.sampleSize
  const earlierHex = `0x${earlierDec.toString(16)}`

  const [latestBlock, earlierBlock] = await Promise.all([
    rpcCall<BlockHeader>(url, 'eth_getBlockByNumber', [latestHex, false]),
    rpcCall<BlockHeader>(url, 'eth_getBlockByNumber', [earlierHex, false]),
  ])

  const latestTs = parseInt(latestBlock.timestamp, 16)
  const earlierTs = parseInt(earlierBlock.timestamp, 16)
  const deltaSec = latestTs - earlierTs
  const measuredAvgMs = (deltaSec * 1000) / spec.sampleSize

  return { spec, realCurrentBlock: latestDec, deltaSec, measuredAvgMs }
}

interface ChainMeasurement {
  spec: ChainSpec
  realCurrentBlock: number
  deltaSec: number
  measuredAvgMs: number
}

// ---------------------------------------------------------------------------
// Drift analysis — mirrors estimateFromBlockHex() + estimateCurrentBlock()
// ---------------------------------------------------------------------------

interface DriftReport {
  label: string
  chainId: number
  codedAvgMs: number
  measuredAvgMs: number
  estimatedCurrentBlock: number
  realCurrentBlock: number
  freshFromBlockEstimate: number
  fromBlockVsRealHead: number
  verdict: 'OK' | 'WARN' | 'BROKEN'
  note: string
}

function analyze(m: ChainMeasurement, nowMs: number): DriftReport {
  const refTs = Date.parse(m.spec.codedRefTimestampIso)

  // estimateCurrentBlock with coded values
  const estimatedCurrentBlock =
    m.spec.codedRefBlock + Math.floor((nowMs - refTs) / m.spec.codedAvgMs)

  // estimateFromBlockHex for a hypothetical "fresh" invoice (issuedAt = now).
  // clampedIssuedAt = twoDaysAgo
  const twoDaysAgoMs = nowMs - TWO_DAYS_SEC * 1000
  const blocksSinceRef = Math.floor((twoDaysAgoMs - refTs) / m.spec.codedAvgMs)
  const freshFromBlockEstimate = m.spec.codedRefBlock + blocksSinceRef - FROM_BLOCK_BUFFER

  const fromBlockVsRealHead = freshFromBlockEstimate - m.realCurrentBlock

  let verdict: DriftReport['verdict'] = 'OK'
  let note = ''
  if (freshFromBlockEstimate > m.realCurrentBlock) {
    verdict = 'BROKEN'
    note = `fresh-invoice fromBlock is ${fromBlockVsRealHead} blocks AHEAD of real head → Alchemy returns empty`
  } else {
    const lookbackBlocks = m.realCurrentBlock - freshFromBlockEstimate
    const lookbackSec = lookbackBlocks * (m.measuredAvgMs / 1000)
    const lookbackHours = lookbackSec / 3600
    if (lookbackHours < 12) {
      verdict = 'WARN'
      note = `fresh-invoice lookback only ${lookbackHours.toFixed(1)}h — near drift threshold`
    } else {
      const avgDriftPct = ((m.spec.codedAvgMs - m.measuredAvgMs) / m.measuredAvgMs) * 100
      note = `lookback ${lookbackHours.toFixed(1)}h, avgMs drift ${avgDriftPct.toFixed(1)}%`
    }
  }

  return {
    label: m.spec.label,
    chainId: m.spec.chainId,
    codedAvgMs: m.spec.codedAvgMs,
    measuredAvgMs: m.measuredAvgMs,
    estimatedCurrentBlock,
    realCurrentBlock: m.realCurrentBlock,
    freshFromBlockEstimate,
    fromBlockVsRealHead,
    verdict,
    note,
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const apiKey = loadAlchemyKey()
  const nowMs = Date.now()
  console.log(`\nMeasuring block times across ${CHAINS.length} chains...`)
  console.log(`Now: ${new Date(nowMs).toISOString()}\n`)

  const measurements = await Promise.all(
    CHAINS.map((spec) =>
      measureChain(spec, apiKey).catch((err) => {
        console.error(`[${spec.label}] FAILED: ${(err as Error).message}`)
        return null
      }),
    ),
  )

  const reports: DriftReport[] = []
  for (const m of measurements) {
    if (m) reports.push(analyze(m, nowMs))
  }

  const pad = (s: string, n: number): string => s.padEnd(n)
  console.log(
    pad('Chain', 20),
    pad('coded(ms)', 10),
    pad('measured(ms)', 14),
    pad('realHead', 13),
    pad('freshFromBlock', 15),
    pad('Δhead', 10),
    'verdict',
  )
  console.log('-'.repeat(110))
  for (const r of reports) {
    console.log(
      pad(`${r.label} (${r.chainId})`, 20),
      pad(String(r.codedAvgMs), 10),
      pad(r.measuredAvgMs.toFixed(2), 14),
      pad(String(r.realCurrentBlock), 13),
      pad(String(r.freshFromBlockEstimate), 15),
      pad(String(r.fromBlockVsRealHead), 10),
      r.verdict,
    )
  }

  const broken = reports.filter((r) => r.verdict === 'BROKEN')
  const warning = reports.filter((r) => r.verdict === 'WARN')

  console.log('')
  if (broken.length > 0) {
    console.error('BROKEN:')
    for (const r of broken) console.error(`  ${r.label}: ${r.note}`)
    console.error(
      '\nFix: update AVG_BLOCK_TIME_MS in src/entities/network/lib/block-estimates.ts',
    )
    console.error('     (do NOT change REFERENCE_BLOCKS — anchors are frozen pre-v1.0 release)')
    process.exit(1)
  }
  if (warning.length > 0) {
    console.warn('WARN:')
    for (const r of warning) console.warn(`  ${r.label}: ${r.note}`)
  }
  console.log('All chains OK.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
