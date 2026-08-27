import Hero from './home/Hero.jsx'
import ProofStrip from './home/ProofStrip.jsx'
import Work from './home/Work.jsx'
import Capabilities from './home/Capabilities.jsx'
import Process from './home/Process.jsx'
import Pricing from './home/Pricing.jsx'
import CtaBand from './home/CtaBand.jsx'
import Faq from './home/Faq.jsx'
import Gallery from './home/Gallery.jsx'

/* The page's stylesheet stays a single file, imported once, here.

   Splitting it per-section is tempting and is the one refactor to think
   twice about: several rules in it resolve against index.css by source
   order alone, so whichever sheet loads second wins every specificity
   *tie*. One import from one place keeps that order fixed no matter what
   order the section components above happen to be evaluated in. */
import './HomePage.css'

/* Nine bands, in render order. Each is one file in ./home, and each maps
   to the band of the same name in HomePage.css. */
export default function HomePage() {
  return (
    <div className="home">
      <Hero />
      <ProofStrip />
      <Work />
      <Capabilities />
      <Process />
      <Pricing />
      <CtaBand />
      <Faq />
      <Gallery />
    </div>
  )
}
