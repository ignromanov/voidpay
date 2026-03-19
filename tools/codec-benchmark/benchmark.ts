import { writeFileSync } from 'node:fs'
import type { CodecModule, CodecInfo } from './shared/types.js'

// Deterministic crypto — applied BEFORE dynamic codec imports
globalThis.crypto.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
  const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength)
  for (let i = 0; i < bytes.length; i++) bytes[i] = (i % 16) + 1
  return array
}

// Dynamic imports — executed AFTER mock is in place
const { codec: v0 } = await import('./codecs/v0-json-lzstring.js')
const { codec: v1 } = await import('./codecs/v1-binary-v1.js')
const { codec: v2 } = await import('./codecs/v2-binary-v2.js')
const { codec: v3 } = await import('./codecs/v3-binary-v3.js')
const { codec: v4 } = await import('./codecs/v4-tlv-v1.js')
const { codec: v5 } = await import('./codecs/v5-tlv-v1-rewrite.js')
const { TEST_INVOICES } = await import('./shared/test-invoices.js')

const CODECS: CodecModule[] = [v0, v1, v2, v3, v4, v5]

// ---- Benchmark loop ----

interface Result {
  scenario: string
  codec: string
  version: string
  length: number
  reduction: number // percentage vs v0
}

const results: Result[] = []

for (const { name, invoice } of TEST_INVOICES) {
  const v0Length = v0.encode(invoice).length
  for (const codec of CODECS) {
    const encoded = codec.encode(invoice)
    const length = encoded.length
    const reduction = Math.round((1 - length / v0Length) * 100)
    results.push({
      scenario: name,
      codec: codec.info.name,
      version: codec.info.version,
      length,
      reduction,
    })
  }
}

// ---- Console output ----

const scenarios = [...new Set(results.map(r => r.scenario))]
const versions = CODECS.map(c => c.info.version)

const COL_W = 8
const LABEL_W = 16

const header =
  'Scenario'.padEnd(LABEL_W) +
  '| ' +
  versions.map(v => v.padStart(COL_W - 1)).join(' | ')
console.log('\n' + header)
console.log('-'.repeat(LABEL_W + versions.length * (COL_W + 2)))

for (const scenario of scenarios) {
  const row =
    scenario.padEnd(LABEL_W) +
    '| ' +
    versions
      .map(v => {
        const r = results.find(x => x.scenario === scenario && x.version === v)
        return String(r?.length ?? '?').padStart(COL_W - 1)
      })
      .join(' | ')
  console.log(row)
}
console.log()

// ---- Generate demo.html ----

const codecInfos = CODECS.map(c => c.info)

const lookup: Record<string, Record<string, { length: number; reduction: number }>> = {}
for (const r of results) {
  if (!lookup[r.scenario]) lookup[r.scenario] = {}
  lookup[r.scenario]![r.version] = { length: r.length, reduction: r.reduction }
}

const bestPerScenario: Record<string, string> = {}
for (const s of scenarios) {
  let best = versions[0]!
  let bestLen = Infinity
  for (const v of versions) {
    const len = lookup[s]![v]!.length
    if (len < bestLen) {
      bestLen = len
      best = v
    }
  }
  bestPerScenario[s] = best
}

const avgReduction: Record<string, number> = {}
for (const v of versions) {
  const reductions = scenarios.map(s => lookup[s]![v]!.reduction)
  avgReduction[v] = Math.round(reductions.reduce((a, b) => a + b, 0) / reductions.length)
}

