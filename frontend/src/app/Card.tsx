import type { ReactNode } from 'react'

interface CardProps {
  title: string
  /** Small text at the right of the title rule, e.g. a date range. */
  aside?: string
  children: ReactNode
}

/** Parchment card with a slab-serif title. */
export function Card({ title, aside, children }: CardProps) {
  return (
    <article className="card">
      <h2 className="card__title">
        {title}
        {aside && <span className="card__aside">{aside}</span>}
      </h2>
      {children}
    </article>
  )
}
