import { esc } from './helpers.js'
import type { Tr } from '../data/i18n.js'
import type { CodecInfo } from '../shared/types.js'

export function renderMeta(t: Tr, codecInfos: CodecInfo[]): string {
  const ERA_BOUNDARY = 4

  const metaRows = codecInfos
    .map((c, i) => {
      const eraLabel = i === 0
        ? `<tr class="era-sep"><td colspan="8"><span class="era-tag">${t.adhocBinary}</span> ${t.adhocEraDesc}</td></tr>\n`
        : i === ERA_BOUNDARY
          ? `<tr class="era-sep"><td colspan="8"><span class="era-tag">${t.tlvStructured}</span> ${t.tlvEraDesc}</td></tr>\n`
          : ''
      return `${eraLabel}<tr>
      <td><strong>${c.version}</strong></td>
      <td>${c.name}</td>
      <td>${c.date}</td>
      <td class="meta-desc">${esc(c.description)}</td>
      <td>${c.compression}</td>
      <td>${c.encoding}</td>
      <td>${c.browserCompatible ? '✓' : '✗'}</td>
      <td style="font-family:monospace">${c.commit}</td>
    </tr>`
    })
    .join('\n')

  return `<h2>${t.codecMetadata}</h2>
  <table class="meta">
    <thead>
      <tr><th>${t.metaVer}</th><th>${t.metaName}</th><th>${t.metaDate}</th><th>${t.metaDesc}</th><th>${t.metaCompression}</th><th>${t.metaEncoding}</th><th>${t.metaBrowser}</th><th>${t.metaCommit}</th></tr>
    </thead>
    <tbody>${metaRows}</tbody>
  </table>`
}
