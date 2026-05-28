'use client'

import { CheckIcon, CopyIcon, LockIcon, MailIcon, SendIcon, TwitterIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'
import { toAbsoluteUrl } from '@/shared/config/urls'
import { track, AnalyticsEvent } from '@/features/analytics'
import { CopyOverlay } from './CopyOverlay'

interface LinkTabProps {
  /** Full invoice URL */
  url: string
  /** Whether URL was recently copied */
  copied: boolean
  /** Handler for copy button click */
  onCopy: () => void
  /** Telegram share URL */
  telegramUrl: string
  /** Twitter share URL */
  twitterUrl: string
  /** Email share URL (mailto:) */
  emailUrl: string
  /** Whether OG preview params are included */
  includeOg: boolean
  /** Handler for OG toggle */
  onOgToggle: (include: boolean) => void
}

/**
 * Parse a full invoice URL into color-coded parts:
 * - domain (e.g. voidpay.xyz or localhost:3000)
 * - path (e.g. /pay)
 * - ogParams (e.g. ?og=...) — only present when includeOg=true
 * - hash (e.g. #N4Ig...)
 */
function parseUrlParts(url: string): {
  protocol: string
  domain: string
  path: string
  ogParams: string
  hash: string
} {
  try {
    const parsed = new URL(toAbsoluteUrl(url))
    return {
      protocol: parsed.protocol + '//', // e.g. "https://"
      domain: parsed.host, // host includes port (e.g. localhost:3000)
      path: parsed.pathname,
      ogParams: parsed.search,
      hash: parsed.hash,
    }
  } catch {
    return { protocol: '', domain: '', path: url, ogParams: '', hash: '' }
  }
}

/**
 * Link tab content: color-coded URL, void CTA, 3-col share grid, OG toggle, privacy hint
 */
export function LinkTab({
  url,
  copied,
  onCopy,
  telegramUrl,
  twitterUrl,
  emailUrl,
  includeOg,
  onOgToggle,
}: LinkTabProps) {
  const { protocol, domain, path, ogParams, hash } = parseUrlParts(url)

  return (
    <div
      key="link-tab"
      className="space-y-4 motion-safe:animate-slide-in-right"
    >
      {/* Link display */}
      <div className="space-y-2">
        <Text variant="label">Permalink</Text>
        <div
          className="max-h-24 sm:max-h-28 cursor-text overflow-y-auto break-all rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2 sm:px-3 sm:py-2.5 font-mono text-[11px] sm:text-xs leading-relaxed [&::selection]:bg-violet-500/15 [&_*::selection]:bg-violet-500/15"
          onClick={(e) => {
            const selection = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(e.currentTarget)
            selection?.removeAllRanges()
            selection?.addRange(range)
          }}
        >
          <span className="text-zinc-600">{protocol}</span>
          <span className="font-semibold text-violet-500">{domain}</span>
          <span className="text-violet-400/70">{path}</span>
          {includeOg && ogParams && (
            <span className="text-amber-500">{ogParams}</span>
          )}
          {hash && <span className="text-zinc-400">{hash}</span>}
        </div>
      </div>

      <Button
        variant="void"
        className="h-auto w-full py-3"
        onClick={() => {
          track(AnalyticsEvent.SHARE_LINK_COPY, { has_og: includeOg })
          onCopy()
        }}
      >
        <CopyOverlay copied={copied} />
        <span className="relative z-10 flex items-center gap-2">
          {copied ? (
            <>
              <CheckIcon size={18} className="text-emerald-400" />
              <span className="text-sm font-medium">Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon size={18} />
              <span className="text-sm font-medium">Copy Link</span>
            </>
          )}
        </span>
      </Button>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share invoice via Telegram"
          className="flex min-h-[44px] items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-lg border border-[#0088cc]/20 bg-[#0088cc]/10 px-2 sm:px-3 py-2.5 text-xs font-semibold text-[#0088cc] transition-all hover:bg-[#0088cc]/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0088cc]/50 active:scale-95"
          onClick={() => track(AnalyticsEvent.SHARE_SOCIAL, { channel: 'telegram' })}
        >
          <SendIcon size={14} /> Telegram
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share invoice via Twitter"
          className="flex min-h-[44px] items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 active:scale-95"
          onClick={() => track(AnalyticsEvent.SHARE_SOCIAL, { channel: 'twitter' })}
        >
          <TwitterIcon size={14} /> Twitter
        </a>
        <a
          href={emailUrl}
          aria-label="Share invoice via Email"
          className="flex min-h-[44px] items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 sm:px-3 py-2.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50 active:scale-95"
          onClick={() => track(AnalyticsEvent.SHARE_SOCIAL, { channel: 'email' })}
        >
          <MailIcon size={14} /> Email
        </a>
      </div>

      <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 transition-colors focus-within:ring-1 focus-within:ring-amber-500/50">
        <input
          type="checkbox"
          checked={includeOg}
          onChange={(e) => onOgToggle(e.target.checked)}
          className="sr-only"
          aria-label="Toggle link preview card"
        />
        <div
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors',
            includeOg
              ? 'bg-amber-500 text-white'
              : 'border border-zinc-600 bg-transparent text-transparent'
          )}
        >
          <CheckIcon size={12} strokeWidth={3} />
        </div>
        <div>
          <span className={cn(
            'text-xs font-medium transition-colors',
            includeOg ? 'text-amber-400' : 'text-zinc-500'
          )}>
            Link preview card
          </span>
          <p className="text-xs text-zinc-600">Shows amount &amp; network in social previews</p>
        </div>
      </label>

      <div className="flex items-start gap-2 px-1">
        <LockIcon size={12} className="mt-0.5 shrink-0 text-zinc-600" />
        <p className="text-xs leading-relaxed text-zinc-500">
          <strong className="text-zinc-400">Privacy by design.</strong> Invoice data is encoded in the link. No servers. We can&apos;t see it.
        </p>
      </div>
    </div>
  )
}
