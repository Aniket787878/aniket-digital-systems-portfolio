import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, m, useInView, useMotionValueEvent, useScroll } from 'motion/react'
import { concepts } from '../../../../concepts/registry.js'
import { BrowserBar, OpenLink } from './parts.jsx'
import { TAG, counter, heroSrc, stripSrc } from './shared.js'

/*
  The desktop build: five browser-framed sites on a ring that turns as the
  page scrolls. Lazy-loaded, so phones and reduced motion never fetch it.

  Geometry lives in websites.css (--w, --r); this file only feeds it one
  number, --turn (0 to 4, which card faces front), and dims the others.
  The ring is only ever rotated, never moved, so it cannot drift off
  centre mid-turn.
*/

const N = concepts.length
const STEP = 360 / N
// Each card holds the front for 60% of its share of the scroll and the
// ring turns in the other 40%. The last card has a hold and no turn.
const HOLD = 0.6
const SPAN = N - 1 + HOLD

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function turnAt(p) {
  const u = Math.min(Math.max(p, 0), 1) * SPAN
  const i = Math.min(Math.floor(u), N - 1)
  const w = u - i
  return w < HOLD || i === N - 1 ? i : i + easeInOut((w - HOLD) / (1 - HOLD))
}

// The scroll progress at the middle of card i's hold.
const progressFor = (i) => (i + HOLD / 2) / SPAN

export default function Orbit() {
  const track = useRef(null)
  const ring = useRef(null)
  const cards = useRef([])
  const [front, setFront] = useState(0)
  // The front card starts playing its page only once the ring is on
  // screen, so the visitor sees it from the top.
  const live = useInView(track)

  // Writes the turn and the dimming straight to the DOM, so scrolling
  // never re-renders; React only hears about it when the front changes.
  const paint = useCallback((p) => {
    const t = turnAt(p)
    ring.current?.style.setProperty('--turn', t.toFixed(4))
    cards.current.forEach((el, i) => {
      if (!el) return
      // Distance round the ring, in cards, from the front position.
      const d = Math.min(Math.abs(i - t), N - Math.abs(i - t))
      const k = Math.min(d, 1)
      // Mid-turn the two cards sharing the front stay opaque (so neither
      // shows through the other); only settled side cards fade.
      const fade = Math.min(Math.max((d - 0.5) / 0.5, 0), 1)
      el.style.opacity = String(1 - 0.65 * fade)
      el.style.filter = k > 0.01 ? `brightness(${(1 - 0.5 * k).toFixed(3)})` : 'none'
    })
    return t
  }, [])

  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const f = Math.round(paint(p)) % N
    setFront((prev) => (prev === f ? prev : f))
  })
  useLayoutEffect(() => {
    paint(scrollYProgress.get())
  }, [paint, scrollYProgress])

  const goTo = (i) => {
    const el = track.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const run = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + progressFor(i) * run, behavior: 'smooth' })
  }

  const c = concepts[front]

  return (
    <div className="wo-track" ref={track}>
      <div className="wo-stage">
        <div className="stage-glow" aria-hidden="true" />
        {/* Mouse-only shortcut; keyboard users have the dots and the caption link. */}
        <div className="wo-view" aria-hidden="true">
          <div className="wo-ring" ref={ring} style={{ '--step': `${STEP}deg` }}>
            {concepts.map((item, i) => (
              <div
                key={item.slug}
                ref={(el) => (cards.current[i] = el)}
                className={`wo-card${i === front ? ' is-front' : ''}`}
                style={{ '--i': i }}
              >
                <BrowserBar name={item.name} />
                <div className="wo-screen">
                  <img
                    src={heroSrc(item.slug)}
                    width="1440"
                    height="900"
                    alt=""
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  {i === front && live && (
                    <img
                      key={item.slug}
                      className="wo-strip"
                      src={stripSrc(item.slug)}
                      width="960"
                      height="3600"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                {i === front ? (
                  <Link to={`/concepts/${item.slug}`} className="wo-hit" tabIndex={-1} />
                ) : (
                  <button type="button" className="wo-hit" tabIndex={-1} onClick={() => goTo(i)} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="wo-caption stage-glass">
          <div className="wo-top">
            <div className="wo-nav">
              <span className="stage-mono wo-count" aria-live="polite">
                {counter(front, N)}
              </span>
              <div className="wo-dots" role="group" aria-label="Choose a website">
                {concepts.map((item, i) => (
                  <button
                    key={item.slug}
                    type="button"
                    className="wo-dot"
                    aria-label={`Show ${item.name}`}
                    aria-current={i === front ? 'true' : undefined}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            </div>
            <span className="stage-mono">{TAG}</span>
          </div>
          {/* Old and new copy share one grid cell and crossfade, so the
              caption is never empty while the ring turns. */}
          <div className="wo-copy-stack">
            <AnimatePresence initial={false}>
              <m.div
                key={c.slug}
                className="wo-copy"
                initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -4, filter: 'blur(6px)' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="wo-text">
                  <h3 className="wo-name">
                    {c.name} <span className="wo-type">{c.type}</span>
                  </h3>
                  <p className="wo-line">{c.line}</p>
                </div>
                <OpenLink slug={c.slug} name={c.name} />
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
