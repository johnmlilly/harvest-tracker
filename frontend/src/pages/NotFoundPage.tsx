import { Card } from '../app/Card'
import { Link } from '../app/Link'

export function NotFoundPage() {
  return (
    <div className="not-found">
      <Card title="Lost on the trail">
        <p>Oops! This page isn't here.</p>
        <Link to="/" className="btn">
          Go home
        </Link>
      </Card>
    </div>
  )
}
