import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { VoidButtonOverlay } from './button-void-overlay'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        glow: 'bg-violet-600 text-white shadow-[0_0_20px_-5px_rgba(124,58,237,0.6)] border border-violet-400/50 hover:bg-violet-500 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.8)] hover:-translate-y-0.5 active:scale-[0.96]',
        void: 'relative bg-black text-white border border-electric-violet/30 shadow-lg shadow-electric-violet/20 overflow-hidden group disabled:grayscale',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 px-6 text-base rounded-2xl',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Loading state for void variant (triggers maximum spin velocity) */
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const isVoidVariant = variant === 'void'
    const isButtonDisabled = disabled || isLoading

    if (isVoidVariant) {
      // When asChild is used (e.g., with Link), clone the child element with merged props
      // This avoids Slot's React.Children.only() error with multiple children
      if (asChild && React.isValidElement(children)) {
        type ChildProps = { className?: string; children?: React.ReactNode }
        const childElement = children as React.ReactElement<ChildProps>

        const voidContent = (
          <>
            <VoidButtonOverlay isLoading={isLoading ?? false} isDisabled={disabled ?? false} />
            <span className="relative z-10 transition-transform group-hover:scale-95">
              {childElement.props.children}
            </span>
          </>
        )

        return React.cloneElement<ChildProps>(
          childElement,
          {
            className: cn(buttonVariants({ variant, size, className }), childElement.props.className),
            ...props,
          } as Partial<ChildProps>,
          voidContent
        )
      }

      return (
        <button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={isButtonDisabled}
          {...props}
        >
          <VoidButtonOverlay isLoading={isLoading ?? false} isDisabled={disabled ?? false} />
          <span className="relative z-10 transition-transform group-hover:scale-95">
            {children}
          </span>
        </button>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isButtonDisabled}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
