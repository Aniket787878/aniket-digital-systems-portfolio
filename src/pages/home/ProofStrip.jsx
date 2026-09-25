import { m } from 'motion/react'
import { proofTools } from '../../data.js'
import { reveal } from '../../motion/variants.js'
import Marquee from '../../components/Marquee.jsx'

/* ---------------------------------------------------------------
   1b — Proof strip. Who it is for, then the stack, straight under
   the hero.

   The "who" line was the hero's lede until the hero was cut to four
   elements. It reads better here than it did up there: the hero
   makes a claim, and the first thing under it says who the claim is
   meant for, immediately followed by what it is built out of.

   A tools row is the honest version of the logo wall a template puts
   here: no client logos to show yet, but "n8n, Claude, Supabase" tells a
   technical buyer more than six greyed-out wordmarks would. Each tool
   carries the reason it gets used, so it reads as judgement rather than
   a skills list.
   --------------------------------------------------------------- */
export default function ProofStrip() {
  return (
    <section className="proof">
      <div className="container">
        {/* Two columns so the band fills the width rather than stacking two
            narrow paragraphs against an empty right half: who it's for on the
            left, how it's built on the right. */}
        <m.div className="proof-head" {...reveal}>
          <p className="proof-lede">
            For clinics, studios, agencies and consultancies: bookings, intake
            and follow-ups in one place instead of across WhatsApp threads and
            spreadsheets.
          </p>
          <p className="proof-intro">
            Built with tools you keep. Self-hosted where it matters, so the
            system stays yours after I hand it over.
          </p>
        </m.div>
        {/* The tool stack as a slow, seamless ticker — a live logo-wall
            equivalent. Pauses on hover; static and wrapped under reduced
            motion (see .marquee). */}
        <Marquee seconds={40}>
          {proofTools.map((tool) => (
            <span key={tool.name} className="proof-marquee-item">
              <span className="proof-name">{tool.name}</span>
              <span className="proof-note">{tool.note}</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
