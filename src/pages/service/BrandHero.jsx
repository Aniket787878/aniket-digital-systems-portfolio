import { m } from 'motion/react'
import { Link } from 'react-router-dom'
import { CheckCta, TalkCta } from '../../components/FunnelCta.jsx'
import { brand, site, whatsappPrefill } from '../../data.js'
import './showcase/stage.css'
import '../ai/AiPages.css'

/* ---------------------------------------------------------------
   /ai's opening screen: the brand home (docs/work/ai-brand/spec.md).
   The Stage look of the service heroes (night ground, dot grid, one
   saffron glow), centred, with no scene: the name, three promises
   each closing on a serif word, who it is for, the free check and the
   call, then the reply promise and the guarantee. Everything reads
   `brand` in data.js, so a rename touches one line.
   Reduced motion: <MotionConfig reducedMotion="user"> in App.jsx shows
   the final state.
   --------------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1]
const settle = {
  hidden: { opacity: 0, y: 12, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: EASE } }
}
const group = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }

/* The quiet strip under the hero's promises: the brand's own pages
   (docs/work/ai-brand-2/spec.md). The vertical labels come from
   `brand.verticals`, so a new vertical joins the strip by itself. */
const LINKS = [
  { to: '/ai/try', label: 'Try it' },
  ...brand.verticals.map((v) => ({ to: `/ai/for/${v.slug}`, label: v.link })),
  { to: '/ai/pricing', label: 'Pricing' }
]

export default function BrandHero() {
  return (
    <section className="stage svc-brand" aria-labelledby="svc-brand-title">
      <div className="stage-glow svc-brand-glow" aria-hidden="true" />

      <m.div className="container svc-brand-inner" variants={group} initial="hidden" animate="show">
        <m.p className="stage-pill stage-mono svc-brand-kicker" variants={settle}>
          <span className="stage-dot" aria-hidden="true" />
          <span className="svc-brand-name">{brand.name}</span>
          <span aria-hidden="true">·</span>
          {brand.line}
        </m.p>

        <m.h1 className="stage-title svc-brand-title" id="svc-brand-title" variants={settle}>
          {brand.headline.map(([head, word, tail]) => (
            <span key={word} className="svc-brand-line">
              {head}
              <span className="stage-serif">{word}</span>
              {tail}
            </span>
          ))}
        </m.h1>

        <m.p className="stage-lede svc-brand-lede" variants={settle}>
          {brand.lede}
        </m.p>

        <m.div className="svc-brand-actions" variants={settle}>
          <CheckCta placement="ai-brand-hero" label={brand.checkLabel} magnet />
          <TalkCta message={whatsappPrefill.ai} contact="/contact?service=ai#write" placement="ai-brand-hero" />
        </m.div>

        <m.div className="svc-brand-promise" variants={settle}>
          <p className="stage-mono">{site.replyPromise}</p>
          <p className="stage-mono">{site.guarantee}</p>
        </m.div>

        <m.nav className="aip-strip" aria-label={`More about ${brand.name}`} variants={settle}>
          <ul>
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </m.nav>
      </m.div>
    </section>
  )
}
