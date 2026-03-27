interface UmamiTracker {
  track(name: string, data?: Record<string, unknown>): void
}

declare global {
  interface Window {
    umami?: UmamiTracker
  }
}

export {}
