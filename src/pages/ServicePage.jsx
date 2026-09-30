import { services } from '../data.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import ServiceHero from './service/ServiceHero.jsx'
import Proof from './service/Proof.jsx'
import Offers from './service/Offers.jsx'
import OtherAreas from './service/OtherAreas.jsx'
import Faq from './home/Faq.jsx'
import Cta from './home/Cta.jsx'
import './ServicePage.css'

/*
  One service area's page: /websites, /software or /ai (`services` in
  data.js). Composition only, one idea per band, on the Dusk grounds
  (docs/design-system.md):

    1. ServiceHero (dusk)  the area's claim, the ask, what you get
    2. Proof (night)       what backs it, each card opening its evidence
    3. Offers (paper)      this area's prices, guarantee, Care Plan
    4. Faq (paper)         this area's questions (the home band, reused)
    5. OtherAreas (night)  the two areas this page is not
    6. Cta (dusk)          the home page's closing band, reused

  These are the pages outreach links point at, so each has to stand on
  its own for a buyer who never sees the home page.
*/
export default function ServicePage({ slug }) {
  const area = services.find((s) => s.slug === slug)
  useDocumentTitle(area.docTitle)

  return (
    <div className="svc">
      <ServiceHero area={area} />
      <Proof area={area} />
      <Offers area={area} />
      <Faq key={area.slug} items={area.faq} heading={['Before you ask.', `${area.name}, in plain answers.`]} />
      <OtherAreas area={area} />
      <Cta service={area.slug} />
    </div>
  )
}
