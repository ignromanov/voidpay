'use client'

import { forwardRef, type ReactNode, type MouseEventHandler } from 'react'
import { cn } from '@/shared/lib/utils'
import { useInvoiceScale, type UseInvoiceScaleOptions } from '../lib/use-invoice-scale'

export interface ScaledInvoicePreviewProps {
  /** Invoice content (will be scaled) */
  children: ReactNode
  /** Overlay content (NOT scaled, positioned absolute) */
  overlay?: ReactNode
  /**
   * Container height for scale calculation.
   * Can be CSS value like '75vh', '600px', or number (pixels).
   * @default '75vh'
   */
  containerHeight?: string | number
  /**
   * Options for dynamic scaling
   */
  scaleOptions?: UseInvoiceScaleOptions
  /**
   * Click handler with access to mouse event.
   * Cursor style should be controlled via className.
   */
  onClick?: MouseEventHandler<HTMLDivElement>
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onMouseLeave?: MouseEventHandler<HTMLDivElement>
  className?: string
}

export const ScaledInvoicePreview = forwardRef<HTMLDivElement, ScaledInvoicePreviewProps>(
  function ScaledInvoicePreview(
    {
      children,
      overlay,
      containerHeight = '75vh',
      scaleOptions,
      onClick,
      onMouseEnter,
      onMouseLeave,
      className,
    },
    ref
  ) {
    const { containerRef, scale, scaledWidth, scaledHeight } = useInvoiceScale(scaleOptions)

    // Merge refs if external ref provided
    const setRefs = (node: HTMLDivElement | null) => {
      // Set internal ref
      if (containerRef && 'current' in containerRef) {
        ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }
      // Set external ref
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    const heightStyle = typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight

    return (
      <div
        ref={setRefs}
        className={cn('relative flex w-full items-center justify-center', className)}
        style={{ minHeight: heightStyle }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
                }
              }
            : undefined
        }
      >
        {/* Scaled invoice wrapper */}
        <div
          className="relative overflow-hidden rounded-sm transition-[width,height] duration-200 ease-out"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            willChange: 'width, height',
          }}
        >
          {/* Invoice with CSS scale — origin top-left to align with container */}
          <div
            className="absolute top-0 left-0 origin-top-left transition-transform duration-200 ease-out"
            style={{ transform: `scale(${scale})` }}
          >
            {children}
          </div>

          {/* Overlay (not scaled, inside invoice bounds) */}
          {overlay}
        </div>
      </div>
    )
  }
)
