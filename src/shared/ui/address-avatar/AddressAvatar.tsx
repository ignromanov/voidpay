'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { blo } from 'blo'
import { cn } from '@/shared/lib/utils'

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 40,
} as const

export interface AddressAvatarProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> {
  /** Ethereum address (0x...) */
  address: `0x${string}`
  /** Avatar size preset */
  size?: keyof typeof SIZE_MAP | number
  /** Custom alt text (defaults to truncated address) */
  alt?: string
}

/**
 * Address Avatar with Blockie Identicon
 *
 * Generates a deterministic, colorful identicon for any Ethereum address
 * using the blo library. SSR-safe as it generates SVG data URIs.
 *
 * @example
 * ```tsx
 * <AddressAvatar address="0x1234...abcd" size="md" />
 * ```
 */
export const AddressAvatar = forwardRef<HTMLImageElement, AddressAvatarProps>(
  ({ address, size = 'md', alt, className, ...props }, ref) => {
    const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size]
    const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
    const avatarAlt = alt || `Avatar for ${truncatedAddress}`

    // blo generates a deterministic SVG data URI from the address
    const blockieUri = blo(address)

    // Using <img> intentionally: blo generates inline SVG data URIs,
    // no network request needed, Next/Image optimization not applicable
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        ref={ref}
        src={blockieUri}
        alt={avatarAlt}
        width={pixelSize}
        height={pixelSize}
        className={cn('rounded-full', className)}
        {...props}
      />
    )
  }
)

AddressAvatar.displayName = 'AddressAvatar'
