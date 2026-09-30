import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import '@fontsource/archivo/latin-800.css'
import '@fontsource/archivo/latin-500.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import './kinetic.css'
import { NAV, STEPS, SERVICES, FIRST, TEAM, HOURS } from './content.js'

const Scene = lazy(() => import('./Scene.jsx'))

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

function useMedia(query) {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const fn = () => setOn(m.matches)
    fn()
    m.addEventListener('change', fn)
    return () => m.removeEventListener('change', fn)
  }, [query])
  return on
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
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
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/* CSS chrome discs: the no-WebGL fallback, and the still frames used on
   phones and with reduced motion. shape: spine | bar | ring */
function CssDiscs({ shape, className = '' }) {
  const items = []
  for (let i = 0; i < 24; i++) {
    const s = i / 23
    let style
    if (shape === 'ring') {
      style = { '--a': `${(i / 24) * 360}deg` }
    } else if (shape === 'bar') {
      style = { '--i': i, '--w': 0.72 + 0.4 * s }
    } else {
      const u = s - 0.5
      const x = Math.sin(u * Math.PI * 2) * 34
      const dx = Math.cos(u * Math.PI * 2)
      style = { '--i': 23 - i, '--x': `${x}px`, '--r': `${-dx * 14}deg`, '--w': 0.74 + 0.42 * (1 - s) }
    }
    items.push(<span key={i} className="k-cd" style={style} />)
  }
  return (
    <div className={`k-css k-css-${shape} ${className}`} aria-hidden="true">
      {items}
    </div>
  )
}

