import { DateTime } from 'luxon'

/** UTC calendar day YYYY-MM-DD for a scheduled instant (ISO string from API). */
export function utcCalendarDateKeyFromIso(iso: string): string | null {
  const dt = DateTime.fromISO(iso, { setZone: true })
  if (!dt.isValid) return null
  return dt.toUTC().toISODate()
}

/** YYYY-MM-DD strings sort the same as chronology. */
export function compareCalendarDateKeys(a: string, b: string): number {
  return a.localeCompare(b)
}

/** Epoch ms for sorting; null if missing or invalid. */
export function scheduledInstantMs(iso: string | null): number | null {
  if (!iso) return null
  const dt = DateTime.fromISO(iso, { setZone: true })
  return dt.isValid ? dt.toMillis() : null
}
