import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

/** True while the tab is hidden, so scenes can pause their animation. */
export function usePageHidden() {
  return useSyncExternalStore(subscribe, () => document.visibilityState === 'hidden')
}
