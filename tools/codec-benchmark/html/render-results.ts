import { cellColor, reductionColor } from './helpers.js'
import type { Tr } from '../data/i18n.js'
import type { CodecInfo } from '../shared/types.js'

export function renderResults(
  t: Tr,
  scenarios: string[],
  versions: string[],
  codecInfos: CodecInfo[],
  rawJsonSize: Record<string, number>,
  lookup: Record<string, Record<string, { length: number; reduction: number }>>,
  bestPerScenario: Record<string, string>,
): string {
  const ERA_BOUNDARY = 4

  const tableRows = scenarios
    .map(s => {
      const raw = rawJsonSize[s]!
      const lengths = versions.map(v => lookup[s]![v]!.length)
      const minLen = Math.min(...lengths)
      const maxLen = Math.max(...lengths)

      const rawCell = `<td class="raw-cell">
          <div class="cell-bar"><div class="cell-fill" style="width:100%;background:#525252"></div></div>
          <div class="cell-val"><span>${raw}</span><span class="reduction zero">0%</span></div>
        </td>`

      const cells = versions
        .map((v, vi) => {
          const { length } = lookup[s]![v]!
          const barColor = cellColor(length, minLen, maxLen)
          const isBest = bestPerScenario[s] === v
          const barPct = Math.min(100, Math.round((length / raw) * 100))
          const reduction = Math.round((1 - length / raw) * 100)
          const redStr = reduction >= 0 ? `−${reduction}%` : `+${Math.abs(reduction)}%`
          const redColor = reductionColor(reduction)
          const eraBorder = vi === ERA_BOUNDARY ? 'border-left:2px solid #404040;' : ''
          return `<td style="${eraBorder}">
          <div class="cell-bar"><div class="cell-fill" style="width:${barPct}%;background:${barColor}"></div></div>
          <div class="cell-val">
            <span${isBest ? ' class="best"' : ''}>${length}</span>
            <span class="reduction" style="color:${redColor}">${redStr}</span>
          </div>
        </td>`
        })
        .join('\n')
      return `<tr><td class="scenario-name">${s}</td>${rawCell}${cells}</tr>`
    })
    .join('\n')

  const versionHeaders = versions
    .map((v, vi) => {
      const eraBorder = vi === ERA_BOUNDARY ? 'border-left:2px solid #404040;' : ''
      return `<th style="${eraBorder}">${v}</th>`
    })
    .join('\n        ')

  const barCharts = scenarios
    .map(s => {
      const lengths = versions.map(v => lookup[s]![v]!.length)
      const maxLen = Math.max(...lengths)
      const minLen = Math.min(...lengths)
      const bars = codecInfos.map(c => {
        const { length } = lookup[s]![c.version]!
        const pct = Math.round((length / maxLen) * 100)
        const color = cellColor(length, minLen, maxLen)
        return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0">
          <span style="width:32px;text-align:right;color:#a3a3a3;font-size:0.8rem;flex-shrink:0">${c.version}</span>
          <div style="flex:1;display:flex;align-items:center;gap:8px">
            <div style="background:${color};height:20px;width:${pct}%;border-radius:3px;min-width:4px"></div>
            <span style="color:#e5e5e5;font-size:0.85rem;flex-shrink:0">${length}</span>
          </div>
        </div>`
      }).join('\n')
      return `<div class="card">
      <div style="color:#a3a3a3;font-size:0.9rem;margin-bottom:0.5rem">${s}</div>
      ${bars}
    </div>`
    })
    .join('\n')

  return `<h2>${t.results}</h2>
  <p style="color:#525252;font-size:0.8rem;margin:-0.5rem 0 1rem">${t.resultsDesc}</p>
  <table class="results">
    <thead>
      <tr>
        <th></th>
        <th style="text-align:center;color:#525252;font-weight:400;border-bottom:2px solid #262626;letter-spacing:0">${t.baselineEra}</th>
        <th colspan="${ERA_BOUNDARY}" style="text-align:center;color:#737373;font-weight:400;border-bottom:2px solid #333;letter-spacing:0">${t.adhocBinary}</th>
        <th colspan="${versions.length - ERA_BOUNDARY}" style="text-align:center;color:#737373;font-weight:400;border-bottom:2px solid #525252;letter-spacing:0">${t.tlvStructured}</th>
      </tr>
      <tr>
        <th>${t.scenario}</th>
        <th style="color:#525252">${t.raw}</th>
        ${versionHeaders}
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <h2>${t.visualComparison}</h2>
  <div class="charts-grid">${barCharts}</div>`
}
