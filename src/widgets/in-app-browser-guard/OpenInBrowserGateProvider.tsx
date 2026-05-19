'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { OpenInBrowserModal } from './OpenInBrowserModal'

interface OpenInBrowserGateContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const OpenInBrowserGateContext = createContext<OpenInBrowserGateContextValue | null>(null)

export function OpenInBrowserGateProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  return (
    <OpenInBrowserGateContext.Provider value={{ isOpen, open, close }}>
      {children}
      <OpenInBrowserModal open={isOpen} onClose={close} />
    </OpenInBrowserGateContext.Provider>
  )
}

/**
 * Returns the OpenInBrowserGate context value.
 *
 * Safe-fallback: when called outside <OpenInBrowserGateProvider> (e.g. Navigation
 * renders before the lazy Web3Provider resolves), returns a no-op gate so the
 * page doesn't crash. Components inside Web3Provider scope get the real gate.
 */
const NOOP_GATE: OpenInBrowserGateContextValue = {
  isOpen: false,
  open: () => {},
  close: () => {},
}

export function useOpenInBrowserGate(): OpenInBrowserGateContextValue {
  return useContext(OpenInBrowserGateContext) ?? NOOP_GATE
}
