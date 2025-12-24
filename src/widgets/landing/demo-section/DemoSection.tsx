/**
 * DemoSection - Rotating invoice demo with network themes
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo Experience)
 */

'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { useHydrated } from '@/shared/lib'
import { Button, Card, CardContent, Heading, Text } from '@/shared/ui'
import { AnimatePresence, motion } from '@/shared/ui/motion'
import { useReducedMotion } from '@/shared/ui'

import { useNetworkTheme } from '../context/network-theme-context'
import { DEMO_INVOICES, ROTATION_INTERVAL_MS } from '../constants/demo-invoices'
import { useDemoRotation } from '../hooks/use-demo-rotation'

// Invoice paper dimensions (A4 at 96 DPI)
const INVOICE_WIDTH = 794
const INVOICE_HEIGHT = 1123

// Network theme colors for background glow only
const NETWORK_THEMES = {
  ethereum: {
    badge: 'bg-blue-600',
    glowFrom: 'from-blue-600/40',
    glowTo: 'to-indigo-600/40',
  },
  arbitrum: {
    badge: 'bg-cyan-600',
    glowFrom: 'from-cyan-600/40',
    glowTo: 'to-blue-600/40',
  },
  optimism: {
    badge: 'bg-red-600',
    glowFrom: 'from-red-600/40',
    glowTo: 'to-orange-600/40',
  },
  polygon: {
    badge: 'bg-purple-600',
    glowFrom: 'from-purple-600/40',
    glowTo: 'to-violet-600/40',
  },
} as const

