import { describe, expect, it } from 'vitest'

import {
  compareCalendarDateKeys,
  scheduledInstantMs,
  utcCalendarDateKeyFromIso,
} from './utc-calendar-date'

describe('utcCalendarDateKeyFromIso', () => {
  it('maps UTC instant to UTC calendar key', () => {
    expect(utcCalendarDateKeyFromIso('2026-06-10T00:00:00.000Z')).toBe('2026-06-10')
  })

  it('uses UTC date, not local', () => {
    expect(utcCalendarDateKeyFromIso('2026-06-10T23:00:00.000Z')).toBe('2026-06-10')
  })

  it('returns null for invalid strings', () => {
    expect(utcCalendarDateKeyFromIso('not-a-date')).toBeNull()
    expect(utcCalendarDateKeyFromIso('')).toBeNull()
  })
})

describe('compareCalendarDateKeys', () => {
  it('orders YYYY-MM-DD chronologically', () => {
    expect(compareCalendarDateKeys('2026-01-01', '2026-12-31')).toBeLessThan(0)
    expect(compareCalendarDateKeys('2026-12-31', '2026-01-01')).toBeGreaterThan(0)
    expect(compareCalendarDateKeys('2026-06-01', '2026-06-01')).toBe(0)
  })
})

describe('scheduledInstantMs', () => {
  it('parses valid ISO', () => {
    expect(scheduledInstantMs('2026-06-10T12:00:00.000Z')).toBe(
      Date.parse('2026-06-10T12:00:00.000Z')
    )
  })

  it('returns null for null or bad input', () => {
    expect(scheduledInstantMs(null)).toBeNull()
    expect(scheduledInstantMs('')).toBeNull()
    expect(scheduledInstantMs('invalid')).toBeNull()
  })
})
