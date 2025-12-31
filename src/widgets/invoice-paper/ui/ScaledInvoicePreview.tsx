'use client'

import {
  forwardRef,
  useCallback,
  type ReactNode,
  type MouseEventHandler,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { cn } from '@/shared/lib/utils'
import {
  useInvoiceScale,
  PRESET_CONFIGS,
  type ScalePreset,
  type UseInvoiceScaleOptions,
} from '../lib/use-invoice-scale'

/**
 * Union type for click handlers that support both mouse and keyboard activation.
 * - MouseEventHandler: For mouse click events
 * - () => void: For simple callbacks (e.g., from keyboard activation)
 */
type ClickHandler = MouseEventHandler<HTMLDivElement> | (() => void)

export interface ScaledInvoicePreviewProps {
  /** Invoice content (will be scaled on screen, full-size on print) */
  children: ReactNode

  /** Overlay content (NOT scaled, positioned absolute, hidden on print) */
  overlay?: ReactNode

  /**
   * Preset configuration for common use cases (recommended).
   * - demo: Landing page (fit both dimensions)
   * - editor: Create page (fit, maxScale 0.85)
   * - modal: Fullscreen modal (width-only scaling, allow scroll)
   */
  preset?: ScalePreset

  /**
   * Custom scale options (alternative to preset).
   * Use when you need fine-grained control.
   * Ignored when preset is provided.
   */
  scaleOptions?: Omit<UseInvoiceScaleOptions, 'preset'>

  /**
   * Enable print mode — adds .invoice-print-target class.
   * When true, this container becomes the printable invoice.
   * @default false
   */
  printable?: boolean

  /**
   * Network-specific glow gradient classes.
   * Applied to ::before pseudo-element for elliptical ambient glow.
   * Example: "before:from-indigo-500/60 before:to-blue-500/40"
   * Use NETWORK_GLOW_SHADOWS[networkId] from @/entities/network
   */
  glowClassName?: string | undefined

  /**
   * Click handler supporting both mouse events and keyboard activation.
   * When triggered via keyboard (Enter/Space), called without event argument.
   * Cursor style should be controlled via className.
   */
  onClick?: ClickHandler

  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onMouseLeave?: MouseEventHandler<HTMLDivElement>

  className?: string
}

/**
 * Container for scaled invoice preview.
 *
 * Handles responsive scaling of InvoicePaper based on container size.
 * Uses CSS transform for smooth scaling without layout thrashing.
 *
 * With printable=true, becomes the print target (no scaling in print).
 *
 * @example
 * // Screen + print in one component
 * <ScaledInvoicePreview preset="editor" printable>
 *   <InvoicePaper data={data} />
 * </ScaledInvoicePreview>
 */
export const ScaledInvoicePreview = forwardRef<HTMLDivElement, ScaledInvoicePreviewProps>(
  function ScaledInvoicePreview(
    {
      children,
      overlay,
      preset,
      scaleOptions,
      printable = false,
      glowClassName,
      onClick,
      onMouseEnter,
      onMouseLeave,
      className,
    },
    ref
  ) {
    // Build hook options: preset takes precedence over scaleOptions
    const hookOptions: UseInvoiceScaleOptions = preset ? { preset } : (scaleOptions ?? {})

    const { setContainerRef, scale, scaledWidth, scaledHeight } = useInvoiceScale(hookOptions)

    // Get container height class from preset (or empty if using scaleOptions)
    const containerHeightClass = preset ? PRESET_CONFIGS[preset].containerHeightClass : ''

    // Merge callback ref with forwarded ref
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        // Set internal callback ref (for hook)
        setContainerRef(node)
        // Set external ref
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [setContainerRef, ref]
    )

    // Keyboard handler for accessibility (Enter/Space triggers click)
    const handleKeyDown = onClick
      ? (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            // Call onClick without event for keyboard activation
            ;(onClick as () => void)()
          }
        }
      : undefined

    // Mouse click handler (passes event if handler accepts it)
    const handleClick = onClick
      ? (e: MouseEvent<HTMLDivElement>) => {
          onClick(e)
        }
      : undefined

    return (
      <div
        ref={mergedRef}
        className={cn(
          // w-full for width, height from preset config
          'relative flex w-full items-center justify-center',
          // Preset-specific height class (min-h-[75vh] for demo, h-full for editor/modal)
          containerHeightClass,
          // Print: position for print target
          'print:block print:h-auto',
          className
        )}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={handleKeyDown}
      >
        {/* Scaled invoice wrapper — overflow-visible for glow effect */}
        <div
          className={cn(
            'relative overflow-visible rounded-sm transition-[width,height] duration-200 ease-out',
            // Print: reset all sizing/positioning to let invoice-print-target handle layout
            'print:!static print:!h-auto print:!w-auto print:!overflow-visible print:rounded-none print:transition-none',
            // Elliptical ambient glow via ::before (matches invoice shape)
            glowClassName && [
              // Ellipse matching invoice proportions with soft blur
              'before:pointer-events-none before:absolute before:-inset-[25%] before:z-[-1] before:rounded-full',
              // Soft glow with large blur extending beyond bounds
              'before:bg-gradient-to-br before:opacity-40 before:blur-[100px]',
              'before:transition-opacity before:duration-500 print:before:hidden',
              // Network-specific gradient colors
              glowClassName,
            ]
          )}
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            willChange: 'width, height',
          }}
        >
          {/* Invoice with CSS scale — origin top-left to align with container */}
          {/* Print target is HERE so InvoicePaper (article) is direct child */}
          <div
            className={cn(
              'absolute top-0 left-0 origin-top-left transition-transform duration-200 ease-out',
              // Print: no transform, static positioning, full size
              'print:static print:!transform-none print:transition-none',
              // Apply print target class — InvoicePaper is direct child
              printable && 'invoice-print-target'
            )}
            style={{ transform: `scale(${scale})` }}
          >
            {children}
          </div>

          {/* Overlay (not scaled, inside invoice bounds, hidden on print) */}
          {overlay && <div className="print:hidden">{overlay}</div>}
        </div>
      </div>
    )
  }
)
