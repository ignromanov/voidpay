'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

/**
 * Input component variants using CVA
 */
export const inputVariants = cva(
  'flex w-full rounded-lg border bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 focus:shadow-[0_0_15px_rgba(124,58,237,0.3)] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      state: {
        default: 'border-zinc-800',
        /** Soft error: subtle hint while user is still typing (focused) */
        errorSoft: 'border-zinc-800 bg-red-900/25',
        /** Full error: prominent border after user leaves the field (blurred) */
        error: 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>,
    VariantProps<typeof inputVariants> {
  /** Optional label displayed above input */
  label?: string
  /** Error message - triggers error styling when present */
  error?: string
  /**
   * Whether the field has been touched (blurred at least once).
   * - `touched=false` + error → soft error (subtle bg hint)
   * - `touched=true` + error → full error (border + message)
   * Accepts undefined for react-hook-form's touchedFields compatibility.
   * @default true (backwards compatible)
   */
  touched?: boolean | undefined
  /** Optional icon element */
  icon?: React.ReactNode
  /** Icon position (default: 'leading') */
  iconPosition?: 'leading' | 'trailing'
  /** Input id - auto-generated if not provided */
  id?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      touched,
      icon,
      iconPosition = 'leading',
      id: providedId,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const id = providedId ?? generatedId
    const errorId = `${id}-error`

    // Track focus state for soft/full error display
    const [isFocused, setIsFocused] = React.useState(false)

    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        onFocus?.(e)
      },
      [onFocus]
    )

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        onBlur?.(e)
      },
      [onBlur]
    )

    // Determine input state based on error and focus
    // - Focused + error → soft error (subtle hint while typing)
    // - Blurred + error → full error (prominent after leaving field)
    // - touched prop is kept for backwards compatibility but focus takes priority
    const isTouched = touched ?? true
    const inputState = error ? (isFocused ? 'errorSoft' : isTouched ? 'error' : 'errorSoft') : 'default'
    // Show error message only when blurred and touched
    const showErrorMessage = error && !isFocused && isTouched

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'leading' && (
            <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={id}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={showErrorMessage ? errorId : undefined}
            className={cn(
              inputVariants({ state: inputState }),
              icon && iconPosition === 'leading' && 'pl-9',
              icon && iconPosition === 'trailing' && 'pr-9',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'trailing' && (
            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500">
              {icon}
            </div>
          )}
        </div>
        {showErrorMessage && (
          <p id={errorId} className="mt-1.5 text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
