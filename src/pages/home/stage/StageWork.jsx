import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { projects, films, stills, stillLabel } from '../../../data.js'
import { concepts } from '../../../concepts/registry.js'
import LoopVideo from '../../../components/LoopVideo.jsx'
import Stream from './work/Stream.jsx'
import { settle, useMedia } from './work/shared.js'
import { track } from '../../../analytics.js'
import '../../service/showcase/stage.css'
import './work/work.css'

/* Phones (<=767px, Spec 3): the pinned deck above becomes a horizontal
   swipe deck, one card per screen, built with plain CSS scroll-snap
   (work/work.css `.sw-deck` under this query). No extra motion library:
   the "Next" rehook calls scrollBy on the native scroll container. */
const PHONE = '(max-width: 767px)'

/* ---------------------------------------------------------------
   The second story loop: the real work, as a deck. On a wide screen
   each project is a glass window that pins near the top while the next
   one slides up over it; the covered window shrinks to 0.94 and dims to
   half brightness as it goes under, so the stack reads like a deck of
   cards. Each window ends on a rehook naming the next one. The deck
   closes on the five concept websites, labelled as concepts.

   Selection and order match the old home Work band: the two client
   platforms (schematic films), then the three working demos (real
   screens). Phones, short screens and reduced motion get plain
   stacked cards.
   --------------------------------------------------------------- */

/* Where a pinned card sits, and how far each later card sits below the
   one it covers, so the covered cards show as a thin stacked edge. */
const TOP = 96
const STEP = 14

const DECK = '(min-width: 1024px) and (min-height: 680px)'

/* What the media is, in the words the films themselves use on screen. */
const KIND_TAG = {
  schematic: 'Schematic film · client data never shown',
  real: 'Working demo · real screens'
}

function mediaFor(project) {
  const film = films[project.slug]
  if (film?.kind === 'schematic') {
    return { kind: 'video', src: film.src, poster: film.poster, tag: KIND_TAG.schematic, ratio: '16 / 9' }
  }
  if (film) {
    /* The bare app loop, not the "framed" one: the card already draws
       the browser frame, and a frame inside a frame reads as clutter. */
    return { kind: 'video', src: film.clip, poster: film.clipPoster, tag: KIND_TAG.real, ratio: '16 / 10' }
  }
  const still = stills[project.slug]
  if (still) return { kind: 'image', src: still.cover.file, tag: stillLabel.badge, ratio: '16 / 10' }
  return null
}

/* The height a laid-out card needs: the taller of its two columns'
   content, plus the rehook strip. Built from offsetTop / offsetHeight,
   which ignore the deck's scale transform and do not depend on whether
   the card is currently pinned, so the answer is the same in both modes
   (no flip-flopping between them). */
function needOf(card) {
  const part = (el) => {
    const kids = el ? [...el.children] : []
    if (!kids.length) return 0
    const first = kids[0]
    const last = kids[kids.length - 1]
    const cs = getComputedStyle(el)
    return last.offsetTop + last.offsetHeight - first.offsetTop + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
  }
  const rehook = card.querySelector('.sw-rehook')
  return Math.max(part(card.querySelector('.sw-copy')), part(card.querySelector('.sw-media'))) + (rehook?.offsetHeight ?? 0) + 2
}

