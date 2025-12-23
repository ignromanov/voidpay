/**
 * WhyVoidPay - Feature grid with TOP 3 highlighted
 * Feature: 012-landing-page
 * User Story: US3 (Feature Discovery & Trust Building)
 */

'use client'

import type { SVGProps } from 'react'

import { useHydrated } from '@/shared/lib'
import { cn } from '@/shared/lib/utils'
import { Heading, Text } from '@/shared/ui'
import { motion } from '@/shared/ui/motion'
import { useReducedMotion } from '@/shared/ui/hooks/use-reduced-motion'

import { FEATURE_CARDS } from '../constants/features'

// TOP 3 features to highlight (by id) - order matters for display
const TOP_FEATURES = ['no-database', 'instant', 'multichain']

function HeroFeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = 'text-violet-500',
  shouldAnimate,
}: {
  icon: React.ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  iconColor?: string
  shouldAnimate: boolean
}) {
  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group rounded-3xl border border-violet-500/20 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-10 backdrop-blur-sm transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-900/10"
    >
      {/* Icon container - larger */}
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 shadow-lg transition-transform group-hover:scale-110">
        <Icon className={cn('h-8 w-8', iconColor)} aria-hidden="true" />
      </div>
      <Heading variant="h2" as="h3" className="mb-4 text-2xl">
        {title}
      </Heading>
      <Text variant="large" className="text-zinc-400">
        {description}
      </Text>
    </motion.div>
  )
}

export function WhyVoidPay() {
  const prefersReducedMotion = useReducedMotion()
  const hydrated = useHydrated()
  const shouldAnimate = hydrated && !prefersReducedMotion

  // Sort topCards to match TOP_FEATURES order
  const topCards = TOP_FEATURES
    .map((id) => FEATURE_CARDS.find((card) => card.id === id))
    .filter((card): card is NonNullable<typeof card> => card !== undefined)

  return (
    <section className="relative bg-transparent px-6 py-32" aria-labelledby="why-voidpay-heading">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <Heading variant="h1" as="h2" id="why-voidpay-heading" className="mb-4">
            Why VoidPay?
          </Heading>
          <Text variant="large" className="mx-auto max-w-2xl text-zinc-400">
            Built for freelancers, DAOs, and agencies who demand privacy and speed.
          </Text>
        </div>

        {/* TOP 3 feature cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {topCards.map((card) => (
            <HeroFeatureCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              description={card.description}
              shouldAnimate={shouldAnimate}
              {...(card.iconColor ? { iconColor: card.iconColor } : {})}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
