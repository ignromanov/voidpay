/**
 * DemoSection - Rotating invoice demo with network themes
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo Experience)
 */

'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { useHydrated } from '@/shared/lib'
import { Button, Heading, Text, useReducedMotion } from '@/shared/ui'
import { AnimatePresence, motion } from '@/shared/ui/motion'
import { InvoicePaper } from '@/widgets/invoice-paper'

import { useNetworkTheme } from '../context/network-theme-context'
import { DEMO_INVOICES, ROTATION_INTERVAL_MS } from '../constants/demo-invoices'
import { useDemoRotation } from '../hooks/use-demo-rotation'

import { INVOICE_WIDTH, NETWORK_THEMES, getNetworkName } from './constants'
import { useInvoiceScale } from './hooks/use-invoice-scale'
import { DemoPagination } from './ui/DemoPagination'

export function DemoSection() {
  const prefersReducedMotion = useReducedMotion()
  const hydrated = useHydrated()
  const { setTheme } = useNetworkTheme()
  const { containerRef, scale, scaledHeight } = useInvoiceScale()

  const shouldAnimate = hydrated && !prefersReducedMotion
  const [isHovered, setIsHovered] = useState(false)

  const { activeIndex, pause, resume, goTo } = useDemoRotation({
    itemCount: DEMO_INVOICES.length,
    interval: ROTATION_INTERVAL_MS,
    autoStart: !prefersReducedMotion,
  })

  // Sync network theme with active invoice
  useEffect(() => {
    const currentInvoice = DEMO_INVOICES[activeIndex]
    if (currentInvoice) {
      setTheme(getNetworkName(currentInvoice.net))
    }
  }, [activeIndex, setTheme])

  const currentInvoice = DEMO_INVOICES[activeIndex]

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    pause()
  }, [pause])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    if (!prefersReducedMotion) {
      resume()
    }
  }, [prefersReducedMotion, resume])

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

  const theme = NETWORK_THEMES[getNetworkName(currentInvoice.net)]

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
        style={{ height: scaledHeight + 40 }}
      >
        {/* Hover zone */}
        <div
          className="absolute top-0 left-1/2 z-20 -translate-x-1/2"
          style={{
            width: INVOICE_WIDTH * scale,
            height: scaledHeight,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Scaled invoice */}
          <div
            className="absolute top-0 left-1/2 origin-top transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-50%) scale(${scale})` }}
          >
            <div className="rounded-sm shadow-[0_50px_150px_-30px_rgba(0,0,0,0.8)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentInvoice.id}
                  initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldAnimate ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <div className="rounded-sm shadow-[0_50px_150px_-30px_rgba(0,0,0,0.8)]">
                    <InvoicePaper data={currentInvoice} className="border-none shadow-none" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Hover CTA */}
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
                  size="default"
                  className="rounded-full bg-violet-600 px-8 py-4"
                  asChild
                >
                  <Link href={`/create?template=${currentInvoice.id}`}>Use This Template</Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Background glow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`glow-${currentInvoice.net}`}
            initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={shouldAnimate ? { opacity: 0, scale: 0.8 } : { opacity: 0.7, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`pointer-events-none absolute top-[40%] left-1/2 -z-10 aspect-square w-full max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr ${theme.glowFrom} ${theme.glowTo} mix-blend-screen blur-[100px]`}
            style={{ transform: `translateX(-50%) translateY(-50%) scale(${scale})` }}
          />
        </AnimatePresence>
      </div>

      {/* Pagination */}
      <DemoPagination items={DEMO_INVOICES} activeIndex={activeIndex} onSelect={handleDotSelect} />
    </section>
  )
}
