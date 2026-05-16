import { FingerprintIcon, AlertCircleIcon } from '@/shared/ui/icons'
import { Text } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'

export interface LinkOptionsSectionViewProps {
  magicDustEnabled?: boolean
}

/**
 * LinkOptionsSectionView — pure presentational display of link generation options.
 *
 * Renders a static (non-interactive) representation of the MagicDust toggle.
 * No useCreatorStore, no browser hooks. Safe for Remotion, SSR, Storybook.
 * Container: LinkOptionsSection.tsx (which uses the real MagicDustToggle)
 */
export function LinkOptionsSectionView({ magicDustEnabled = true }: LinkOptionsSectionViewProps): React.JSX.Element {
  return (
    <div className="space-y-3 border-t border-zinc-800/50 pt-4">
      <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FingerprintIcon
              size={16}
              className={cn(magicDustEnabled ? 'text-violet-400' : 'text-zinc-600')}
            />
            <Text variant="tiny" className="font-bold text-zinc-300">
              Magic Dust Verification
            </Text>
          </div>
          <div
            className={cn(
              'h-5 w-9 rounded-full transition-colors',
              magicDustEnabled ? 'bg-violet-600' : 'bg-zinc-700'
            )}
          >
            <div
              className={cn(
                'mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                magicDustEnabled ? 'ml-0.5 translate-x-4' : 'ml-0.5 translate-x-0'
              )}
            />
          </div>
        </div>

        <div className="mt-2 border-t border-zinc-800/50 pt-2">
          {magicDustEnabled ? (
            <Text variant="tiny" className="leading-tight">
              Adds a tiny random amount (e.g. 0.000042) to the total to{' '}
              <strong className="text-zinc-400">instantly verify payment</strong> on-chain without a database.
            </Text>
          ) : (
            <div className="flex items-start gap-2">
              <AlertCircleIcon size={12} className="mt-0.5 shrink-0 text-amber-500" />
              <Text variant="tiny" className="leading-tight text-amber-500/80">
                <strong>Warning:</strong> Without Magic Dust, the system cannot auto-detect this specific payment. You
                will need to manually check your wallet and mark the invoice as paid.
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
