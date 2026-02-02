import { useEffect, useRef, type RefObject } from 'react'

/**
 * Hook for trapping focus within a modal or dialog
 *
 * Features:
 * - Stores and restores previously focused element
 * - Focuses first focusable element on mount
 * - Traps Tab/Shift+Tab navigation within container
 * - Closes on Escape key
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void
): void {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Store previously focused element for restoration
    previousActiveElement.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      )
    }

    // Focus first element on mount
    const focusableElements = getFocusableElements()
    const firstElement = focusableElements[0]
    firstElement?.focus()

    // Trap focus within container
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key to close
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // TAB key focus trap
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements()
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus to previously active element
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === 'function'
      ) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, onClose, containerRef])
}
