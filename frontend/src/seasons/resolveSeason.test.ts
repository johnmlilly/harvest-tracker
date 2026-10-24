import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveSeason } from './resolveSeason'

// Chicago is UTC-6 in winter (CST) and UTC-5 in summer (CDT).
describe('resolveSeason', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts each season on the 1st in Chicago time', () => {
    expect(resolveSeason(new Date('2026-03-01T06:00:00Z'))).toBe('spring') // Mar 1 00:00 CST
    expect(resolveSeason(new Date('2026-06-01T05:00:00Z'))).toBe('summer') // Jun 1 00:00 CDT
    expect(resolveSeason(new Date('2026-09-01T05:00:00Z'))).toBe('fall') // Sep 1 00:00 CDT
    expect(resolveSeason(new Date('2026-12-01T06:00:00Z'))).toBe('winter') // Dec 1 00:00 CST
  })

  it('uses Chicago time, not UTC, near a boundary', () => {
    // Sep 1 03:00 UTC is still Aug 31 22:00 in Chicago.
    expect(resolveSeason(new Date('2026-09-01T03:00:00Z'))).toBe('summer')
    // Mar 1 05:59 UTC is still Feb 28 23:59 in Chicago.
    expect(resolveSeason(new Date('2026-03-01T05:59:00Z'))).toBe('winter')
  })

  it('keeps January and February in winter, including leap day', () => {
    expect(resolveSeason(new Date('2027-01-15T18:00:00Z'))).toBe('winter')
    expect(resolveSeason(new Date('2028-02-29T18:00:00Z'))).toBe('winter')
  })

  it('defaults to the current time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-23T17:00:00Z'))
    expect(resolveSeason()).toBe('fall')
  })
})
