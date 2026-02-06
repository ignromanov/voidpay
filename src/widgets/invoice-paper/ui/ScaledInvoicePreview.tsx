'use client'

import {
  forwardRef,
  useCallback,
  useState,
  type ReactNode,
  type MouseEventHandler,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { cn } from '@/shared/lib/utils'
import { Maximize2Icon } from '@/shared/ui/icons'
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
   * Border styling classes applied directly to invoice wrapper.
   * Use for ring/shadow effects on fullscreen modal.
   * Example: "ring-1 ring-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.25)]"
   * Use NETWORK_GLOW_BORDERS[networkId] from @/entities/network
   */
  borderClassName?: string | undefined

  /**
   * Click handler supporting both mouse events and keyboard activation.
   * When triggered via keyboard (Enter/Space), called without event argument.
   * Cursor style should be controlled via className.
   */
  onClick?: ClickHandler

  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onMouseLeave?: MouseEventHandler<HTMLDivElement>

  /**
   * Show built-in "Expand" overlay on hover.
   * Automatically manages hover state internally.
   * Requires onClick to be set.
   * @default false
   */
  showExpandOverlay?: boolean

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
      borderClassName,
      onClick,
      onMouseEnter,
      onMouseLeave,
      showExpandOverlay = false,
      className,
    },
    ref
  ) {
    // Hover state for expand overlay
    const [isHovered, setIsHovered] = useState(false)

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

    // Combined mouse handlers (internal state + external callbacks)
    const handleMouseEnter: MouseEventHandler<HTMLDivElement> = (e) => {
      if (showExpandOverlay) setIsHovered(true)
      onMouseEnter?.(e)
    }

    const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (e) => {
      if (showExpandOverlay) setIsHovered(false)
      onMouseLeave?.(e)
    }

    // Built-in expand overlay (shown when showExpandOverlay=true and onClick is set)
    const expandOverlay = showExpandOverlay && onClick ? (
      <div
        className={cn(
          'absolute inset-0 z-20 flex items-end justify-start p-3 transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <button
          className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/80 px-3 py-1.5 font-mono text-[10px] whitespace-nowrap text-zinc-300 shadow-xl backdrop-blur-md transition-colors hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-100"
          type="button"
        >
          <Maximize2Icon className="h-3 w-3" />
          Expand
        </button>
      </div>
    ) : null

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
      >
        {/* Scaled invoice wrapper — exact invoice dimensions, glow via ::before */}
        {/* Event handlers HERE for precise hit area (glow has pointer-events-none) */}
        <div
          className={cn(
            'relative overflow-visible rounded-sm transition-[width,height] duration-200 ease-out',
            // Print: reset all sizing/positioning to let invoice-print-target handle layout
            'print:!static print:!h-auto print:!w-auto print:!overflow-visible print:rounded-none print:transition-none',
            // Cursor style for interactive invoice (zoom-in for expand action)
            onClick && 'cursor-zoom-in',
            // Elliptical ambient glow via ::before (pointer-events-none = won't capture clicks)
            glowClassName && [
              // Ellipse matching invoice proportions with soft blur
              'before:pointer-events-none before:absolute before:-inset-[25%] before:z-[-1] before:rounded-full',
              // Soft glow with large blur extending beyond bounds
              'before:bg-gradient-to-br before:opacity-40 before:blur-[100px]',
              'before:transition-opacity before:duration-500 print:before:hidden',
              // Network-specific gradient colors
              glowClassName,
            ],
            // Border glow for fullscreen modal (ring + shadow, applied directly)
            borderClassName && ['print:shadow-none print:ring-0', borderClassName]
          )}
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            willChange: 'width, height',
          }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={handleKeyDown}
        >
          {/* Invoice with CSS scale — origin top-left to align with container */}
          <div
            className={cn(
              'absolute top-0 left-0 origin-top-left transition-transform duration-200 ease-out',
              // Print: either become the print target or hide
              printable ? 'invoice-print-target' : 'print:hidden'
            )}
            style={{ transform: `scale(${scale})` }}
          >
            {children}
          </div>

          {/* Overlay (not scaled, inside invoice bounds, hidden on print) */}
          {overlay && <div className="print:hidden">{overlay}</div>}
          {/* Built-in expand overlay */}
          {expandOverlay && <div className="print:hidden">{expandOverlay}</div>}
        </div>

      </div>
    )
  }
)