function generateDemoHtml(
  results: Result[],
  codecInfos: CodecInfo[],
  scenarios: string[],
  versions: string[],
  lookup: Record<string, Record<string, { length: number; reduction: number }>>,
  bestPerScenario: Record<string, string>,
  avgReduction: Record<string, number>,
): string {
  function cellColor(length: number, min: number, max: number): string {
    if (max === min) return '#22c55e'
    const t = (length - min) / (max - min)
    const r = Math.round(34 + t * (239 - 34))
    const g = Math.round(197 - t * (197 - 68))
    const b = Math.round(94 - t * (94 - 68))
    return `rgb(${r},${g},${b})`
  }

  // Build table rows
  const tableRows = scenarios
    .map(s => {
      const lengths = versions.map(v => lookup[s]![v]!.length)
      const minLen = Math.min(...lengths)
      const maxLen = Math.max(...lengths)
      const cells = versions
        .map(v => {
          const { length, reduction } = lookup[s]![v]!
          const color = cellColor(length, minLen, maxLen)
          const isBest = bestPerScenario[s] === v
          const redCls = reduction > 0 ? 'pos' : reduction < 0 ? 'neg' : 'zero'
          const redStr = reduction > 0 ? `−${reduction}%` : reduction < 0 ? `+${Math.abs(reduction)}%` : '0%'
          return `<td style="background:${color}20;border-color:#262626">
          <span${isBest ? ' class="best"' : ''}>${length}</span>
          <span class="reduction ${redCls}">${redStr}</span>
        </td>`
        })
        .join('\n')
      return `<tr><td>${s}</td>${cells}</tr>`
    })
    .join('\n')

  // Build bar charts
  const barCharts = scenarios
    .map(s => {
      const lengths = versions.map(v => lookup[s]![v]!.length)
      const maxLen = Math.max(...lengths)
      const minLen = Math.min(...lengths)
      const bars = CODECS.map(c => {
        const { length } = lookup[s]![c.info.version]!
        const pct = Math.round((length / maxLen) * 100)
        const color = cellColor(length, minLen, maxLen)
        return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0">
          <span style="width:80px;text-align:right;color:#a3a3a3;font-size:0.8rem">${c.info.version}</span>
          <div style="background:${color};height:20px;width:${pct}%;border-radius:3px;min-width:4px"></div>
          <span style="color:#e5e5e5;font-size:0.85rem">${length}</span>
        </div>`
      }).join('\n')
      return `<div class="card" style="margin-bottom:1rem">
      <div style="color:#a3a3a3;font-size:0.9rem;margin-bottom:0.5rem">${s}</div>
      ${bars}
    </div>`
    })
    .join('\n')

  // Codec metadata rows
  const metaRows = codecInfos
    .map(
      c => `<tr>
      <td>${c.version}</td>
      <td>${c.name}</td>
      <td>${c.date}</td>
      <td>${c.compression}</td>
      <td>${c.encoding}</td>
      <td>${c.browserCompatible ? '✓' : '✗'}</td>
      <td style="font-family:monospace">${c.commit}</td>
    </tr>`,
    )
    .join('\n')

  // Summary cards
  const bestOverallVersion = versions.reduce((best, v) =>
    avgReduction[v]! > avgReduction[best]! ? v : best,
  )
  const bestCodecInfo = codecInfos.find(c => c.version === bestOverallVersion)!

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VoidPay Codec Evolution — Size Benchmark</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 2rem; }
    h1 { color: #fff; font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { color: #737373; font-size: 0.9rem; margin-bottom: 2rem; }
    h2 { color: #a3a3a3; margin-top: 2.5rem; font-size: 1.1rem; border-bottom: 1px solid #262626; padding-bottom: 0.5rem; }
    .summary { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1.5rem 0; }
    .card { background: #171717; border: 1px solid #262626; border-radius: 8px; padding: 1rem 1.5rem; }
    .card .label { color: #737373; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .card .value { font-size: 1.4rem; font-weight: 700; margin-top: 0.25rem; }
    .card .sub { font-size: 0.8rem; color: #525252; margin-top: 0.25rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9rem; }
    th, td { padding: 0.5rem 0.75rem; text-align: right; border: 1px solid #262626; }
    th { background: #111; color: #a3a3a3; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    td:first-child, th:first-child { text-align: left; }
    .best { font-weight: 700; color: #22c55e; }
    .reduction { display: block; font-size: 0.72rem; margin-top: 2px; }
    .pos { color: #22c55e; } .neg { color: #ef4444; } .zero { color: #737373; }
    .meta td, .meta th { border-color: #1a1a1a; padding: 0.35rem 0.75rem; font-size: 0.82rem; }
    .meta td:nth-child(6) { text-align: center; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; margin-top: 1rem; }
    @media (max-width: 600px) { body { padding: 1rem; } .summary { flex-direction: column; } }
  </style>
</head>
<body>
  <h1>VoidPay Codec Evolution — Size Benchmark</h1>
  <div class="subtitle">Encoded URL character count across 6 historical codec versions · ${scenarios.length} test scenarios</div>

  <div class="summary">
    <div class="card">
      <div class="label">Best Overall</div>
      <div class="value">${bestCodecInfo.version} — ${bestCodecInfo.name}</div>
      <div class="sub">Avg ${avgReduction[bestOverallVersion]}% smaller than v0</div>
    </div>
    <div class="card">
      <div class="label">Codecs Compared</div>
      <div class="value">${codecInfos.length}</div>
      <div class="sub">v0 (2025-11) → v5 (2026-03)</div>
    </div>
    <div class="card">
      <div class="label">v0 Baseline</div>
      <div class="value">JSON + lz-string</div>
      <div class="sub">URI-encoded, LZ77 compression</div>
    </div>
  </div>

  <h2>Results (encoded string length in chars)</h2>
  <table>
    <thead>
      <tr>
        <th>Scenario</th>
        ${versions.map(v => `<th>${v}</th>`).join('\n        ')}
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <h2>Visual Comparison</h2>
  <div class="charts-grid">
    ${barCharts}
  </div>

  <h2>Codec Metadata</h2>
  <table class="meta">
    <thead>
      <tr><th>Ver</th><th>Name</th><th>Date</th><th>Compression</th><th>Encoding</th><th>Browser</th><th>Commit</th></tr>
    </thead>
    <tbody>${metaRows}</tbody>
  </table>

  <p style="color:#3f3f46;font-size:0.75rem;margin-top:2rem">
    Generated ${new Date().toISOString()} · 8 test invoices (minimal → unicode) · Salt deterministic for reproducibility
  </p>
</body>
</html>`
}

const html = generateDemoHtml(
  results,
  codecInfos,
  scenarios,
  versions,
  lookup,
  bestPerScenario,
  avgReduction,
)
writeFileSync('demo.html', html)
console.log('✓ demo.html generated')
