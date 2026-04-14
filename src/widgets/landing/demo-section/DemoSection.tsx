/**
 * DemoSection - Rotating invoice demo with network themes
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo Experience)
 */

'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { track, AnalyticsEvent } from '@/features/analytics'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkThemeName } from '@/entities/network'
import { useReducedMotion } from '@/shared/ui'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'
import { InvoicePaper, ScaledInvoicePreview, InvoicePaperProps } from '@/widgets/invoice-paper'
import { getDemoInvoices, ROTATION_INTERVAL_MS } from '../constants/demo-invoices'
import { useDemoRotation } from '../hooks/use-demo-rotation'

import { DemoPagination } from './ui/DemoPagination'

// Resolved type of getDemoInvoices element
type DemoInvoice = Awaited<ReturnType<typeof getDemoInvoices>>[number]

export function DemoSection() {
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)
  const [isHovered, setIsHovered] = useState(false)
  const [demoInvoices, setDemoInvoices] = useState<DemoInvoice[]>([])
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    void getDemoInvoices().then(setDemoInvoices)
  }, [])

  const { activeIndex, pause, resume, goTo } = useDemoRotation({
    itemCount: demoInvoices.length,
    interval: ROTATION_INTERVAL_MS,
    autoStart: !prefersReducedMotion,
  })

  // Sync network theme with active invoice
  useEffect(() => {
    const currentInvoice = demoInvoices[activeIndex]
    if (currentInvoice) {
      setNetworkTheme(getNetworkThemeName(currentInvoice.data.networkId))
    }
  }, [activeIndex, demoInvoices, setNetworkTheme])

  const currentInvoice = demoInvoices[activeIndex]

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    pause()
  }, [pause])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    resume()
  }, [resume])

  // Touch swipe to navigate between demo invoices
  const touchStartRef = useRef(0)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch) touchStartRef.current = touch.clientX
    pause()
  }, [pause])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0]
    if (!touch || demoInvoices.length === 0) return
    const diff = touch.clientX - touchStartRef.current
    if (Math.abs(diff) > 50) {
      const next = diff > 0
        ? (activeIndex - 1 + demoInvoices.length) % demoInvoices.length
        : (activeIndex + 1) % demoInvoices.length
      goTo(next)
    }
  }, [activeIndex, demoInvoices.length, goTo])

  const handleDotSelect = useCallback(
    (index: number) => {
      goTo(index)
      pause()
    },
    [goTo, pause]
  )

  if (!currentInvoice) {
    return <section className="py-16 text-center text-zinc-500 md:py-32">Demo content unavailable</section>
  }

  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-visible py-16 md:py-32"
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

      {/* Invoice container with pagination */}
      <div
        className="relative flex w-full max-w-[1400px] flex-col items-center px-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ScaledInvoicePreview
          preset="demo"
          networkId={currentInvoice.data.networkId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          overlay={
            <div
              className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100 md:opacity-100 md:pointer-events-auto' : 'opacity-100 md:pointer-events-none md:opacity-0'}`}
            >
              <Button
                variant="glow"
                size="default"
                className="rounded-full bg-violet-600 px-8 py-4"
                onClick={() => track(AnalyticsEvent.LANDING_CTA_CLICK, { cta_location: 'demo' })}
                asChild
              >
                <Link href={`/create#${currentInvoice.createHash}`}>Use This Template</Link>
              </Button>
            </div>
          }
        >
          {/* Type assertion needed because DEMO_INVOICES status is runtime value.
              Discriminated union correctly enforces txHash when status='paid'. */}
          <InvoicePaper
            {...({
              data: currentInvoice.data,
              status: currentInvoice.status,
              txHash: currentInvoice.txHash,
              txHashValidated: currentInvoice.txHashValidated,
            } as InvoicePaperProps)}
          />
        </ScaledInvoicePreview>

        {/* Pagination inside container for glow effect coverage */}
        <DemoPagination items={demoInvoices} activeIndex={activeIndex} onSelect={handleDotSelect} />
      </div>
    </section>
  )
}
