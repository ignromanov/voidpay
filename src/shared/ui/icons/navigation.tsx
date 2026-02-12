/**
 * Navigation Icons
 *
 * Arrows and chevrons for navigation and expand/collapse UI.
 */

import { defaultProps, type IconProps } from './types'

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
 * ArrowLeft icon - Used in Privacy/Terms back button
 */
export function ArrowLeftIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}

/**
 * ChevronUp icon - Used for collapse indicator
 */
export function ChevronUpIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

/**
 * ChevronDown icon - Used for expand indicator
 */
export function ChevronDownIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps} width={size} height={size} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
