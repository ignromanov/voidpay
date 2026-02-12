/**
 * Miscellaneous Icons
 *
 * Domain-specific and utility icons.
 */

import { defaultProps, type IconProps } from './types'

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
 * Coins icon - Used for currency/payment
 */
export function CoinsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  )
}

/**
 * Calendar icon - Used for date picker
 */
export function CalendarIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

/**
 * Fingerprint icon - Used for unique ID/Magic Dust
 */
export function FingerprintIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13.1c0 2.4 0 6.4-1 8.9" />
      <path d="M17.3 21c.1-.6.4-2.3.5-3" />
      <path d="M2 12a10 10 0 0 1 18-6" />
      <path d="M2 16h.01" />
      <path d="M21.8 16c.2-2 .1-5.4 0-6" />
      <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .3-2" />
      <path d="M8.7 22c.2-.7.5-1.3.6-2" />
      <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
    </svg>
  )
}

/**
 * Users icon - Used for multiple users
 */
export function UsersIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

/**
 * Image icon - Used for image/picture
 */
export function ImageIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

/**
 * EyeOff icon - Used for hidden/privacy
 */
export function EyeOffIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M10.7 5.1a10.7 10.7 0 0 1 11.2 6.6 1 1 0 0 1 0 .7 10.7 10.7 0 0 1-1.4 2.5" />
      <path d="M14.1 14.2a3 3 0 0 1-4.2-4.2" />
      <path d="M17.5 17.5a10.8 10.8 0 0 1-15.4-5.2 1 1 0 0 1 0-.7 10.8 10.8 0 0 1 4.4-5.1" />
      <path d="m2 2 20 20" />
    </svg>
  )
}

/**
 * QrCode icon - Used for QR code
 */
export function QrCodeIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  )
}

/**
 * FileText icon - Used for documents/empty state
 */
export function FileTextIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}

/**
 * Database icon - Used for zero storage feature
 */
export function DatabaseIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}

/**
 * Layers icon - Used for open standard feature
 */
export function LayersIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  )
}

/**
 * LayoutTemplate icon - Used for no bloat feature
 */
export function LayoutTemplateIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <rect width="18" height="7" x="3" y="3" rx="1" />
      <rect width="9" height="7" x="3" y="14" rx="1" />
      <rect width="5" height="7" x="16" y="14" rx="1" />
    </svg>
  )
}

/**
 * MousePointerClick icon - Used for one-click feature
 */
export function MousePointerClickIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M14 4.1 12 6" />
      <path d="m5.1 8-2.9-.8" />
      <path d="m6 12-1.9 2" />
      <path d="M7.2 2.2 8 5.1" />
      <path d="M9 9.7a.5.5 0 0 1 .7-.7l11 4.5a.5.5 0 0 1-.1.9l-4.3 1a1 1 0 0 0-.7.7l-1 4.4a.5.5 0 0 1-1 .1z" />
    </svg>
  )
}

/**
 * Shield icon - Used for immutable/security feature
 */
export function ShieldIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

/**
 * Zap icon - Used for instant/fast feature
 */
export function ZapIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}

/**
 * Briefcase icon - Used for freelancers audience
 */
export function BriefcaseIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}

/**
 * Building2 icon - Used for agencies audience
 */
export function Building2Icon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  )
}

/**
 * Hexagon icon - Used for Polygon network shape
 */
export function HexagonIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  )
}

/**
 * Triangle icon - Used for Arbitrum network shape
 */
export function TriangleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    </svg>
  )
}

/**
 * Flag icon - Used for report abuse
 */
export function FlagIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  )
}
