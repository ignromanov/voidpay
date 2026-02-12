/**
 * Status & Feedback Icons
 *
 * Icons for indicating state, success, warnings, and dismissal.
 */

import { defaultProps, type IconProps } from './types'

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
 * AlertCircle icon - Used for warning/alert
 */
export function AlertCircleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

/**
 * Check icon - Used for success/checkmark
 */
export function CheckIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/**
 * CheckCircle icon - Used for success with circle
 */
export function CheckCircleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

/**
 * X icon - Used for close/dismiss
 */
export function XIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

/**
 * Loader2 icon - Used for loading spinner (animate with spin)
 */
export function Loader2Icon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

/**
 * AlertTriangle icon - Used for warnings
 */
export function AlertTriangleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

/**
 * XCircle icon - Used for error states
 */
export function XCircleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

/**
 * Info icon - Used for information
 */
export function InfoIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

/**
 * ShieldAlert icon - Used for security/blocked states
 */
export function ShieldAlertIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}

/**
 * Minus icon - Used for partial/remove
 */
export function MinusIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M5 12h14" />
    </svg>
  )
}

/**
 * Clock icon - Used for pending status
 */
export function ClockIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

/**
 * ShieldCheck icon - Used for confirmation progress
 */
export function ShieldCheckIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
