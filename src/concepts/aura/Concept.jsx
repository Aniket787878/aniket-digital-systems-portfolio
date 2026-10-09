import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import './aura.css'
import { Component, lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { m, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { days, hours, promises, roles, steps, treatments } from './content.js'

/*
  Aura Skin Studio (made-up clinic, Bandra West). A light, glassy page: one
  frosted serum bottle carries the first three chapters in a fixed WebGL
  layer behind the copy; the studio and booking chapters are HTML with
  their own grounds, painted with light only.
*/

const Scene = lazy(() => import('./Scene.jsx'))

const MOBILE = '(max-width: 767px)'
function subscribeMobile(cb) {
  const mq = window.matchMedia(MOBILE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const useMobile = () => useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE).matches, () => false)

/* Matches aura.css's tightest hero breakpoint (max-width: 430px), where the
   hero copy's padding-top is reduced to 58svh to clear the fixed portfolio
   badge. The 3D headline's default vertical placement (drawType, Scene.jsx)
   assumes the generous 72svh offset used at 431-767px; below 430px it needs
   to sit higher so it doesn't cross into the HTML copy underneath. */
const NARROW_PHONE = '(max-width: 430px)'
function subscribeNarrowPhone(cb) {
  const mq = window.matchMedia(NARROW_PHONE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const useNarrowPhone = () =>
  useSyncExternalStore(subscribeNarrowPhone, () => window.matchMedia(NARROW_PHONE).matches, () => false)

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

class GLBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail && this.props.onFail()
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* The page without WebGL: the same composition in CSS. The headline is real
   HTML here, and a frosted bottle (backdrop blur) sits over it. */
function FlatBottle() {
  return (
    <div className="aura-flat" aria-hidden="true">
      <div className="aura-flat-bottle">
        <span className="aura-flat-bulb" />
        <span className="aura-flat-collar" />
        <span className="aura-flat-glass">
          <span className="aura-flat-liquid" />
          <span className="aura-flat-label">Aura</span>
        </span>
        <span className="aura-flat-shadow" />
      </div>
    </div>
  )
}

function Cursor() {
  const ring = useRef(null)
  useEffect(() => {
    const el = ring.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let x = -100
    let y = -100
    let cx = -100
    let cy = -100
    let raf = 0
    const tick = () => {
      cx += (x - cx) * (reduce ? 1 : 0.22)
      cy += (y - cy) * (reduce ? 1 : 0.22)
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      if (Math.abs(x - cx) > 0.2 || Math.abs(y - cy) > 0.2) raf = requestAnimationFrame(tick)
      else raf = 0
    }
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      const t = e.target instanceof Element ? e.target : null
      el.classList.toggle('is-big', !!(t && t.closest('a, button, select, [data-cursor]')))
      el.classList.toggle('is-light', !!(t && t.closest('[data-cursor-light]')))
      el.classList.add('is-on')
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const leave = () => el.classList.remove('is-on')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    document.documentElement.classList.add('aura-cursor-on')
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('aura-cursor-on')
      cancelAnimationFrame(raf)
    }
  }, [])
  return <div ref={ring} className="aura-cursor" aria-hidden="true" />
}

function Reveal({ as = 'div', i = 0, x = 0, y = 28, className, children, reduced }) {
  const Tag = m[as]
  return (
    <Tag
      className={className}
      initial={reduced ? false : { opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.9, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Tag>
  )
}

function BookingForm() {
  const [sent, setSent] = useState(false)
  return (
    <form
      className="aura-form"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <div className="aura-field">
        <label htmlFor="aura-name">Your name</label>
        <input id="aura-name" name="name" autoComplete="name" placeholder="First and last name" />
      </div>
      <div className="aura-field">
        <label htmlFor="aura-phone">Phone</label>
        <input id="aura-phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 00000 00000" />
      </div>
      <div className="aura-field">
        <label htmlFor="aura-day">Preferred day</label>
        <select id="aura-day" name="day" defaultValue="Any day">
          {days.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="aura-pill aura-pill-xl">
        <span>Book a skin consultation</span>
        <span className="aura-pill-dot" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
      </button>
      <p className="aura-form-status" role="status">
        {sent ? 'Concept site: this form does not send.' : ''}
      </p>
    </form>
  )
}

export default function Concept() {
  const reducedPref = useReducedMotion()
  const reduced = !!reducedPref
  const mobile = useMobile()
  const narrowPhone = useNarrowPhone()
  const full = !reduced && !mobile
  const [gl] = useState(hasWebGL)
  const [glFailed, setGlFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const [step, setStep] = useState(0)
  const [navDark, setNavDark] = useState(false)
  const stage = useRef(null)
  const hero = useRef(null)
  const visit = useRef(null)
  const live3d = gl && !glFailed

  // Never hold the page behind the loader for long.
  useEffect(() => {
    const id = setTimeout(() => setReady(true), live3d ? 6000 : 400)
    return () => clearTimeout(id)
  }, [live3d])

  // Pause the WebGL layer when its chapters are off screen or the tab is hidden.
  useEffect(() => {
    const el = full ? stage.current : hero.current
    if (!el || !('IntersectionObserver' in window)) return undefined
    let seen = true
    const update = () => setActive(seen && !document.hidden)
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting
      update()
    })
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [full])

  // The nav turns light while it sits over the dark studio chapter.
  useEffect(() => {
    const el = document.getElementById('studio')
    if (!el) return undefined
    const check = () => {
      const r = el.getBoundingClientRect()
      setNavDark(r.top <= 44 && r.bottom > 44)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: visit, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setStep(v < 0.36 ? 0 : v < 0.7 ? 1 : 2)
  })

  const cls = [
    'c-aura',
    full ? 'is-full' : 'is-still',
    live3d ? 'is-3d' : 'is-flat',
    ready ? 'is-ready' : '',
    reduced ? 'is-reduced' : '',
    navDark ? 'nav-dark' : ''
  ].join(' ')

  return (
    <div className={cls}>
      <div className="aura-loader" aria-hidden="true">
        <span className="aura-loader-word">AURA</span>
        <span className="aura-loader-line" />
        <span className="aura-label">Skin studio · Bandra West</span>
      </div>
      <Cursor />
      <div className="aura-grain" aria-hidden="true" />

      <header className="aura-nav">
        <a href="#top" className="aura-logo" aria-label="Aura Skin Studio, back to top">
          AURA
        </a>
        <nav aria-label="Aura Skin Studio">
          <ul>
            <li><a href="#treatments">Treatments</a></li>
            <li><a href="#visit">First visit</a></li>
            <li><a href="#studio">Studio</a></li>
          </ul>
        </nav>
        <a href="#book" className="aura-pill aura-pill-sm">Book</a>
      </header>

      <div ref={stage} className="aura-stage">
        <section id="top" ref={hero} className="aura-hero" aria-labelledby="aura-h1">
          <div className="aura-canvas">
            {live3d ? (
              <GLBoundary fallback={<FlatBottle />} onFail={() => setGlFailed(true)}>
                <Suspense fallback={null}>
                  <Scene
                    full={full}
                    reduced={reduced}
                    active={active}
                    narrowPhone={narrowPhone}
                    onReady={() => setReady(true)}
                  />
                </Suspense>
              </GLBoundary>
            ) : (
              <FlatBottle />
            )}
          </div>

          <h1 id="aura-h1" className="aura-h1">
            <span>Skin, in its</span> <em>best light.</em>
          </h1>

          <div className="aura-hero-side">
            <span className="aura-label">Dermatologist-led skin studio</span>
            <span className="aura-label">Bandra West, Mumbai</span>
          </div>

          <div className="aura-hero-copy">
            <p>
              Considered skin treatments in Bandra West, planned by a dermatologist around your skin, with honest
              advice on what will help and what will not.
            </p>
            <div className="aura-actions">
              <a href="#book" className="aura-pill">
                <span>Book a skin consultation</span>
                <span className="aura-pill-dot" aria-hidden="true">+</span>
              </a>
              <a href="#treatments" className="aura-link">See the treatments</a>
            </div>
          </div>

        </section>

        <section id="treatments" className="aura-treat" aria-labelledby="aura-treat-h">
          <div className="aura-col">
            <Reveal reduced={reduced} className="aura-label">01 · The menu</Reveal>
            <Reveal reduced={reduced} as="h2" className="aura-h2" i={1}>
              <span id="aura-treat-h">Treatments, chosen <em>for your skin.</em></span>
            </Reveal>
            <ol className="aura-menu">
              {treatments.map((t, i) => (
                <Reveal key={t.name} reduced={reduced} as="li" className="aura-menu-row" i={i} x={-60} y={0}>
                  <span className="aura-menu-no">{String(i + 1).padStart(2, '0')}</span>
                  <div className="aura-menu-main">
                    <h3>{t.name}</h3>
                    <p>{t.note}</p>
                  </div>
                  <div className="aura-menu-meta">
                    <span>{t.time}</span>
                    <strong>{t.price}</strong>
                  </div>
                </Reveal>
              ))}
            </ol>
            <p className="aura-fine">
              This is the studio menu. Your dermatologist confirms the right treatment and the final price at your
              consultation, before anything is booked.
            </p>
          </div>
        </section>

        <section id="visit" ref={visit} className="aura-visit" aria-labelledby="aura-visit-h">
          <div className="aura-visit-sticky">
            <div className="aura-col">
              <span className="aura-label">02 · Your first visit</span>
              <h2 id="aura-visit-h" className="aura-h2">
                How a first <em>visit works</em>
              </h2>
              <ol className="aura-steps">
                {steps.map((s, i) => (
                  <li key={s.title} className={`aura-step ${!full || step >= i ? 'is-on' : ''} ${full && step === i ? 'is-now' : ''}`}>
                    <span className="aura-step-no">{i + 1}</span>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="aura-fine">First consultation ₹1,500, set against your first treatment if you go ahead.</p>
            </div>
            {!full && (
              <div className="aura-drop-still" aria-hidden="true">
                <span className="aura-drop-bead" />
                <span className="aura-drop-ring" />
                <span className="aura-drop-ring" />
                <span className="aura-drop-ring" />
              </div>
            )}
          </div>
        </section>
      </div>

      <section id="studio" className="aura-studio" aria-labelledby="aura-studio-h" data-cursor-light>
        <div className="aura-room" aria-hidden="true">
          <span className="aura-room-arch" />
          <span className="aura-room-shaft aura-room-shaft-1" />
          <span className="aura-room-shaft aura-room-shaft-2" />
          <span className="aura-room-lamp" />
          <span className="aura-room-floor" />
        </div>
        <div className="aura-studio-inner">
          <div className="aura-studio-head">
            <Reveal reduced={reduced} className="aura-label">03 · The studio</Reveal>
            <Reveal reduced={reduced} as="h2" className="aura-h2" i={1}>
              <span id="aura-studio-h">Quiet rooms, <em>soft light,</em> one client at a time.</span>
            </Reveal>
            <Reveal reduced={reduced} as="p" className="aura-studio-lede" i={2}>
              Three treatment rooms off Hill Road in Bandra West. Daylight through linen in the afternoon, warm lamps
              after dark, and nobody waiting in the corridor behind you.
            </Reveal>
          </div>
          <div className="aura-studio-grid">
            <Reveal reduced={reduced} className="aura-card" i={0}>
              <h3>Opening hours</h3>
              <dl className="aura-hours">
                {hours.map(([d, h]) => (
                  <div key={d}>
                    <dt>{d}</dt>
                    <dd>{h}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal reduced={reduced} className="aura-card" i={1}>
              <h3>Who you will meet</h3>
              <ul className="aura-list">
                {roles.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal reduced={reduced} className="aura-card" i={2}>
              <h3>At every visit</h3>
              <ul className="aura-list">
                {promises.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal reduced={reduced} className="aura-card" i={3}>
              <h3>Where</h3>
              <p>Bandra West, Mumbai 400050. The full address is shared when your consultation is confirmed.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="book" className="aura-book" aria-labelledby="aura-book-h">
        <div className="aura-book-glow" aria-hidden="true" />
        <div className="aura-book-inner">
          <div>
            <span className="aura-label">04 · Book</span>
            <h2 id="aura-book-h" className="aura-h2 aura-book-h">
              Book a skin <em>consultation</em>
            </h2>
            <p className="aura-book-lede">
              Thirty minutes with a dermatologist, a close look at your skin, and a written plan to take home. ₹1,500,
              set against your first treatment.
            </p>
            <p className="aura-book-contact">
              <a href="tel:+910000000000">+91 00000 00000</a>
              <a href="mailto:hello@aura.example">hello@aura.example</a>
            </p>
          </div>
          <BookingForm />
        </div>
      </section>

      <footer className="aura-footer">
        <p className="aura-footer-word" aria-hidden="true">AURA</p>
        <div className="aura-footer-row">
          <p>Aura Skin Studio · Bandra West, Mumbai</p>
          <p>Tuesday to Sunday · Closed Mondays</p>
          <p>A concept site. The menu and prices are a sample.</p>
        </div>
      </footer>
    </div>
  )
}
