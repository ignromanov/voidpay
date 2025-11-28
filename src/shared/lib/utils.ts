/**
 * Utility functions for VoidPay
 *
 * Common utility functions used throughout the application.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind CSS class merging
 *
 * Combines clsx for conditional classes and tailwind-merge for
 * proper handling of Tailwind CSS class conflicts.
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // returns 'py-1 px-4'
 * cn('bg-red-500', { 'bg-blue-500': isBlue }) // conditional
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
