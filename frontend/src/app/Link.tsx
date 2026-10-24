import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate, useLocation } from './useLocation'

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
  /** Keep the current query (preview overrides) when `to` has none. Defaults to true. */
  keepSearch?: boolean
}

/** In-app link: plain left clicks navigate without a reload; new-tab and modifier clicks behave normally. */
export function Link({ to, keepSearch = true, onClick, ...rest }: LinkProps) {
  const { search } = useLocation()
  const href = keepSearch && !to.includes('?') ? to + search : to

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      rest.target
    ) {
      return
    }
    event.preventDefault()
    navigate(href)
  }

  return <a href={href} onClick={handleClick} {...rest} />
}
