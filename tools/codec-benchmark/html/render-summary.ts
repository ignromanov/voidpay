import type { Tr } from '../data/i18n.js'
import type { CodecInfo } from '../shared/types.js'

export function renderSummary(
  t: Tr,
  codecInfos: CodecInfo[],
  versions: string[],
  avgReduction: Record<string, number>,
): string {
  const bestOverallVersion = versions.reduce((best, v) =>
    avgReduction[v]! > avgReduction[best]! ? v : best,
  )
  const bestCodecInfo = codecInfos.find(c => c.version === bestOverallVersion)!

  return `<div class="summary">
    <div class="card">
      <div class="label">${t.bestOverall}</div>
      <div class="value">${bestCodecInfo.version} — ${bestCodecInfo.name}</div>
      <div class="sub">Avg ${avgReduction[bestOverallVersion]}% ${t.avgSmaller}</div>
    </div>
    <div class="card">
      <div class="label">${t.codecsCompared}</div>
      <div class="value">${codecInfos.length}</div>
      <div class="sub">v0 (2025-11) → v6 (2026-03)</div>
    </div>
    <div class="card">
      <div class="label">${t.v0Baseline}</div>
      <div class="value">JSON + lz-string</div>
      <div class="sub">URI-encoded, LZ77 compression</div>
    </div>
  </div>`
}
