import type { Content, ContentColumns, Column } from 'pdfmake/interfaces'
import { getExplorerUrl } from '@/entities/network'
import { APP_URLS } from '@/shared/config'

import type { PartialInvoice } from '@/shared/lib/invoice-types'
import type { PdfExportOptions } from '../model/types'

import { COLORS, ICONS, ICON_SIZE } from './pdf-theme'
import type { FormattedTotals } from './pdf-calculations'

// ── Payment Info Card ────────────────────────────────────────

/** Payment Info card — compact key-value list with unified icon + value pattern */
function buildPaymentInfoCard(
  data: PartialInvoice,
  networkName: string,
  currency: string,
  options: PdfExportOptions
): Column {
  const walletAddress = data.from?.walletAddress ?? ''
  const cardContent: Content[] = []

  if (networkName) {
    cardContent.push({
      columns: [
        { svg: ICONS.globe, width: ICON_SIZE, margin: [0, 1, 0, 0] } as Column,
        { text: networkName, fontSize: 9, bold: true, color: COLORS.text },
      ],
      columnGap: 5,
      margin: [0, 0, 0, 5] as [number, number, number, number],
    })
  }

  if (currency) {
    cardContent.push({
      columns: [
        { svg: ICONS.coin, width: ICON_SIZE, margin: [0, 1, 0, 0] } as Column,
        { text: currency, fontSize: 9, bold: true, color: COLORS.text },
      ],
      columnGap: 5,
      margin: [0, 0, 0, data.tokenAddress ? 2 : 5] as [number, number, number, number],
    })
    if (data.tokenAddress) {
      cardContent.push({
        text: data.tokenAddress,
        fontSize: 6.5,
        color: COLORS.zinc600,
        characterSpacing: 0.2,
        margin: [ICON_SIZE + 5, 0, 0, 5],
      } as Content)
    }
  }

  if (walletAddress && cardContent.length > 0) {
    cardContent.push({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.3, lineColor: COLORS.borderLight }],
      margin: [0, 2, 0, 6],
    } as Content)
  }

  if (walletAddress) {
    cardContent.push({
      columns: [
        { svg: ICONS.wallet, width: ICON_SIZE } as Column,
        { text: walletAddress, fontSize: 6.5, color: COLORS.black, characterSpacing: 0.2 },
      ],
      columnGap: 5,
      margin: [0, 0, 0, 6] as [number, number, number, number],
    })
  }

  if (options.invoiceUrl && (!options.status || options.status === 'pending')) {
    cardContent.push({
      stack: [
        { qr: options.invoiceUrl, fit: 120, alignment: 'center' as const, margin: [0, 4, 0, 2] },
        { text: 'SCAN TO PAY', fontSize: 6, bold: true, color: COLORS.light, alignment: 'center' as const, characterSpacing: 0.8 },
      ],
    })
  }

  if (options.txHash) {
    const explorerUrl = data.networkId ? getExplorerUrl(data.networkId, options.txHash) : undefined
    cardContent.push(
      {
        columns: [
          { svg: ICONS.hash, width: ICON_SIZE, margin: [0, 1, 0, 0] } as Column,
          { text: 'Transaction', fontSize: 7.5, bold: true, color: COLORS.muted },
        ],
        columnGap: 3,
        margin: [0, 6, 0, 2],
      } as Content,
      {
        text: options.txHash,
        fontSize: 6,
        color: COLORS.txText,
        characterSpacing: 0.1,
        link: explorerUrl,
      } as Content
    )
  }

  if (cardContent.length === 0) {
    cardContent.push({ text: 'No payment details', fontSize: 8, color: COLORS.light, italics: true } as Content)
  }

  return {
    table: {
      widths: ['*'],
      body: [
        [{
          text: 'PAYMENT INFO',
          fontSize: 7.5,
          bold: true,
          color: COLORS.muted,
          characterSpacing: 1.2,
          fillColor: COLORS.bgMuted,
          margin: [10, 5, 10, 5],
        }],
        [{
          stack: cardContent,
          fillColor: COLORS.bgLight,
          margin: [10, 10, 10, 10],
        }],
      ],
    },
    layout: {
      hLineWidth: (i: number) => i === 1 ? 0 : 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.borderLight,
      vLineColor: () => COLORS.borderLight,
    },
    width: 240,
  } as Column
}

// ── Totals Column ────────────────────────────────────────────

