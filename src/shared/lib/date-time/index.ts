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
