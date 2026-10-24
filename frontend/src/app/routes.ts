export type Route = { name: 'home' } | { name: 'scenes' } | { name: 'notFound' }

/** Map a pathname to a page. `/crops/:slug` stays notFound until crop pages exist. */
export function matchRoute(pathname: string): Route {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (path === '/' || path === '') return { name: 'home' }
  if (path === '/scenes') return { name: 'scenes' }
  return { name: 'notFound' }
}
