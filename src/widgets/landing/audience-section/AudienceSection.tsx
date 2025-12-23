/**
 * AudienceSection - "Built For" audience segmentation
 * Feature: 012-landing-page
 * DAO Diplomat: Target Freelancers, DAOs, and Agencies with specific pain points
 */

'use client'

import { Briefcase, Building2, Users } from 'lucide-react'

import { useHydrated } from '@/shared/lib'
import { Heading, Text, useReducedMotion } from '@/shared/ui'

import { AudienceCard } from './AudienceCard'

const AUDIENCES = [
  {
    id: 'freelancers',
    icon: Briefcase,
    title: 'Freelancers',
    headline: 'Get paid without giving up privacy',
    description:
      'Your PayPal can freeze your funds. Your bank requires KYC. Invoice apps track every transaction. VoidPay? Just a URL. No middleman. No profile. No trace.',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'daos',
    icon: Users,
    title: 'DAOs',
    headline: 'Pay contributors. Keep it private.',
    description:
      'No treasury doxx, no recipient exposure, no middleman logs. Simple URL workflow for contributor payments without the compliance overhead.',
    iconColor: 'text-violet-500',
  },
  {
    id: 'agencies',
    icon: Building2,
    title: 'Agencies',
    headline: 'Professional invoices, zero infrastructure',
    description:
      'No SaaS subscriptions. No server setup. No database maintenance. Create professional crypto invoices and share them instantly.',
    iconColor: 'text-cyan-500',
  },
] as const

export function AudienceSection() {
  const prefersReducedMotion = useReducedMotion()
  const hydrated = useHydrated()
  const shouldAnimate = hydrated && !prefersReducedMotion

  return (
    <section
      className="relative bg-transparent px-6 py-32"
      aria-labelledby="audience-section-heading"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <Heading variant="h1" as="h2" id="audience-section-heading" className="mb-4">
            Built For
          </Heading>
          <Text variant="large" className="mx-auto max-w-2xl text-zinc-400">
            Whether you&apos;re a solo creator, a DAO treasurer, or running an agency — VoidPay
            works the way you do.
          </Text>
        </div>

        {/* Audience cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <AudienceCard
              key={audience.id}
              icon={audience.icon}
              title={audience.title}
              headline={audience.headline}
              description={audience.description}
              iconColor={audience.iconColor}
              shouldAnimate={shouldAnimate}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
