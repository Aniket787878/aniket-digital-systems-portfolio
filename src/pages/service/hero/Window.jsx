import { forwardRef } from 'react'

/*
  The glass window every hero scene sits in: a title bar, the scene, and
  a status strip whose right end carries the honesty tag (what the
  visitor is looking at). `hold` pauses the CSS keyframes while the loop
  clock is stopped (off screen, hidden tab).
*/
const Window = forwardRef(function Window({ className = '', hold, bar, status, tag, children, outside }, ref) {
  return (
    <div ref={ref} className={`sv-scene ${className} ${hold ? 'is-hold' : ''}`}>
      {outside}
      <div className="sv-win stage-glass">
        <div className="sv-bar">
          <span className="sv-lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {bar}
        </div>
        <div className="sv-body">{children}</div>
        <div className="sv-strip">
          <span className="sv-status">{status}</span>
          <span className="stage-mono sv-tag">
            <span className="stage-dot" aria-hidden="true" />
            {tag}
          </span>
        </div>
      </div>
    </div>
  )
})

export default Window
