import { Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { conceptBySlug } from './registry.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import './concept-shell.css'

/* A concept site, full-bleed, without the portfolio's nav and footer (App
   drops them on /concepts/*). The one piece of the portfolio that stays is
   the badge: it says what this is and how to get back. */
export default function ConceptPage() {
  const { slug } = useParams()
  const concept = conceptBySlug[slug]
  useDocumentTitle(concept ? `${concept.name} · concept design by Aniket` : 'Not found')
  if (!concept) return <NotFoundPage />
  const Site = concept.load
  return (
    <div className="concept-shell">
      <Suspense fallback={<div className="concept-loading" aria-hidden="true" />}>
        <Site />
      </Suspense>
      <aside className="concept-badge" aria-label="About this page">
        <span className="concept-badge-dot" aria-hidden="true" />
        <span>Concept design · made-up business</span>
        <Link to="/websites" className="concept-badge-back">
          Back to Aniket&rsquo;s work
        </Link>
      </aside>
    </div>
  )
}
