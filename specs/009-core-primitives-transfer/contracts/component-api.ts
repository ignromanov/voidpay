/**
 * Core UI Primitives - Component API Contracts
 * Feature: 009-core-primitives-transfer
 * Generated: 2025-11-28
 *
 * This file defines the TypeScript interfaces for all UI primitives.
 * Implementation MUST match these contracts exactly.
 */

import type { VariantProps } from 'class-variance-authority'
import type { cva } from 'class-variance-authority'
import type React from 'react'

// ============================================================================
// INPUT COMPONENT
// ============================================================================

/**
 * Input variants definition (for reference)
 */
type InputVariants = {
  state: {
    default: string
    error: string
  }
}

/**
 * Input component props
 * @extends React.InputHTMLAttributes<HTMLInputElement>
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label displayed above input */
  label?: string
  /** Error message - triggers error styling when present */
  error?: string
  /** Optional icon element */
  icon?: React.ReactNode
  /** Icon position (default: 'leading') */
  iconPosition?: 'leading' | 'trailing'
}

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

/**
 * Textarea component props
 * @extends React.TextareaHTMLAttributes<HTMLTextAreaElement>
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Optional label displayed above textarea */
  label?: string
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================

/**
 * Badge variants definition (for reference)
 */
type BadgeVariants = {
  variant: {
    default: string
    success: string
    warning: string
    outline: string
  }
}

/**
 * Badge component props
 * @extends React.HTMLAttributes<HTMLDivElement>
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant (default: 'default') */
  variant?: 'default' | 'success' | 'warning' | 'outline'
}

// ============================================================================
// TYPOGRAPHY - HEADING COMPONENT
// ============================================================================

/**
 * Heading visual variants
 */
export type HeadingVariant = 'hero' | 'h1' | 'h2' | 'h3' | 'h4'

/**
 * Heading semantic elements
 */
export type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/**
 * Heading component props
 * @extends React.HTMLAttributes<HTMLHeadingElement>
 */
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Visual variant (default: 'h2') */
  variant?: HeadingVariant
  /** Semantic HTML element override */
  as?: HeadingElement
}

// ============================================================================
// TYPOGRAPHY - TEXT COMPONENT
// ============================================================================

/**
 * Text visual variants
 */
export type TextVariant = 'body' | 'large' | 'small' | 'tiny' | 'muted' | 'label'

/**
 * Text semantic elements
 */
export type TextElement = 'p' | 'span' | 'div' | 'label'

/**
 * Text component props
 * @extends React.HTMLAttributes<HTMLElement>
 */
export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual variant (default: 'body') */
  variant?: TextVariant
  /** Semantic HTML element override */
  as?: TextElement
  /** Use monospace font (Geist Mono) */
  mono?: boolean
}

// ============================================================================
// CARD COMPONENT (EXTENDED)
// ============================================================================

/**
 * Card visual variants
 */
export type CardVariant = 'default' | 'glass'

/**
 * Card component props (BACKWARD COMPATIBLE)
 * @extends React.HTMLAttributes<HTMLDivElement>
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant (default: 'default') */
  variant?: CardVariant
}

/**
 * Card sub-component props (UNCHANGED)
 */
export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>
export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>
export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>
export type CardContentProps = React.HTMLAttributes<HTMLDivElement>
export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

// ============================================================================
// COMPONENT EXPORTS CONTRACT
// ============================================================================

/**
 * Expected exports from src/shared/ui/index.ts
 *
 * export { Input, type InputProps } from './input';
 * export { Textarea, type TextareaProps } from './textarea';
 * export { Badge, badgeVariants, type BadgeProps } from './badge';
 * export { Heading, Text, headingVariants, textVariants } from './typography';
 * export type { HeadingProps, HeadingVariant, TextProps, TextVariant } from './typography';
 * // Card exports unchanged
 */