function Cursor() {
  const el = useRef(null)
  useEffect(() => {
    const node = el.current
    let x = -100
    let y = -100
    let raf = 0
    const draw = () => {
      raf = 0
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      const hot = e.target.closest && e.target.closest('a, button')
      node.classList.toggle('is-hot', !!hot)
      if (!raf) raf = requestAnimationFrame(draw)
    }
    const leave = () => node.classList.add('is-gone')
    const enter = () => node.classList.remove('is-gone')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerenter', enter)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div className="k-cursor" ref={el} aria-hidden="true">
      <span className="k-cursor-h" />
      <span className="k-cursor-v" />
      <span className="k-cursor-o" />
    </div>
  )
}

function Label({ n, children }) {
  return (
    <p className="k-label">
      <span className="k-label-n">{n}/06</span>
      <span className="k-label-t">{children}</span>
    </p>
  )
}

function Services() {
  const [open, setOpen] = useState(0)
  return (
    <ul className="k-svc-list">
      {SERVICES.map((s, i) => {
        const id = `k-svc-${i}`
        const isOpen = open === i
        return (
          <li key={s.name} className={`k-svc ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="k-svc-btn"
              aria-expanded={isOpen}
              aria-controls={id}
              onClick={() => setOpen(isOpen ? -1 : i)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(i)}
            >
              <span className="k-svc-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="k-svc-name">{s.name}</span>
              <span className="k-svc-plus" aria-hidden="true" />
            </button>
            <div className="k-svc-more" id={id}>
              <div className="k-svc-inner">
                <p className="k-svc-meta">
                  <span>{s.time}</span>
                  <span className="k-svc-price">{s.price}</span>
                </p>
                <p className="k-svc-note">{s.note}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function Concept() {
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const narrow = useMedia('(max-width: 767px)')
  const [gl, setGl] = useState(() => (typeof window === 'undefined' ? false : hasWebGL()))
  const simple = narrow || reduced || !gl
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const stRef = useRef({ section: 'hero', p: 0, dy: 0, vel: 0, velT: 0, px: 0 })

  const hero = useRef(null)
  const s2 = useRef(null)
  const s4 = useRef(null)
  const s6 = useRef(null)

  const onReady = useCallback(() => setReady(true), [])
  const onFail = useCallback(() => {
    setGl(false)
    setReady(true)
  }, [])

  // Loader: wait for the first frame, but never longer than 3s.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 3000)
    return () => clearTimeout(t)
  }, [])

  // Pointer X feeds the spine's bend.
  useEffect(() => {
    const st = stRef.current
    const move = (e) => {
      st.px = (e.clientX / window.innerWidth) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  // Scroll: section progress, speed, and which dark section owns the canvas.
  useEffect(() => {
    const st = stRef.current
    let raf = 0
    let lastY = window.scrollY
    let lastT = performance.now()
    let lastStep = null
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      const now = performance.now()
      const y = window.scrollY
      st.vel = Math.abs(y - lastY) / Math.max(8, now - lastT)
      st.velT = now
      lastY = y
      lastT = now
      if (simple) {
        st.section = 'hero'
        st.p = 0
        return
      }
      const prog = (el) => {
        const r = el.getBoundingClientRect()
        return { r, p: clamp01(-r.top / Math.max(1, r.height - vh)) }
      }
      const a = prog(s2.current)
      const b = prog(s4.current)
      s2.current.style.setProperty('--p', a.p.toFixed(4))
      s4.current.style.setProperty('--p', b.p.toFixed(4))
      const step = b.p < 0.5 ? -1 : Math.min(3, Math.floor(clamp01((b.p - 0.56) / 0.4) * 4))
      if (step !== lastStep) {
        s4.current.dataset.step = String(step)
        lastStep = step
      }
      const cands = [
        ['hero', hero.current, 0],
        ['s2', s2.current, a.p],
        ['s4', s4.current, b.p],
        ['cta', s6.current, 0]
      ]
      let best = null
      let bestVis = 0
      for (const [name, el, p] of cands) {
        const r = el.getBoundingClientRect()
        const vis = Math.min(vh, r.bottom) - Math.max(0, r.top)
        if (vis > bestVis) {
          bestVis = vis
          best = [name, p, r]
        }
      }
      if (best) {
        const [name, p, r] = best
        // How far the section's frame sits from the viewport top, so the
        // spine rides in and out with it. The hero keeps it pinned, and s2
        // only carries it out: entering s2 is the straightening, in place.
        let top = 0
        if (name === 'cta') top = r.top
        else if (name === 's4') top = r.top > 0 ? r.top : Math.min(0, r.bottom - vh)
        else if (name === 's2') top = Math.min(0, r.bottom - vh)
        st.section = name
        st.p = p
        st.dy = top / vh
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [simple])

  // Only render while a dark (canvas) section is on screen and the tab is visible.
  useEffect(() => {
    const els = simple ? [hero.current] : [hero.current, s2.current, s4.current, s6.current]
    const seen = new Set()
    const sync = () => setActive(seen.size > 0 && document.visibilityState === 'visible')
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target)
        else seen.delete(e.target)
      }
      sync()
    })
    els.forEach((el) => io.observe(el))
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [simple])

  const canvas = gl ? (
    <div className="k-canvas" aria-hidden="true">
      <GLBoundary onFail={onFail}>
        <Suspense fallback={null}>
          <Scene stRef={stRef} reduced={reduced} active={active} narrow={narrow} onReady={onReady} />
        </Suspense>
      </GLBoundary>
    </div>
  ) : (
    <CssDiscs shape="spine" className="k-css-hero" />
  )

  return (
    <div className={`c-kinetic ${simple ? 'is-simple' : 'is-full'} ${ready || !gl ? 'is-ready' : ''}`}>
      <a className="k-skip" href="#k-main">
        Skip to content
      </a>
      <div className="k-loader" aria-hidden="true">
        <span className="k-loader-word">Kinetic</span>
        <span className="k-loader-bar" />
        <span className="k-loader-n">Warming up</span>
      </div>
      <Cursor />

      <header className="k-nav">
        <a className="k-logo" href="#k-top" aria-label="Kinetic Physio, back to top">
          <span className="k-logo-mark" aria-hidden="true" />
          <span className="k-logo-word">Kinetic</span>
          <span className="k-logo-sub">Physio</span>
        </a>
        <nav aria-label="Main">
          <ul className="k-nav-list">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="k-nav-cta" href="#k-book">
          <span aria-hidden="true">[</span> Book <span aria-hidden="true">&rarr; ]</span>
        </a>
      </header>

      {!simple && canvas}

      <main id="k-main">
        <section className="k-hero k-dark" id="k-top" ref={hero} aria-labelledby="k-h1">
          {simple && canvas}
          <div className="k-grid" aria-hidden="true" />
          <div className="k-hero-top">
            <Label n="01">Sports and physio clinic</Label>
            <p className="k-hero-where">
              <span>Koramangala 5th Block,</span> <span>Bengaluru</span>
            </p>
          </div>
          <h1 className="k-type k-type-back" id="k-h1">
            <span className="k-l k-l1">Move</span> <span className="k-l k-l2">without</span>{' '}
            <span className="k-l k-l3">
              pain<span className="k-dot">.</span>
            </span>
          </h1>
          <div className="k-type k-type-front" aria-hidden="true">
            <span className="k-l k-l1">Move</span>
            <span className="k-l k-l2">without</span>
            <span className="k-l k-l3">
              pain<span className="k-dot">.</span>
            </span>
          </div>
          <div className="k-hero-foot">
            <p className="k-hero-lede">
              We find what is really causing the pain, treat it by hand, and build the strength so it stays gone.
              For runners, lifters, weekend cricketers and anyone who sits at a desk too long.
            </p>
            <div className="k-hero-side">
              <a className="k-btn-line" href="#k-services">
                See services and prices
              </a>
              <span className="k-scroll" aria-hidden="true">
                Scroll
              </span>
            </div>
          </div>
        </section>

        <section className="k-approach k-dark" id="k-approach" ref={s2} aria-labelledby="k-h2-approach">
          <div className="k-sticky">
            <div className="k-grid" aria-hidden="true" />
            {simple && <CssDiscs shape="bar" className="k-css-approach" />}
            <div className="k-approach-head">
              <Label n="02">Approach</Label>
              <h2 id="k-h2-approach" className="k-h2-sm">
                The way back has three parts. We do all three, in that order.
              </h2>
            </div>
            <ol className="k-cols">
              {STEPS.map((s, i) => (
                <li key={s.n} className="k-col" style={{ '--d': i }}>
                  <span className="k-col-n">{s.n}</span>
                  <h3 className="k-col-t">{s.title}</h3>
                  <p className="k-col-b">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="k-services k-light" id="k-services" aria-labelledby="k-h2-services">
          <div className="k-grid" aria-hidden="true" />
          <div className="k-services-head">
            <Label n="03">Services</Label>
            <h2 id="k-h2-services" className="k-h2-big">
              What we treat
            </h2>
            <p className="k-services-sub">
              Every session is one to one, in a private room. Pay by UPI, card or cash.
            </p>
          </div>
          <Services />
        </section>

        <section className="k-first k-dark" id="k-first" ref={s4} data-step="-1" aria-labelledby="k-h2-first">
          <div className="k-sticky">
            <div className="k-grid" aria-hidden="true" />
            {simple && <CssDiscs shape="ring" className="k-css-first" />}
            <div className="k-first-center" aria-hidden="true">
              <span className="k-first-60">60</span>
              <span className="k-first-min">minutes</span>
            </div>
            <div className="k-first-copy">
              <Label n="04">First visit</Label>
              <h2 id="k-h2-first" className="k-h2-mid">
                Your first session
              </h2>
              <p className="k-first-sub">One hour, ₹1,500. You leave with a plan, not just a diagnosis.</p>
              <ol className="k-steps">
                {FIRST.map((s, i) => (
                  <li key={s.at} className="k-step" data-i={i}>
                    <span className="k-step-at">{s.at}</span>
                    <div>
                      <h3 className="k-step-t">{s.title}</h3>
                      <p className="k-step-b">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="k-team k-light" id="k-team" aria-labelledby="k-h2-team">
          <div className="k-grid" aria-hidden="true" />
          <Label n="05">Team</Label>
          <h2 id="k-h2-team" className="k-h2-big">
            Who you&rsquo;ll see
          </h2>
          <ul className="k-roles">
            {TEAM.map((t, i) => (
              <li key={t.role} className="k-role">
                <span className="k-role-n">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="k-role-t">{t.role}</h3>
                <p className="k-role-b">{t.body}</p>
              </li>
            ))}
          </ul>
          <div className="k-bring">
            <h3 className="k-bring-t">What to bring</h3>
            <p>
              Clothes you can move in, the shoes you train in, and any scans, X-rays or surgery notes. Shorts help
              for knee and hip problems.
            </p>
          </div>
        </section>

        <section className="k-book k-dark" id="k-book" ref={s6} aria-labelledby="k-h2-book">
          <div className="k-grid" aria-hidden="true" />
          {simple && !narrow && <CssDiscs shape="spine" className="k-css-book" />}
          <Label n="06">Book</Label>
          <h2 id="k-h2-book" className="k-type-book">
            <span>Start</span> <span>with one</span> <span>visit.</span>
          </h2>
          <div className="k-book-row">
            <a className="k-cta" href="tel:+910000000000">
              <span>Book an assessment</span>
              <span className="k-cta-arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
            <p className="k-book-alt">
              Or WhatsApp <a href="https://wa.me/910000000000">+91 00000 00000</a>
            </p>
          </div>
          <div className="k-info">
            <div>
              <h3 className="k-info-t">Hours</h3>
              <dl className="k-hours">
                {HOURS.map(([d, h]) => (
                  <div key={d}>
                    <dt>{d}</dt>
                    <dd>{h}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="k-info-t">Where</h3>
              <p>
                Kinetic Physio
                <br />
                Koramangala 5th Block
                <br />
                Bengaluru 560095
              </p>
              <p className="k-info-dim">Ground floor, step-free entry. Street parking outside.</p>
            </div>
            <div>
              <h3 className="k-info-t">Contact</h3>
              <p>
                <a href="tel:+910000000000">+91 00000 00000</a>
                <br />
                <a href="mailto:hello@kineticphysio.example">hello@kineticphysio.example</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="k-foot">
        <p className="k-foot-word" aria-hidden="true">
          Kinetic
        </p>
        <div className="k-foot-row">
          <p>Kinetic Physio, Koramangala, Bengaluru</p>
          <p>Sports injury, back and neck pain, rehab after surgery</p>
          <a href="#k-top">Back to top &uarr;</a>
        </div>
      </footer>
    </div>
  )
}