export default function StageWork() {
  const reduce = useReducedMotion()
  const wide = useMedia(DECK)
  const phone = useMedia(PHONE)
  const sectionRef = useRef(null)
  const deckRef = useRef(null)

  const items = useMemo(() => {
    const platforms = projects.filter((p) => films[p.slug]?.kind === 'schematic')
    const tools = projects.filter((p) => films[p.slug]?.kind === 'real')
    return [...platforms, ...tools]
  }, [])
  const total = items.length + 1
  const refs = useMemo(() => Array.from({ length: total }, () => createRef()), [total])
  const names = useMemo(() => [...items.map((p) => p.title), 'Five concept designs'], [items])

  /* Spec 3's counter and dots: which slot is mostly on screen in the
     phone swipe deck. A second, simpler observer than LoopVideo's own
     (which plays only the on-screen film already, for free, because the
     deck clips anything scrolled out horizontally) — this one only
     drives the "01 / 06" text, the dots and the live region. */
  const [active, setActive] = useState(0)
  const [swiped, setSwiped] = useState(false)
  useEffect(() => {
    if (!phone) return undefined
    const deckEl = deckRef.current
    if (!deckEl) return undefined
    const slots = [...deckEl.querySelectorAll('.sw-slot')]
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const i = slots.indexOf(entry.target)
          if (i === -1) return
          setActive(i)
          /* Sticky once true: the hint should stay gone even if the
             visitor swipes back to the first card. */
          if (i > 0) setSwiped(true)
        })
      },
      { root: deckEl, threshold: 0.6 }
    )
    slots.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [phone, total])

  /* Every card in the deck shares one height (~70vh), so a covering card
     always hides the one under it completely. If the copy needs more than
     that, the cards grow, as long as the last card still fits on screen
     below its pinned top; if it cannot, the deck turns itself off and the
     cards stack normally, rather than cutting text off. */
  const [fit, setFit] = useState({ ok: true, h: 0 })
  useEffect(() => {
    if (!wide || reduce) return undefined
    const section = sectionRef.current
    const measure = () => {
      const vh = window.innerHeight
      const base = Math.min(Math.max(560, vh * 0.7), 700)
      const need = Math.max(0, ...[...section.querySelectorAll('.sw-card')].map(needOf))
      const h = Math.ceil(Math.max(base, need))
      const ok = TOP + (total - 1) * STEP + h <= vh - 8
      setFit((f) => (f.ok === ok && f.h === h ? f : { ok, h }))
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [wide, reduce, total])

  const deck = wide && !reduce && fit.ok && fit.h > 0

  return (
    <section
      className={`stage sw${deck ? ' is-deck' : ''}`}
      id="work"
      aria-labelledby="sw-title"
      ref={sectionRef}
      style={deck ? { '--sw-card-h': `${fit.h}px` } : undefined}
    >
      <Stream target={sectionRef} />
      {/* The section's one glow, pinned behind whichever card is on top. */}
      <div className="sw-glow-track" aria-hidden="true">
        <div className="sw-glow-pin">
          <div className="stage-glow" style={{ '--glow-x': '55%', '--glow-y': '55%' }} />
        </div>
      </div>

      <m.header className="sw-head" {...settle(reduce)}>
        <p className="stage-pill stage-mono">
          <span className="stage-dot" aria-hidden="true" />
          The work
        </p>
        <h2 id="sw-title" className="stage-title">
          Work that&rsquo;s running <span className="stage-serif">now.</span>
        </h2>
        <p className="stage-lede">
          One client platform in daily use, one in pre-launch, and three working tools. Each one is shown for
          exactly what it is.
        </p>
      </m.header>

      {phone && (
        <div className="sw-counter">
          <span className="sw-counter-n stage-mono">
            <span className="sw-counter-cur">{pad(active + 1)}</span> / {pad(total)}
            {!swiped && <span className="sw-counter-hint"> · swipe for the next build</span>}
          </span>
          <span className="sw-dots" aria-hidden="true">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`sw-dot${i === active ? ' is-active' : ''}`} />
            ))}
          </span>
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite">
        {phone ? `Project ${active + 1} of ${total}: ${names[active]}` : ''}
      </p>

      <ol className="sw-deck" ref={deckRef} aria-label={phone ? 'Projects, swipe sideways' : undefined}>
        {items.map((project, i) => (
          <Slot
            key={project.slug}
            index={i}
            total={total}
            deck={deck}
            phone={phone}
            reduce={reduce}
            slotRef={refs[i]}
            nextRef={refs[i + 1]}
            next={items[i + 1]?.title ?? 'Five concept websites'}
          >
            <ProjectCard project={project} index={i} total={total} />
          </Slot>
        ))}
        <Slot
          index={items.length}
          total={total}
          deck={deck}
          phone={phone}
          reduce={reduce}
          slotRef={refs[items.length]}
          next="Three ways to work together"
          nextHref="#services"
        >
          <ConceptsCard deck={deck} />
        </Slot>
      </ol>

      {phone && (
        <p className="sw-seeall">
          <Link to="/projects" className="sw-seeall-link">
            See all {projects.length} projects <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      )}
    </section>
  )
}

/* One pinned position in the deck. Owns the scroll maths: how far the
   NEXT card has slid over this one (scale + shade), and whether this
   card has reached the top (its node on the stream lights). */
function Slot({ index, total, deck, phone, reduce, slotRef, nextRef, next, nextHref, children }) {
  const top = TOP + index * STEP
  const { scrollYProgress: covered } = useScroll({
    target: nextRef ?? slotRef,
    offset: ['start end', `start ${top + STEP}px`]
  })
  const { scrollYProgress: arrived } = useScroll({ target: slotRef, offset: ['start end', `start ${top}px`] })

  const scale = useTransform(covered, [0, 1], [1, 0.94])
  const shade = useTransform(covered, [0, 1], [0, 0.5])
  const lit = useTransform(arrived, [0.92, 1], [0, 1])

  /* A card that is fully under the next one swaps its film for the
     still poster: nobody can see it, so it should not be decoding. */
  const [buried, setBuried] = useState(false)
  useMotionValueEvent(covered, 'change', (v) => {
    if (!deck || !nextRef) return
    const b = v > 0.985
    if (b !== buried) setBuried(b)
  })

  const last = index === total - 1

  /* Spec 3's swipe control: on phones, the "Next" rehook of every card but
     the last becomes the button that advances the deck by one slot. The
     last card keeps its down-the-page link (nextHref), same as before. */
  const onSwipeNext = () => {
    const slotEl = slotRef.current
    const deckEl = slotEl?.closest('.sw-deck')
    if (!slotEl || !deckEl) return
    deckEl.scrollBy({ left: slotEl.offsetWidth + 12, behavior: reduce ? 'auto' : 'smooth' })
    track('sw_next', { index })
  }

  return (
    <li
      className="sw-slot"
      ref={slotRef}
      style={deck ? { top } : undefined}
      aria-label={phone ? `${index + 1} of ${total}` : undefined}
    >
      {deck && <m.span className="sw-node" style={{ opacity: lit }} aria-hidden="true" />}
      <m.article
        className="sw-card stage-glass"
        style={deck && !last ? { scale } : undefined}
        data-buried={deck && buried ? '' : undefined}
      >
        {children}
        <p className="sw-rehook stage-mono">
          <span className="sw-rehook-next" aria-hidden="true">
            Next ↓
          </span>
          <span className="sr-only">Next: </span>
          {nextHref ? (
            <a href={nextHref} className="sw-rehook-name">
              {next}
            </a>
          ) : phone ? (
            <button type="button" className="sw-rehook-name sw-rehook-btn" onClick={onSwipeNext}>
              {next}
            </button>
          ) : (
            <span className="sw-rehook-name">{next}</span>
          )}
        </p>
        {deck && !last && <m.span className="sw-shade" style={{ opacity: shade }} aria-hidden="true" />}
      </m.article>
    </li>
  )
}

