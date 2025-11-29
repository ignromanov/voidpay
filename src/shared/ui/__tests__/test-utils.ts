/**
 * Shared test utilities for UI component testing
 */
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type React from 'react'

/**
 * Custom render function with userEvent setup
 */
export function renderWithUser(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { userEvent }
