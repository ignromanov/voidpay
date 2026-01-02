/**
 * Sonner mock for testing
 *
 * Sonner doesn't render DOM in happy-dom test environment.
 * This mock provides a simple implementation that renders testable DOM.
 */
import type React from 'react'
import { vi } from 'vitest'

interface ToasterProps {
  position?: string
  className?: string
  style?: React.CSSProperties
  gap?: number
  icons?: Record<string, React.ReactNode>
  toastOptions?: {
    unstyled?: boolean
    classNames?: Record<string, string>
  }
  visibleToasts?: number
  richColors?: boolean
  closeButton?: boolean
  duration?: number
}

export function Toaster({ className, style }: ToasterProps) {
  return (
    <div
      data-sonner-toaster=""
      className={className}
      style={style}
    />
  )
}

// Mock toast functions
export const toast = Object.assign(
  vi.fn((message: string) => message),
  {
    success: vi.fn((message: string) => message),
    error: vi.fn((message: string) => message),
    loading: vi.fn((message: string) => message),
    info: vi.fn((message: string) => message),
    warning: vi.fn((message: string) => message),
    promise: vi.fn(),
    dismiss: vi.fn(),
    custom: vi.fn(),
  }
)
