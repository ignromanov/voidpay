import type { Content, ContentColumns, Column } from 'pdfmake/interfaces'
import { formatDateUTC } from '@/shared/lib/date-time'

import type { PartialInvoice } from '@/shared/lib/invoice-types'
import type { PdfExportOptions } from '../model/types'

import { COLORS } from './pdf-theme'

function metaRow(
  label: string,
  value: string,
  margin?: [number, number, number, number],
  valueColor?: string
): Content {
  return {
    columns: [
      { text: label, fontSize: 8, bold: true, color: COLORS.light, width: 48, characterSpacing: 1.2 },
      { text: value, fontSize: 10, bold: !!valueColor, color: valueColor ?? COLORS.text, alignment: 'right' as const },
    ],
    ...(margin ? { margin } : {}),
  }
}

/** Header section matching PaperHeader.tsx */
export function buildHeader(
  invoiceId: string,
  data: PartialInvoice,
  options: PdfExportOptions
): ContentColumns {
  const issuedDate = data.issuedAt ? formatDateUTC(data.issuedAt) : '\u2014'
  const dueDate = data.dueAt ? formatDateUTC(data.dueAt) : '\u2014'
  const isDraft = invoiceId === 'DRAFT'

  const titleLine: Content = {
    text: [
      { text: 'INVOICE ', fontSize: 26, bold: true, color: COLORS.light },
      isDraft
        ? { text: 'Draft', fontSize: 26, italics: true, color: COLORS.placeholder }
        : {
            text: `#${invoiceId}`, fontSize: 26, bold: true,
            color: options.invoiceUrl ? COLORS.brand : COLORS.black,
            link: options.invoiceUrl,
          },
    ],
  }

  const metaRows: Content[] = [
    metaRow('ISSUED', issuedDate),
    metaRow('DUE', dueDate, [0, 4, 0, 0]),
  ]

  if (options.status) {
    const statusText = options.status === 'paid' && options.paidAt
      ? `${options.status.toUpperCase()} · ${formatDateUTC(options.paidAt)}`
      : options.status.toUpperCase()
    metaRows.push(metaRow('STATUS', statusText, [0, 4, 0, 0], COLORS.brand))
  }

  return {
    columns: [
      { stack: [titleLine], width: '*' } as Column,
      { stack: metaRows, width: 170, alignment: 'right' } as Column,
    ],
  }
}
