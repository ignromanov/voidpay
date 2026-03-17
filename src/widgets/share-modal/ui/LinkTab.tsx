'use client'

import { useMemo } from 'react'
import { CheckIcon, CopyIcon, SendIcon, TwitterIcon, LockIcon } from '@/shared/ui/icons'
import { motion } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Text } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'
import { decodeOGPreview, getNetworkIdFromCode } from '@/features/invoice-codec'
import { getNetworkName } from '@/entities/network'

interface LinkTabProps {
  url: string
  copied: boolean
  onCopy: () => void
  telegramUrl: string
  twitterUrl: string
}

interface UrlParts {
  domain: string
  route: string
  ogRaw: string | null
  hash: string | null
  ogMeta: { id: string; amount: string; currency: string; network: string } | null
}

function parseInvoiceUrl(url: string): UrlParts {
  try {
    const parsed = new URL(url)
    const domain = parsed.host
    const route = parsed.pathname
    const ogRaw = parsed.searchParams.get('og')
    const hash = parsed.hash ? parsed.hash.slice(1) : null // remove #

    let ogMeta: UrlParts['ogMeta'] = null
    if (ogRaw) {
      try {
        const decoded = decodeOGPreview(ogRaw)
        const networkId = getNetworkIdFromCode(decoded.network)
        ogMeta = {
          id: decoded.id,
          amount: decoded.amount,
          currency: decoded.currency,
          network: networkId ? getNetworkName(networkId) : decoded.network,
        }
      } catch {
        // OG decode failed — show raw
      }
    }

    return { domain, route, ogRaw, hash, ogMeta }
  } catch {
    return { domain: url, route: '', ogRaw: null, hash: null, ogMeta: null }
  }
}

function truncateHash(hash: string, chars = 20): string {
  if (hash.length <= chars * 2) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-8)}`
}

export function LinkTab({ url, copied, onCopy, telegramUrl, twitterUrl }: LinkTabProps) {
  const parts = useMemo(() => parseInvoiceUrl(url), [url])

  return (
    <motion.div
      key="link-tab"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5"
    >
      {/* URL Anatomy card */}
      <div
        className="cursor-text select-all rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 font-mono text-sm [&::selection]:bg-violet-500/30 [&_*::selection]:bg-violet-500/30"
        onClick={(e) => {
          const selection = window.getSelection()
          const range = document.createRange()
          range.selectNodeContents(e.currentTarget)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }}
      >
        {/* Domain — brand accent */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-violet-400 font-bold text-base tracking-tight">
            {parts.domain}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-zinc-300">{parts.route}</span>
        </div>

        {/* OG preview param */}
        {parts.ogRaw && (
          <div>
            <span className="text-zinc-600">?og=</span>
            <span className="text-zinc-500 text-xs">{parts.ogRaw}</span>
          </div>
        )}

        {/* Hash fragment — the encrypted invoice */}
        {parts.hash && (
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600">#</span>
              <span className="text-violet-400/80 text-xs break-all">
                {truncateHash(parts.hash)}
              </span>
              <LockIcon size={12} className="shrink-0 text-violet-500/60" />
            </div>
            {/* Subtle glow behind hash */}
            <div className="absolute inset-0 -z-10 rounded-lg bg-violet-500/5 blur-sm" />
          </div>
        )}
      </div>

      {/* OG Metadata badges */}
      {parts.ogMeta && (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="font-mono text-[11px]">
            {parts.ogMeta.id}
          </Badge>
          <Badge variant="secondary" className="text-[11px]">
            {parts.ogMeta.amount} {parts.ogMeta.currency}
          </Badge>
          <Badge variant="secondary" className="text-[11px]">
            {parts.ogMeta.network}
          </Badge>
        </div>
      )}

      {/* Privacy message */}
      <Text variant="tiny" className="text-zinc-500">
        All data lives in this link. No server. No database.
      </Text>

      {/* Copy button — full width primary */}
      <Button
        onClick={onCopy}
        variant="default"
        className={cn(
          'w-full',
          copied && 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
        )}
      >
        {copied ? (
          <>
            <CheckIcon size={16} className="mr-1.5" /> Copied!
          </>
        ) : (
          <>
            <CopyIcon size={16} className="mr-1.5" /> Copy Link
          </>
        )}
      </Button>

      {/* Social share links */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#0088cc]/20 bg-[#0088cc]/10 py-2.5 text-sm font-bold text-[#0088cc] transition-all hover:bg-[#0088cc]/20 active:scale-[0.97]"
        >
          <SendIcon size={16} /> Telegram
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-[0.97]"
        >
          <TwitterIcon size={16} /> Twitter / X
        </a>
      </div>
    </motion.div>
  )
}
