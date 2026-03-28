import { esc } from './helpers.js'
import type { Tr } from '../data/i18n.js'
import type { FormatEdu } from '../data/edu-en.js'
import type { FieldComparison } from '../data/field-comparisons.js'

export function renderEducation(
  t: Tr,
  eduData: FormatEdu[],
  fieldComparisons: FieldComparison[],
): string {
  const tabs = eduData
    .map((f, i) => `<button class="edu-tab${i === 0 ? ' active' : ''}" data-ver="${f.ver}" onclick="showEdu(this)">${f.ver}</button>`)
    .join('\n    ')

  const panels = eduData.map((f, i) => {
    const pipeSteps = f.pipeline
      .map((s, si) => {
        const accent = s.accent ? `border-color:${s.accent};color:${s.accent}` : 'border-color:#404040;color:#a3a3a3'
        const arrow = si < f.pipeline.length - 1 ? '<span class="pipe-arrow">→</span>' : ''
        return `<span class="pipe-step" style="${accent}">${esc(s.label)}</span>${arrow}`
      })
      .join('\n          ')

    const structBars = f.structure
      .map(s => `<div class="struct-seg" style="width:${s.pct}%;background:${s.color}" title="${esc(s.label)}: ~${s.pct}%">
              <span class="struct-label">${esc(s.label)}</span>
            </div>`)
      .join('\n          ')

    const innovations = f.innovations
      .map(inn => `<div class="edu-item edu-pro"><span class="edu-icon">+</span>${esc(inn)}</div>`)
      .join('\n          ')

    const limitations = f.limitations
      .map(lim => `<div class="edu-item edu-con"><span class="edu-icon">−</span>${esc(lim)}</div>`)
      .join('\n          ')

    const eraLabel = f.era === 'baseline' ? t.baselineEra : f.era === 'adhoc' ? t.adhocBinary : t.tlvStructured
    const eraColor = f.era === 'baseline' ? '#525252' : f.era === 'adhoc' ? '#f59e0b' : '#3b82f6'

    return `<div class="edu-panel${i === 0 ? '' : ' hidden'}" id="edu-${f.ver}">
        <div class="edu-header">
          <div>
            <span class="edu-ver">${f.ver}</span>
            <span class="edu-name">${esc(f.name)}</span>
            <span class="edu-era" style="background:${eraColor}">${eraLabel}</span>
          </div>
        </div>
        <div class="edu-section">
          <div class="edu-section-title">${t.encodingPipeline}</div>
          <div class="pipe-flow">${pipeSteps}</div>
        </div>
        <div class="edu-section">
          <div class="edu-section-title">${t.byteStructure} <span class="edu-dim">${t.approxAllocation}</span></div>
          <div class="struct-bar-container">${structBars}</div>
          <div class="struct-note">${esc(f.structNote)}</div>
        </div>
        <div class="edu-columns">
          <div class="edu-section">
            <div class="edu-section-title">${t.innovations}</div>
            ${innovations}
          </div>
          <div class="edu-section">
            <div class="edu-section-title">${t.limitations}</div>
            ${limitations}
          </div>
        </div>
        <div class="edu-insight">
          <span class="edu-insight-icon">&#x1f4a1;</span>
          <span>${esc(f.keyInsight)}</span>
        </div>
      </div>`
  }).join('\n    ')

  const fieldRows = fieldComparisons.map(fc => {
    return fc.versions.map((v, vi) => {
      const sizeBar = fc.versions[0]!.size > 0
        ? `<div class="field-bar" style="width:${Math.round((v.size / fc.versions[0]!.size) * 100)}%;background:${v.size <= 4 ? '#22c55e' : v.size <= 10 ? '#f59e0b' : '#ef4444'}"></div>`
        : ''
      return `<tr${vi === 0 ? ' class="field-first"' : ''}>
          ${vi === 0 ? `<td rowspan="${fc.versions.length}" class="field-name"><div>${esc(fc.field)}</div><div class="field-desc">${esc(fc.description)}</div></td>` : ''}
          <td class="field-ver">${esc(v.ver)}</td>
          <td class="field-enc">${esc(v.encoding)}</td>
          <td class="field-hex"><code>${esc(v.bytes)}</code></td>
          <td class="field-size">
            <div class="field-size-row">
              <span>${v.size > 0 ? v.size + 'B' : '—'}</span>
              ${sizeBar}
            </div>
          </td>
        </tr>`
    }).join('\n      ')
  }).join('\n      ')

  return `
    <div class="edu-tabs" id="eduTabs">${tabs}</div>
    ${panels}
    <div class="edu-section" style="margin-top:2rem">
      <h3 style="color:#e5e5e5;font-size:1rem;margin-bottom:0.75rem">${t.fieldEncodingComparison}</h3>
      <p style="color:#525252;font-size:0.8rem;margin:-0.25rem 0 1rem">${t.fieldComparisonDesc}</p>
      <table class="field-table">
        <thead>
          <tr><th>${t.field}</th><th>${t.version}</th><th>${t.encoding}</th><th>${t.hex}</th><th>${t.size}</th></tr>
        </thead>
        <tbody>${fieldRows}</tbody>
      </table>
    </div>`
}
