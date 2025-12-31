'use client'

import { forwardRef, type ReactNode, type MouseEventHandler } from 'react'
import { cn } from '@/shared/lib/utils'
import {
  useInvoiceScale,
  INVOICE_BASE_WIDTH,
  INVOICE_BASE_HEIGHT,
  type UseInvoiceScaleOptions,
} from '../lib/use-invoice-scale'

/**
 * Fixed scale presets for special cases (print, thumbnails, etc.)
 * Based on 794×1123px base (A4 aspect ratio)
 */
const SCALE_PRESETS = {
  xs: { scale: 0.35, width: 278, height: 393 },
  sm: { scale: 0.45, width: 357, height: 505 },
  md: { scale: 0.55, width: 437, height: 618 },
  lg: { scale: 0.7, width: 556, height: 786 },
  xl: { scale: 0.9, width: 715, height: 1011 },
  full: { scale: 1, width: INVOICE_BASE_WIDTH, height: INVOICE_BASE_HEIGHT },
} as const

export type InvoiceScalePreset = keyof typeof SCALE_PRESETS

export interface ScaledInvoicePreviewProps {
  /** Invoice content (will be scaled) */
  children: ReactNode
  /** Overlay content (NOT scaled, positioned absolute) */
  overlay?: ReactNode
  /**
   * Fixed scale preset for special cases (print, thumbnails).
   * When not provided, uses dynamic viewport-based scaling.
   */
  fixedScale?: InvoiceScalePreset
  /**
   * Options for dynamic scaling (ignored when fixedScale is set)
   */
  scaleOptions?: UseInvoiceScaleOptions
  /**
   * Click handler with access to mouse event.
   * Cursor style should be controlled via className (no auto cursor-zoom-in).
   */
  onClick?: MouseEventHandler<HTMLDivElement>
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onMouseLeave?: MouseEventHandler<HTMLDivElement>
  className?: string
}

export const ScaledInvoicePreview = forwardRef<HTMLDivElement, ScaledInvoicePreviewProps>(
  function ScaledInvoicePreview(
    { children, overlay, fixedScale, scaleOptions, onClick, onMouseEnter, onMouseLeave, className },
    ref
  ) {
    // Dynamic scaling (default behavior)
    const { containerRef, scale: dynamicScale, scaledWidth, scaledHeight } = useInvoiceScale(scaleOptions)

    // Use fixed preset if specified, otherwise dynamic
    const isFixed = fixedScale !== undefined
    const preset = isFixed ? SCALE_PRESETS[fixedScale] : null

    const currentScale = isFixed ? preset!.scale : dynamicScale
    const currentWidth = isFixed ? preset!.width : scaledWidth
    const currentHeight = isFixed ? preset!.height : scaledHeight

    return (
      <div
        ref={isFixed ? ref : containerRef}
        className={cn(
          'relative overflow-hidden rounded-sm transition-[width,height] duration-200 ease-out',
          className
        )}
        style={
          isFixed
            ? { width: currentWidth, height: currentHeight }
            : {
                width: `${currentWidth}px`,
                height: `${currentHeight}px`,
                willChange: 'width, height',
              }
        }
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  // Create minimal event-like object for keyboard activation
                  const syntheticEvent = {
                    stopPropagation: () => {},
                    preventDefault: () => {},
                    currentTarget: e.currentTarget,
                  } as React.MouseEvent<HTMLDivElement>
                  onClick(syntheticEvent)
                }
              }
            : undefined
        }
      >
        {/* Invoice with CSS scale — origin top-left to align with container */}
        <div
          className="absolute top-0 left-0 origin-top-left transition-transform duration-200 ease-out"
          style={{ transform: `scale(${currentScale})` }}
        >
          {children}
        </div>

        {/* Overlay (not scaled) */}
        {overlay}
      </div>
    )
  }
)
