import { useState } from 'react'
import { EyeIcon, SearchIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'
import { track, AnalyticsEvent } from '@/features/analytics'

interface MoreOptionsPanelProps {
  isWatching: boolean
  onStartWatching?: (() => void) | undefined
  onStopWatching?: (() => void) | undefined
  onVerifyTxHash?: ((args: { txHash: string }) => void) | undefined
}

export function MoreOptionsPanel({
  isWatching,
  onStartWatching,
  onStopWatching,
  onVerifyTxHash,
}: MoreOptionsPanelProps) {
  const [txHashInput, setTxHashInput] = useState('')
  const txHashValid = /^0x[0-9a-fA-F]{64}$/.test(txHashInput)

  return (
    <div className="space-y-2 rounded-lg border border-zinc-800/60 bg-zinc-900/50 p-3">
      {(onStartWatching || onStopWatching) && (
        <button
          type="button"
          className={cn(
            'cursor-pointer w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
            isWatching
              ? 'text-violet-400 bg-violet-500/10'
              : 'text-zinc-400 hover:bg-violet-500/10 hover:text-violet-300',
          )}
          onClick={isWatching ? onStopWatching : onStartWatching}
          data-testid={isWatching ? 'stop-watching-button' : 'start-watching-button'}
          aria-label={isWatching ? 'Stop watching for incoming payment' : 'Automatically watch for incoming payment'}
        >
          {isWatching ? (
            <>
              <span className="h-2 w-2 rounded-full bg-violet-400 motion-safe:animate-pulse" />
              Watching...
            </>
          ) : (
            <>
              <EyeIcon size={12} className="text-violet-400" />
              Watch for payment
            </>
          )}
        </button>
      )}
      {onVerifyTxHash && (
        <div className="space-y-2">
          <label htmlFor="txhash-input" className="block text-xs text-zinc-500">
            Verify by transaction hash
          </label>
          <div className="flex gap-2">
            <Input
              id="txhash-input"
              placeholder="0x..."
              value={txHashInput}
              onChange={e => setTxHashInput(e.target.value)}
              className="flex-1 font-mono text-xs bg-zinc-900 border-zinc-700 text-zinc-200"
              data-testid="txhash-input"
              aria-describedby="txhash-hint"
              aria-invalid={txHashInput.length > 0 && !txHashValid}
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-[42px] w-[42px] border-zinc-700 text-violet-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 disabled:opacity-40 disabled:text-zinc-600"
              disabled={!txHashValid}
              onClick={() => {
                track(AnalyticsEvent.PAY_VERIFY, { method: 'tx-hash' })
                onVerifyTxHash({ txHash: txHashInput })
              }}
              data-testid="verify-txhash-button"
              aria-label="Verify transaction hash"
            >
              <SearchIcon size={16} />
            </Button>
          </div>
          <p id="txhash-hint" className="text-[10px] text-zinc-600">
            {txHashInput.length > 0 && !txHashValid
              ? 'Enter a valid 66-character transaction hash (0x...)'
              : 'Paste a transaction hash to verify payment manually'}
          </p>
        </div>
      )}
    </div>
  )
}
