import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import React from 'react'
import { InvoicePaper } from '../ui/InvoicePaper'
import type { InvoiceSchemaV1 } from '@/entities/invoice'

describe('InvoicePaper Print Support', () => {
  it('supports forwardRef for printing', () => {
    const ref = React.createRef<HTMLDivElement>()
    const data = {
      id: '1',
      iss: 0,
      due: 0,
      cur: 'USDC',
      net: 1,
      f: { n: 'S', a: '0x1' },
      c: { n: 'C', a: '0x2' },
      it: [],
    } as unknown as InvoiceSchemaV1

    render(<InvoicePaper ref={ref} data={data} animated={false} />)
    expect(ref.current).not.toBeNull()
  })

  it('applies print-specific CSS classes', () => {
    const data = {
      id: '1',
      iss: 0,
      due: 0,
      cur: 'USDC',
      net: 1,
      f: { n: 'S', a: '0x1' },
      c: { n: 'C', a: '0x2' },
      it: [],
    } as unknown as InvoiceSchemaV1

    render(<InvoicePaper data={data} animated={false} />)
    const paper = screen.getByRole('article')
    expect(paper.className).toContain('print:shadow-none')
  })
})
