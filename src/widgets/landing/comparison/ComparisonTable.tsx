/**
 * ComparisonTable - VoidPay vs competitors
 * Feature: 012-landing-page
 * Research: Honest comparison builds trust (23% conversion lift)
 */

import { Check, X, Minus } from 'lucide-react'

import { Heading, Text } from '@/shared/ui/typography'

type ComparisonValue = 'yes' | 'no' | 'partial' | string

type ComparisonRow = {
  feature: string
  voidpay: ComparisonValue
  requestNetwork: ComparisonValue
  basenode: ComparisonValue
  traditional: ComparisonValue
}

/**
 * Comparison data based on market research (December 2025)
 * Sources: Request Finance docs, Basenode.io pricing, industry reports
 * Order: VoidPay → Request → Basenode → Traditional (last)
 */
const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Sign-up Required',
    voidpay: 'no',
    requestNetwork: 'yes',
    basenode: 'yes',
    traditional: 'yes',
  },
  {
    feature: 'KYC Required',
    voidpay: 'no',
    requestNetwork: 'partial',
    basenode: 'no',
    traditional: 'yes',
  },
  {
    feature: 'Data Storage',
    voidpay: 'None (URL)',
    requestNetwork: 'IPFS',
    basenode: 'Server',
    traditional: 'Server',
  },
  {
    feature: 'Platform Fee',
    voidpay: '$0',
    requestNetwork: '1-2%',
    basenode: 'Freemium',
    traditional: '~6.6%',
  },
  {
    feature: 'Free Invoices',
    voidpay: 'Unlimited',
    requestNetwork: 'partial',
    basenode: '12/year',
    traditional: 'partial',
  },
  {
    feature: 'Settlement Time',
    voidpay: 'Seconds',
    requestNetwork: 'Seconds',
    basenode: 'Seconds',
    traditional: '3-5 days',
  },
  {
    feature: 'Setup Time',
    voidpay: '30 seconds',
    requestNetwork: '~5 minutes',
    basenode: '~2 minutes',
    traditional: '1+ day',
  },
  {
    feature: 'Privacy Level',
    voidpay: 'Maximum',
    requestNetwork: 'partial',
    basenode: 'partial',
    traditional: 'no',
  },
  {
    feature: 'Works Offline',
    voidpay: 'yes',
    requestNetwork: 'no',
    basenode: 'no',
    traditional: 'no',
  },
  {
    feature: 'Self-Hostable',
    voidpay: 'yes',
    requestNetwork: 'no',
    basenode: 'no',
    traditional: 'no',
  },
  {
    feature: 'Multi-Chain',
    voidpay: 'yes',
    requestNetwork: 'yes',
    basenode: 'yes',
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
  return (
    <section className="relative border-t border-zinc-900 bg-zinc-950/10 px-6 py-32 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl">
        {/* Section header - SEO: competitor comparison keywords */}
        <div className="mb-16 text-center">
          <Heading variant="h1" as="h2" id="comparison-heading" className="mb-4">
            Crypto Invoice Tools Compared
          </Heading>
          <Text variant="large" className="mx-auto max-w-xl text-zinc-400">
            VoidPay vs Request Finance vs Basenode vs Traditional Invoicing
          </Text>
        </div>

        {/* Comparison table - horizontally scrollable on mobile */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30">
          <div className="min-w-[640px]">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-2 border-b border-zinc-800 bg-zinc-900/50 px-4 py-4 md:gap-4 md:px-6">
              <div className="text-left text-sm font-medium text-zinc-400">Feature</div>
              <div className="text-center text-sm font-bold text-violet-400">VoidPay</div>
              <div className="text-center text-sm font-medium text-zinc-400">Request</div>
              <div className="text-center text-sm font-medium text-zinc-400">Basenode</div>
              <div className="text-center text-sm font-medium text-zinc-400">Traditional</div>
            </div>

            {/* Table rows */}
            {COMPARISON_DATA.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-5 items-center gap-2 px-4 py-4 md:gap-4 md:px-6 ${
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
                  <ValueCell value={row.basenode} />
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
          Comparison based on public documentation as of December 2025. Features may vary.
        </Text>
      </div>
    </section>
  )
}
