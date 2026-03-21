import { esc } from './helpers.js'
import type { IntroData } from '../data/intro-en.js'

export function renderIntro(intro: IntroData): string {
  const sections = intro.sections
    .map(s => {
      const paragraphs = s.paragraphs.map(p => `<p>${esc(p)}</p>`).join('\n      ')
      return `<h3>${esc(s.title)}</h3>
      ${paragraphs}`
    })
    .join('\n      ')

  return `<div class="intro">
    <h1>${esc(intro.headline)}</h1>
    <div class="tagline">${esc(intro.tagline)}</div>
    ${sections}
    <div class="key-insight">${esc(intro.keyInsight)}</div>
    <hr>
  </div>`
}
