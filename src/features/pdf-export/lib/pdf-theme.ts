// ── Colors (matching web InvoicePaper zinc/violet palette) ──

export const COLORS = {
  black: '#18181b',       // zinc-900
  text: '#27272a',        // zinc-800
  textMd: '#3f3f46',      // zinc-700 (rate, qty values)
  zinc600: '#52525b',     // zinc-600 (row index)
  muted: '#71717a',       // zinc-500
  light: '#a1a1aa',       // zinc-400
  placeholder: '#d4d4d8', // zinc-300
  borderThick: '#3f3f46', // zinc-700 (header / table thick borders)
  borderLight: '#e4e4e7', // zinc-200 (row borders, card borders)
  borderDashed: '#d4d4d8', // zinc-300 (footer dashed)
  brand: '#7c3aed',       // violet-600 (total amount)
  bgLight: '#fafafa',     // zinc-50 (card body, zebra rows)
  bgMuted: '#f4f4f5',     // zinc-100 (card header)
  taxRed: '#991b1b',      // red-800
  discountGreen: '#059669', // emerald-600
  txBg: '#ecfdf5',        // emerald-50
  txBorder: '#a7f3d0',    // emerald-200
  txText: '#065f46',      // emerald-800
} as const

/** Content width for A4 with 50pt margins: 595 - 50 - 50 */
export const CONTENT_WIDTH = 495

// ── SVG Icons (matching web Lucide icons in PartyInfo.tsx) ──

export const ICON_SIZE = 9

function makeSvg(paths: string): string {
  return `<svg viewBox="0 0 24 24" width="${ICON_SIZE}" height="${ICON_SIZE}" fill="none" stroke="${COLORS.light}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

export const ICONS = {
  mail: makeSvg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
  phone: makeSvg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  hash: makeSvg('<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>'),
  mapPin: makeSvg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
  wallet: makeSvg('<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),
  globe: makeSvg('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  coin: makeSvg('<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>'),
  fingerprint: makeSvg('<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>'),
} as const