export function DemoSection() {
  const prefersReducedMotion = useReducedMotion()
  const hydrated = useHydrated()
  const containerRef = useRef<HTMLDivElement>(null)

  // Only apply animations after hydration to prevent SSR mismatch
  const shouldAnimate = hydrated && !prefersReducedMotion
  const [isHovered, setIsHovered] = useState(false)
  const [wrapperScale, setWrapperScale] = useState(0.45)
  const { setTheme } = useNetworkTheme()

  const { activeIndex, pause, resume, goTo } = useDemoRotation({
    itemCount: DEMO_INVOICES.length,
    interval: ROTATION_INTERVAL_MS,
    autoStart: !prefersReducedMotion,
  })

  // Sync network theme with active invoice
  useEffect(() => {
    const currentInvoice = DEMO_INVOICES[activeIndex]
    if (currentInvoice) {
      setTheme(currentInvoice.network)
    }
  }, [activeIndex, setTheme])

  // Responsive scaling with RAF-throttled resize handling
  // Combines viewport tracking and scale calculation in one effect
  useEffect(() => {
    let rafId: number | null = null
    let isScheduled = false

    // Calculate scale from dimensions (pure function, no setState)
    const calculateScale = (width: number, height: number): number => {
      if (width === 0 || height === 0) return 0.45
      const PADDING_X = width < 768 ? 24 : 48
      const availableWidth = Math.max(width - PADDING_X, 280)
      const targetHeight = Math.max(height * 0.75, 400)
      const widthRatio = availableWidth / INVOICE_WIDTH
      const heightRatio = targetHeight / INVOICE_HEIGHT
      const ratio = Math.min(widthRatio, heightRatio)
      return Math.min(Math.max(ratio, 0.25), 0.85)
    }

    // Throttled update using requestAnimationFrame
    const updateSize = (width: number, height: number) => {
      if (isScheduled) return
      isScheduled = true
      rafId = requestAnimationFrame(() => {
        const newScale = calculateScale(width, height)
        setWrapperScale(newScale)
        isScheduled = false
      })
    }

    // Initial measurement
    updateSize(window.innerWidth, window.innerHeight)

    // Window resize handler (throttled)
    const handleResize = () => {
      updateSize(window.innerWidth, window.innerHeight)
    }

    // Container resize observer (throttled)
    const container = containerRef.current
    let observer: ResizeObserver | null = null
    if (container) {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          updateSize(entry.contentRect.width, window.innerHeight)
        }
      })
      observer.observe(container)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      observer?.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const currentInvoice = DEMO_INVOICES[activeIndex]

  if (!currentInvoice) {
    // Defensive check - should never happen with correct DEMO_INVOICES config
    console.error('[DemoSection] Invalid activeIndex or empty DEMO_INVOICES:', {
      activeIndex,
      invoicesLength: DEMO_INVOICES.length,
    })
    return (
      <section className="py-32 text-center text-zinc-500">
        Demo content unavailable
      </section>
    )
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
    <section className="relative flex w-full flex-col items-center justify-center overflow-visible py-32" aria-labelledby="demo-heading">
      {/* Section header */}
      <div className="mb-16 space-y-3 px-4 text-center">
        <Heading variant="h1" as="h2" id="demo-heading">
          See Real Invoices
        </Heading>
        <Text variant="large" className="mx-auto max-w-lg text-zinc-400">
          Each invoice is a self-contained URL. Hover to use as a template.
        </Text>
      </div>

      {/* Invoice paper container with dynamic scaling */}
      <div
        ref={containerRef}
        className="relative flex w-full max-w-[1400px] justify-center px-4 transition-[height] duration-200 ease-linear"
        style={{ height: scaledHeight + 40 }}
      >
        {/* Hover zone wrapper - contains both scaled invoice and button overlay */}
        <div
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2"
          style={{
            width: INVOICE_WIDTH * wrapperScale,
            height: INVOICE_HEIGHT * wrapperScale,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Scaled invoice wrapper */}
          <div
            className="absolute left-1/2 top-0 origin-top transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-50%) scale(${wrapperScale})` }}
          >
          {/* Invoice paper simulation with animation */}
          <div className="rounded-sm shadow-[0_50px_150px_-30px_rgba(0,0,0,0.8)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentInvoice.id}
                initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldAnimate ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <Card
                  variant="default"
                  className="relative overflow-hidden bg-white text-zinc-900"
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
                    <div className="mb-8 border-b border-zinc-200 pb-6">
                      <Text variant="label" className="text-violet-600">
                        INVOICE
                      </Text>
                      <Heading variant="h2" as="h3" className="mt-2 text-3xl text-zinc-900">
                        {currentInvoice.description}
                      </Heading>
                    </div>

                    {/* Line items */}
                    <div className="mb-8 flex-1 space-y-4">
                      {currentInvoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-lg">
                          <Text variant="body" className="text-zinc-700">
                            {item.description}
                          </Text>
                          <Text variant="body" mono className="text-zinc-500">
                            {item.quantity} x {item.unitPrice}
                          </Text>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-zinc-200 pt-6">
                      <div className="flex items-center justify-between">
                        <Text variant="label" className="text-zinc-500">
                          Total
                        </Text>
                        <Text variant="body" mono className="text-4xl font-bold text-zinc-900">
                          {currentInvoice.amount} {currentInvoice.token}
                        </Text>
                      </div>
                      <Text variant="small" className="mt-2 text-zinc-600">
                        To: {currentInvoice.recipient}
                      </Text>
                    </div>
                  </CardContent>

                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

          {/* Hover overlay with CTA - inside hover zone to prevent flickering */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-30 flex items-center justify-center"
              >
                <Button
                  variant="glow"
                  size="lg"
                  className="rounded-full bg-violet-600 px-8 py-4"
                  asChild
                >
                  <Link href={`/create?template=${currentInvoice.id}`}>Use This Template</Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Background glow effect - animated with network colors */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`glow-${currentInvoice.network}`}
            initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={shouldAnimate ? { opacity: 0, scale: 0.8 } : { opacity: 0.7, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`pointer-events-none absolute left-1/2 top-[40%] -z-10 aspect-square w-full max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr ${theme.glowFrom} ${theme.glowTo} blur-[100px] mix-blend-screen`}
            style={{ transform: `translateX(-50%) translateY(-50%) scale(${wrapperScale})` }}
          />
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      <div className="mt-6 flex justify-center gap-3">
        {DEMO_INVOICES.map((invoice, index) => (
          <button
            key={invoice.id}
            type="button"
            aria-label={`View ${invoice.network} invoice`}
            className="group relative flex h-8 w-8 cursor-pointer items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            onClick={() => {
              goTo(index)
              pause()
            }}
          >
            <span
              className={`block h-2 rounded-full transition-all duration-200 group-hover:scale-125 ${
                index === activeIndex
                  ? 'w-6 bg-violet-500'
                  : 'w-2 bg-zinc-600 group-hover:bg-zinc-400'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
