/**
 * HowItWorks - Horizontal timeline workflow section
 * Feature: 012-landing-page
 * User Story: US3 (Feature Discovery & Trust Building)
 */

'use client'

import type { SVGProps } from 'react'

import { ArrowRight } from 'lucide-react'

import { useHydrated } from '@/shared/lib'
import { Heading, Text } from '@/shared/ui'
import { motion } from '@/shared/ui/motion'
import { useReducedMotion } from '@/shared/ui/hooks/use-reduced-motion'

import { WORKFLOW_STEPS } from '../constants/features'

function TimelineStep({
  step,
  icon: Icon,
  title,
  description,
  isLast,
}: {
  step: number
  icon: React.ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  isLast: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const hydrated = useHydrated()
  const shouldAnimate = hydrated && !prefersReducedMotion

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: step * 0.15 }}
      className="relative flex flex-col items-center text-center md:flex-1"
    >
      {/* Step number + Icon */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-600/10 shadow-lg shadow-violet-900/10">
          <Icon className="h-10 w-10 text-violet-400" aria-hidden="true" />
        </div>
        {/* Step number badge */}
        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-lg">
          {step}
        </span>
      </div>

      {/* Title */}
      <Heading variant="h3" as="h3" className="mb-2 text-xl">
        {title}
      </Heading>

      {/* Description */}
      <Text variant="body" className="max-w-xs text-sm text-zinc-400">
        {description}
      </Text>

      {/* Arrow to next step (hidden on mobile, shown on md+) */}
      {!isLast && (
        <div className="absolute right-0 top-10 hidden translate-x-1/2 md:block">
          <ArrowRight className="h-6 w-6 text-zinc-600" aria-hidden="true" />
        </div>
      )}
    </motion.div>
  )
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-zinc-950/10 px-6 py-32 backdrop-blur-sm"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Section header */}
        <div className="space-y-4 text-center">
          <Heading variant="h1" as="h2" id="how-it-works-heading">
            Three Steps to Get Paid
          </Heading>
          <Text variant="large" className="text-zinc-400">
            No accounts. No sign-ups. Just invoices.
          </Text>
        </div>

        {/* Timeline steps */}
        <div className="relative flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-8">
          {WORKFLOW_STEPS.map(({ step, title, description, icon }, index) => (
            <TimelineStep
              key={step}
              step={step}
              icon={icon}
              title={title}
              description={description}
              isLast={index === WORKFLOW_STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
