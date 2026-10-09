import { Suspense, lazy, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import { concepts } from '../../../concepts/registry.js'
import { BrowserBar, OpenLink } from './websites/parts.jsx'
import { TAG, counter, heroSrc } from './websites/shared.js'
import './stage.css'
import './websites.css'

/*
  "Five businesses. Five worlds.": the /websites showpiece. The five
  concept sites (src/concepts/registry.js), each captured by
  scripts/capture-concepts.mjs into a hero poster and a scroll-through
  strip.

  Two builds:
  - Desktop (1024px+) with motion: a pinned ring that turns one site to
    the front per step of scroll (websites/Orbit.jsx, lazy-loaded so the
    main bundle only carries this file).
  - Everything else (tablets, phones, reduced motion): a row of cards that
    scrolls sideways inside itself, each with its caption. No pinning.
*/

const Orbit = lazy(() => import('./websites/Orbit.jsx'))

const WIDE = '(min-width: 1024px)'
function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(WIDE)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(WIDE).matches,
    () => false
  )
}

function Row() {
  return (
    <ol className="wr-row" aria-label="The five websites">
      {concepts.map((c, i) => (
        <li key={c.slug} className="wr-item">
          <Link to={`/concepts/${c.slug}`} className="wr-card" tabIndex={-1} aria-hidden="true">
            <BrowserBar name={c.name} />
            <img
              src={heroSrc(c.slug)}
              width="1440"
              height="900"
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </Link>
          <div className="wr-cap">
            <span className="stage-mono">{counter(i, concepts.length)}</span>
            <h3 className="wo-name">
              {c.name} <span className="wo-type">{c.type}</span>
            </h3>
            <p className="wo-line">{c.line}</p>
            <div className="wo-act">
              <OpenLink slug={c.slug} name={c.name} />
              <span className="stage-mono">{TAG}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function WebsitesShowcase() {
  const wide = useWide()
  const reduced = useReducedMotion()
  const ring = wide && !reduced

  return (
    <section className={`stage ws ${ring ? 'is-ring' : 'is-row'}`} aria-labelledby="ws-title">
      <div className="container ws-head">
        <h2 id="ws-title" className="stage-title">
          Five businesses. Five <span className="stage-serif">worlds</span>.
        </h2>
        <p className="stage-lede ws-lede">
          Each one is a complete website, designed for a different kind of business to show the range. The
          businesses are made up, the sites are real, and every one opens full screen.
        </p>
      </div>

      {ring ? (
        <Suspense fallback={<div className="wo-track" />}>
          <Orbit />
        </Suspense>
      ) : (
        <Row />
      )}

      <div className="container">
        <p className="stage-note ws-note">
          <span className="stage-dot" aria-hidden="true" />
          {/* Into the one primary action, not the contact page. */}
          <Link to="/ai-check" className="ws-rehook">
            Want one like this for your business? Start with the free AI check.
            <span aria-hidden="true"> →</span>
          </Link>
        </p>
      </div>
    </section>
  )
}
