import type { Content, ContentColumns, Column } from 'pdfmake/interfaces'

import type { PartialInvoice } from '@/shared/lib/invoice-types'

import { COLORS, ICONS, ICON_SIZE } from './pdf-theme'

/** Party detail row with inline SVG icon (matching web PartyInfo Lucide icons) */
function detailRow(
  icon: string,
  text: string,
  align: 'left' | 'right',
  opts?: { fontSize?: number; color?: string; lineHeight?: number; margin?: [number, number, number, number]; link?: string }
): Content {
  const fontSize = opts?.fontSize ?? 9
  const iconTop = fontSize >= 8 ? 1 : 0
  const iconCol = { svg: icon, width: ICON_SIZE, margin: [0, iconTop, 0, 0] } as Column
  const textCol = {
    text,
    fontSize,
    color: opts?.link ? COLORS.text : (opts?.color ?? COLORS.text),
    alignment: align,
    lineHeight: opts?.lineHeight,
    characterSpacing: opts?.fontSize && opts.fontSize < 8 ? 0.2 : undefined,
    link: opts?.link,
    width: '*',
  } as Column

  return {
    columns: align === 'right' ? [textCol, iconCol] : [iconCol, textCol],
    columnGap: 5,
    margin: opts?.margin ?? [0, 3, 0, 0],
  }
}

function partyColumn(
  label: string,
  party: PartialInvoice['from'] | PartialInvoice['client'] | undefined,
  align: 'left' | 'right'
): Column {
  const lines: Content[] = [
    { text: label, fontSize: 8, bold: true, color: COLORS.light, alignment: align, characterSpacing: 1.5 },
  ]

  if (!party?.name) {
    lines.push({
      text: '\u2014',
      fontSize: 14,
      bold: true,
      color: COLORS.placeholder,
      alignment: align,
      margin: [0, 4, 0, 0],
    })
    return { stack: lines, width: '*' } as Column
  }

  lines.push({
    text: party.name,
    fontSize: 14,
    bold: true,
    color: COLORS.black,
    alignment: align,
    margin: [0, 4, 0, 6],
  })

  if (party.email) {
    lines.push(detailRow(ICONS.mail, party.email, align, { link: `mailto:${party.email}` }))
  }
  if (party.phone) {
    lines.push(detailRow(ICONS.phone, party.phone, align, { link: `tel:${party.phone}` }))
  }
  if (party.taxId) {
    lines.push(detailRow(ICONS.hash, party.taxId, align))
  }

  if (party.physicalAddress) {
    lines.push(detailRow(ICONS.mapPin, party.physicalAddress, align, {
      color: COLORS.muted,
      lineHeight: 1.5,
      margin: [0, 6, 0, 0],
    }))
  }

  if (label === 'BILL TO' && party.walletAddress) {
    lines.push(detailRow(ICONS.wallet, party.walletAddress, align, {
      fontSize: 7,
      color: COLORS.zinc600,
      margin: [0, 6, 0, 0],
    }))
  }

  return { stack: lines, width: '*' } as Column
}

/** Parties section matching PartyInfo.tsx */
export function buildParties(data: PartialInvoice): ContentColumns {
  return {
    columns: [
      partyColumn('FROM', data.from, 'left'),
      partyColumn('BILL TO', data.client, 'right'),
    ],
    margin: [0, 10, 0, 14] as [number, number, number, number],
  }
}
