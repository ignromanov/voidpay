'use client'

import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { NETWORK_CONFIG } from '@/entities/network'
import { cn } from '@/shared/lib/utils'

/**
 * NetworkSelect Component Props
 *
 * Constitutional Principle VII: Web3 Safety
 * - Displays supported networks for invoice creation
 * - Wallet network switching happens separately during payment flow
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
 * Network Selector for Invoice Form
 *
 * Allows users to select blockchain networks for invoice creation.
 * This is a pure UI component - wallet network switching is handled
 * separately in the payment flow (when user connects wallet).
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
  const selectedNetwork = React.useMemo(() => {
    return NETWORK_CONFIG.find((network) => network.chainId === value)
  }, [value])

  const handleValueChange = React.useCallback(
    (chainIdStr: string) => {
      const chainId = parseInt(chainIdStr, 10)
      onChange(chainId)
    },
    [onChange]
  )

  return (
    <Select value={value.toString()} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger variant="glass" className={cn('w-[200px]', className)}>
        <SelectValue>
          {selectedNetwork && (
            <div className="flex items-center gap-2.5">
              <div className={cn('flex items-center justify-center', selectedNetwork.colorClass)}>
                <selectedNetwork.icon
                  className={cn('h-4 w-4', selectedNetwork.iconFilled && 'fill-current')}
                />
              </div>
              <span className="font-bold">{selectedNetwork.name}</span>
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
