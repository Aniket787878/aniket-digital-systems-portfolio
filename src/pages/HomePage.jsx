import StageHero from './home/stage/StageHero.jsx'
import Stakes from './home/stage/Stakes.jsx'
import StageWork from './home/stage/StageWork.jsx'
import Testimonials from './home/Testimonials.jsx'
import Doors from './home/stage/Doors.jsx'
import HowLoop from './home/stage/HowLoop.jsx'
import Questions from './home/stage/Questions.jsx'
import Close from './home/stage/Close.jsx'
import Current from './home/stage/Current.jsx'

/* The page's stylesheet stays a single file, imported once, here.

   Splitting it per-section is tempting and is the one refactor to think
   twice about: several rules in it resolve against index.css by source
   order alone, so whichever sheet loads second wins every specificity
   *tie*. One import from one place keeps that order fixed no matter what
   order the section components above happen to be evaluated in. */
import './HomePage.css'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { seo } from '../data.js'

/* The home page on the Stage ground (docs/ideas/relay-direction.md): one
   near-black ground, a saffron stream of light, and the story loop (stakes,
   big question, headfake, rehook) cascading down the page:
     1. StageHero + Stakes: the problem, the question, "fewer steps, not
        more software", rehooking into the work.
     2. StageWork: the real projects, each one rehooking into the next.
     3. Doors: the three service areas and their prices.
     4. HowLoop: the glowing infinity loop of how the work runs, rehooking
        into the call.
   Testimonials renders only once a real quote exists. The old Dusk bands
   (Hero, Statement, Work, Services, Tour, Connect, Process) are unused here;
   Faq and Cta are still used by the service pages. */
export default function HomePage() {
  useDocumentTitle(seo.title)
  return (
    <div className="home home-stage">
      <Current />
      <StageHero />
      <Stakes />
      <StageWork />
      <Testimonials />
      <Doors />
      <HowLoop />
      <Questions />
      <Close />
    </div>
  )
}
