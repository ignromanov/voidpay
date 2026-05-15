'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { TelegramPayActionModal } from './TelegramPayActionModal'

interface TelegramGateContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const TelegramGateContext = createContext<TelegramGateContextValue | null>(null)

export function TelegramGateProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  return (
    <TelegramGateContext.Provider value={{ isOpen, open, close }}>
      {children}
      <TelegramPayActionModal open={isOpen} onClose={close} />
    </TelegramGateContext.Provider>
  )
}

/**
 * Returns the TelegramGate context value.
 *
 * Safe-fallback: when called outside <TelegramGateProvider> (e.g. Navigation
 * renders before the lazy Web3Provider resolves), returns a no-op gate so the
 * page doesn't crash. Components inside Web3Provider scope get the real gate.
 */
const NOOP_GATE: TelegramGateContextValue = {
  isOpen: false,
  open: () => {},
  close: () => {},
}

export function useTelegramGate(): TelegramGateContextValue {
  return useContext(TelegramGateContext) ?? NOOP_GATE
}
