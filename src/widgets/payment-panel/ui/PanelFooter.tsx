import { getExplorerUrl } from '@/entities/network'
import {
  DownloadIcon,
  ExternalLinkIcon,
  FlagIcon,
  QrCodeIcon,
} from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'

interface PanelFooterProps {
  isPending: boolean
  isPaid: boolean
  txHash?: string | undefined
  networkId: number
  onQrOpen: () => void
}

export function PanelFooter({ isPending, isPaid, txHash, networkId, onQrOpen }: PanelFooterProps) {
  return (
    <div className="px-4 pb-3">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="flex items-center justify-between w-full py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="text-xs text-zinc-500 inline-flex items-center gap-1 opacity-50 cursor-not-allowed"
            aria-label="Download PDF (coming soon)"
          >
            <DownloadIcon size={12} />
            PDF
          </Button>
          {isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onQrOpen}
              className="hidden md:inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white"
              aria-label="Show QR code for mobile payment"
            >
              <QrCodeIcon size={12} />
              QR
            </Button>
          )}
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
            className="text-xs text-zinc-500 hover:text-red-400 font-medium group hover:bg-red-500/5"
            aria-label="Report abuse"
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
