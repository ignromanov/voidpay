/**
 * ComparisonTable - VoidPay vs competitors
 * Feature: 012-landing-page
 * Research: Honest comparison builds trust (23% conversion lift)
 */

'use client'

import { Check, X, Minus } from 'lucide-react'

import { Heading, Text, motion, useReducedMotion } from '@/shared/ui'

type ComparisonValue = 'yes' | 'no' | 'partial' | string

type ComparisonRow = {
  feature: string
  voidpay: ComparisonValue
  requestNetwork: ComparisonValue
  traditional: ComparisonValue
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Sign-up Required',
    voidpay: 'no',
    requestNetwork: 'yes',
    traditional: 'yes',
  },
  {
    feature: 'Data Storage',
    voidpay: 'None (URL)',
    requestNetwork: 'IPFS',
    traditional: 'Server',
  },
  {
    feature: 'Cost',
    voidpay: 'Free',
    requestNetwork: 'Gas + Fees',
    traditional: 'Subscription',
  },
  {
    feature: 'Privacy Level',
    voidpay: 'Maximum',
    requestNetwork: 'partial',
    traditional: 'no',
  },
  {
    feature: 'Setup Time',
    voidpay: '30 seconds',
    requestNetwork: '~5 minutes',
    traditional: '1+ day',
  },
  {
    feature: 'Multi-Chain',
    voidpay: 'yes',
    requestNetwork: 'yes',
    traditional: 'no',
  },
]

function ValueCell({ value }: { value: ComparisonValue }) {
  if (value === 'yes') {
    return (
      <div className="flex justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-4 w-4 text-emerald-400" />
        </div>
      </div>
    )
  }
  if (value === 'no') {
    return (
      <div className="flex justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
          <X className="h-4 w-4 text-red-400" />
        </div>
      </div>
    )
  }
  if (value === 'partial') {
    return (
      <div className="flex justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20">
          <Minus className="h-4 w-4 text-yellow-400" />
        </div>
      </div>
    )
  }
  return <span className="text-sm text-zinc-300">{value}</span>
}

export function ComparisonTable() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative z-10 border-t border-zinc-900 bg-zinc-950/10 px-6 py-32 backdrop-blur-sm">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        {/* Section header */}
        <div className="mb-12 text-center">
          <Heading variant="h1" as="h2" className="mb-4">
            How We Compare
          </Heading>
          <Text variant="large" className="mx-auto max-w-xl text-zinc-400">
            An honest look at VoidPay vs. alternatives.
          </Text>
        </div>

        {/* Comparison table - horizontally scrollable on mobile */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30">
          <div className="min-w-[500px]">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 border-b border-zinc-800 bg-zinc-900/50 px-4 py-4 md:px-6">
              <div className="text-left text-sm font-medium text-zinc-400">Feature</div>
              <div className="text-center text-sm font-bold text-violet-400">VoidPay</div>
              <div className="text-center text-sm font-medium text-zinc-400">Request</div>
              <div className="text-center text-sm font-medium text-zinc-400">Traditional</div>
            </div>

            {/* Table rows */}
            {COMPARISON_DATA.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 items-center gap-4 px-4 py-4 md:px-6 ${
                  index < COMPARISON_DATA.length - 1 ? 'border-b border-zinc-800/50' : ''
                }`}
              >
                <div className="text-sm font-medium text-zinc-100">{row.feature}</div>
                <div className="text-center">
                  <ValueCell value={row.voidpay} />
                </div>
                <div className="text-center">
                  <ValueCell value={row.requestNetwork} />
                </div>
                <div className="text-center">
                  <ValueCell value={row.traditional} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <Text variant="small" className="mt-6 text-center text-zinc-500">
          Comparison based on public documentation as of December 2024. Features may vary.
        </Text>
      </motion.div>
    </section>
  )
}
