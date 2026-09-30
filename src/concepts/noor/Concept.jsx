import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import './noor.css'
import { rig } from './rig.js'
import { NAV, SERVICES, STAGES, WORK, ROLES } from './content.js'

const Scene = lazy(() => import('./Scene.jsx'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/* If WebGL is missing or the scene throws, the page keeps a composed still:
   the same arch, sphere and slabs, drawn in CSS under the same light. */
class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.failed ? <Still /> : this.props.children
  }
}

function Still() {
  return (
    <div className="noor-still" aria-hidden="true">
      <div className="noor-still-beam" />
      <div className="noor-still-piece">
        <div className="noor-still-arch" />
        <div className="noor-still-ball" />
        <div className="noor-still-slab noor-still-slab--top" />
        <div className="noor-still-slab" />
      </div>
    </div>
  )
}

function useMedia(q) {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const f = () => setOn(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [q])
  return on
}

/* Scroll -> camera keyframe. Every [data-cam] element is a stop on the walk
   around the sculpture; between two stops the value moves linearly with
   scroll, and the scene eases it. Native scroll, read only. */
function useCameraScroll(rootRef, enabled) {
  useEffect(() => {
    if (!enabled) {
      rig.k = 0
      rig.invalidate?.()
      return
    }
    let stops = []
    const measure = () => {
      const els = rootRef.current?.querySelectorAll('[data-cam]') || []
      const vh = window.innerHeight
      stops = [...els]
        .map((el) => ({ k: +el.dataset.cam, y: el.getBoundingClientRect().top + window.scrollY - vh * 0.45 }))
        .sort((a, b) => a.k - b.k || a.y - b.y)
      if (stops.length) stops[0].y = 0
      update()
    }
    const update = () => {
      if (!stops.length) return
      const y = window.scrollY
      const last = stops[stops.length - 1]
      let k = y >= last.y ? last.k : stops[0].k
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i]
        const b = stops[i + 1]
        if (y >= a.y && y < b.y) {
          k = a.k + ((y - a.y) / Math.max(1, b.y - a.y)) * (b.k - a.k)
          break
        }
      }
      rig.k = k
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.documentElement)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', measure)
    }
  }, [rootRef, enabled])
}

/* A soft ring that trails the pointer and opens up over anything you can
   act on. Pointer devices only; the native cursor stays. */
function Cursor() {
  const ring = useRef(null)
  useEffect(() => {
    const el = ring.current
    let x = -100
    let y = -100
    let tx = x
    let ty = y
    let raf = 0
    const move = (e) => {
      tx = e.clientX
      ty = e.clientY
      const t = e.target.closest?.('a, button, input, select, textarea, [data-hot]')
      el.classList.toggle('is-hot', !!t)
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const tick = () => {
      x += (tx - x) * 0.2
      y += (ty - y) * 0.2
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div className="noor-cursor" ref={ring} aria-hidden="true">
      <span />
    </div>
  )
}

function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`noor-rv ${className}`} data-rv {...rest}>
      {children}
    </Tag>
  )
}

