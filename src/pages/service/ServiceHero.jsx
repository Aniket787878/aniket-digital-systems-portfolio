import { useEffect, useRef, useSyncExternalStore } from 'react'
import { m, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import Icon from '../../components/icons.jsx'
import { CheckCta, TalkCta } from '../../components/FunnelCta.jsx'
import { whatsappPrefill } from '../../data.js'
import { useCurrency, inCurrency } from '../../currency.js'
import { glideTo } from '../../scroll/smooth.js'
import SitesScene from './hero/SitesScene.jsx'
import InboxScene from './hero/InboxScene.jsx'
import DeskScene from './hero/DeskScene.jsx'
import './showcase/stage.css'
import './hero/hero.css'

/* ---------------------------------------------------------------
   A service page's opening screen, in the Stage look of the showpiece
   right under it: night ground, dot grid, one saffron glow, the claim
   on the left and a tilted glass window on the right with a live scene
   for the area (hero/*Scene.jsx). Each scene shows something the
   showpiece below does not:
     websites  a page building itself, then becoming a real concept site
     software  enquiries from three places landing in one real inbox
     ai        one front desk using the clinic's tools, from recorded runs
   The three buyer facts sit in a glass strip along the bottom, and the
   section ends on --night so the showpiece continues without a seam.
   --------------------------------------------------------------- */

const SCENES = { websites: SitesScene, software: InboxScene, ai: DeskScene }

/* The story loop (docs/ideas/relay-direction.md, section 0): the stakes
   above the claim, the scene as the headfake, and a rehook at the foot
   that hands the visitor to the showpiece right below. */
const STAKES = {
  websites: 'A visitor decides whether to stay before they read a word.',
  software: 'Messages in four apps. Nobody sure who replied.',
  ai: 'The questions arrive at night. The desk opens at nine.'
}
const REHOOK = {
  websites: 'Five real sites, built to show the range',
  software: 'Take it apart: what sits under one screen',
  ai: 'Watch one whole day at the front desk'
}

const EASE = [0.22, 1, 0.36, 1]
const settle = {
  hidden: { opacity: 0, y: 12, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: EASE } }
}
const group = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }

/* Tilt only where it reads as depth: a wide screen with a real pointer. */
const DESKTOP = '(min-width: 1024px)'
const FINE = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
function useMedia(query) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

/* "...the moment it lands." -> ["...the moment it ", "lands", "."] so the
   last word can take the serif without its full stop. */
function splitLast(line) {
  const at = line.lastIndexOf(' ')
  const head = line.slice(0, at + 1)
  const [, word, tail] = line.slice(at + 1).match(/^(.*?)([.!?,]*)$/)
  return [head, word, tail]
}

export default function ServiceHero({ area }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const wide = useMedia(DESKTOP)
  const fine = useMedia(FINE)
  const currency = useCurrency()
  const prefill = whatsappPrefill[area.slug] || whatsappPrefill.hero
  const Scene = SCENES[area.slug]
  const [head, word, tail] = splitLast(area.title[1])
  // Reduced motion keeps the resting pose but drops the pointer and
  // scroll movement.
  const tilt = wide
  const moving = wide && !reduce

  // Pointer: -0.5..0.5 across the hero, sprung so the window drifts.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // The window settles towards flat as the hero scrolls away.
  const flat = useTransform(scrollYProgress, [0, 0.8], [1, 0.45], { clamp: true })
  const rotateX = useTransform([sy, flat], ([y, f]) => (!tilt ? 0 : moving ? 9 * f - y * 8 : 9))
  const rotateY = useTransform([sx, flat], ([x, f]) => (!tilt ? 0 : moving ? -13 * f + x * 8 : -13))

  // The showpiece is the hero's next sibling (ServicePage.jsx).
  const toShowcase = () => {
    const next = ref.current && ref.current.nextElementSibling
    if (next) glideTo(next)
  }

  useEffect(() => {
    if (!moving || !fine) return undefined
    const el = ref.current
    const move = (e) => {
      const r = el.getBoundingClientRect()
      px.set((e.clientX - r.left) / r.width - 0.5)
      py.set((e.clientY - r.top) / r.height - 0.5)
    }
    const leave = () => {
      px.set(0)
      py.set(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [moving, fine, px, py])

  return (
    <section className={`stage sv-hero sv-${area.slug}`} ref={ref} aria-labelledby="svc-title">
      <div className="stage-glow sv-glow" aria-hidden="true" />

      {/* Keyed on the area so moving between service pages replays the
          entrance instead of swapping the words in place. */}
      <m.div key={area.slug} className="sv-wrap" variants={group} initial="hidden" animate="show">
        <div className="sv-grid">
          <div className="sv-copy">
            <m.p className="stage-pill stage-mono sv-kicker" variants={settle}>
              <Icon name={area.icon} size={14} />
              {area.name}
            </m.p>
            {STAKES[area.slug] && (
              <m.p className="sv-stakes" variants={settle}>
                {STAKES[area.slug]}
              </m.p>
            )}
            <m.h1 className="stage-title sv-title" id="svc-title" variants={settle}>
              <span className="sv-line">{area.title[0]}</span>
              <span className="sv-line">
                {head}
                <span className="stage-serif">{word}</span>
                {tail}
              </span>
            </m.h1>
            <m.p className="stage-lede sv-lede" variants={settle}>
              {area.sub}
            </m.p>

            <m.div className="sv-actions" variants={settle}>
              <CheckCta placement={`${area.slug}-hero`} magnet />
              <TalkCta message={prefill} contact={`/contact?service=${area.slug}#write`} />
            </m.div>
            <m.p className="stage-mono sv-foot" variants={settle}>
              From {inCurrency(area.from, currency)}. Free AI check first, no obligation.
            </m.p>
          </div>

          <m.div className="sv-visual" variants={settle}>
            <div className="sv-persp">
              <m.div className="sv-tilt" style={{ rotateX, rotateY }}>
                <Scene live={!reduce} wide={wide} />
              </m.div>
            </div>
          </m.div>
        </div>

        <m.ul className="sv-facts stage-glass" variants={settle} aria-label={`What you get with ${area.name.toLowerCase()}`}>
          {area.points.map((point) => (
            <li key={point.title} className="sv-fact">
              <span className="sv-fact-icon" aria-hidden="true">
                <Icon name={point.icon} size={16} />
              </span>
              <span className="sv-fact-body">
                <span className="sv-fact-title">{point.title}</span>
                <span className="sv-fact-text">{point.text}</span>
              </span>
            </li>
          ))}
        </m.ul>

        {REHOOK[area.slug] && (
          <m.div
            className="sv-rehook"
            initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.2 }}
          >
            <button type="button" className="sv-rehook-btn stage-mono" onClick={toShowcase}>
              <span className="sv-rehook-arrow" aria-hidden="true">
                ↓
              </span>
              {REHOOK[area.slug]}
            </button>
          </m.div>
        )}
      </m.div>
    </section>
  )
}
