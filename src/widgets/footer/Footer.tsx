'use client'

/**
 * Footer Component
 *
 * Minimal glass-style footer:
 * - Sticky to bottom
 * - Glass effect (backdrop-blur)
 * - Single line: copyright, links, social
 */

import { GithubIcon, MailIcon, TwitterIcon } from '@/shared/ui/icons'

import { AnalyticsToggle } from '@/features/analytics'
import { SOCIAL_URLS } from '@/shared/config'

export function Footer() {
  return (
    <footer className="fixed right-0 bottom-0 left-0 z-40 border-t border-zinc-800/30 bg-zinc-950/60 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl print:hidden">
      <div className="mx-auto flex min-h-10 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 text-xs text-zinc-400">
        {/* Left: Copyright */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">© 2026 VoidPay · MIT</span>
          <span className="sm:hidden">© VoidPay</span>
          <a href="/privacy" className="inline-flex min-h-[44px] items-center transition-colors hover:text-zinc-300">
            Privacy
          </a>
          <a href="/terms" className="inline-flex min-h-[44px] items-center transition-colors hover:text-zinc-300">
            Terms
          </a>
          <AnalyticsToggle />
        </div>

        {/* Right: Social + Contact */}
        <div className="flex items-center gap-2">
          <a
            href="mailto:hello@voidpay.xyz"
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
            aria-label="Contact email"
          >
            <MailIcon className="h-4 w-4" />
          </a>
          <a
            href={SOCIAL_URLS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
            aria-label="GitHub"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <a
            href={SOCIAL_URLS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
            aria-label="Twitter"
          >
            <TwitterIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
