import { MESSAGE, REPLY, STEPS, SLOTS, derive } from './flow.js'
import Glyph from './glyphs.jsx'

/* The same flow for phones and narrow screens: one step per row, in
   order, on a flat window. Every row is laid out from the first frame
   (just dimmed and blurred until its moment), so nothing below it jumps
   as the steps arrive. */
export default function FlowList({ t }) {
  const s = derive(t)
  const veil = Math.min(s.fade, s.fadeIn)
  const current = STEPS.reduce((last, step, i) => (t >= step.at ? i : last), -1)

  return (
    <div className="sh-window sh-window-flat stage-glass">
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
      </div>
      <ol className="sh-list" style={{ opacity: veil }}>
        {STEPS.map((step, i) => {
          const on = t >= step.at
          return (
            <li key={step.id} className={`sh-step${on ? ' is-on' : ''}${i === current ? ' is-focus' : ''}`}>
              <span className="sh-step-icon" aria-hidden="true">
                {step.glyph === 'ring' ? <span className="sh-ring sh-ring-sm" /> : <Glyph name={step.glyph} size={14} />}
              </span>
              <span className="sh-step-body">
                <span className="sh-step-label">{step.label}</span>
                {step.id === 'chat' && (
                  <span className="sh-bubble">
                    <span className="sh-typed">{MESSAGE.slice(0, s.typed)}</span>
                    <span className="sh-ghost">{MESSAGE.slice(s.typed)}</span>
                  </span>
                )}
                {step.id === 'reply' && (
                  <span className="sh-bubble sh-bubble-short">
                    <span className="sh-typed">{REPLY.slice(0, s.replyTyped)}</span>
                    <span className="sh-ghost">{REPLY.slice(s.replyTyped)}</span>
                  </span>
                )}
                {step.detail && (
                  <span className={`sh-step-detail${step.id === 'booked' ? ' sh-step-detail-peak' : ''}`}>
                    {step.detail}
                  </span>
                )}
                {step.id === 'cal' && (
                  <span className="sh-chips">
                    {SLOTS.map((slot, i) => (
                      <span key={slot} className={`sh-chip${s.slotsShown[i] ? ' is-on' : ''}`}>
                        {slot}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="sh-tag sh-tag-foot">Recorded test run &middot; made-up physio clinic</p>
    </div>
  )
}
