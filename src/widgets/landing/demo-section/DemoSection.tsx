/**
 * DemoSection - Rotating invoice demo with network themes
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo Experience)
 */

'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { getNetworkTheme } from '@/entities/network'
import { Button, Heading, Text } from '@/shared/ui'
import { InvoicePaper, useInvoiceScale } from '@/widgets/invoice-paper'

import { useNetworkTheme } from '../context/network-theme-context'
import { DEMO_INVOICES, ROTATION_INTERVAL_MS } from '../constants/demo-invoices'
import { useDemoRotation } from '../hooks/use-demo-rotation'

import { DemoPagination } from './ui/DemoPagination'

export function DemoSection() {
  const { setTheme } = useNetworkTheme()
  const { containerRef, scale, scaledWidth, scaledHeight } = useInvoiceScale()

  const [isHovered, setIsHovered] = useState(false)

  const { activeIndex, pause, resume, goTo } = useDemoRotation({
    itemCount: DEMO_INVOICES.length,
    interval: ROTATION_INTERVAL_MS,
    autoStart: true,
  })

  // Sync network theme with active invoice
  useEffect(() => {
    const currentInvoice = DEMO_INVOICES[activeIndex]
    if (currentInvoice) {
      setTheme(getNetworkTheme(currentInvoice.data.networkId))
    }
  }, [activeIndex, setTheme])

  const currentInvoice = DEMO_INVOICES[activeIndex]

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    pause()
  }, [pause])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    resume()
  }, [resume])

  const handleDotSelect = useCallback(
    (index: number) => {
      goTo(index)
      pause()
    },
    [goTo, pause]
  )

  if (!currentInvoice) {
    return <section className="py-32 text-center text-zinc-500">Demo content unavailable</section>
  }

  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-visible py-32"
      aria-labelledby="demo-heading"
    >
      {/* Header */}
      <header className="mb-16 space-y-3 px-4 text-center">
        <Heading variant="h1" as="h2" id="demo-heading">
          See Real Invoices
        </Heading>
        <Text variant="large" className="mx-auto max-w-lg text-zinc-400">
          Each invoice is a self-contained URL. Hover to use as a template.
        </Text>
      </header>

      {/* Invoice container */}
      <div
        ref={containerRef}
        className="relative flex w-full max-w-[1400px] justify-center px-4 transition-[height] duration-200 ease-linear"
        style={
          {
            '--scaled-height': `${scaledHeight + 40}px`,
            height: 'var(--scaled-height)',
            willChange: 'height',
          } as React.CSSProperties
        }
      >
        {/* Hover zone */}
        <div
          className="absolute top-0 left-1/2 z-20 -translate-x-1/2"
          style={
            {
              '--hover-width': `${scaledWidth}px`,
              '--hover-height': `${scaledHeight}px`,
              width: 'var(--hover-width)',
              height: 'var(--hover-height)',
              willChange: 'width, height',
            } as React.CSSProperties
          }
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Scaled invoice */}
          <div
            className="absolute top-0 left-1/2 origin-top transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-50%) scale(${scale})` }}
          >
            <InvoicePaper
              data={currentInvoice.data}
              status={currentInvoice.status}
              {...(currentInvoice.txHash && { txHash: currentInvoice.txHash })}
              {...(currentInvoice.txHashValidated !== undefined && {
                txHashValidated: currentInvoice.txHashValidated,
              })}
              showGlow
              className="rounded-sm shadow-[0_50px_150px_-30px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Hover CTA */}
          <div
            className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <Button
              variant="glow"
              size="default"
              className="rounded-full bg-violet-600 px-8 py-4"
              asChild
            >
              <Link href={`/create#${currentInvoice.createHash}`}>
                Use This Template
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <DemoPagination items={DEMO_INVOICES} activeIndex={activeIndex} onSelect={handleDotSelect} />
    </section>
  )
}
