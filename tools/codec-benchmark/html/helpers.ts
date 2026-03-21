export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function cellColor(length: number, min: number, max: number): string {
  if (max === min) return '#22c55e'
  const ratio = (length - min) / (max - min)
  const r = Math.round(34 + ratio * (239 - 34))
  const g = Math.round(197 - ratio * (197 - 68))
  const b = Math.round(94 - ratio * (94 - 68))
  return `rgb(${r},${g},${b})`
}

export function reductionColor(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct)) / 100
  if (clamped >= 0.5) {
    const s = (clamped - 0.5) * 2
    return `rgb(${Math.round(234 - s * 200)},${Math.round(179 + s * 18)},68)`
  }
  const s = clamped * 2
  return `rgb(${Math.round(239 - s * 5)},${Math.round(68 + s * 111)},68)`
}
