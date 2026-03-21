'use client'

import { CheckIcon, CopyIcon, LockIcon, MailIcon, SendIcon, TwitterIcon } from '@/shared/ui/icons'
import { motion } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'

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
 * - domain (e.g. voidpay.xyz)
 * - path (e.g. /pay)
 * - ogParams (e.g. ?og=...) — only present when includeOg=true
 * - hash (e.g. #N4Ig...)
 */
function parseUrlParts(url: string): {
  domain: string
  path: string
  ogParams: string
  hash: string
} {
  try {
    const parsed = new URL(url)
    return {
      domain: parsed.hostname,
      path: parsed.pathname,
      ogParams: parsed.search,
      hash: parsed.hash,
    }
  } catch {
    return { domain: '', path: url, ogParams: '', hash: '' }
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
  const { domain, path, ogParams, hash } = parseUrlParts(url)

  return (
    <motion.div
      key="link-tab"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* 1. Link display — no inline copy button */}
      <div className="space-y-2">
        <Text variant="label">Permalink</Text>
        <div
          className="max-h-20 cursor-text overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-xs leading-relaxed [&::selection]:bg-violet-500/30 [&::selection]:text-white [&_*::selection]:bg-violet-500/30 [&_*::selection]:text-white"
          style={{ wordBreak: 'break-all' }}
          onClick={(e) => {
            const selection = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(e.currentTarget)
            selection?.removeAllRanges()
            selection?.addRange(range)
          }}
        >
          <span className="font-semibold text-violet-500">{domain}</span>
          <span className="text-violet-400/70">{path}</span>
          {includeOg && ogParams && (
            <span className="text-amber-500">{ogParams}</span>
          )}
          {hash && <span className="text-zinc-400">{hash}</span>}
        </div>
      </div>

      {/* 2. Primary CTA — Copy Link */}
      <Button
        variant="void"
        size="lg"
        className={cn(
          'w-full',
          copied && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-none hover:bg-emerald-500/25'
        )}
        onClick={onCopy}
      >
        {copied ? (
          <>
            <CheckIcon size={16} /> Copied
          </>
        ) : (
          <>
            <CopyIcon size={16} /> Copy Link
          </>
        )}
      </Button>

      {/* 3. Share buttons — 3-column grid */}
      <div className="grid grid-cols-3 gap-2">
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#0088cc]/20 bg-[#0088cc]/8 py-2.5 text-xs font-semibold text-[#0088cc] transition-colors hover:bg-[#0088cc]/15"
        >
          <SendIcon size={14} /> Telegram
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/8"
        >
          <TwitterIcon size={14} /> Twitter
        </a>
        <a
          href={emailUrl}
          className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 py-2.5 text-xs font-semibold text-amber-500 transition-colors hover:bg-amber-500/15"
        >
          <MailIcon size={14} /> Email
        </a>
      </div>

      {/* 4. OG toggle */}
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 transition-colors hover:border-zinc-700">
        <input
          type="checkbox"
          checked={includeOg}
          onChange={(e) => onOgToggle(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 text-[10px] transition-colors',
            includeOg
              ? 'border-amber-500 bg-amber-500/15 text-amber-500'
              : 'border-zinc-600 bg-transparent text-transparent'
          )}
        >
          ✓
        </div>
        <div>
          <div className="text-xs font-semibold text-zinc-200">Include public preview</div>
          <div className="text-[11px] text-zinc-500">Shows amount &amp; token in link previews</div>
        </div>
      </label>

      {/* 5. Privacy hint */}
      <div className="flex items-start gap-2 rounded-lg border border-violet-500/15 bg-violet-500/8 px-3 py-2.5">
        <LockIcon size={14} className="mt-0.5 shrink-0 text-violet-400" />
        <p className="text-xs leading-relaxed text-violet-300">
          <strong>Privacy by design.</strong> Your invoice data is encoded directly in this link. No
          servers. No tracking.
        </p>
      </div>
    </motion.div>
  )
}
