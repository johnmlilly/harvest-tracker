import { describe, expect, it } from 'vitest'
import { clampPercent } from './percent'

describe('clampPercent', () => {
  it('keeps values inside 0-100', () => {
    expect(clampPercent(62.5)).toBe(62.5)
  })

  it('clamps out-of-range values', () => {
    expect(clampPercent(-5)).toBe(0)
    expect(clampPercent(140)).toBe(100)
  })

  it('treats NaN and infinities as 0', () => {
    expect(clampPercent(Number.NaN)).toBe(0)
    expect(clampPercent(Number.POSITIVE_INFINITY)).toBe(0)
  })
})
