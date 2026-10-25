import { m } from 'motion/react'
import { brand } from '../../data.js'
import { reveal } from '../../motion/variants.js'

/* ---------------------------------------------------------------
   The weekly proof note, as a sample (docs/work/ai-brand-2/spec.md,
   slice 5): what a Care Plan client reads every Monday. DUMMY DATA for
   a made-up business, labelled "Sample" on the card and in the caption,
   never a real client's numbers. Copy: `brand.proofNote` in data.js.
   --------------------------------------------------------------- */
export default function ProofNote() {
  const note = brand.proofNote
  return (
    <m.figure className="aip-note" {...reveal}>
      <div className="stage-glass aip-note-card">
        <div className="aip-note-top">
          <p className="stage-mono aip-note-week">
            {note.business} · {note.week}
          </p>
          <span className="aip-note-badge">{note.label}</span>
        </div>
        <dl className="aip-note-rows">
          {note.rows.map((row) => (
            <div key={row.label} className="aip-note-row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="aip-note-line">{note.fixed}</p>
        <p className="aip-note-line">{note.next}</p>
      </div>
      <figcaption className="stage-mono aip-note-caption">{note.caption}</figcaption>
    </m.figure>
  )
}
