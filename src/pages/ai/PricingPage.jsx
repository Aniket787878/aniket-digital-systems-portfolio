import { m } from 'motion/react'
import { brand, packages, services, whatsappPrefill } from '../../data.js'
import { usePageMeta } from './usePageMeta.js'
import { useCurrency } from '../../currency.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import { CheckCta, TalkCta } from '../../components/FunnelCta.jsx'
import { PriceCard, CarePlanCard, CurrencyToggle } from '../../components/Pricing.jsx'
import { PillLabel, TickList } from '../../components/ui.jsx'
import Icon from '../../components/icons.jsx'
import OwnIt from '../service/OwnIt.jsx'
import Faq from '../home/Faq.jsx'
import '../service/showcase/stage.css'
import '../ServicePage.css'
import './AiPages.css'

/* ---------------------------------------------------------------
   /ai/pricing (docs/work/ai-brand-2/spec.md, slice 5). Bands: hero
   (stage), the four AI packages and the Care Plan (paper; prices only
   from `packages` lane 'ai' and `carePlan`, in the visitor's currency),
   what runs it each month and the handover pack (night, with the
   50/50 terms), you own it (the /ai OwnIt band, which closes on
   site.guarantee, said once on the page),
   the AI questions (services[ai].faq), then the free check.
   Copy: `brand.pricingExtras`.
   --------------------------------------------------------------- */

const page = brand.pricingExtras
const AI_PACKAGES = packages.filter((pkg) => pkg.lane === 'ai')
const AREA = services.find((s) => s.slug === 'ai')


export default function PricingPage() {
  usePageMeta(page.docTitle, page.description)
  const currency = useCurrency()
  const [head, word, tail] = page.title
  const [closeHead, closeWord, closeTail] = page.closeTitle

  return (
    <div className="aip">
      <section className="stage aip-hero" aria-labelledby="aip-pricing-title">
        <div className="stage-glow aip-hero-glow" aria-hidden="true" />
        <m.div className="container aip-hero-inner" {...reveal}>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            <span className="aip-brand-name">{brand.name}</span>
            <span aria-hidden="true">·</span>
            {page.pill}
          </p>
          <h1 className="stage-title aip-hero-title" id="aip-pricing-title">
            {head}
            <span className="stage-serif">{word}</span>
            {tail}
          </h1>
          <p className="stage-lede aip-hero-lede">{page.lede}</p>
          <div className="aip-actions">
            <CheckCta placement="ai-pricing-hero" label={brand.checkLabel} magnet />
            <TalkCta message={whatsappPrefill.ai} contact="/contact?service=ai#write" placement="ai-pricing-hero" />
          </div>
        </m.div>
      </section>

      <section className="paper aip-prices" id="prices" aria-labelledby="aip-prices-title">
        <div className="container">
          <m.header className="center-head" {...reveal}>
            <PillLabel icon="rupee">Fixed prices</PillLabel>
            <h2 className="h2" id="aip-prices-title">
              {page.pricesHead[0]}
              <span className="soft">{page.pricesHead[1]}</span>
            </h2>
            <CurrencyToggle currency={currency} />
          </m.header>

          <m.ul className="price-grid aip-price-grid" {...revealStagger}>
            {AI_PACKAGES.map((pkg) => (
              <PriceCard key={pkg.name} pkg={pkg} currency={currency} />
            ))}
          </m.ul>

          <div className="aip-care">
            <CarePlanCard currency={currency} reveal={reveal} />
            <m.p className="aip-care-extra" {...reveal}>
              <Icon name="check" size={16} strokeWidth={2.4} />
              {page.care}
            </m.p>
          </div>
        </div>
      </section>

      <section className="night aip-included" aria-labelledby="aip-included-title">
        <div className="container">
          <h2 className="sr-only" id="aip-included-title">
            What else is in the price
          </h2>
          <m.div className="aip-included-grid" {...revealStagger}>
            {[page.running, page.handover].map((block) => (
              <m.div key={block.title} className="svc-method-step aip-included-card" variants={fadeUp}>
                <h3>{block.title}</h3>
                <p>{block.text}</p>
                <TickList items={block.items} className="aip-ticks" />
              </m.div>
            ))}
          </m.div>
          <m.p className="aip-terms" {...reveal}>
            <strong>{page.terms}</strong> {page.termsNote}
          </m.p>
        </div>
      </section>

      <OwnIt />

      <Faq items={AREA.faq} heading={['Before you ask.', 'AI, prices and paying, in plain answers.']} />

      <section className="stage aip-close" aria-labelledby="aip-pricing-close">
        <div className="stage-glow aip-hero-glow" aria-hidden="true" />
        <m.div className="container aip-hero-inner" {...reveal}>
          <h2 className="stage-title aip-close-title" id="aip-pricing-close">
            {closeHead}
            <span className="stage-serif">{closeWord}</span>
            {closeTail}
          </h2>
          <p className="stage-lede aip-hero-lede">{page.closeLede}</p>
          <div className="aip-actions">
            <CheckCta placement="ai-pricing-close" label={brand.checkLabel} />
            <TalkCta message={whatsappPrefill.ai} contact="/contact?service=ai#write" placement="ai-pricing-close" />
          </div>
        </m.div>
      </section>
    </div>
  )
}