function BrowserFrame({ label, ratio, children }) {
  return (
    <div className="sw-frame">
      <div className="sw-bar" aria-hidden="true">
        <span className="sw-lights">
          <i />
          <i />
          <i />
        </span>
        <span className="sw-bar-label">{label}</span>
      </div>
      <div className="sw-screen" style={{ aspectRatio: ratio }}>
        {children}
      </div>
    </div>
  )
}

const pad = (n) => String(n).padStart(2, '0')

function ProjectCard({ project, index, total }) {
  const media = mediaFor(project)
  const href = `/projects/${project.slug}`
  return (
    <div className="sw-grid">
      <div className="sw-media">
        {media && (
          <BrowserFrame label={`${pad(index + 1)} / ${pad(total)}`} ratio={media.ratio}>
            {media.kind === 'video' ? (
              <>
                {/* The poster sits under the film, so a buried card (film
                    unmounted) and a card still buffering look the same. */}
                <img className="sw-poster" src={media.poster} alt="" width="1920" height="1080" loading="lazy" decoding="async" />
                <span className="sw-live">
                  <LoopVideo src={media.src} poster={media.poster} className="sw-video" />
                </span>
              </>
            ) : (
              <img className="sw-poster" src={media.src} alt="" width="1440" height="900" loading="lazy" decoding="async" />
            )}
          </BrowserFrame>
        )}
        <p className="sw-caption stage-mono">
          {project.subtitle} · {project.year}
        </p>
      </div>

      <div className="sw-copy">
        {media && (
          <p className="sw-tag stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            {media.tag}
          </p>
        )}
        <h3 className="sw-name">{project.title}</h3>
        <p className="sw-tagline">{project.tagline}</p>
        {project.outcome?.length > 0 && (
          <>
            <ul className="sw-outcome">
              {project.outcome.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {project.outcomeNote && <p className="sw-note">{project.outcomeNote}</p>}
          </>
        )}
        <Link to={href} className="sw-link">
          Read the case study<span className="sr-only">: {project.title}</span>
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
    </div>
  )
}

/* The five concept sites' hero posters, fanned on a slow 3D arc. */
function ConceptsCard({ deck }) {
  const n = concepts.length
  const mid = (n - 1) / 2
  return (
    <div className="sw-grid sw-grid-concepts">
      <div className="sw-media sw-arc-wrap" aria-hidden="true">
        <div className={`sw-arc${deck ? ' is-swaying' : ''}`}>
          {concepts.map((c, i) => {
            const k = i - mid
            return (
              <figure key={c.slug} className={`sw-arc-card${k === 0 ? ' is-center' : ''}`} style={{ '--k': k, '--ak': Math.abs(k) }}>
                <span className="sw-arc-bar">
                  <i />
                  <i />
                  <i />
                </span>
                <img src={`/showcase/websites/${c.slug}-hero.webp`} alt="" width="1440" height="900" loading="lazy" decoding="async" />
              </figure>
            )
          })}
        </div>
      </div>

      <div className="sw-copy">
        <p className="sw-tag stage-mono">
          <span className="stage-dot" aria-hidden="true" />
          Concept designs · made-up businesses
        </p>
        <h3 className="sw-name sw-name-lg">
          Plus five websites designed to show the <span className="stage-serif">range.</span>
        </h3>
        <p className="sw-tagline">
          A skin clinic, a physio clinic, a yoga studio, an interiors studio and an advisory firm: made-up
          businesses, each site built around one cinematic centrepiece.
        </p>
        <Link to="/websites" className="sw-link">
          See all five sites<span aria-hidden="true"> →</span>
        </Link>
      </div>
    </div>
  )
}
