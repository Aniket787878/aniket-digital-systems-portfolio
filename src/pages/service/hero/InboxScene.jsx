import { useRef } from 'react'
import Glyph from '../showcase/ai/icons.jsx'
import Window from './Window.jsx'
import useLoop from './useLoop.js'

/*
  /software: "everything lands in one place". The real Shared Inbox
  screen (public/walkthroughs/shared-inbox/03.png, resized into
  public/showcase/software/) sits in the window. Three sources wait
  outside it; each step one of them sends a pulse along its wire into
  the window, the real list moves down one row, and a new row lands on
  top, highlighted, already sorted and given an owner. The new row's
  words are generic labels, not a person: nothing is invented.

  The list is the screenshot itself: a clipped copy of its list column,
  slid down by one row height, so the rows under the new one are the
  real ones. Geometry measured on 03.png (2880 x 1800): list column
  x 11.11% to 36.18%, first row from y 11.22%, rows 10.5% tall. The
  window shows the part of the screen from x 9% to 70% and y 0 to 62%
  (the list and the open thread), so the real text is large enough to
  read; every number in hero.css under "crop" comes from those.

  Phones: no sources or wires, the row still lands. Reduced motion: one
  row already landed.
*/

const STEP_MS = 4600

const SOURCES = [
  { key: 'wa', glyph: 'wa', name: 'WhatsApp' },
  { key: 'email', glyph: 'gmail', name: 'Email' },
  { key: 'form', glyph: 'web', name: 'Website form' }
]

// Scene units: 100 = the scene's width (see .sv-inbox in hero.css).
const ROW_Y = 17.76
const ROW_X = 24.7
const SRC_Y = [17.5, 29.5, 41.5]
const wire = (y) => `M16 ${y} C 23 ${y}, 23.5 ${ROW_Y}, ${ROW_X} ${ROW_Y}`

export default function InboxScene({ live }) {
  const ref = useRef(null)
  const { step, index, running } = useLoop(ref, { count: SOURCES.length, ms: STEP_MS, enabled: live })
  const src = SOURCES[index]
  const prev = SOURCES[(index + SOURCES.length - 1) % SOURCES.length]

  return (
    <Window
      ref={ref}
      className={`sv-inbox ${live ? 'is-live' : 'is-still'}`}
      hold={live && !running}
      tag="Real screen from a working demo"
      bar={<span className="stage-mono sv-title-bar">Shared inbox · demo workspace</span>}
      status={
        <span className="stage-mono sv-inbox-status" key={`s${step}`}>
          New enquiry from <b>{src.name}</b>, sorted
        </span>
      }
      outside={
        <div className="sv-sources" aria-hidden="true">
          <svg className="sv-wires" viewBox="0 0 100 58.6">
            {SOURCES.map((s, i) => (
              <path key={s.key} className="sv-wire-base" d={wire(SRC_Y[i])} />
            ))}
            <g key={`w${step}`}>
              <path className="sv-wire-hot" d={wire(SRC_Y[index])} pathLength="100" />
              {live && <path className="sv-wire-pulse" d={wire(SRC_Y[index])} pathLength="100" />}
            </g>
            <circle className="sv-wire-end" cx={ROW_X} cy={ROW_Y} r="0.45" />
          </svg>
          {SOURCES.map((s, i) => (
            <span
              key={s.key}
              className={`sv-src ${i === index ? 'is-on' : ''}`}
              style={{ top: `${SRC_Y[i]}cqw` }}
            >
              <span className="sv-src-icon">
                <Glyph name={s.glyph} />
              </span>
              <span className="sv-src-name">{s.name}</span>
              {i === index && <i className="sv-src-ping" key={`p${step}`} />}
            </span>
          ))}
        </div>
      }
    >
      <div className="sv-screen" aria-hidden="true">
        <img
          className="sv-screen-img"
          src="/showcase/software/inbox-1200.webp"
          srcSet="/showcase/software/inbox-1200.webp 1200w, /showcase/software/inbox-2048.webp 2048w"
          sizes="(min-width: 1024px) 46vw, 92vw"
          width="1200"
          height="750"
          alt=""
          decoding="async"
        />
        <div className="sv-list">
          <div className={`sv-list-move ${live && step === 0 ? 'is-first' : ''}`}>
          <img
            className="sv-list-img"
            src="/showcase/software/inbox-1200.webp"
            srcSet="/showcase/software/inbox-1200.webp 1200w, /showcase/software/inbox-2048.webp 2048w"
            sizes="(min-width: 1024px) 46vw, 92vw"
            width="1200"
            height="750"
            alt=""
            decoding="async"
          />
          </div>
        </div>
        {live && step > 0 && <Row key={`o${step}`} src={prev} out />}
        <Row key={`r${step}`} src={src} />
      </div>
      <p className="sr-only">
        A short loop on a real screen from the Shared Inbox demo: enquiries from WhatsApp, email and the website form
        each land at the top of one list, sorted and given an owner.
      </p>
    </Window>
  )
}

function Row({ src, out }) {
  return (
    <div className={`sv-row ${out ? 'is-out' : ''}`}>
      <span className="sv-row-top">
        <i className="sv-row-dot" />
        <span className="sv-row-name">New enquiry · {src.name}</span>
        <span className="sv-row-time">now</span>
      </span>
      <span className="sv-row-meta">
        <Glyph name={src.glyph} className="sv-row-glyph" />
        <span>sorted · owner set</span>
      </span>
    </div>
  )
}
