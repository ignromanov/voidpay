'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@/shared/ui/icons'
import { track, AnalyticsEvent } from '@/features/analytics'

export function CreateYourOwnCta() {
  return (
    <Link
      href="/create"
      onClick={() => track(AnalyticsEvent.PAY_TO_CREATE_CLICK)}
      className="group inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-violet-400 py-2 min-h-[44px]"
    >
      Create your own invoice
      <ArrowRightIcon size={12} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
