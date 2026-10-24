import { describe, expect, it } from 'vitest'
import { parseOverrides } from './overrides'

describe('parseOverrides', () => {
  it('reads valid season, time, and progress', () => {
    expect(parseOverrides('?season=fall&time=dusk&progress=60')).toEqual({
      season: 'fall',
      time: 'dusk',
      progress: 60,
    })
  })

  it('returns nothing when no overrides are given', () => {
    expect(parseOverrides('')).toEqual({})
    expect(parseOverrides('?other=1')).toEqual({})
  })

  it('accepts only exact lowercase values', () => {
    expect(parseOverrides('?season=Fall&time=NIGHT')).toEqual({})
  })

  it('drops unknown and empty values', () => {
    expect(parseOverrides('?season=bogus&time=noon&progress=')).toEqual({})
  })

  it('clamps progress to 0-100', () => {
    expect(parseOverrides('?progress=-5')).toEqual({ progress: 0 })
    expect(parseOverrides('?progress=140')).toEqual({ progress: 100 })
    expect(parseOverrides('?progress=62.5')).toEqual({ progress: 62.5 })
  })

  it('drops non-numeric progress', () => {
    expect(parseOverrides('?progress=abc')).toEqual({})
    expect(parseOverrides('?progress=Infinity')).toEqual({})
  })
})
