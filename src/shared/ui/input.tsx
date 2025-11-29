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
      icon,
      iconPosition = 'leading',
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const id = providedId ?? generatedId
    const errorId = `${id}-error`

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
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              inputVariants({ state: error ? 'error' : 'default' }),
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
        {error && (
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
