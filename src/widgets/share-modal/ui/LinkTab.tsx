'use client'

import { CheckIcon, CopyIcon, SendIcon, TwitterIcon } from '@/shared/ui/icons'
import { motion } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'

interface LinkTabProps {
  /** Base URL path (highlighted in violet) */
  basePath: string
  /** Rest of URL (query/hash, shown in muted color) */
  rest: string
  /** Whether URL was recently copied */
  copied: boolean
  /** Handler for copy button click */
  onCopy: () => void
  /** Telegram share URL */
  telegramUrl: string
  /** Twitter share URL */
  twitterUrl: string
}

/**
 * Link tab content with copy button, social sharing, and privacy warning
 */
export function LinkTab({
  basePath,
  rest,
  copied,
  onCopy,
  telegramUrl,
  twitterUrl,
}: LinkTabProps) {
  return (
    <motion.div
      key="link-tab"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Link display with copy button */}
      <div className="space-y-2">
        <Text variant="label" className="text-zinc-400">
          Permalink
        </Text>
        <div className="flex gap-2">
          <div
            className="max-h-24 flex-1 cursor-text select-all overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed [&::selection]:bg-violet-500/30 [&::selection]:text-white [&_*::selection]:bg-violet-500/30 [&_*::selection]:text-white"
            style={{ wordBreak: 'break-all' }}
            onClick={(e) => {
              const selection = window.getSelection()
              const range = document.createRange()
              range.selectNodeContents(e.currentTarget)
              selection?.removeAllRanges()
              selection?.addRange(range)
            }}
          >
            <span className="text-violet-400">{basePath}</span>
            {rest && <span className="text-zinc-500">{rest}</span>}
          </div>
          <Button
            onClick={onCopy}
            variant={copied ? 'secondary' : 'secondary'}
            className={cn(
              'w-24 shrink-0',
              copied && 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            )}
          >
            {copied ? (
              <>
                <CheckIcon size={16} className="mr-1" /> Copied
              </>
            ) : (
              <>
                <CopyIcon size={16} className="mr-1" /> Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Social share links */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#0088cc]/20 bg-[#0088cc]/10 py-3 text-sm font-bold text-[#0088cc] transition-colors hover:bg-[#0088cc]/20"
        >
          <SendIcon size={16} /> Telegram
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          <TwitterIcon size={16} /> Twitter / X
        </a>
      </div>

      {/* Privacy warning */}
      <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-4">
        <Text variant="tiny" className="text-violet-300">
          <strong>Note:</strong> VoidPay is stateless. This link contains all the invoice data
          securely encoded. If you lose this link, the invoice is lost forever.
        </Text>
      </div>
    </motion.div>
  )
}
