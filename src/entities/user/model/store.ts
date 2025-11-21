import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  currency: string
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setCurrency: (currency: string) => void
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      theme: 'system',
      currency: 'USD',
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'user-preferences',
    }
  )
)
