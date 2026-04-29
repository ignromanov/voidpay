'use client'

/**
 * Footer Component
 *
 * Supports two rendering modes via `floating` prop:
 * - floating=false (default): in document flow (sticky-bottom via parent flex column)
 * - floating=true: fixed overlay at bottom (used on viewport-locked routes like /pay, /create)
 *
 * No backdrop-filter — avoids repaint on scroll (perf win retained from refactor).
 */

import { GithubIcon, MailIcon, TwitterIcon, FileTextIcon, ShieldIcon } from '@/shared/ui/icons'
import { AnalyticsToggle } from '@/features/analytics'
import { SOCIAL_URLS } from '@/shared/config'
import { cn } from '@/shared/lib/utils'

export interface FooterProps {
  /**
   * If true, renders as fixed overlay (used on viewport-locked routes like /pay, /create).
   * Default: false — renders in document flow (sticky-bottom via parent flex column).
   */
  floating?: boolean
}

const ICON_BTN = 'flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300'
const ICON_SIZE = 'h-4 w-4'

export function Footer({ floating = false }: FooterProps) {
  return (
    <footer
      className={cn(
        'border-t border-zinc-800/30 bg-zinc-950 pb-[env(safe-area-inset-bottom,0px)] print:hidden',
        floating
          ? 'fixed right-0 bottom-0 left-0 z-40'
          : 'relative z-10'
      )}
    >
      <div className="mx-auto flex min-h-11 max-w-7xl flex-nowrap items-center justify-between gap-x-3 px-3 py-1 text-xs text-zinc-400 sm:gap-x-4 sm:px-4">
        {/* Left: Copyright + legal */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="hidden whitespace-nowrap sm:inline">© 2026 VoidPay · MIT</span>
          <span className="whitespace-nowrap sm:hidden">© VoidPay</span>

          {/* Terms — text on sm+, icon below sm */}
          <a
            href="/terms"
            aria-label="Terms"
            className={cn(ICON_BTN, 'sm:h-11 sm:w-auto sm:rounded sm:px-2 sm:hover:bg-transparent')}
          >
            <FileTextIcon className={cn(ICON_SIZE, 'sm:hidden')} aria-hidden="true" />
            <span className="hidden sm:inline">Terms</span>
          </a>

          {/* Privacy — text on sm+, icon below sm */}
          <a
            href="/privacy"
            aria-label="Privacy"
            className={cn(ICON_BTN, 'sm:h-11 sm:w-auto sm:rounded sm:px-2 sm:hover:bg-transparent')}
          >
            <ShieldIcon className={cn(ICON_SIZE, 'sm:hidden')} aria-hidden="true" />
            <span className="hidden sm:inline">Privacy</span>
          </a>

          <AnalyticsToggle />
        </div>

        {/* Right: contact + social — all icons same size, all touch targets 44px */}
        <div className="flex shrink-0 items-center gap-1">
          <a href="mailto:hello@voidpay.xyz" className={ICON_BTN} aria-label="Contact email">
            <MailIcon className={ICON_SIZE} />
          </a>
          <a
            href={SOCIAL_URLS.github}
            target="_blank"
            rel="noopener noreferrer"
            className={ICON_BTN}
            aria-label="GitHub"
          >
            <GithubIcon className={ICON_SIZE} />
          </a>
          <a
            href={SOCIAL_URLS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className={ICON_BTN}
            aria-label="Twitter"
          >
            <TwitterIcon className={ICON_SIZE} />
          </a>
        </div>
      </div>
    </footer>
  )
}
