/**
 * AudienceCard - Card component for audience segmentation
 * Feature: 012-landing-page
 */

'use client'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Heading, Text, motion } from '@/shared/ui'

export type AudienceCardProps = {
  icon: LucideIcon
  title: string
  headline: string
  description: string
  iconColor?: string
  shouldAnimate: boolean
}

export function AudienceCard({
  icon: Icon,
  title,
  headline,
  description,
  iconColor = 'text-violet-500',
  shouldAnimate,
}: AudienceCardProps) {
  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group rounded-3xl border border-zinc-800/50 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-8 backdrop-blur-sm transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/20"
    >
      {/* Icon + Title row */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
          <Icon className={cn('h-5 w-5', iconColor)} aria-hidden="true" />
        </div>
        <Text variant="body" className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          {title}
        </Text>
      </div>

      {/* Headline */}
      <Heading variant="h3" as="h3" className="mb-3 text-xl">
        {headline}
      </Heading>

      {/* Description */}
      <Text variant="body" className="leading-relaxed text-zinc-400">
        {description}
      </Text>
    </motion.div>
  )
}
