import { getExplorerUrl } from '@/entities/network'
import {
  DownloadIcon,
  ExternalLinkIcon,
  FlagIcon,
  QrCodeIcon,
  Share2Icon,
} from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'
import { SOCIAL_URLS } from '@/shared/config'

interface PanelFooterProps {
  isPending: boolean
  isPaid: boolean
  txHash?: string | undefined
  networkId: number
  onQrOpen: () => void
  onShareOpen?: (() => void) | undefined
  onPdfExport?: (() => void) | undefined
}

export function PanelFooter({ isPending, isPaid, txHash, networkId, onQrOpen, onShareOpen, onPdfExport }: PanelFooterProps) {
  return (
    <div className="px-4 pb-3">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="flex items-center justify-between w-full py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!onPdfExport}
            onClick={onPdfExport}
            className={
              onPdfExport
                ? 'inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-violet-400 min-h-[44px]'
                : 'text-xs text-zinc-500 inline-flex items-center gap-1 opacity-50 cursor-not-allowed min-h-[44px]'
            }
            aria-label={onPdfExport ? 'Download PDF' : 'Download PDF (coming soon)'}
          >
            <DownloadIcon size={12} />
            PDF
          </Button>
          {onShareOpen ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShareOpen}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-violet-400 min-h-[44px]"
              aria-label="Share invoice"
            >
              <Share2Icon size={12} />
              Share
            </Button>
          ) : isPending ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onQrOpen}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white min-h-[44px]"
              aria-label="Show QR code for mobile payment"
            >
              <QrCodeIcon size={12} />
              QR
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {isPaid && txHash && (
            <a
              href={getExplorerUrl(networkId, txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-800/50 px-2.5 py-1.5 text-xs font-bold text-zinc-400 transition-colors border border-zinc-700/50 hover:text-white hover:bg-zinc-800"
            >
              View Tx
              <ExternalLinkIcon size={12} />
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-500 hover:text-red-400 font-medium group hover:bg-red-500/5 min-h-[44px]"
            aria-label="Report abuse"
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.href : ''
              const subject = encodeURIComponent('Abuse Report')
              const body = encodeURIComponent(`I would like to report the following invoice:\n\n${url}\n\nReason:\n`)
              window.location.href = `mailto:${SOCIAL_URLS.abuseEmail}?subject=${subject}&body=${body}`
            }}
          >
            <span className="inline-flex items-center gap-1">
              <FlagIcon size={12} className="group-hover:fill-current" />
              Report
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
