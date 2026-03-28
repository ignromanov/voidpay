import { esc, cellColor } from './helpers.js'
import type { Tr } from '../data/i18n.js'
import type { CodecInfo } from '../shared/types.js'

export function renderUrls(
  t: Tr,
  scenarios: string[],
  versions: string[],
  codecInfos: CodecInfo[],
  lookup: Record<string, Record<string, { length: number; reduction: number }>>,
  urlsLookup: Record<string, Record<string, string>>,
  bestPerScenario: Record<string, string>,
): string {
  const urlTabs = scenarios
    .map((s, i) => `<button class="url-tab${i === 0 ? ' active' : ''}" data-scenario="${esc(s)}" onclick="showScenario(this)">${esc(s)}</button>`)
    .join('\n  ')

  const urlPanels = scenarios
    .map((s, i) => {
      const lengths = versions.map(v => lookup[s]![v]!.length)
      const minLen = Math.min(...lengths)
      const maxLen = Math.max(...lengths)
      const rows = versions.map(v => {
        const { length } = lookup[s]![v]!
        const encoded = urlsLookup[s]![v]!
        const fullUrl = `https://voidpay.xyz/pay#${encoded}`
        const isBest = bestPerScenario[s] === v
        const color = cellColor(length, minLen, maxLen)
        const codecName = codecInfos.find(c => c.version === v)?.name ?? v
        const panelId = `url-${s.replace(/\s+/g, '-')}-${v}`
        return `<div class="url-row${isBest ? ' url-best' : ''}">
        <div class="url-meta">
          <span class="url-ver">${v}</span>
          <span class="url-name">${esc(codecName)}</span>
          <span class="url-len" style="color:${color}">${length} ${t.chars}</span>
        </div>
        <div class="url-content">
          <code class="url-text" id="${panelId}">${esc(fullUrl)}</code>
          <button class="copy-btn" data-url="${esc(fullUrl)}" onclick="copyUrl(this,'${esc(t.copied)}','${esc(t.failed)}','${esc(t.copy)}')">${t.copy}</button>
        </div>
      </div>`
      }).join('\n      ')
      return `<div class="url-panel${i === 0 ? '' : ' hidden'}" id="panel-${s.replace(/\s+/g, '-')}">
      ${rows}
    </div>`
    })
    .join('\n')

  return `<h2>${t.encodedUrls}</h2>
  <div class="url-tabs" id="urlTabs">${urlTabs}</div>
  ${urlPanels}`
}
