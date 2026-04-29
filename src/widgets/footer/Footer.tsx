'use client'

/**
 * Footer Component
 *
 * Minimal footer — sticky-bottom via flex document flow (mt-auto in body column):
 * - No fixed positioning — no backdrop-filter repaint on scroll
 * - Single line guaranteed on all viewports ≥320px (flex-nowrap)
 * - copyright, links, social
 */

import { GithubIcon, MailIcon, TwitterIcon } from '@/shared/ui/icons'

import { AnalyticsToggle } from '@/features/analytics'
import { SOCIAL_URLS } from '@/shared/config'

const SOCIAL_LINK = 'flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800/50 hover:text-zinc-300'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-zinc-800/30 bg-zinc-950 pb-[env(safe-area-inset-bottom,0px)] print:hidden">
      <div className="mx-auto flex min-h-11 max-w-7xl flex-nowrap items-center justify-between gap-x-4 px-4 py-1.5 text-xs text-zinc-400">
        {/* Left: Copyright */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">© 2026 VoidPay · MIT</span>
          <span className="sm:hidden">© VoidPay</span>
          <a href="/terms" className="inline-flex min-h-[44px] items-center transition-colors hover:text-zinc-300">
            Terms
          </a>
          <a href="/privacy" className="inline-flex min-h-[44px] items-center transition-colors hover:text-zinc-300">
            Privacy
          </a>
          <AnalyticsToggle />
        </div>

        {/* Right: Social + Contact */}
        <div className="flex items-center gap-2">
          <a
            href="mailto:hello@voidpay.xyz"
            className={SOCIAL_LINK}
            aria-label="Contact email"
          >
            <MailIcon className="h-4 w-4" />
          </a>
          <a
            href={SOCIAL_URLS.github}
            target="_blank"
            rel="noopener noreferrer"
            className={SOCIAL_LINK}
            aria-label="GitHub"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <a
            href={SOCIAL_URLS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className={SOCIAL_LINK}
            aria-label="Twitter"
          >
            <TwitterIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
