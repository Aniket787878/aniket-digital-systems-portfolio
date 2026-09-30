import { useCallback, useEffect, useRef, useState } from 'react'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import './meridian.css'
import Scene from './Scene.jsx'
import { bus, measure } from './bus.js'
import { NAV, STAGES, SERVICES, STEPS, TEAM, TIERS, nextAdvanceTax } from './content.js'

/* Meridian Advisory: a made-up accounting, tax and wealth firm in BKC.
   One field of 40k points is the whole visual: a scattered cloud, a globe,
   a rising chart, one ring. Scroll decides the shape (see bus.js). */

const reducedQuery = '(prefers-reduced-motion: reduce)'

function useReduced() {
  const [r, setR] = useState(() => typeof window !== 'undefined' && window.matchMedia(reducedQuery).matches)
  useEffect(() => {
    const mq = window.matchMedia(reducedQuery)
    const on = () => setR(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return r
}

const Em = ({ children }) => <em className="mr-em">{children}</em>

function Arrow() {
  return (
    <svg className="mr-arrow" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function Logo() {
  return (
    <a href="#top" className="mr-logo" aria-label="Meridian Advisory, back to top">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <ellipse cx="10" cy="10" rx="3.4" ry="8.2" fill="none" stroke="#c8a45c" strokeWidth="1.3" />
      </svg>
      <span>Meridian</span>
    </a>
  )
}

function Cursor() {
  const ref = useRef(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = ref.current
    let x = -100
    let y = -100
    let cx = x
    let cy = y
    let raf = 0
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      el.classList.add('is-on')
      const t = e.target.closest?.('a, button, input, select, textarea, label')
      el.classList.toggle('is-hover', !!t)
    }
    const tick = () => {
      cx += (x - cx) * 0.22
      cy += (y - cy) * 0.22
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    const leave = () => el.classList.remove('is-on')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [])
  return <div ref={ref} className="mr-cursor" aria-hidden="true" />
}

function Nav({ scrolled }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  return (
    <header className={`mr-nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <Logo />
      <nav aria-label="Main">
        <ul className="mr-nav-links">
          {NAV.map(([label, href]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mr-nav-right">
        <a href="#m-contact" className="mr-btn mr-btn-light mr-nav-cta">
          <span>Book a conversation</span>
          <Arrow />
        </a>
        <button
          type="button"
          className="mr-menu-btn"
          aria-expanded={open}
          aria-controls="mr-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="mr-menu-icon" aria-hidden="true" />
          <span className="mr-sr">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>
      <div id="mr-menu" className="mr-menu" hidden={!open}>
        <ul>
          {NAV.map(([label, href]) => (
            <li key={href}>
              <a href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="#m-contact" onClick={() => setOpen(false)}>
              Contact
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}

function Hero() {
  const tax = nextAdvanceTax()
  return (
    <section id="m-hero" className="mr-hero" aria-labelledby="mr-h1">
      <div className="mr-hero-meta mr-mono">
        <span>Bandra Kurla Complex, Mumbai</span>
        <span>19.07° N &nbsp; 72.87° E</span>
      </div>
      <div className="mr-hero-body">
        <p className="mr-kicker mr-mono">Accounting, tax and wealth advice</p>
        <h1 id="mr-h1" className="mr-display">
          <span className="mr-line">Your money,</span>
          <span className="mr-line">
            in <Em>order</Em>.
          </span>
        </h1>
        <div className="mr-hero-foot">
          <p className="mr-lede">
            For founders and families in Mumbai. One team that sees your company, your taxes and your investments
            together, and a written plan you can actually read.
          </p>
          <div className="mr-actions">
            <a href="#m-contact" className="mr-btn mr-btn-brass">
              <span>Book a first conversation</span>
              <Arrow />
            </a>
            <a href="#m-story" className="mr-btn mr-btn-ghost">
              <span>See how we work</span>
            </a>
          </div>
        </div>
      </div>
      <aside className="mr-ticker" aria-label="Next advance tax date">
        <div className="mr-ticker-row mr-mono">
          <span>Next advance tax</span>
          <span className="mr-dot" aria-hidden="true" />
        </div>
        <p className="mr-ticker-date mr-num">{tax.label}</p>
        <div className="mr-ticker-row mr-mono">
          <span>{tax.pct}% of the year&rsquo;s tax due</span>
          <span className="mr-num">in {tax.days} days</span>
        </div>
      </aside>
      <div className="mr-scrollcue mr-mono" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}

function Story({ stage }) {
  return (
    <section id="m-story" className="mr-story" aria-labelledby="mr-story-h">
      <div className="mr-story-pin">
        <div className="mr-story-text">
          <p className="mr-kicker mr-mono">
            <span className="mr-num">01</span> &nbsp;Approach
          </p>
          <h2 id="mr-story-h" className="mr-h2">
            From scattered <br />
            to <Em>clear</Em>.
          </h2>
          <ol className="mr-stage-tabs mr-mono" aria-label="Stages">
            {STAGES.map((s, i) => (
              <li key={s.key} className={i === stage ? 'is-on' : ''} aria-current={i === stage ? 'step' : undefined}>
                <span className="mr-num">0{i + 1}</span> {s.key}
              </li>
            ))}
          </ol>
          <div className="mr-stage-bar" aria-hidden="true">
            <i />
          </div>
          <div className="mr-stages">
            {STAGES.map((s, i) => (
              <div key={s.key} className={`mr-stage${i === stage ? ' is-on' : ''}`}>
                <h3 className="mr-stage-title">{s.key}</h3>
                <ul>
                  {s.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="m-services" className="mr-section mr-services" aria-labelledby="mr-services-h">
      <div className="mr-head">
        <p className="mr-kicker mr-mono">
          <span className="mr-num">02</span> &nbsp;Services
        </p>
        <h2 id="mr-services-h" className="mr-h2">
          Four things, done <Em>properly</Em>.
        </h2>
        <p className="mr-sub">
          Most clients start with one and add the rest once the picture is clear. The same team handles all four,
          so nothing falls between two firms.
        </p>
      </div>
      <div className="mr-cards">
        {SERVICES.map((s) => (
          <article key={s.n} className="mr-card" data-reveal>
            <div className="mr-card-top mr-mono">
              <span className="mr-num">{s.n}</span>
              <span className="mr-card-rule" aria-hidden="true" />
            </div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <ul>
              {s.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

function How({ step }) {
  return (
    <section id="m-how" className="mr-section mr-how" aria-labelledby="mr-how-h">
      <div className="mr-how-grid">
        <div className="mr-how-text">
          <p className="mr-kicker mr-mono">
            <span className="mr-num">03</span> &nbsp;How we work
          </p>
          <h2 id="mr-how-h" className="mr-h2">
            One plan, <br />
            reviewed each <Em>quarter</Em>.
          </h2>
          <ol className="mr-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className={`mr-step${i <= step ? ' is-on' : ''}`} data-step={i}>
                <div className="mr-step-when mr-mono">
                  <span className="mr-num">0{i + 1}</span>
                  <span>{s.when}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mr-team">
            <h3 className="mr-kicker mr-mono">Who you work with</h3>
            <dl>
              {TEAM.map(([role, what]) => (
                <div key={role}>
                  <dt>{role}</dt>
                  <dd>{what}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

function Fees() {
  return (
    <section id="m-fees" className="mr-section mr-fees" aria-labelledby="mr-fees-h">
      <div className="mr-head mr-head-center">
        <p className="mr-kicker mr-mono">
          <span className="mr-num">04</span> &nbsp;Fees
        </p>
        <h2 id="mr-fees-h" className="mr-h2">
          Fixed fees, agreed <Em>upfront</Em>.
        </h2>
        <p className="mr-sub">
          Our menu for a year of work. No hourly billing and no commission on anything you buy. We confirm the fee in
          writing after the first conversation.
        </p>
      </div>
      <div className="mr-tiers">
        {TIERS.map((t) => (
          <article key={t.name} className={`mr-tier${t.featured ? ' is-featured' : ''}`} data-reveal>
            <div className="mr-tier-head">
              <h3>{t.name}</h3>
              {t.featured && <span className="mr-tag mr-mono">Most asked for</span>}
            </div>
            <p className="mr-tier-for">{t.for}</p>
            <p className="mr-price">
              {t.from && <span className="mr-price-from mr-mono">from</span>}
              <span className="mr-price-cur">₹</span>
              <span className="mr-num">{t.price}</span>
              <span className="mr-price-per mr-mono">/ year</span>
            </p>
            <ul>
              {t.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <a href="#m-contact" className={`mr-btn ${t.featured ? 'mr-btn-brass' : 'mr-btn-ghost'} mr-btn-full`}>
              <span>Talk about {t.name.toLowerCase()}</span>
              <Arrow />
            </a>
          </article>
        ))}
      </div>
      <p className="mr-fine mr-mono">GST extra at 18%. Audit fees, where a statutory audit is needed, are quoted separately.</p>
    </section>
  )
}

function Contact() {
  const [sent, setSent] = useState(false)
  return (
    <section id="m-contact" className="mr-section mr-contact" aria-labelledby="mr-contact-h">
      <div className="mr-contact-grid">
        <div className="mr-contact-text">
          <p className="mr-kicker mr-mono">
            <span className="mr-num">05</span> &nbsp;Contact
          </p>
          <h2 id="mr-contact-h" className="mr-h2 mr-h2-big">
            Book a first <Em>conversation</Em>.
          </h2>
          <p className="mr-sub">
            Forty-five minutes, no charge. Bring your last return and a rough list of what you own. We will tell you
            what we would do first.
          </p>
          <dl className="mr-facts">
            <div>
              <dt className="mr-mono">Office</dt>
              <dd>
                G Block, Bandra Kurla Complex
                <br />
                Bandra East, Mumbai 400 051
              </dd>
            </div>
            <div>
              <dt className="mr-mono">Hours</dt>
              <dd>
                Monday to Friday, <span className="mr-num">9:30</span> to <span className="mr-num">18:30</span>
                <br />
                Saturday by appointment
              </dd>
            </div>
            <div>
              <dt className="mr-mono">Phone</dt>
              <dd className="mr-num">+91 00000 00000</dd>
            </div>
            <div>
              <dt className="mr-mono">Email</dt>
              <dd>hello@meridian.example</dd>
            </div>
          </dl>
        </div>
        <form
          className="mr-form"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <div className="mr-field">
            <label htmlFor="mr-name">Your name</label>
            <input id="mr-name" name="name" autoComplete="name" required />
          </div>
          <div className="mr-field">
            <label htmlFor="mr-email">Email</label>
            <input id="mr-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="mr-field">
            <label htmlFor="mr-topic">What would you like help with?</label>
            <select id="mr-topic" name="topic" defaultValue="Tax filing and planning">
              {SERVICES.map((s) => (
                <option key={s.n}>{s.title}</option>
              ))}
              <option>Not sure yet</option>
            </select>
          </div>
          <div className="mr-field">
            <label htmlFor="mr-msg">Anything we should know first?</label>
            <textarea id="mr-msg" name="message" rows="3" />
          </div>
          <button type="submit" className="mr-btn mr-btn-brass mr-btn-full">
            <span>Request a time</span>
            <Arrow />
          </button>
          <p className="mr-note mr-mono" role="status">
            {sent
              ? 'Thank you. This is a concept site, so nothing was sent.'
              : 'Concept site: this form does not send anything.'}
          </p>
        </form>
      </div>
      <footer className="mr-footer">
        <div className="mr-footer-rule" aria-hidden="true" />
        <div className="mr-footer-row">
          <Logo />
          <p className="mr-mono">Meridian Advisory is a made-up firm, designed as a concept.</p>
          <p className="mr-mono mr-num">© 2026</p>
        </div>
      </footer>
    </section>
  )
}

function Loader({ done }) {
  return (
    <div className={`mr-loader${done ? ' is-done' : ''}`} aria-hidden="true">
      <div className="mr-loader-in">
        <span className="mr-mono">Meridian</span>
        <i />
        <span className="mr-mono">Putting the picture together</span>
      </div>
    </div>
  )
}

export default function Concept() {
  const reduced = useReduced()
  const root = useRef(null)
  const [stage, setStage] = useState(0)
  const [step, setStep] = useState(-1)
  const [scrolled, setScrolled] = useState(false)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setTimeout(() => setReady(true), 350), [])

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2500) // never hold the page hostage
    return () => clearTimeout(t)
  }, [])

  // scroll, pointer and measurements, written into the shared bus
  useEffect(() => {
    measure()
    const el = root.current
    const story = document.getElementById('m-story')
    const how = document.getElementById('m-how')
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      bus.scrollY = y
      setScrolled(y > 40)
      const r = story.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)))
      el.style.setProperty('--story', p.toFixed(4))
      setStage(p < 0.4 ? 0 : p < 0.7 ? 1 : 2)
      const h = how.getBoundingClientRect()
      const steps = how.querySelectorAll('.mr-step')
      let s = -1
      steps.forEach((node, i) => {
        if (node.getBoundingClientRect().top < window.innerHeight * 0.62) s = i
      })
      if (h.bottom < 0) s = 3
      setStep(s)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onResize = () => {
      measure()
      onScroll()
    }
    const onPointer = (e) => {
      bus.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      bus.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
      bus.pointer.active = 1
    }
    const onLeave = () => (bus.pointer.active = 0)
    const ro = new ResizeObserver(onResize)
    ro.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.fonts?.ready.then(onResize)
    update()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // reveal cards as they enter
  useEffect(() => {
    const nodes = root.current.querySelectorAll('[data-reveal]')
    if (reduced) {
      nodes.forEach((n) => n.classList.add('is-in'))
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
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [reduced])

  return (
    <div ref={root} id="top" className={`c-meridian${reduced ? ' is-reduced' : ''}${ready ? ' is-ready' : ''}`}>
      <a href="#m-services" className="mr-skip">
        Skip to services
      </a>
      <div className="mr-stage-canvas">
        <Scene still={reduced} onReady={onReady} />
      </div>
      <div className="mr-vignette" aria-hidden="true" />
      <div className="mr-noise" aria-hidden="true" />
      <Loader done={ready} />
      <Cursor />
      <Nav scrolled={scrolled} />
      <main>
        <Hero />
        <Story stage={stage} />
        <Services />
        <How step={step} />
        <Fees />
        <Contact />
      </main>
    </div>
  )
}
