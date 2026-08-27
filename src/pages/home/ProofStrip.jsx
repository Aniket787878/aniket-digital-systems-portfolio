import { proofTools } from '../../data.js'

/* ---------------------------------------------------------------
   1b — Proof strip. The stack, named, straight under the hero.

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
        <p className="proof-intro">
          Built with tools you keep. Self-hosted where it matters, so the
          system stays yours after I hand it over.
        </p>
        <ul className="proof-grid">
          {proofTools.map((tool) => (
            <li key={tool.name} className="proof-item">
              <span className="proof-name">{tool.name}</span>
              <span className="proof-note">{tool.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
