import { describe, expect, it } from 'vitest'
import { matchRoute } from './routes'

describe('matchRoute', () => {
  it('matches home and the scene list', () => {
    expect(matchRoute('/')).toEqual({ name: 'home' })
    expect(matchRoute('/scenes')).toEqual({ name: 'scenes' })
  })

  it('tolerates a trailing slash', () => {
    expect(matchRoute('/scenes/')).toEqual({ name: 'scenes' })
  })

  it('treats crop pages as not found until they exist', () => {
    expect(matchRoute('/crops/corn')).toEqual({ name: 'notFound' })
  })

  it('treats unknown paths as not found', () => {
    expect(matchRoute('/nope')).toEqual({ name: 'notFound' })
    expect(matchRoute('/scenes/fall')).toEqual({ name: 'notFound' })
  })
})
