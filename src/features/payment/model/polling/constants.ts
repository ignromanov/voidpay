// ---------------------------------------------------------------------------
// Polling constants & module-level counters
// ---------------------------------------------------------------------------

export const AGGRESSIVE_INTERVAL_MS = 12_000
export const AGGRESSIVE_MAX_MS = 5 * 60 * 1_000

// Step-based watching intervals: two 60s steps, then 120s, then 300s
// Two initial 60s steps are required so that a restart (which resets to step 0)
// fires at 60s twice before escalating — satisfying the "fresh escalation" spec.
export const WATCHING_INTERVALS_MS = [60_000, 60_000, 120_000, 300_000] as const
export const WATCHING_MAX_MS = 30 * 60 * 1_000

export const MANUAL_COOLDOWN_MS = 30_000

export const MAX_CONCURRENT_SESSIONS = 3
export const MAX_CONSECUTIVE_429 = 3

// Module-level session counter for concurrent polling sessions
export let activeSessionCount = 0

export function incrementActiveSessionCount() {
  activeSessionCount += 1
}

export function decrementActiveSessionCount() {
  activeSessionCount -= 1
}

// Module-level session ID counter (avoids Date.now() collisions)
let sessionIdCounter = 0

export function nextSessionId() {
  sessionIdCounter += 1
  return sessionIdCounter
}

/** @internal Test-only: reset module-level counters */
export function __resetPollingCounters() {
  activeSessionCount = 0
  sessionIdCounter = 0
}