function totalsRow(
  label: string,
  amount: string,
  currency: string,
  amountColor?: string
): Content {
  return {
    columns: [
      { text: label, fontSize: 10, color: COLORS.muted, width: '*' },
      { text: amount, fontSize: 10, color: amountColor ?? COLORS.text, alignment: 'right' as const, width: 'auto' },
      { text: currency, fontSize: 10, color: COLORS.muted, width: 'auto', margin: [6, 0, 0, 0] },
    ],
    margin: [0, 3, 0, 3] as [number, number, number, number],
  }
}

/** Totals column matching TotalsSection.tsx with violet total */
function buildTotalsColumn(
  totals: FormattedTotals,
  currency: string,
  tax: string | undefined,
  discount: string | undefined
): Column {
  const currencyLabel = currency || 'TOKEN'
  const rows: Content[] = []

  rows.push(totalsRow('Subtotal', totals.subtotal, currencyLabel))

  if (tax && tax !== '0') {
    rows.push(totalsRow(`Tax (${tax}%)`, `+${totals.taxAmount}`, currencyLabel, COLORS.taxRed))
  }

  if (discount && discount !== '0') {
    rows.push(totalsRow(`Discount (${discount}%)`, `-${totals.discountAmount}`, currencyLabel, COLORS.discountGreen))
  }

  rows.push({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 0.5, lineColor: COLORS.borderLight }],
    margin: [0, 6, 0, 6],
  })

  rows.push({
    columns: [
      { text: 'Total', fontSize: 16, bold: true, color: COLORS.black, width: 'auto', margin: [0, 5, 0, 0] },
      {
        text: [
          { text: `${totals.total}  `, fontSize: 22, bold: true, color: COLORS.brand },
          { text: currencyLabel, fontSize: 11, bold: true, color: COLORS.muted },
        ],
        alignment: 'right' as const,
      },
    ],
    margin: [0, 2, 0, 0] as [number, number, number, number],
  })

  if (totals.magicDust) {
    rows.push({
      columns: [
        { text: '', width: '*' } as Column,
        { svg: ICONS.fingerprint, width: ICON_SIZE, margin: [0, 1, 0, 0] } as Column,
        {
          text: [
            { text: 'Unique ID: ', fontSize: 8, color: COLORS.muted },
            { text: `${totals.magicDust} ${currencyLabel}`, fontSize: 8, color: COLORS.muted },
          ],
          width: 'auto',
        } as Column,
      ],
      columnGap: 3,
      margin: [0, 4, 0, 0],
    })
  }

  return { stack: rows, width: '*', margin: [24, 0, 0, 0] } as Column
}

// ── Bottom Section (Payment Info + Totals) ───────────────────

/** Bottom section: payment info card + totals column matching PaperTotals.tsx */
export function buildBottomSection(
  totals: FormattedTotals,
  currency: string,
  data: PartialInvoice,
  networkName: string,
  options: PdfExportOptions
): ContentColumns {
  return {
    columns: [
      buildPaymentInfoCard(data, networkName, currency, options),
      buildTotalsColumn(totals, currency, data.tax, data.discount),
    ],
    margin: [0, 8, 0, 0] as [number, number, number, number],
  }
}

// ── Content Footer (matches PaperFooter.tsx) ─────────────────

/** Content footer with notes and branding */
export function buildContentFooter(notes: string | undefined): Content {
  const noteText = (notes
    ?? 'Payment is due by the date shown above. Please send the exact amount to the wallet address provided.').slice(0, 500)

  return {
    columns: [
      {
        stack: [
          { text: 'Thank you for your business!', fontSize: 10, bold: true, color: COLORS.black },
          { text: noteText, fontSize: 9, color: COLORS.muted, lineHeight: 1.5, margin: [0, 3, 0, 0] },
        ],
        width: '*',
      } as Column,
      {
        stack: [
          {
            text: 'Powered by VoidPay',
            fontSize: 8,
            bold: true,
            color: COLORS.muted,
            alignment: 'right' as const,
            characterSpacing: 0.5,
            link: APP_URLS.base,
          },
          {
            text: 'Create your own crypto invoice for free.',
            fontSize: 7,
            color: COLORS.light,
            alignment: 'right' as const,
            link: `${APP_URLS.base}/create`,
            margin: [0, 2, 0, 0],
          },
        ],
        width: 'auto',
      } as Column,
    ],
    columnGap: 20,
  }
}
