/**
 * HowItWorks - 3-step workflow section
 * Feature: 012-landing-page
 * User Story: US3 (Feature Discovery & Trust Building)
 */

'use client'

import type { SVGProps } from 'react'

import { Heading, Text } from '@/shared/ui'

import { WORKFLOW_STEPS } from '../constants/features'

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string
  icon: React.ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8 backdrop-blur-sm transition-colors hover:bg-zinc-900/40">
      {/* Large background number */}
      <span className="pointer-events-none absolute -right-4 -top-10 select-none text-[100px] font-black text-white/5 transition-colors group-hover:text-white/10 md:text-[150px]">
        {number}
      </span>
      <div className="relative z-10">
        {/* Icon container */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-900/20">
          <Icon className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <Heading variant="h2" as="h3" className="mb-3 text-2xl">
          {title}
        </Heading>
        <Text variant="body" className="text-zinc-400">
          {description}
        </Text>
      </div>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section
      className="relative z-10 border-t border-zinc-900 bg-zinc-950/10 px-6 py-40 backdrop-blur-sm"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-6xl space-y-20">
        {/* Section header */}
        <div className="space-y-4 text-center">
          <Heading variant="h1" as="h2" id="how-it-works-heading">
            How It Works
          </Heading>
          <Text variant="large" className="text-zinc-400">
            The simplest invoicing workflow in web3.
          </Text>
        </div>

        {/* Step cards grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {WORKFLOW_STEPS.map(({ step, title, description, icon }) => (
            <StepCard
              key={step}
              number={String(step).padStart(2, '0')}
              icon={icon}
              title={title}
              description={description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
