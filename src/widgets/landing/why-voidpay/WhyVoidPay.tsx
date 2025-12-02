/**
 * WhyVoidPay - 6-card feature grid section
 * Feature: 012-landing-page
 * User Story: US3 (Feature Discovery & Trust Building)
 */

'use client'

import type { SVGProps } from 'react'

import { cn } from '@/lib/utils'
import { Heading, Text } from '@/shared/ui'

import { FEATURE_CARDS } from '../constants/features'

function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = 'text-violet-500',
}: {
  icon: React.ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  iconColor?: string
}) {
  return (
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8 backdrop-blur-sm transition-all hover:border-zinc-600 hover:bg-zinc-900/40">
      {/* Icon container */}
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 shadow-inner transition-transform group-hover:scale-110">
        <Icon className={cn('h-5 w-5', iconColor)} aria-hidden="true" />
      </div>
      <Heading variant="h3" as="h3" className="mb-3">
        {title}
      </Heading>
      <Text variant="body" className="text-zinc-400">
        {description}
      </Text>
    </div>
  )
}

export function WhyVoidPay() {
  return (
    <section className="relative z-10 bg-transparent px-6 py-40" aria-labelledby="why-voidpay-heading">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-20 text-center md:text-left">
          <Heading variant="h1" as="h2" id="why-voidpay-heading" className="mb-4">
            Why VoidPay?
          </Heading>
          <Text variant="large" className="max-w-2xl text-zinc-400">
            Built for freelancers, DAOs, and agencies who demand aesthetic perfection and
            cryptographic security.
          </Text>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <FeatureCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              description={card.description}
              {...(card.iconColor ? { iconColor: card.iconColor } : {})}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
