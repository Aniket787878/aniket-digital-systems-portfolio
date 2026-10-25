import { m } from 'motion/react'
import { brand, packages } from '../../data.js'
import { usePageMeta } from './usePageMeta.js'
import { reveal } from '../../motion/variants.js'
import { CheckCta } from '../../components/FunnelCta.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import { PillLabel } from '../../components/ui.jsx'
import Method from '../service/Method.jsx'
import ProofNote from './ProofNote.jsx'
import '../service/showcase/stage.css'
import '../ServicePage.css'
import './AiPages.css'

/* ---------------------------------------------------------------
   /ai/every-enquiry (docs/work/ai-brand-2/spec.md, slice 5): the one
   page ads and outreach point at. The 10:40 pm hook and the promise,
   the free check as the one primary button with WhatsApp second, then
   the four steps, the person who checks (photo slot left empty and
   labelled), a sample weekly proof note (dummy data, labelled), and the
   close with the starting price (read from `packages`) and the privacy
   line. The normal nav only. Copy: `brand.landing`.
   --------------------------------------------------------------- */

const page = brand.landing
/* The lowest AI price is the Roadmap, step 2 of the path. */
const START = packages.find((pkg) => pkg.lane === 'ai' && pkg.step)


function Actions({ placement, magnet = false }) {
  return (
    <div className="aip-actions">
      <CheckCta placement={placement} label={brand.checkLabel} magnet={magnet} />
      <WhatsAppCta message={page.whatsappMessage} label={page.whatsappLabel} className="btn-light" placement={placement} />
    </div>
  )
}

export default function LandingPage() {
  usePageMeta(page.docTitle, page.description)
  const [head, word, tail] = page.title
  const [closeHead, closeWord, closeTail] = page.closeTitle

  return (
    <div className="aip">
      <section className="stage aip-hero aip-landing-hero" aria-labelledby="aip-landing-title">
        <div className="stage-glow aip-hero-glow" aria-hidden="true" />
        <m.div className="container aip-hero-inner" {...reveal}>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            <span className="aip-brand-name">{brand.name}</span>
            <span aria-hidden="true">·</span>
            {brand.line}
          </p>
          <h1 className="stage-title aip-hero-title aip-landing-title" id="aip-landing-title">
            {head}
            <span className="stage-serif">{word}</span>
            {tail}
          </h1>
          <p className="stage-lede aip-hero-lede">{page.sub}</p>
          <Actions placement="ai-landing-hero" magnet />
        </m.div>
      </section>

      <Method />

      <section className="paper aip-person" aria-labelledby="aip-person-title">
        <div className="container aip-person-inner">
          <m.div className="aip-photo" role="img" aria-label={page.person.photoLabel} {...reveal}>
            <span className="stage-mono">{page.person.photoLabel}</span>
          </m.div>
          <m.div className="aip-person-text" {...reveal}>
            <PillLabel icon="check">Checked by a person</PillLabel>
            <h2 className="h2" id="aip-person-title">
              {page.person.title}
            </h2>
            {page.person.lines.map((line) => (
              <p key={line} className="aip-person-line">
                {line}
              </p>
            ))}
          </m.div>
        </div>
      </section>

      <section className="stage aip-proof" aria-labelledby="aip-proof-title">
        <div className="stage-glow aip-hero-glow" aria-hidden="true" />
        <div className="container aip-proof-inner">
          <m.header className="aip-demo-head" {...reveal}>
            <h2 className="stage-title aip-demo-title" id="aip-proof-title">
              Every Monday, a <span className="stage-serif">proof</span> note.
            </h2>
            <p className="stage-lede">What the AI did that week, what a person corrected, and what changes next.</p>
          </m.header>
          <ProofNote />
        </div>
      </section>

      <section className="stage aip-close" aria-labelledby="aip-landing-close">
        <div className="stage-glow aip-hero-glow" aria-hidden="true" />
        <m.div className="container aip-hero-inner" {...reveal}>
          <h2 className="stage-title aip-close-title" id="aip-landing-close">
            {closeHead}
            <span className="stage-serif">{closeWord}</span>
            {closeTail}
          </h2>
          <p className="stage-lede aip-hero-lede">{page.closeLede}</p>
          <Actions placement="ai-landing-close" />
          <p className="stage-mono aip-price-signal">
            From {START.price.inr} / {START.price.usd}
          </p>
          <p className="stage-mono aip-privacy">{page.privacy}</p>
        </m.div>
      </section>
    </div>
  )
}
