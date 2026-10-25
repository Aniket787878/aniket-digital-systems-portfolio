import { m } from 'motion/react'
import { brand, whatsappPrefill } from '../../data.js'
import { usePageMeta } from './usePageMeta.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import { CheckCta, TalkCta } from '../../components/FunnelCta.jsx'
import ProjectCard from '../../components/ProjectCard.jsx'
import { projectCard } from '../../components/projectCard.js'
import '../service/showcase/stage.css'
import './AiPages.css'

/* ---------------------------------------------------------------
   /ai/try (docs/work/ai-brand-2/spec.md, slice 3): every demo on one
   page, so a visitor can see it working before talking to anyone.
   The three working demos first, then the three demo screens, each
   card with its honest label (components/projectCard.js) and one line
   on what you are seeing (`brand.tryIntro`), opening its case page.
   Closes on the free check. Copy: `brand.tryPage` in data.js.
   --------------------------------------------------------------- */

const page = brand.tryPage


export default function TryPage() {
  usePageMeta(page.docTitle, page.description)
  const [head, word, tail] = page.title
  const [closeHead, closeWord, closeTail] = page.closeTitle

  return (
    <div className="aip">
      <section className="stage aip-hero" aria-labelledby="aip-try-title">
        <div className="stage-glow aip-hero-glow" aria-hidden="true" />
        <m.div className="container aip-hero-inner" {...reveal}>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            {page.pill}
          </p>
          <h1 className="stage-title aip-hero-title" id="aip-try-title">
            {head}
            <span className="stage-serif">{word}</span>
            {tail}
          </h1>
          <p className="stage-lede aip-hero-lede">{page.lede}</p>
        </m.div>
      </section>

      <section className="night aip-try" aria-label="The demos">
        <div className="container">
          {page.groups.map((group) => (
            <div key={group.kind} className="aip-try-group">
              <m.header className="aip-group-head" {...reveal}>
                <h2 className="aip-group-title">{group.head}</h2>
                <p className="aip-group-note">{group.note}</p>
              </m.header>
              <m.ul className="aip-cards" {...revealStagger}>
                {group.slugs.map((slug) => (
                  <m.li key={slug} variants={fadeUp}>
                    <ProjectCard
                      card={projectCard(slug, { note: `What you are seeing: ${brand.tryIntro[slug]}`, cta: 'Open the demo' })}
                    />
                  </m.li>
                ))}
              </m.ul>
            </div>
          ))}
        </div>
      </section>

      <section className="stage aip-close" aria-labelledby="aip-try-close">
        <div className="stage-glow aip-hero-glow" aria-hidden="true" />
        <m.div className="container aip-hero-inner" {...reveal}>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            Free, two minutes
          </p>
          <h2 className="stage-title aip-close-title" id="aip-try-close">
            {closeHead}
            <span className="stage-serif">{closeWord}</span>
            {closeTail}
          </h2>
          <p className="stage-lede aip-hero-lede">{page.closeLede}</p>
          <div className="aip-actions">
            <CheckCta placement="ai-try-close" label={brand.checkLabel} magnet />
            <TalkCta message={whatsappPrefill.ai} contact="/contact?service=ai#write" placement="ai-try-close" />
          </div>
        </m.div>
      </section>
    </div>
  )
}
