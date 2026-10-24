import { describe, expect, it } from 'vitest'
import { seasonMonths } from './seasonMonths'

describe('seasonMonths', () => {
  it('spans three months from the season start', () => {
    expect(seasonMonths('spring')).toBe('March to May')
    expect(seasonMonths('summer')).toBe('June to August')
    expect(seasonMonths('fall')).toBe('September to November')
  })

  it('wraps winter into the next year', () => {
    expect(seasonMonths('winter')).toBe('December to February')
  })
})
