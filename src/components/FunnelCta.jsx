import { Link } from 'react-router-dom'
import Icon from './icons.jsx'
import BookingCta from './BookingCta.jsx'
import WhatsAppCta from './WhatsAppCta.jsx'
import { hasBooking } from '../booking.js'
import { hasWhatsApp } from '../whatsapp.js'
import { whatsappPrefill } from '../data.js'
import { fx } from '../interactions/attrs.js'
import { track } from '../analytics.js'

/* ---------------------------------------------------------------
   The site's two buttons (docs/outreach/2026-10-09-ai-consultancy-
   funnel-audit.md): one primary everywhere, one secondary beside it.

   CheckCta    "Get your free AI check" -> /ai-check. The only saffron
               button in any view. `placement` names where it was
               clicked, for the cta_click event.
   TalkCta     the existing call route, always second: the booking link
               once site.bookingUrl is set, else WhatsApp, else the
               contact page (same fallback as BookingCta / WhatsAppCta).
   --------------------------------------------------------------- */
export const CHECK_PATH = '/ai-check'
export const CHECK_LABEL = 'Get your free AI check'

export function CheckCta({ placement, label = CHECK_LABEL, className = 'btn-saffron', magnet = false }) {
  return (
    <Link
      to={CHECK_PATH}
      className={className}
      onClick={() => track('cta_click', { placement })}
      {...(magnet ? fx('magnet') : null)}
    >
      {label}
      <span className="btn-pill-icon" aria-hidden="true">
        <Icon name="arrow" size={16} />
      </span>
    </Link>
  )
}

export function TalkCta({
  className = 'btn-light',
  message = whatsappPrefill.audit,
  whatsappLabel = 'Book a free call',
  contact = '/contact',
  contactLabel = 'Send a message'
}) {
  if (hasBooking) return <BookingCta className={className} />
  if (hasWhatsApp) return <WhatsAppCta message={message} label={whatsappLabel} className={className} />
  return (
    <Link to={contact} className={className}>
      {contactLabel}
    </Link>
  )
}

/* ---------------------------------------------------------------
   Rehook: the quiet line that ends a band and points onward (the
   story loop's last beat), so no band is a dead end. A question in
   muted type, then an underlined link. Defaults to the free AI check;
   pass `to` for the next band or page. A text link, never a button,
   so it never competes with the one primary in view.
   `tone` is 'night' (light text) or 'paper' (dark text).
   --------------------------------------------------------------- */
export function Rehook({ question, label, to = CHECK_PATH, placement, tone = 'night', className = '' }) {
  const toCheck = to === CHECK_PATH
  return (
    <p className={`rehook rehook-${tone}${className ? ` ${className}` : ''}`}>
      {question && <span className="rehook-q">{question} </span>}
      <Link
        to={to}
        className="rehook-link"
        onClick={toCheck ? () => track('cta_click', { placement: placement || 'rehook' }) : undefined}
      >
        {label}
        <span className="rehook-arrow" aria-hidden="true">
          &rarr;
        </span>
      </Link>
    </p>
  )
}
