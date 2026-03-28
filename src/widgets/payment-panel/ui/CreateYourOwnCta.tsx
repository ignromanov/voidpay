'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@/shared/ui/icons'
import { track, AnalyticsEvent } from '@/features/analytics'

export function CreateYourOwnCta() {
  return (
    <Link
      href="/create"
      onClick={() => track(AnalyticsEvent.PAY_TO_CREATE_CLICK)}
      className="group flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700/50 py-2.5 text-xs text-zinc-500 transition-all hover:border-violet-500/40 hover:text-violet-400 min-h-[44px]"
    >
      Create your own invoice with VoidPay
      <ArrowRightIcon size={12} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
