import { DESK_STATUS, LOG, MESSAGE, NODES, PICKED, REPLY, SLOTS, WIRES, derive } from './flow.js'
import Glyph from './glyphs.jsx'

/* The glass window with the live enquiry flow (desktop). A pure
   function of t; the clock lives in StageHero. Sizes inside are in
   container units, so the window scales as one piece and the typing
   never moves anything: every slot is laid out at its full size from
   the first frame, and text only changes colour as it "types". */

const TRAIL = 0.16
const HEAD = 0.035

function dash(len, u, reverse) {
  const h = u * (1 + TRAIL)
  return reverse ? h - 1 : len - h
}

export default function FlowWindow({ t }) {
  const s = derive(t)
  const veil = Math.min(s.fade, s.fadeIn)

  return (
    <div className="sh-window stage-glass">
      <div className="sh-bar">
        <span className="sh-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="sh-wtitle">
          <span className="stage-dot sh-live" aria-hidden="true" />
          Front desk &middot; live flow
        </span>
        <span className="sh-tag">Recorded test run &middot; made-up physio clinic</span>
      </div>

      <div
        className="sh-flow"
        style={{ opacity: veil, filter: veil < 1 ? `blur(${(1 - veil) * 10}px)` : 'none' }}
      >
        <svg className="sh-wires" viewBox="0 0 1000 600" aria-hidden="true">
          {Object.entries(WIRES).map(([id, d]) => (
            <path key={id} d={d} pathLength="1" className={`sh-wire${s.lit.has(id) ? ' is-lit' : ''}`} />
          ))}
        </svg>
        {/* Pulses on their own layer: they change every frame, the wires
            and nodes under them do not need repainting with them. */}
        <svg className="sh-wires sh-pulses" viewBox="0 0 1000 600" aria-hidden="true">
          <g>
            {s.pulses.map((p) => (
              <g key={p.key}>
                <path
                  d={WIRES[p.wire]}
                  pathLength="1"
                  className="sh-trail"
                  strokeDasharray={`${TRAIL} 3`}
                  strokeDashoffset={dash(TRAIL, p.u, p.reverse)}
                />
                <path
                  d={WIRES[p.wire]}
                  pathLength="1"
                  className="sh-head"
                  strokeDasharray={`${HEAD} 3`}
                  strokeDashoffset={dash(HEAD, p.u, p.reverse)}
                />
              </g>
            ))}
          </g>
        </svg>

        <Node id="chat" glyph="web" label="Website chat" focus={s.focus}>
          <p className="sh-bubble">
            <span className="sh-typed">{MESSAGE.slice(0, s.typed)}</span>
            {s.typing && <span className="sh-caret" aria-hidden="true" />}
            <span className="sh-ghost">{MESSAGE.slice(s.typed)}</span>
          </p>
          <p className={`sh-offer${s.desk !== 'idle' && s.desk !== 'reading' ? ' is-on' : ''}`}>
            {SLOTS.join(' · ')} offered
          </p>
          <p className={`sh-bubble sh-bubble-short${s.replyShown ? ' is-on' : ''}`}>
            <span className="sh-typed">{REPLY.slice(0, s.replyTyped)}</span>
            {s.replyTyping && <span className="sh-caret" aria-hidden="true" />}
            <span className="sh-ghost">{REPLY.slice(s.replyTyped)}</span>
          </p>
        </Node>

        <Node id="desk" glyph="desk" label="AI front desk" focus={s.focus}>
          <p className="sh-status">
            {(s.desk === 'reading' || s.desk === 'booking') && <span className="sh-spin" aria-hidden="true" />}
            {s.desk === 'done' && <span className="sh-ok" aria-hidden="true" />}
            {DESK_STATUS[s.desk]}
          </p>
        </Node>

        <div className={`sh-wait${s.waiting ? ' is-on' : ''}`} style={{ left: '45.2%', top: '72%' }}>
          <span className="sh-ring" aria-hidden="true" />
          <span className="sh-wait-label">waiting on a yes</span>
        </div>

        <Node id="cal" glyph="cal" label="Calendar" focus={s.focus}>
          <div className="sh-swap">
            <p className={`sh-meta${s.slotsLabel && !s.booked ? ' is-on' : ''}`}>free times &middot; Mon 5 Oct</p>
            <p className={`sh-result${s.booked ? ' is-on' : ''}`}>
              <span className="sh-ok" aria-hidden="true" />
              Booked &middot; Mon 5 Oct, 10:00 to 10:45
            </p>
          </div>
          <div className="sh-chips">
            {SLOTS.map((slot, i) => (
              <span
                key={slot}
                className={`sh-chip${s.slotsShown[i] ? ' is-on' : ''}${s.booked ? (slot === PICKED ? ' is-picked' : ' is-dim') : ''}`}
              >
                {slot}
              </span>
            ))}
          </div>
        </Node>

        <Node id="sheet" glyph="sheet" label="Sheets" focus={s.focus}>
          <div className="sh-swap">
            <p className={`sh-meta${!s.logged ? ' is-on' : ''}`}>bookings log</p>
            <p className={`sh-result${s.logged ? ' is-on' : ''}`}>
              <span className="sh-ok" aria-hidden="true" />
              Booking logged
            </p>
          </div>
        </Node>

        <Node id="remind" glyph="bell" label="Reminder" focus={s.focus}>
          <div className="sh-swap">
            <p className={`sh-meta${!s.reminded ? ' is-on' : ''}`}>morning confirmations</p>
            <p className={`sh-result${s.reminded ? ' is-on' : ''}`}>
              <span className="sh-ok" aria-hidden="true" />
              Reminder prepared for 08:00
            </p>
          </div>
        </Node>
      </div>

      <div className="sh-log">
        <span className="sh-log-head">last runs</span>
        <ol className="sh-log-rows">
          {LOG.map((row) => (
            <li key={row.tool} className={t >= row.at && s.fade > 0.5 ? 'is-on' : 'is-prev'}>
              <span className="sh-log-dot" aria-hidden="true" />
              <span className="sh-log-text">{row.text}</span>
              <span className="sh-log-tool">{row.tool}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function Node({ id, glyph, label, focus, children }) {
  const n = NODES[id]
  return (
    <div
      className={`sh-node sh-node-${id}${focus === id ? ' is-focus' : ''}`}
      style={{
        left: `${n.x / 10}%`,
        top: `${n.y / 6}%`,
        width: `${n.w / 10}cqi`,
        height: `${n.h / 10}cqi`
      }}
    >
      <div className="sh-node-head">
        <span className="sh-node-icon">
          <Glyph name={glyph} size={14} />
        </span>
        {label}
      </div>
      {children}
    </div>
  )
}
