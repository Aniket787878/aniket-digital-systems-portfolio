import { Component, useEffect, useRef, useState } from 'react'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import './ekam.css'
import { createInk, mixPalette } from './ink.js'
import { CLASSES, DAYS, FIRST_VISIT, MANIFESTO, PRICES, TEAM, TIMETABLE } from './content.js'

/* Breath: a 10 second cycle, 4 s in and 6 s out. 0 is empty, 1 is full. */
const CYCLE = 10
const IN = 4
function breathAt(d) {
  return d < IN ? 0.5 - 0.5 * Math.cos((Math.PI * d) / IN) : 0.5 + 0.5 * Math.cos((Math.PI * (d - IN)) / (CYCLE - IN))
}
const sst = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
/* how much of "Breathe in." shows at a point in the cycle (cross-fades ~0.9 s) */
const inWeight = (d) => sst(-0.45, 0.45, d) - sst(IN - 0.45, IN + 0.45, d) + sst(CYCLE - 0.45, CYCLE + 0.45, d)

const FROZEN = { time: 38, breath: 0.62 }

class InkBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <div className="ek-fallback" aria-hidden="true" /> : this.props.children
  }
}

function Arrow() {
  return (
    <svg className="ek-arrow" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function makeGrain() {
  const c = document.createElement('canvas')
  c.width = c.height = 140
  const x = c.getContext('2d')
  if (!x) return ''
  const img = x.createImageData(140, 140)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  x.putImageData(img, 0, 0)
  return `url(${c.toDataURL('image/png')})`
}

export default function Concept() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const inRef = useRef(null)
  const outRef = useRef(null)
  const ringRef = useRef(null)
  const phaseRef = useRef(null)
  const cursorRef = useRef(null)
  const navRef = useRef(null)
  const [fallback, setFallback] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [sent, setSent] = useState(false)
  /* kept in React state, not classList: React owns className and would wipe it */
  const [mode] = useState(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    return `${rm ? ' is-reduced' : ''}${fine && !rm ? ' has-cursor' : ''}`
  })
  const today = (new Date().getDay() + 6) % 7

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const useCursor = finePointer && !reduced

    const grain = makeGrain()
    if (grain) root.style.setProperty('--ek-grain', grain)

    let ink = null
    try {
      ink = canvas ? createInk(canvas, { scale: mobile ? 0.25 : 0.5 }) : null
    } catch {
      ink = null
    }
    if (!ink) setFallback(true)

    const pal = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]
    const s = { time: 0, breath: 0, mouse: [0.62, 0.55], vel: [0, 0], swirl: 0, scroll: 0, dim: 0, pal }
    const target = { pal: 0, dim: 0, scroll: 0 }
    let palPos = 0

    /* sections tell the ink which palette and how much dimming they want */
    const secs = Array.from(root.querySelectorAll('[data-ink]'))
    let mids = []
    const words = Array.from(root.querySelectorAll('.ek-mw'))
    const manifesto = root.querySelector('.ek-manifesto')
    let manTop = 0
    let manLen = 1
    const measure = () => {
      mids = secs.map((el) => {
        const r = el.getBoundingClientRect()
        return r.top + window.scrollY + Math.min(r.height, window.innerHeight * 1.2) / 2
      })
      if (manifesto) {
        const r = manifesto.getBoundingClientRect()
        manTop = r.top + window.scrollY
        manLen = Math.max(1, r.height - window.innerHeight)
      }
    }

    let lastLit = -1
    const onScroll = () => {
      const y = window.scrollY
      const c = y + window.innerHeight * 0.5
      let p = +secs[0].dataset.ink
      let dm = +secs[0].dataset.dim
      for (let i = 0; i < mids.length; i++) {
        if (c >= mids[i]) {
          const a = secs[i]
          const b = secs[i + 1]
          if (!b) {
            p = +a.dataset.ink
            dm = +a.dataset.dim
          } else {
            const f = sst(0, 1, (c - mids[i]) / Math.max(1, mids[i + 1] - mids[i]))
            p = +a.dataset.ink + (+b.dataset.ink - +a.dataset.ink) * f
            dm = +a.dataset.dim + (+b.dataset.dim - +a.dataset.dim) * f
          }
        }
      }
      target.pal = p
      /* phones: text spans the full width, so the ink sits a little lower */
      target.dim = mobile ? Math.min(0.7, dm * 1.25 + 0.06) : dm
      target.scroll = (y / window.innerHeight) * 0.16
      navRef.current?.classList.toggle('is-scrolled', y > 40)

      if (!reduced && words.length) {
        const prog = Math.min(1, Math.max(0, (y - manTop + window.innerHeight * 0.35) / manLen))
        const lit = prog * (words.length + 6)
        if (Math.abs(lit - lastLit) > 0.05) {
          lastLit = lit
          for (let i = 0; i < words.length; i++) {
            const o = Math.min(1, Math.max(0, lit - i))
            words[i].style.opacity = (0.16 + 0.84 * o).toFixed(3)
          }
        }
      }
      if (reduced) paintStill()
    }

    let still = 0
    function paintStill() {
      if (!ink || still) return
      still = requestAnimationFrame(() => {
        still = 0
        mixPalette(target.pal, pal)
        s.time = FROZEN.time
        s.breath = FROZEN.breath
        s.dim = target.dim
        s.scroll = 0
        ink.render(s)
      })
    }

    /* pointer: feeds the ink swirl and the cursor ring */
    let lx = 0
    let ly = 0
    let lt = 0
    const onMove = (e) => {
      const now = performance.now()
      const dt = Math.max(8, now - lt)
      if (lt) {
        const vx = ((e.clientX - lx) / window.innerWidth) * (16 / dt)
        const vy = (-(e.clientY - ly) / window.innerHeight) * (16 / dt)
        s.vel[0] += vx * 0.8
        s.vel[1] += vy * 0.8
        s.swirl = Math.min(1.2, s.swirl + Math.hypot(vx, vy) * 1.6)
      }
      lx = e.clientX
      ly = e.clientY
      lt = now
      s.mouse[0] = e.clientX / window.innerWidth
      s.mouse[1] = 1 - e.clientY / window.innerHeight
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
    }
    const onOver = (e) => {
      const hot = !!e.target.closest?.('a, button, input, select, label')
      cursorRef.current?.classList.toggle('is-hot', hot)
    }

    /* the breathing clock: drives the words, the ring and the ink */
    let raf = 0
    const start = performance.now()
    let phase = ''
    let firstFrame = false
    const frame = (now) => {
      const t = (now - start) / 1000
      const d = t % CYCLE
      const b = breathAt(d)
      const wIn = inWeight(d)
      if (inRef.current) {
        inRef.current.style.opacity = wIn.toFixed(3)
        inRef.current.style.transform = `scale(${(0.985 + 0.03 * b).toFixed(4)})`
      }
      if (outRef.current) {
        outRef.current.style.opacity = (1 - wIn).toFixed(3)
        outRef.current.style.transform = `scale(${(0.985 + 0.03 * b).toFixed(4)})`
      }
      if (ringRef.current) ringRef.current.style.transform = `scale(${(0.42 + 0.58 * b).toFixed(4)})`
      const ph = d < IN ? 'in' : 'out'
      if (ph !== phase && phaseRef.current) {
        phase = ph
        phaseRef.current.textContent = ph
      }
      if (ink) {
        palPos += (target.pal - palPos) * 0.06
        s.dim += (target.dim - s.dim) * 0.06
        s.scroll += (target.scroll - s.scroll) * 0.08
        s.swirl *= 0.955
        s.vel[0] *= 0.9
        s.vel[1] *= 0.9
        s.time = t + 20
        s.breath = b
        mixPalette(palPos, pal)
        ink.render(s)
      }
      if (!firstFrame) {
        firstFrame = true
        ready()
      }
      raf = requestAnimationFrame(frame)
    }
    const run = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const onVis = () => (document.hidden ? stop() : run())

    let readyDone = false
    const shownAt = performance.now()
    function ready() {
      if (readyDone) return
      readyDone = true
      const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
      fonts.then(() => {
        const wait = reduced ? 0 : Math.max(0, 900 - (performance.now() - shownAt))
        setTimeout(() => setLoaded(true), wait)
      })
    }

    const onResize = () => {
      ink?.resize()
      measure()
      onScroll()
    }

    /* sections rise in once as they arrive */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    )
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))

    measure()
    onScroll()
    palPos = target.pal
    s.dim = target.dim
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    if (!reduced) {
      window.addEventListener('pointermove', onMove, { passive: true })
      if (useCursor) root.addEventListener('pointerover', onOver)
      document.addEventListener('visibilitychange', onVis)
      run()
    } else {
      paintStill()
      ready()
    }
    const late = setTimeout(measure, 1200)

    return () => {
      stop()
      cancelAnimationFrame(still)
      clearTimeout(late)
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerover', onOver)
      document.removeEventListener('visibilitychange', onVis)
      ink?.destroy()
    }
  }, [])

  const words = MANIFESTO.split(' ')

  return (
    <div className={`c-ekam${loaded ? ' is-loaded' : ''}${mode}`} ref={rootRef}>
      <InkBoundary>
        {fallback ? (
          <div className="ek-fallback" aria-hidden="true" />
        ) : (
          <canvas className="ek-ink" ref={canvasRef} aria-hidden="true" />
        )}
      </InkBoundary>
      <div className="ek-grain" aria-hidden="true" />
      <div className="ek-cursor" ref={cursorRef} aria-hidden="true" />

      <div className="ek-loader" aria-hidden="true">
        <span className="ek-loader-ring" />
        <span className="ek-loader-name">
          Studio <em>Ekam</em>
        </span>
      </div>

      <header className="ek-nav" ref={navRef}>
        <a className="ek-brand" href="#top">
          Studio <em>Ekam</em>
        </a>
        <nav aria-label="Main">
          <ul>
            <li><a href="#classes">Classes</a></li>
            <li><a href="#timetable">Timetable</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#visit">Find us</a></li>
          </ul>
        </nav>
        <a className="ek-btn ek-btn--small" href="#book">
          <span>Book a class</span>
        </a>
      </header>

      <main>
        <section className="ek-hero" id="top" data-ink="0" data-dim="0">
          <p className="ek-eyebrow">
            <span className="ek-dot" aria-hidden="true" />
            Yoga and breathwork &middot; Assagao, North Goa
          </p>
          <h1 className="ek-hero-title">
            <span className="ek-sr">Studio Ekam, yoga and breathwork in Assagao, Goa. Breathe in, breathe out.</span>
            <span className="ek-word ek-word--in" ref={inRef} aria-hidden="true">Breathe in.</span>
            <span className="ek-word ek-word--out" ref={outRef} aria-hidden="true">Breathe out.</span>
          </h1>
          <div className="ek-hero-foot">
            <p className="ek-lede">
              A small garden studio for yoga and breath. Unhurried teachers, soft morning light, and classes that
              always begin with the breath.
            </p>
            <div className="ek-actions">
              <a className="ek-btn" href="#book">
                <span>Book your first class</span>
                <Arrow />
              </a>
              <a className="ek-btn ek-btn--ghost" href="#timetable">
                <span>See this week</span>
              </a>
            </div>
          </div>
          <div className="ek-ring" aria-hidden="true">
            <span className="ek-ring-title">breathe with us</span>
            <span className="ek-ring-box">
              <span className="ek-ring-track" />
              <span className="ek-ring-live" ref={ringRef} />
              <span className="ek-ring-phase" ref={phaseRef}>in</span>
            </span>
            <span className="ek-ring-note">4 in &middot; 6 out</span>
          </div>
          <p className="ek-scrollhint" aria-hidden="true">
            <span />
            scroll slowly
          </p>
        </section>

        <section className="ek-manifesto" id="about" data-ink="0.5" data-dim="0.38" aria-labelledby="ek-about-h">
          <div className="ek-sticky">
            <h2 className="ek-kicker" id="ek-about-h">A slower practice</h2>
            <p className="ek-manifesto-text">
              {words.map((w, i) => (
                <span className="ek-mw" key={i}>
                  {w}{' '}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section className="ek-section ek-classes" id="classes" data-ink="1" data-dim="0.3" aria-labelledby="ek-classes-h">
          <div className="ek-head" data-reveal>
            <p className="ek-kicker ek-kicker--num">01 &middot; Classes</p>
            <h2 className="ek-h2" id="ek-classes-h">
              Five ways <em>in.</em>
            </h2>
            <p className="ek-intro">
              Every class is capped at twelve mats. Start anywhere: your teacher will offer an easier or a stronger
              version of every shape.
            </p>
          </div>
          <ul className="ek-cards">
            {CLASSES.map((c, i) => (
              <li className="ek-card ek-glass" key={c.name} data-reveal style={{ '--d': `${i * 80}ms` }}>
                <span className="ek-card-num">0{i + 1}</span>
                <h3>{c.name}</h3>
                <p>{c.body}</p>
                <dl className="ek-card-meta">
                  <div>
                    <dt>Level</dt>
                    <dd>{c.level}</dd>
                  </div>
                  <div>
                    <dt>Length</dt>
                    <dd>{c.length}</dd>
                  </div>
                </dl>
              </li>
            ))}
            <li className="ek-card ek-card--note" data-reveal style={{ '--d': '400ms' }}>
              <p className="ek-card-quiet">Not sure where to begin?</p>
              <a className="ek-link" href="#book">
                Start with Hatha on a weekday morning <Arrow />
              </a>
            </li>
          </ul>

          <div className="ek-first" data-reveal>
            <h3 className="ek-h3">Your first class</h3>
            <ol className="ek-steps">
              {FIRST_VISIT.map(([t, b], i) => (
                <li key={t}>
                  <span className="ek-step-num" aria-hidden="true">{i + 1}</span>
                  <strong>{t}</strong>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
            <p className="ek-team">
              <span>In the room:</span>
              {TEAM.map((r) => (
                <span className="ek-chip" key={r}>{r}</span>
              ))}
            </p>
          </div>
        </section>

        <section className="ek-section ek-tt-sec" id="timetable" data-ink="1.5" data-dim="0.4" aria-labelledby="ek-tt-h">
          <div className="ek-head" data-reveal>
            <p className="ek-kicker ek-kicker--num">02 &middot; Timetable</p>
            <h2 className="ek-h2" id="ek-tt-h">
              This week <em>at Ekam.</em>
            </h2>
            <p className="ek-intro">Mornings to wake the body, evenings to put the day down. All times are Goa time.</p>
          </div>
          <div className="ek-tt ek-glass" data-reveal>
            <div className="ek-tt-labels" aria-hidden="true">
              <span />
              <span>Morning</span>
              <span>Evening</span>
            </div>
            <ul className="ek-tt-days">
              {DAYS.map((d, i) => (
                <li className={`ek-tt-day${i === today ? ' is-today' : ''}`} key={d}>
                  <h3>
                    {d}
                    {i === today && <span className="ek-today">today</span>}
                  </h3>
                  {TIMETABLE[i].map((slot, k) =>
                    slot ? (
                      <p className="ek-slot" key={k}>
                        <span className="ek-slot-when">{k === 0 ? 'Morning' : 'Evening'}</span>
                        <time>{slot[0]}</time>
                        <span className="ek-slot-name">{slot[1]}</span>
                      </p>
                    ) : (
                      <p className="ek-slot ek-slot--rest" key={k}>
                        <span className="ek-slot-when">Evening</span>
                        <span className="ek-slot-name">Rest. Studio closed</span>
                      </p>
                    )
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ek-section ek-pricing" id="pricing" data-ink="2" data-dim="0.3" aria-labelledby="ek-price-h">
          <div className="ek-head" data-reveal>
            <p className="ek-kicker ek-kicker--num">03 &middot; Pricing</p>
            <h2 className="ek-h2" id="ek-price-h">
              Simple, <em>honest</em> prices.
            </h2>
            <p className="ek-intro">No joining fee and no contracts. Mats, props and filtered water come with every class.</p>
          </div>
          <ul className="ek-prices">
            {PRICES.map((p, i) => (
              <li className={`ek-price ek-glass${p.featured ? ' is-featured' : ''}`} key={p.name} data-reveal style={{ '--d': `${i * 90}ms` }}>
                <h3>{p.name}</h3>
                {p.featured && <span className="ek-tag">Most chosen way to start</span>}
                <p className="ek-amount">
                  <span className="ek-rupee">₹</span>
                  {p.price}
                </p>
                <p className="ek-unit">{p.unit}</p>
                <ul className="ek-points">
                  {p.points.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <a className={`ek-btn${p.featured ? '' : ' ek-btn--ghost'}`} href="#book">
                  <span>Choose {p.name.toLowerCase()}</span>
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="ek-section ek-visit" id="visit" data-ink="3" data-dim="0.36" aria-labelledby="ek-visit-h">
          <div className="ek-visit-info" data-reveal>
            <p className="ek-kicker ek-kicker--num">04 &middot; Find us</p>
            <h2 className="ek-h2" id="ek-visit-h">
              Under the mango trees, <em>Assagao.</em>
            </h2>
            <address className="ek-address">
              Studio Ekam
              <br />
              Off Assagao Road, near the church
              <br />
              Assagao, North Goa 403507
            </address>
            <dl className="ek-hours">
              <div>
                <dt>Monday to Saturday</dt>
                <dd>6:30 am to 8:00 pm</dd>
              </div>
              <div>
                <dt>Sunday</dt>
                <dd>7:30 am to 11:00 am</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>+91 00000 00000</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>hello@studioekam.example</dd>
              </div>
            </dl>
            <p className="ek-quiet">Scooter parking at the gate. Ten minutes from Mapusa, fifteen from Anjuna.</p>
          </div>

          <form
            className="ek-form ek-glass"
            id="book"
            data-reveal
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            <h3 className="ek-h3">Book your first class</h3>
            <p className="ek-form-sub">Tell us when suits you and we will hold a mat.</p>
            <label>
              <span>Your name</span>
              <input name="name" autoComplete="name" required />
            </label>
            <label>
              <span>Email or phone</span>
              <input name="contact" autoComplete="email" required />
            </label>
            <div className="ek-form-row">
              <label>
                <span>Class</span>
                <select name="class" defaultValue="Hatha">
                  {CLASSES.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Day</span>
                <select name="day" defaultValue="Mon">
                  {DAYS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>
            <button className="ek-btn ek-btn--wide" type="submit">
              <span>Book your first class</span>
              <Arrow />
            </button>
            <p className="ek-form-note" role="status">
              {sent ? 'Thank you. Concept site: this form does not send.' : 'Concept site: this form does not send.'}
            </p>
          </form>
        </section>
      </main>

      <footer className="ek-footer" data-ink="3" data-dim="0.45">
        <p className="ek-footer-mark" aria-hidden="true">
          Ekam<em>.</em>
        </p>
        <div className="ek-footer-row">
          <p>Studio Ekam &middot; yoga and breathwork &middot; Assagao, Goa</p>
          <p>&copy; 2026 Studio Ekam</p>
          <a className="ek-link" href="#top">
            Back to the breath
          </a>
        </div>
      </footer>
    </div>
  )
}
