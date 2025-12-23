'use client'

import * as React from 'react'
import { useSwitchChain } from 'wagmi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { NETWORK_CONFIG } from '@/entities/network'
import { cn } from '@/shared/lib/utils'

/**
 * NetworkSelect Component Props
 *
 * Constitutional Principle VII: Web3 Safety
 * - Integrates with Wagmi for safe network switching
 * - Prompts user via wallet when switching networks
 */
export interface NetworkSelectProps {
  /** Currently selected chain ID */
  value: number

  /** Selection change handler */
  onChange: (chainId: number) => void

  /** Disable selector */
  disabled?: boolean

  /** Additional CSS classes */
  className?: string
}

/**
 * Network Selector with Wagmi Integration
 *
 * Allows users to select blockchain networks and automatically
 * triggers wallet network switching when changed.
 *
 * @example
 * ```tsx
 * <NetworkSelect
 *   value={selectedChainId}
 *   onChange={(chainId) => setSelectedChainId(chainId)}
 * />
 * ```
 */
export function NetworkSelect({
  value,
  onChange,
  disabled = false,
  className,
}: NetworkSelectProps) {
  const { switchChain } = useSwitchChain()

  const selectedNetwork = React.useMemo(() => {
    return NETWORK_CONFIG.find((network) => network.chainId === value)
  }, [value])

  const handleValueChange = React.useCallback(
    (chainIdStr: string) => {
      const chainId = parseInt(chainIdStr, 10)

      // Update local state first
      onChange(chainId)

      // Trigger wallet network switch if switchChain is available
      if (switchChain) {
        switchChain({ chainId })
      }
    },
    [onChange, switchChain]
  )

  return (
    <Select value={value.toString()} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className={cn('w-[200px]', className)}>
        <SelectValue>
          {selectedNetwork && (
            <div className="flex items-center gap-2">
              <selectedNetwork.icon
                className={cn(
                  'h-4 w-4',
                  selectedNetwork.colorClass,
                  selectedNetwork.iconFilled && 'fill-current'
                )}
              />
              <span>{selectedNetwork.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {NETWORK_CONFIG.map((network) => (
          <SelectItem key={network.chainId} value={network.chainId.toString()}>
            <div className="flex items-center gap-2">
              <network.icon
                className={cn('h-4 w-4', network.colorClass, network.iconFilled && 'fill-current')}
              />
              <span>{network.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
