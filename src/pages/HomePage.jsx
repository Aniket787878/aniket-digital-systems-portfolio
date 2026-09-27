import Hero from './home/Hero.jsx'
import Statement from './home/Statement.jsx'
import Work from './home/Work.jsx'
import Tour from './home/Tour.jsx'
import Connect from './home/Connect.jsx'
import Testimonials from './home/Testimonials.jsx'
import Process from './home/Process.jsx'
import Services from './home/Services.jsx'
import Faq from './home/Faq.jsx'
import Cta from './home/Cta.jsx'

/* The page's stylesheet stays a single file, imported once, here.

   Splitting it per-section is tempting and is the one refactor to think
   twice about: several rules in it resolve against index.css by source
   order alone, so whichever sheet loads second wins every specificity
   *tie*. One import from one place keeps that order fixed no matter what
   order the section components above happen to be evaluated in. */
import './HomePage.css'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { seo } from '../data.js'

/* Bands in render order, on the dark and light grounds of the Dusk system
   (docs/design-system.md). Services (the prices) sits straight after the
   work, so a buyer who has seen the proof reads the price next instead of
   after two long scroll-driven bands. Testimonials renders only once a
   real quote exists. Each is one file in ./home. */
export default function HomePage() {
  useDocumentTitle(seo.title)
  return (
    <div className="home">
      <Hero />
      <Statement />
      <Work />
      <Services />
      <Tour />
      <Connect />
      <Testimonials />
      <Process />
      <Faq />
      <Cta />
    </div>
  )
}
