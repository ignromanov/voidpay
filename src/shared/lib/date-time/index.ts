/**
 * Centralized date-time utilities.
 * All timestamps are Unix seconds (not milliseconds).
 * All date operations use UTC to avoid timezone bugs.
 */

/** Current time as Unix seconds */
export function nowUnix(): number {
  return Math.floor(Date.now() / 1000)
}

/** Current time as ISO 8601 string */
export function nowISO(): string {
  return new Date().toISOString()
}

/** Truncate Unix seconds to midnight UTC of that day */
export function startOfDayUTC(unix: number): number {
  return unix - (unix % 86400)
}

/** Midnight UTC of N days from today */
export function daysFromNowUnix(days: number): number {
  return startOfDayUTC(nowUnix()) + days * 86400
}

/** "2026-03-01" → midnight UTC seconds */
export function dateStringToUnix(str: string): number {
  return Math.floor(new Date(str).getTime() / 1000)
}

/** Unix seconds → "2026-03-01" (UTC) */
export function unixToDateString(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10)
}

/**
 * Check if due date has passed.
 * Normalizes any dueAt to its day's midnight, then adds 86400s.
 * "Due Mar 1" is valid through 23:59:59 UTC Mar 1.
 */
export function isDueDatePassed(dueAt: number): boolean {
  const endOfDueDay = startOfDayUTC(dueAt) + 86400
  return nowUnix() >= endOfDueDay
}

/** Unix seconds → "MAR 1, 2026" (always UTC) */
export function formatDateUTC(ts: number): string {
  const date = new Date(ts * 1000)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

/** Unix seconds → "Apr 3, 2026" (for card/list UI) */
export function formatDateMedium(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Unix seconds → "Apr 3" (compact, no year) */
export function formatDateCompact(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/** ISO 8601 string → Unix seconds */
export function isoToUnix(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000)
}

/**
 * ISO 8601 string → "Just now", "5 min ago", "2 h ago", "3 d ago".
 * For timestamps older than a week, falls back to formatDateCompact ("Apr 3").
 */
export function formatRelativeTime(iso: string): string {
  const then = Math.floor(new Date(iso).getTime() / 1000)
  const diff = Math.max(0, nowUnix() - then)
  if (diff < 30) return 'Just now'
  if (diff < 60) return `${diff}s ago`
  const minutes = Math.floor(diff / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d ago`
  return formatDateCompact(then)
}
