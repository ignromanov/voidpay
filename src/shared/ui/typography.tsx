'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

// ============================================================================
// HEADING COMPONENT
// ============================================================================

/**
 * Heading component variants using CVA
 */
export const headingVariants = cva('text-zinc-100', {
  variants: {
    variant: {
      hero: 'text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.15]',
      h1: 'text-3xl md:text-4xl font-black tracking-tighter',
      h2: 'text-2xl font-bold tracking-tight',
      h3: 'text-xl font-bold tracking-tight',
      h4: 'text-sm font-bold uppercase tracking-widest text-zinc-500',
    },
  },
  defaultVariants: {
    variant: 'h2',
  },
})

/** Map variant to default element */
const headingElementMap: Record<NonNullable<HeadingVariant>, HeadingElement> = {
  hero: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
}

export type HeadingVariant = 'hero' | 'h1' | 'h2' | 'h3' | 'h4'
export type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
  VariantProps<typeof headingVariants> {
  /** Semantic HTML element override */
  as?: HeadingElement
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant = 'h2', as, children, ...props }, ref) => {
    const Component = as ?? headingElementMap[variant ?? 'h2']

    return (
      <Component ref={ref} className={cn(headingVariants({ variant }), className)} {...props}>
        {children}
      </Component>
    )
  }
)
Heading.displayName = 'Heading'

// ============================================================================
// TEXT COMPONENT
// ============================================================================

/**
 * Text component variants using CVA
 */
export const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-base text-zinc-400 leading-relaxed',
      large: 'text-lg md:text-xl text-zinc-400 leading-relaxed',
      small: 'text-sm text-zinc-500',
      tiny: 'text-xs text-zinc-500',
      muted: 'text-zinc-600',
      label: 'text-[10px] font-bold uppercase tracking-wider text-zinc-500',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
})

/** Map variant to default element */
const textElementMap: Record<NonNullable<TextVariant>, TextElement> = {
  body: 'p',
  large: 'p',
  small: 'p',
  tiny: 'span',
  muted: 'span',
  label: 'span',
}

export type TextVariant = 'body' | 'large' | 'small' | 'tiny' | 'muted' | 'label'
export type TextElement = 'p' | 'span' | 'div' | 'label'

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof textVariants> {
  /** Semantic HTML element override */
  as?: TextElement
  /** Use monospace font (Geist Mono) */
  mono?: boolean
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant = 'body', as, mono, children, ...props }, ref) => {
    const Component = as ?? textElementMap[variant ?? 'body']

    return (
      <Component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        className={cn(textVariants({ variant }), mono && 'font-mono', className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Text.displayName = 'Text'

export { Heading, Text }
