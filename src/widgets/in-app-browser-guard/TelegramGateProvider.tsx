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

export function useTelegramGate(): TelegramGateContextValue {
  const ctx = useContext(TelegramGateContext)
  if (!ctx) throw new Error('useTelegramGate must be used inside <TelegramGateProvider>')
  return ctx
}
