import { m } from 'motion/react'
import ContactForm from '../components/ContactForm.jsx'
import { PillLabel, TickList } from '../components/ui.jsx'
import { reveal } from '../motion/variants.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import ContactHero from './contact/ContactHero.jsx'
import NextSteps from './contact/NextSteps.jsx'
import './ContactPage.css'

/*
  Contact, in the Dusk system (docs/design-system.md). Composition only,
  one idea per band, the same grounds as the home and About pages:

    1. ContactHero (dusk)   the ask, and the three ways to reach me
    2. Write it out (paper) the lead form, as a white card
    3. NextSteps (night)    what happens after you get in touch

  Every word is for a business owner, not a developer: no "workflow",
  no "automation", no "budget band". The form's field *names* (what the
  n8n intake reads) are unchanged; only what the visitor sees moved.
*/

const FORM_POINTS = [
  'A few lines in your own words is enough.',
  'You get a confirmation straight away.',
  'I reply personally within 24 hours.'
]

export default function ContactPage() {
  useDocumentTitle('Contact · Aniket')

  return (
    <>
      <ContactHero />

      {/* The target of the "Fill in a short form" route in the hero. */}
      <section className="paper contact-write" id="write" aria-labelledby="contact-write-title">
        <div className="container contact-write-grid">
          <m.header className="contact-write-copy" {...reveal}>
            <PillLabel icon="pen">Write it out</PillLabel>
            <h2 className="h2" id="contact-write-title">
              Prefer to type it?
              <br />
              <span className="soft">Six short questions.</span>
            </h2>
            <p className="contact-write-lede">
              A website, a tool for your team, or the task that keeps you
              busy over and over. No need to know what the fix is. That is
              my job.
            </p>
            <TickList items={FORM_POINTS} className="contact-write-points" />
          </m.header>

          <m.div className="contact-card" {...reveal}>
            <ContactForm />
          </m.div>
        </div>
      </section>

      <NextSteps />
    </>
  )
}
