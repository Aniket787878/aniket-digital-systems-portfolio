import { Link } from 'react-router-dom'
import { address } from './shared.js'

/* The fake browser bar and the "Open the full site" link, both builds. */

export function BrowserBar({ name }) {
  return (
    <div className="ws-bar" aria-hidden="true">
      <span className="ws-lights">
        <i />
        <i />
        <i />
      </span>
      <span className="ws-url">{address(name)}</span>
    </div>
  )
}

export function OpenLink({ slug, name }) {
  return (
    <Link to={`/concepts/${slug}`} className="ws-open">
      Open the full site
      <span className="sr-only">: {name}</span>
      <span aria-hidden="true"> ↗</span>
    </Link>
  )
}
