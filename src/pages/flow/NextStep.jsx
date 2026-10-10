import { Link } from 'react-router-dom'
import { projects } from '../../data.js'
import { hasBooking } from '../../booking.js'
import { hasWhatsApp } from '../../whatsapp.js'
import BookingCta from '../../components/BookingCta.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import Icon from '../../components/icons.jsx'

/* ---------------------------------------------------------------
   The result screens' buttons, by lead temperature (leadExtras.js,
   docs/outreach/2026-10-09-funnel-strategy.md section 4). Shared by the
   two plans (start/FlowPage.jsx) and the AI check.

     hot   "WhatsApp me now" (Aniket's own number, click-to-chat, with
           their answers prefilled) first, the call second
     warm  the page's own call buttons (`warm`), as before
     cold  "Here's what to read next": the one case study closest to
           the area, then the call as a quiet second

   No fake urgency anywhere: the copy says what happens, not how soon
   the offer ends. With no WhatsApp number set, hot falls back to warm.
   --------------------------------------------------------------- */

/* The case study to read next, per area: the closest real thing on the
   site. Each project page carries its own demo / client label. */
const READ_NEXT = {
  websites: 'website-answer-widget',
  software: 'therapist-pwa',
  ai: 'appointment-desk'
}

/* `compact` (Spec 2, the result hand-off under the price): render only
   the one primary button in every temperature branch, no secondary link
   and no "read next" card — those stay in the lower, repeated block,
   where this component is rendered a second time with compact unset. */
export function NextStepActions({ temp, service, waText, warm, contact, onActions, compact = false, placement }) {
  if (temp === 'hot' && hasWhatsApp) {
    return (
      <div className="ac-actions" onClick={onActions}>
        <WhatsAppCta message={waText} label="WhatsApp me now" className="btn-saffron" placement={placement} />
        {!compact &&
          (hasBooking ? (
            <BookingCta className="btn-light" label="Or book a free call" placement={placement} />
          ) : (
            <Link to={contact} className="btn-light">
              Or send a message
            </Link>
          ))}
      </div>
    )
  }

  if (temp === 'cold') {
    const project = projects.find((p) => p.slug === READ_NEXT[service])
    return (
      <>
        {!compact && project && (
          <div className="stage-glass nx-read">
            <p className="stage-mono nx-read-kicker">Here&rsquo;s what to read next</p>
            <h3 className="ac-job-name">{project.title}</h3>
            <p className="ac-job-looks">{project.tagline}</p>
            <Link to={`/projects/${project.slug}`} className="u-link nx-read-link" onClick={onActions}>
              Read how it works <Icon name="arrow" size={14} />
            </Link>
          </div>
        )}
        <div className="ac-actions" onClick={onActions}>
          {hasBooking ? (
            <BookingCta className={compact ? 'btn-saffron' : 'btn-light'} label="Book a free call" placement={placement} />
          ) : hasWhatsApp ? (
            <WhatsAppCta
              message={waText}
              label="Book a free call on WhatsApp"
              className={compact ? 'btn-saffron' : 'btn-light'}
              placement={placement}
            />
          ) : (
            <Link to={contact} className={compact ? 'btn-saffron' : 'btn-light'}>
              Ask for a free call
            </Link>
          )}
        </div>
      </>
    )
  }

  return warm
}
