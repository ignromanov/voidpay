'use client'

import * as React from 'react'
import { CheckIcon, CopyIcon } from '@/shared/ui/icons'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { copyToClipboard } from '@/shared/lib/clipboard'

const copyButtonVariants = cva(
  'relative inline-flex cursor-pointer items-center justify-center rounded transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring print:hidden',
  {
    variants: {
      size: {
        xs: 'h-5 w-5 [&_svg]:size-3',
        sm: 'h-6 w-6 [&_svg]:size-3.5',
        md: 'h-8 w-8 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
)

export interface CopyButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    VariantProps<typeof copyButtonVariants> {
  /**
   * The value to copy to clipboard
   */
  value: string
}

type CopyState = 'idle' | 'copied'

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ className, size, value, 'aria-label': ariaLabel, ...props }, ref) => {
    const [state, setState] = React.useState<CopyState>('idle')
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }, [])

    const handleClick = React.useCallback(async () => {
      const success = await copyToClipboard(value)
      if (success) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setState('copied')
        timeoutRef.current = setTimeout(() => setState('idle'), 2000)
      }
    }, [value])

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          copyButtonVariants({ size }),
          'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700',
          state === 'copied' && 'text-green-600 hover:text-green-600',
          className
        )}
        aria-label={ariaLabel ?? 'Copy to clipboard'}
        {...props}
      >
        {state === 'copied' ? (
          <CheckIcon className="animate-in fade-in zoom-in-75 duration-150" />
        ) : (
          <CopyIcon />
        )}
        <span className="absolute -inset-2" aria-hidden="true" />
      </button>
    )
  }
)
CopyButton.displayName = 'CopyButton'

export { CopyButton, copyButtonVariants }
