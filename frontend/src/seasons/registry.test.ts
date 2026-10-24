import { describe, expect, it } from 'vitest'
import { SEASONS } from './config'
import { defaultTheme } from './default'
import { getTheme } from './registry'

describe('getTheme', () => {
  it('returns a usable theme for every season', () => {
    for (const season of SEASONS) {
      const theme = getTheme(season)
      expect(theme.label).not.toBe('')
      expect(theme.Scene).toBeTypeOf('function')
    }
  })

  it('falls back to the default theme for seasons without a scene', () => {
    // No season folders are registered yet.
    expect(getTheme('fall')).toBe(defaultTheme)
  })
})
