import { useSyncExternalStore } from 'react'

/** Fired after in-app `pushState`, which the browser does not announce on its own. */
export const NAVIGATE_EVENT = 'app:navigate'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAVIGATE_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAVIGATE_EVENT, onChange)
  }
}

const getPathname = () => window.location.pathname
const getSearch = () => window.location.search

export function navigate(href: string) {
  window.history.pushState(null, '', href)
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
}

export function useLocation() {
  const pathname = useSyncExternalStore(subscribe, getPathname)
  const search = useSyncExternalStore(subscribe, getSearch)
  return { pathname, search }
}
