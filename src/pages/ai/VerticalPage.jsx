import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { m } from 'motion/react'
import { brand, whatsappPrefill } from '../../data.js'
import { useDocumentTitle } from '../../useDocumentTitle.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import { CheckCta, TalkCta } from '../../components/FunnelCta.jsx'
import ProjectCard from '../../components/ProjectCard.jsx'
import { projectCard } from '../../components/projectCard.js'
import { PillLabel } from '../../components/ui.jsx'
import Method from '../service/Method.jsx'
import Faq from '../home/Faq.jsx'
import NotFoundPage from '../NotFoundPage.jsx'
import '../service/showcase/stage.css'
import '../ServicePage.css'
import './AiPages.css'

/* ---------------------------------------------------------------
   /ai/for/:vertical (docs/work/ai-brand-2/spec.md, slice 4): one page
   per kind of business (clinics, studios, coaching, agencies), one
   template. Bands: hero (stage), where it leaks (paper, three lines in
   the owner's words), what we hand to AI first (night, four jobs), see
   it working (stage, one labelled demo card), the four steps (the /ai
   Method band), two questions (the home Faq band), then the free check
   and the call. Copy: `brand.verticals` and `brand.verticalPage`.
   An unknown vertical is the 404 page.
   --------------------------------------------------------------- */

const shared = brand.verticalPage

function usePageMeta(title, description) {
  useDocumentTitle(title)
  useEffect(() => {
    const tag = document.querySelector('meta[name="description"]')
    if (!tag || !description) return undefined
    const before = tag.content
    tag.content = description
    return () => {
      tag.content = before
    }
  }, [description])
}

export default function VerticalPage() {
  const { vertical } = useParams()
  const v = brand.verticals.find((item) => item.slug === vertical)
  usePageMeta(v?.docTitle, v?.description)
  if (!v) return <NotFoundPage />

  const [head, word, tail] = v.title
  const [closeHead, closeWord, closeTail] = shared.closeTitle
  const placement = `ai-for-${v.slug}`

  return (
    <div className="aip">
      <section className="stage aip-hero" aria-labelledby="aip-vertical-title">
        <div className="stage-glow aip-hero-glow" aria-hidden="true" />
        <m.div className="container aip-hero-inner" {...reveal}>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            <span className="aip-brand-name">{brand.name}</span>
            <span aria-hidden="true">·</span>
            {v.who}
          </p>
          <h1 className="stage-title aip-hero-title" id="aip-vertical-title">
            {head}
            <span className="stage-serif">{word}</span>
            {tail}
          </h1>
          <p className="stage-lede aip-hero-lede">{v.lede}</p>
          <div className="aip-actions">
            <CheckCta placement={`${placement}-hero`} label={brand.checkLabel} magnet />
            <TalkCta message={whatsappPrefill.ai} contact="/contact?service=ai#write" placement={`${placement}-hero`} />
          </div>
        </m.div>
      </section>

      <section className="paper aip-leaks" aria-labelledby="aip-leaks-title">
        <div className="container">
          <m.header className="center-head" {...reveal}>
            <PillLabel icon="search">Sound familiar?</PillLabel>
            <h2 className="h2" id="aip-leaks-title">
              {shared.leaksHead[0]}
              <span className="soft">{shared.leaksHead[1]}</span>
            </h2>
          </m.header>
          <m.ul className="aip-leak-list" {...revealStagger}>
            {v.leaks.map((leak) => (
              <m.li key={leak} className="aip-leak" variants={fadeUp}>
                <span className="aip-leak-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <p>{leak}</p>
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      <section className="night aip-jobs" aria-labelledby="aip-jobs-title">
        <div className="container">
          <m.header className="center-head" {...reveal}>
            <PillLabel icon="flow" className="on-night">
              First four jobs
            </PillLabel>
            <h2 className="h2" id="aip-jobs-title">
              {shared.jobsHead[0]}
              <span className="soft">{shared.jobsHead[1]}</span>
            </h2>
          </m.header>
          <m.ol className="svc-method-steps aip-job-list" {...revealStagger}>
            {v.jobs.map((job, i) => (
              <m.li key={job.title} className="svc-method-step" variants={fadeUp}>
                <span className="svc-method-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{job.title}</h3>
                <p>{job.text}</p>
              </m.li>
            ))}
          </m.ol>
        </div>
      </section>

      <section className="stage aip-demo" aria-labelledby="aip-demo-title">
        <div className="container aip-demo-inner">
          <m.header className="aip-demo-head" {...reveal}>
            <h2 className="stage-title aip-demo-title" id="aip-demo-title">
              {shared.demoHead[0]}
            </h2>
            <p className="stage-lede">{shared.demoHead[1]}</p>
          </m.header>
          <m.div className="aip-demo-card" {...reveal}>
            <ProjectCard card={projectCard(v.demo, { cta: 'Open the demo' })} layout="wide" />
          </m.div>
        </div>
      </section>

      <Method />

      <Faq key={v.slug} items={v.faq} heading={shared.faqHead} />

      <section className="stage aip-close" aria-labelledby="aip-vertical-close">
        <div className="stage-glow aip-hero-glow" aria-hidden="true" />
        <m.div className="container aip-hero-inner" {...reveal}>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            Free, two minutes
          </p>
          <h2 className="stage-title aip-close-title" id="aip-vertical-close">
            {closeHead}
            <span className="stage-serif">{closeWord}</span>
            {closeTail}
          </h2>
          <p className="stage-lede aip-hero-lede">{shared.closeLede}</p>
          <div className="aip-actions">
            <CheckCta placement={`${placement}-close`} label={brand.checkLabel} />
            <TalkCta message={whatsappPrefill.ai} contact="/contact?service=ai#write" placement={`${placement}-close`} />
          </div>
        </m.div>
      </section>
    </div>
  )
}
