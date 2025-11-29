'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from './hooks/use-reduced-motion'

export interface AuroraTextProps {
  /** Text content or React children */
  children: React.ReactNode
  /** Custom CSS classes */
  className?: string
  /** HTML element to render as */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
}

/**
 * AuroraText component - Animated gradient text effect
 *
 * Renders text with a cycling violet/indigo/purple gradient and drop shadow.
 * Gradient animates across the text using background-clip-text technique.
 * Respects prefers-reduced-motion accessibility setting.
 *
 * @component
 * @example
 * ```tsx
 * // Default (span, animated)
 * <AuroraText>Electric Dreams</AuroraText>
 *
 * // As heading
 * <AuroraText as="h1" className="text-6xl font-bold">
 *   VoidPay
 * </AuroraText>
 *
 * // As paragraph
 * <AuroraText as="p">
 *   Privacy-first invoicing
 * </AuroraText>
 * ```
 */
export function AuroraText({ children, className, as: Component = 'span' }: AuroraTextProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <Component
      className={cn(
        'inline-block bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500',
        'bg-[length:200%_auto] bg-clip-text text-transparent',
        'drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]',
        !prefersReducedMotion && 'animate-aurora',
        className
      )}
    >
      {children}
    </Component>
  )
}
