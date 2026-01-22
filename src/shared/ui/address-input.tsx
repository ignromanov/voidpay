'use client'

import * as React from 'react'
import { Input, type InputProps } from './input'
import { AddressAvatar } from './address-avatar'
import { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'

/**
 * AddressInput Component Props
 *
 * Constitutional Principle VII: Web3 Safety
 * - Validates Ethereum address format (0x + 40 hex chars)
 * - Visual confirmation via blockie to prevent copy-paste errors
 */
export interface AddressInputProps extends Omit<InputProps, 'type' | 'icon' | 'iconPosition'> {
  /** Current address value */
  value: string

  /** Change handler */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  /** Optional callback when validity changes */
  onValidChange?: (isValid: boolean) => void

  /**
   * Whether the field has been touched (blurred at least once).
   * Passed through to Input for soft/full error display.
   * Accepts undefined for react-hook-form's touchedFields compatibility.
   */
  touched?: boolean | undefined
}

/**
 * Address Input with Blockie Visualization
 *
 * Provides visual confirmation of wallet addresses via deterministic color
 * based on address hash. Helps users verify they've entered the correct address.
 *
 * @example
 * ```tsx
 * <AddressInput
 *   value={address}
 *   onChange={(e) => setAddress(e.target.value)}
 *   onValidChange={(isValid) => setIsAddressValid(isValid)}
 *   label="Recipient Wallet"
 *   placeholder="0x..."
 * />
 * ```
 */
export const AddressInput = React.forwardRef<HTMLInputElement, AddressInputProps>(
  ({ value, onChange, onValidChange, touched, ...props }, ref) => {
    const isValid = React.useMemo(() => {
      return ETH_ADDRESS_REGEX.test(value)
    }, [value])

    // Notify parent of validity changes
    React.useEffect(() => {
      if (onValidChange) {
        onValidChange(isValid)
      }
    }, [isValid, onValidChange])

    // Blockie identicon for valid addresses
    const blockieIcon = isValid ? (
      <AddressAvatar address={value as `0x${string}`} size={20} />
    ) : null

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        touched={touched}
        icon={blockieIcon}
        iconPosition="trailing"
        {...props}
      />
    )
  }
)

AddressInput.displayName = 'AddressInput'
