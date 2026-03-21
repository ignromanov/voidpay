import { STYLES } from './styles.js'
import { SCRIPTS } from './scripts.js'
import type { Tr } from '../data/i18n.js'

export interface PageSections {
  intro: string
  summary: string
  results: string
  education: string
  urls: string
  meta: string
}

export function renderPage(t: Tr, sections: PageSections, scenarios: number): string {
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
  <style>${STYLES}</style>
</head>
<body>
  ${sections.intro}
  <h1>${t.title}</h1>
  <div class="subtitle">${t.subtitle}</div>

  ${sections.summary}

  ${sections.results}

  <h2>${t.formatAnatomy}</h2>
  <p style="color:#525252;font-size:0.8rem;margin:-0.5rem 0 1rem">${t.formatAnatomyDesc}</p>
  ${sections.education}

  ${sections.urls}

  ${sections.meta}

  <p style="color:#3f3f46;font-size:0.75rem;margin-top:2rem">
    ${t.generated} ${new Date().toISOString()} · ${scenarios} test invoices (minimal → unicode) · Salt deterministic for reproducibility
  </p>

  <script>${SCRIPTS}</script>
</body>
</html>`
}