export default function Concept() {
  const root = useRef(null)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const mobile = useMedia('(max-width: 767px)')
  const finePointer = useMedia('(hover: hover) and (pointer: fine)')
  const [gl] = useState(hasWebGL)
  const [ready, setReady] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(0)
  const [sent, setSent] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useCameraScroll(root, !reduced)

  // loader: never longer than the scene needs, never shorter than a breath
  useEffect(() => {
    if (!gl) {
      const t = setTimeout(() => setReady(true), 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setReady(true), 6000)
    return () => clearTimeout(t)
  }, [gl])

  useEffect(() => {
    const vis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [])

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (reduced || mobile) return
    const move = (e) => {
      rig.px = (e.clientX / window.innerWidth) * 2 - 1
      rig.py = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [reduced, mobile])

  // section reveals
  useEffect(() => {
    const els = root.current.querySelectorAll('[data-rv]')
    if (reduced) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -12% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [reduced])

  const onReady = () => setTimeout(() => setReady(true), 350)

  return (
    <div className={`c-noor${ready ? ' is-ready' : ''}${reduced ? ' is-still' : ''}`} ref={root}>
      <div className="noor-stage">
        {gl ? (
          <SceneBoundary onFail={() => setReady(true)}>
            <Suspense fallback={null}>
              <Scene mobile={mobile} reduced={reduced} paused={hidden} onReady={onReady} />
            </Suspense>
          </SceneBoundary>
        ) : (
          <Still />
        )}
      </div>
      <div className="noor-vignette" aria-hidden="true" />
      <div className="noor-grain" aria-hidden="true" />
      {finePointer && !reduced && <Cursor />}

      <div className="noor-loader" aria-hidden="true">
        <span className="noor-loader-mark">Atelier Noor</span>
        <span className="noor-loader-line" />
      </div>

      <header className={`noor-nav${scrolled ? ' is-scrolled' : ''}`}>
        <a href="#top" className="noor-logo" aria-label="Atelier Noor, back to top">
          <span className="noor-logo-mark" aria-hidden="true" />
          Atelier Noor
        </a>
        <nav aria-label="Main">
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#contact" className="noor-btn noor-btn--ghost">
          <span>Book a studio visit</span>
        </a>
      </header>

      <main>
        <section className="noor-hero" id="top" data-cam="0" aria-labelledby="noor-h1">
          <p className="noor-label noor-hero-kicker">
            <span>Interior and architecture studio</span>
            <span>Jor Bagh, New Delhi</span>
          </p>
          <h1 className="noor-display" id="noor-h1">
            <span className="noor-line">
              <span>Rooms that</span>
            </span>
            <span className="noor-line">
              <span>
                <em>hold</em> you.
              </span>
            </span>
          </h1>
          <p className="noor-hero-aside">
            We design homes, and the few public rooms worth lingering in, around light, material and the way you live.
          </p>
          <div className="noor-hero-foot">
            <a href="#practice" className="noor-scroll">
              <span className="noor-scroll-line" aria-hidden="true" />
              Walk around
            </a>
          </div>
        </section>

        <section className="noor-practice" id="practice" data-cam="1" aria-labelledby="noor-practice-h">
          <div className="noor-col">
            <Reveal as="p" className="noor-label">
              <span className="noor-num">01</span> Practice
            </Reveal>
            <h2 id="noor-practice-h" className="noor-visually-hidden">
              Practice
            </h2>
            <Reveal as="p" className="noor-statement">
              A good room is quiet. It holds the morning light, the family table, the things you want to keep, and asks
              for <em>nothing</em> back.
            </Reveal>
            <Reveal className="noor-practice-grid">
              <p>
                Atelier Noor is a small studio of architects and interior designers in Jor Bagh. We take on a few
                projects a year so the people who draw your home are the people who visit the site.
              </p>
              <ul className="noor-roles" aria-label="Who you work with">
                {ROLES.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="noor-services" id="services" data-cam="2" aria-labelledby="noor-services-h">
          <div className="noor-col noor-col--wide">
            <Reveal as="p" className="noor-label">
              <span className="noor-num">02</span> Services
            </Reveal>
            <Reveal as="h2" id="noor-services-h" className="noor-h2">
              Four ways in
            </Reveal>
            <ol className="noor-rows">
              {SERVICES.map((s, i) => (
                <Reveal as="li" key={s.title} className={`noor-row${open === i ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="noor-row-head"
                    aria-expanded={open === i}
                    aria-controls={`noor-svc-${i}`}
                    onClick={() => setOpen(open === i ? -1 : i)}
                    onMouseEnter={() => setOpen(i)}
                  >
                    <span className="noor-row-n">0{i + 1}</span>
                    <span className="noor-row-t">{s.title}</span>
                    <span className="noor-row-plus" aria-hidden="true" />
                  </button>
                  <div className="noor-row-body" id={`noor-svc-${i}`}>
                    <div>
                      <p>{s.line}</p>
                      <p className="noor-label noor-row-scope">{s.scope}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="noor-process" id="process" aria-labelledby="noor-process-h">
          <div className="noor-process-head">
            <Reveal as="p" className="noor-label">
              <span className="noor-num">03</span> Process
            </Reveal>
            <Reveal as="h2" id="noor-process-h" className="noor-h2">
              Four stages, <em>one</em> team
            </Reveal>
          </div>
          <ol className="noor-stages">
            {STAGES.map((s, i) => (
              <li key={s.title} className="noor-stage-step" data-cam={3 + i}>
                <Reveal className="noor-stage-card">
                  <span className="noor-stage-n" aria-hidden="true">
                    {['I', 'II', 'III', 'IV'][i]}
                  </span>
                  <p className="noor-label">
                    Stage {i + 1} of 4 <span aria-hidden="true">·</span> {s.when}
                  </p>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal as="p" className="noor-fee">
            Design fees are agreed in writing before Concept begins, as a fixed sum for interiors or a share of build
            cost for architecture. No surprises on the invoice.
          </Reveal>
        </section>

        <section className="noor-work" id="work" data-cam="7" aria-labelledby="noor-work-h">
          <div className="noor-work-head">
            <Reveal as="p" className="noor-label">
              <span className="noor-num">04</span> Selected work
            </Reveal>
            <Reveal as="h2" id="noor-work-h" className="noor-h2">
              Seen in person
            </Reveal>
            <Reveal as="p" className="noor-work-note">
              We do not publish our clients&rsquo; homes online. Visit the studio and we will walk you through recent
              projects, drawings and samples, shown with the owners&rsquo; permission.
            </Reveal>
          </div>
          <ul className="noor-plinths" data-cam="7">
            {WORK.map((w, i) => (
              <Reveal as="li" key={w} className="noor-plinth" style={{ '--d': `${i * 90}ms` }} data-hot>
                <div className="noor-plinth-frame" aria-hidden="true">
                  <span className="noor-plinth-light" />
                  <span className="noor-plinth-block" />
                </div>
                <p className="noor-plinth-cat">{w}</p>
                <p className="noor-label">Project images shared on request</p>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="noor-contact" id="contact" data-cam="8" aria-labelledby="noor-contact-h">
          <div className="noor-contact-grid">
            <div className="noor-contact-copy">
              <Reveal as="p" className="noor-label">
                <span className="noor-num">05</span> Contact
              </Reveal>
              <Reveal as="h2" id="noor-contact-h" className="noor-h2 noor-h2--big">
                Start a <em>conversation</em>
              </Reveal>
              <Reveal as="dl" className="noor-facts">
                <div>
                  <dt>Studio</dt>
                  <dd>Jor Bagh, New Delhi 110003. Visits by appointment.</dd>
                </div>
                <div>
                  <dt>Hours</dt>
                  <dd>Monday to Saturday, 10 am to 6:30 pm</dd>
                </div>
                <div>
                  <dt>Write</dt>
                  <dd>
                    <a href="mailto:hello@noor.example">hello@noor.example</a>
                  </dd>
                </div>
                <div>
                  <dt>Call</dt>
                  <dd>
                    <a href="tel:+910000000000">+91 00000 00000</a>
                  </dd>
                </div>
              </Reveal>
            </div>
            <Reveal
              as="form"
              className="noor-form"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <div className="noor-field">
                <label htmlFor="noor-name">Your name</label>
                <input id="noor-name" name="name" autoComplete="name" required />
              </div>
              <div className="noor-field">
                <label htmlFor="noor-email">Email</label>
                <input id="noor-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="noor-field">
                <label htmlFor="noor-type">Project</label>
                <select id="noor-type" name="type" defaultValue="Residential interiors">
                  {SERVICES.map((s) => (
                    <option key={s.title}>{s.title}</option>
                  ))}
                  <option>Not sure yet</option>
                </select>
              </div>
              <div className="noor-field">
                <label htmlFor="noor-where">Where is it?</label>
                <input id="noor-where" name="where" placeholder="Area and city" />
              </div>
              <div className="noor-field noor-field--full">
                <label htmlFor="noor-msg">Tell us about the space</label>
                <textarea id="noor-msg" name="message" rows={3} />
              </div>
              <div className="noor-form-foot">
                <button type="submit" className="noor-btn">
                  <span>{sent ? 'Thank you' : 'Send'}</span>
                  <span className="noor-btn-arrow" aria-hidden="true" />
                </button>
                <p className="noor-form-note" role="status">
                  {sent
                    ? 'This is a concept site, so nothing was sent.'
                    : 'Concept site: this form does not send anything.'}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="noor-foot">
        <p className="noor-foot-mark">Atelier Noor</p>
        <p className="noor-label">Interiors, architecture and objects. Jor Bagh, New Delhi.</p>
        <p className="noor-label">© 2026 Atelier Noor</p>
      </footer>
    </div>
  )
}
