'use client'

import { useCallback } from 'react'

import { cn } from '@/shared/lib/utils'

export interface DateInputProps {
  value: number | undefined
  onChange: (unix: number | undefined) => void
  className?: string
  'aria-label'?: string
}

/**
 * Reusable date input with VoidPay styling.
 * Handles conversion between unix timestamps and ISO date strings.
 */
export function DateInput({ value, onChange, className, 'aria-label': ariaLabel }: DateInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const unix = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : undefined
      onChange(unix)
    },
    [onChange]
  )

  // Convert unix timestamp to ISO date string for input value
  const inputValue = value ? new Date(value * 1000).toISOString().split('T')[0] : ''

  return (
    <input
      type="date"
      value={inputValue}
      onChange={handleChange}
      aria-label={ariaLabel}
      autoComplete="off"
      className={cn(
        'w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/50 px-2 py-2.5',
        'font-mono text-xs text-zinc-300 transition-shadow outline-none',
        'focus:text-white focus:shadow-[0_0_15px_rgba(124,58,237,0.3)] focus-visible:ring-2 focus-visible:ring-violet-500/50',
        // Webkit calendar picker styling
        '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
        '[&::-webkit-calendar-picker-indicator]:invert',
        '[&::-webkit-calendar-picker-indicator]:opacity-70',
        '[&::-webkit-calendar-picker-indicator]:transition-opacity',
        'hover:[&::-webkit-calendar-picker-indicator]:opacity-100',
        className
      )}
    />
  )
}
