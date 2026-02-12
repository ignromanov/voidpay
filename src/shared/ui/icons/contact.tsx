/**
 * Contact & Identity Icons
 *
 * Icons for contact information and identity fields in PartyInfo.
 */

import { defaultProps, type IconProps } from './types'

/**
 * Mail icon - Used in PartyInfo contact details
 */
export function MailIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

/**
 * Phone icon - Used in PartyInfo contact details
 */
export function PhoneIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

/**
 * MapPin icon - Used in PartyInfo physical address
 */
export function MapPinIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/**
 * Wallet icon - Used in PartyInfo wallet address
 */
export function WalletIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  )
}

/**
 * Hash icon - Used in PartyInfo tax ID
 */
export function HashIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  )
}
