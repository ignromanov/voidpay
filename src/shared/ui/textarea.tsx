'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/utils'

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  /** Optional label displayed above textarea */
  label?: string
  /** Textarea id - auto-generated if not provided */
  id?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id: providedId, ...props }, ref) => {
    const generatedId = React.useId()
    const id = providedId ?? generatedId

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
        <textarea
          id={id}
          ref={ref}
          className={cn(
            'flex min-h-[80px] w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 transition-all duration-200 placeholder:text-zinc-500 focus:border-violet-500 focus:shadow-[0_0_15px_rgba(124,58,237,0.3)] focus:ring-1 focus:ring-violet-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
