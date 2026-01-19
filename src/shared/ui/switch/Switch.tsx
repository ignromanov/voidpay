'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/shared/lib/utils'

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: 'sm' | 'default'
  variant?: 'default' | 'subtle'
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked = false,
      onCheckedChange,
      size = 'default',
      variant = 'default',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    const sizeClasses = {
      sm: {
        track: 'w-8 h-4',
        thumb: 'w-3 h-3',
        translate: 'translate-x-4',
      },
      default: {
        track: 'w-10 h-5',
        thumb: 'w-4 h-4',
        translate: 'translate-x-5',
      },
    }

    const { track, thumb, translate } = sizeClasses[size]

    const variantClasses = {
      default: {
        checked: 'bg-violet-600',
        unchecked: 'bg-zinc-700',
        thumb: 'bg-white',
      },
      subtle: {
        checked: 'bg-zinc-600',
        unchecked: 'bg-zinc-800',
        thumb: 'bg-zinc-400',
      },
    }

    const { checked: checkedBg, unchecked: uncheckedBg, thumb: thumbBg } = variantClasses[variant]

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          track,
          'relative rounded-full transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
          checked ? checkedBg : uncheckedBg,
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full shadow-sm transition-transform duration-200',
            thumb,
            thumbBg,
            checked ? translate : 'translate-x-0'
          )}
        />
      </button>
    )
  }
)

Switch.displayName = 'Switch'
