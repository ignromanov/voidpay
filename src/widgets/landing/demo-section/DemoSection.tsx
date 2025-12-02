/**
 * DemoSection - Rotating invoice demo with network themes
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo Experience)
 */

'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { Button, Card, CardContent, Heading, Text, useReducedMotion } from '@/shared/ui'

import { DEMO_INVOICES, ROTATION_INTERVAL_MS } from '../constants/demo-invoices'
import { useDemoRotation } from '../hooks/use-demo-rotation'

// Invoice paper dimensions (A4 at 96 DPI)
const INVOICE_WIDTH = 794
const INVOICE_HEIGHT = 1123

// Network theme colors for visual distinction
const NETWORK_THEMES = {
  ethereum: {
    border: 'border-blue-500/30',
    badge: 'bg-blue-600',
  },
  arbitrum: {
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-600',
  },
  optimism: {
    border: 'border-red-500/30',
    badge: 'bg-red-600',
  },
} as const

export function DemoSection() {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [wrapperScale, setWrapperScale] = useState(0.45)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  const { activeIndex, pause, resume, goTo } = useDemoRotation({
    itemCount: DEMO_INVOICES.length,
    interval: ROTATION_INTERVAL_MS,
    autoStart: !prefersReducedMotion,
  })

  // Responsive scaling based on viewport
  useEffect(() => {
    setViewportSize({ width: window.innerWidth, height: window.innerHeight })
    const handleResize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight })

    const container = containerRef.current
    if (container) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setViewportSize((prev) => ({ ...prev, width: entry.contentRect.width }))
        }
      })
      observer.observe(container)
      window.addEventListener('resize', handleResize)
      return () => {
        observer.disconnect()
        window.removeEventListener('resize', handleResize)
      }
    }
    return undefined
  }, [])

  // Calculate scale based on viewport
  useEffect(() => {
    if (viewportSize.width === 0 || viewportSize.height === 0) return
    const PADDING_X = viewportSize.width < 768 ? 24 : 48
    const availableWidth = Math.max(viewportSize.width - PADDING_X, 280)
    const targetHeight = Math.max(viewportSize.height * 0.75, 400)
    const widthRatio = availableWidth / INVOICE_WIDTH
    const heightRatio = targetHeight / INVOICE_HEIGHT
    const ratio = Math.min(widthRatio, heightRatio)
    setWrapperScale(Math.min(Math.max(ratio, 0.25), 0.85))
  }, [viewportSize])

  const currentInvoice = DEMO_INVOICES[activeIndex]

  if (!currentInvoice) {
    return null
  }

  const theme = NETWORK_THEMES[currentInvoice.network]
  const scaledHeight = INVOICE_HEIGHT * wrapperScale

  const handleMouseEnter = () => {
    setIsHovered(true)
    pause()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (!prefersReducedMotion) {
      resume()
    }
  }

  return (
    <section className="relative z-10 flex w-full flex-col items-center justify-center overflow-visible py-24" aria-labelledby="demo-heading">
      {/* Section header */}
      <div className="mb-16 space-y-1 px-4 text-center">
        <Heading variant="h2" as="h2" id="demo-heading" className="text-xl font-bold tracking-tight text-white md:text-2xl">
          Interactive Preview
        </Heading>
        <Text variant="body" className="mx-auto max-w-md text-sm text-zinc-400">
          Click <span className="font-bold text-white">&quot;Use This Template&quot;</span> to start editing immediately.
        </Text>
      </div>

      {/* Invoice paper container with dynamic scaling */}
      <div
        ref={containerRef}
        className="relative my-2 flex w-full max-w-[1400px] justify-center px-4 transition-[height] duration-200 ease-linear"
        style={{ height: scaledHeight + 100 }}
      >
        {/* Scaled invoice wrapper */}
        <div
          className="absolute left-1/2 top-0 z-20 origin-top transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translateX(-50%) scale(${wrapperScale})` }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Invoice paper simulation */}
          <div className="rounded-sm shadow-[0_50px_150px_-30px_rgba(0,0,0,0.8)]">
            <Card
              variant="glass"
              className={`relative overflow-hidden transition-all duration-300 ${theme.border}`}
              style={{ width: INVOICE_WIDTH, height: INVOICE_HEIGHT }}
            >
              {/* Network badge */}
              <div
                className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium text-white ${theme.badge}`}
              >
                {currentInvoice.network.charAt(0).toUpperCase() + currentInvoice.network.slice(1)}
              </div>

              <CardContent className="flex h-full flex-col p-8">
                {/* Invoice header */}
                <div className="mb-8 border-b border-zinc-700 pb-6">
                  <Text variant="label" className="text-violet-400">
                    INVOICE
                  </Text>
                  <Heading variant="h2" as="h3" className="mt-2 text-3xl">
                    {currentInvoice.description}
                  </Heading>
                </div>

                {/* Line items */}
                <div className="mb-8 flex-1 space-y-4">
                  {currentInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-lg">
                      <Text variant="body" className="text-zinc-300">
                        {item.description}
                      </Text>
                      <Text variant="body" mono className="text-zinc-400">
                        {item.quantity} x {item.unitPrice}
                      </Text>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-zinc-700 pt-6">
                  <div className="flex items-center justify-between">
                    <Text variant="label" className="text-zinc-400">
                      Total
                    </Text>
                    <Text variant="body" mono className="text-4xl font-bold text-white">
                      {currentInvoice.amount} {currentInvoice.token}
                    </Text>
                  </div>
                  <Text variant="small" className="mt-2 text-zinc-500">
                    To: {currentInvoice.recipient}
                  </Text>
                </div>
              </CardContent>

              {/* Hover overlay with CTA */}
              {isHovered && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-opacity">
                  <Button
                    variant="glow"
                    className="rounded-full bg-violet-600 px-6 py-3"
                    asChild
                  >
                    <Link href={`/create?template=${currentInvoice.id}`}>Use This Template</Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Background glow effect */}
        <div
          className="pointer-events-none absolute left-1/2 top-[40%] -z-10 aspect-square w-full max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 opacity-70 blur-[100px] mix-blend-screen"
          style={{ transform: `scale(${wrapperScale})` }}
        />
      </div>

      {/* Navigation dots */}
      <div className="mt-6 flex justify-center gap-2">
        {DEMO_INVOICES.map((invoice, index) => (
          <button
            key={invoice.id}
            type="button"
            aria-label={`View ${invoice.network} invoice`}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex ? 'w-6 bg-violet-500' : 'w-2 bg-zinc-600 hover:bg-zinc-500'
            }`}
            onClick={() => {
              goTo(index)
              pause()
            }}
          />
        ))}
      </div>
    </section>
  )
}
