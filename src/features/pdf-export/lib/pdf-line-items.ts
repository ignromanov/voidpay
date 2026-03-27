import type { Content } from 'pdfmake/interfaces'
import { formatAmount } from '@/shared/lib/amount-utils'

import type { PartialInvoice } from '@/shared/lib/invoice-types'

import { COLORS } from './pdf-theme'

function computeLineTotal(qty: number, rate: string, decimals: number): string {
  try {
    const scale = 10n ** BigInt(decimals)
    const qtyScaled = BigInt(Math.round(qty * Number(scale)))
    return ((qtyScaled * BigInt(rate || '0')) / scale).toString()
  } catch {
    return '0'
  }
}

/** Line items table matching LineItemsTable.tsx */
export function buildLineItems(
  items: PartialInvoice['items'],
  decimals: number
): Content {
  const safeItems = (items ?? []) as Array<{ description?: string; quantity?: number; rate?: string }>

  const headerRow = [
    { text: '#', fontSize: 8, bold: true, color: COLORS.black, alignment: 'center' as const, characterSpacing: 1.2 },
    { text: 'DESCRIPTION', fontSize: 8, bold: true, color: COLORS.black, characterSpacing: 1.2 },
    { text: 'QTY', fontSize: 8, bold: true, color: COLORS.black, alignment: 'center' as const, characterSpacing: 1.2 },
    { text: 'RATE (PER UNIT)', fontSize: 8, bold: true, color: COLORS.black, alignment: 'right' as const, characterSpacing: 1.2 },
    { text: 'AMOUNT', fontSize: 8, bold: true, color: COLORS.black, alignment: 'right' as const, characterSpacing: 1.2 },
  ]

  const dataRows: Content[][] = safeItems.map((item, i) => {
    const qty = item.quantity ?? 0
    const rate = item.rate ?? '0'
    const lineTotal = computeLineTotal(qty, rate, decimals)
    const formattedQty = qty.toLocaleString('en-US', { maximumFractionDigits: 6, useGrouping: true })
    return [
      { text: `${i + 1}`, alignment: 'center' as const, color: COLORS.zinc600 },
      { text: item.description ?? '', color: COLORS.black },
      { text: formattedQty, alignment: 'center' as const, color: COLORS.textMd },
      { text: formatAmount(rate, decimals), alignment: 'right' as const, color: COLORS.textMd },
      { text: formatAmount(lineTotal, decimals), alignment: 'right' as const, bold: true, color: COLORS.black },
    ]
  })

  if (dataRows.length === 0) {
    dataRows.push([
      { text: 'No line items', colSpan: 5, alignment: 'center' as const, color: COLORS.light, italics: true, fontSize: 9 } as Content,
      { text: '' } as Content,
      { text: '' } as Content,
      { text: '' } as Content,
      { text: '' } as Content,
    ])
  }

  return {
    table: {
      headerRows: 1,
      widths: [24, '*', 50, 95, 95],
      body: [headerRow, ...dataRows],
    },
    layout: {
      hLineWidth: (i: number, node: { table: { body: unknown[][] } }) =>
        i === 1 ? 1.5 : (i > 1 && i < node.table.body.length) ? 0.3 : 0,
      vLineWidth: () => 0,
      hLineColor: (i: number) => i === 1 ? COLORS.borderThick : COLORS.borderLight,
      paddingTop: () => 8,
      paddingBottom: () => 8,
      fillColor: (rowIndex: number) => rowIndex > 0 && rowIndex % 2 === 0 ? COLORS.bgLight : null,
    },
  }
}
