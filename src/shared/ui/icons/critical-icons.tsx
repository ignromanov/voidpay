/**
 * Critical Path Inline SVG Icons
 *
 * These icons are used in above-the-fold components (HeroSection, SocialProofStrip).
 * Inlined to avoid Lucide bundle load during initial render.
 *
 * Source: Lucide Icons (https://lucide.dev)
 * License: ISC License
 *
 * Savings: ~33KB off critical path (full Lucide vs inline SVGs)
 */

import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string
}

const defaultProps: IconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/**
 * ArrowRight icon - Used in HeroSection CTA button
 */
export function ArrowRightIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

/**
 * Lock icon - Used in SocialProofStrip trust badge
 */
export function LockIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/**
 * ServerOff icon - Used in SocialProofStrip trust badge
 */
export function ServerOffIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M7 2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5" />
      <path d="M10 10 2.5 2.5C2 2 2 2.5 2 5v3a2 2 0 0 0 2 2h6z" />
      <path d="M22 17v-1a2 2 0 0 0-2-2h-1" />
      <path d="M4 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1" />
      <path d="M6 18h.01" />
      <path d="m2 2 20 20" />
    </svg>
  )
}

/**
 * Globe icon - Used in SocialProofStrip trust badge
 */
export function GlobeIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

/**
 * Github icon - Used in SocialProofStrip trust badge
 */
export function GithubIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

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
