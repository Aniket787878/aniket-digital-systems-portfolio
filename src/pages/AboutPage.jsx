import { m } from 'motion/react'
import { StartCta, TalkCta } from '../components/FunnelCta.jsx'
import { PillLabel } from '../components/ui.jsx'
import { founder, whatsappPrefill } from '../data.js'
import { heroContainer, heroItem, fadeIn } from '../motion/variants.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import Portrait from './about/Portrait.jsx'
import Steps from './about/Steps.jsx'
import Toolbox from './about/Toolbox.jsx'
import Films from './about/Films.jsx'
import Cta from './home/Cta.jsx'
import './AboutPage.css'

/*
  About: the person behind the work (docs/research/06). Composition only,
  one idea per band, alternating the Dusk grounds like the home page:

    1. Portrait hero (night)   who he is, in one short paragraph
    2. Steps (paper)           scroll-driven stepper, first message to handover
    3. Toolbox (night)         the stack, sorted by what it does for you
    4. Films (paper)           the five builds, one tap each
    5. Cta (dusk)              the home page's closing band, reused

  Everything renders from data.js (`founder`, `toolbox`, `projects`,
  `films`). Nothing here is invented: the photo and the personal story
  are empty until Aniket supplies them, and the page reads complete
  without either (see `founder.photo` for the one-line portrait swap).
*/
export default function AboutPage() {
  useDocumentTitle('About · Aniket')
  const story = founder.story.trim()

  return (
    <>
      <section className="night about-hero" aria-labelledby="about-title">
        <div className="container about-hero-grid">
          <m.div className="about-hero-copy" variants={heroContainer} initial="hidden" animate="show">
            <m.div variants={heroItem}>
              <PillLabel icon="spark" className="on-night">About</PillLabel>
            </m.div>
            <m.h1 className="about-title" id="about-title" variants={heroItem}>
              I&rsquo;m {founder.name}.
              <br />
              <span className="about-title-warm">I build the systems service businesses run on.</span>
            </m.h1>
            <m.p className="about-lede" variants={heroItem}>
              {founder.intro}
            </m.p>
            {story && (
              <m.p className="about-story" variants={heroItem}>
                {story}
              </m.p>
            )}
            <m.div className="about-hero-actions" variants={heroItem}>
              <StartCta placement="about-hero" magnet />
              <TalkCta message={whatsappPrefill.contact} />
            </m.div>
            <m.dl className="about-facts" variants={heroItem}>
              {founder.quickFacts.map((fact) => (
                <div key={fact.label} className="about-fact">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </m.dl>
          </m.div>

          <m.div className="about-hero-portrait" variants={fadeIn} initial="hidden" animate="show">
            <Portrait photo={founder.photo} name={founder.name} role={founder.role} />
          </m.div>
        </div>
      </section>

      <Steps />
      <Toolbox />
      <Films />
      <Cta />
    </>
  )
}
