import type { SeasonTheme } from '../types'
import { DefaultScene } from './DefaultScene'

/** Fallback for any season that has no scene of its own yet. */
export const defaultTheme: SeasonTheme = {
  id: 'default',
  label: 'Our farm',
  palette: {},
  Scene: DefaultScene,
}
