import { Link } from 'react-router-dom'
import Icon from './icons.jsx'
import BookingCta from './BookingCta.jsx'
import WhatsAppCta from './WhatsAppCta.jsx'
import { hasBooking } from '../booking.js'
import { hasWhatsApp } from '../whatsapp.js'
import { whatsappPrefill } from '../data.js'
import { fx } from '../interactions/attrs.js'
import { track } from '../analytics.js'
import { FLOW, START_PATH, START_LABEL } from '../flows.js'

/* ---------------------------------------------------------------
   The site's two buttons (docs/outreach/2026-10-09-ai-consultancy-
   funnel-audit.md): one primary per view, one secondary beside it.

   StartCta    the primary. "Get started" -> /start (what do you want to
               build?) by default; pass `service` for an area's own free
               plan: websites "Plan your website" -> /start/website,
               software "Plan your software" -> /start/software, ai "Get
               your free AI check" -> /ai-check (2026-10-09: a website
               or software buyer is no longer sent to an AI check).
               `placement` names where it was clicked, for cta_click.
               It carries data-primary, which the nav watches so its own
               copy steps back while a page's primary is on screen.
   CheckCta    StartCta for the AI check, kept for the AI-only places.
   TalkCta     the existing call route, always second: the booking link
               once site.bookingUrl is set, else WhatsApp, else the
               contact page (same fallback as BookingCta / WhatsAppCta).
   --------------------------------------------------------------- */

/* Every path that starts a plan: clicks into any of them count as
   cta_click. */
const STARTS = [START_PATH, ...Object.values(FLOW).map((f) => f.to)]

export function StartCta({ service, placement, label, className = 'btn-saffron', magnet = false }) {
  const flow = FLOW[service]
  return (
    <Link
      to={flow ? flow.to : START_PATH}
      className={className}
      data-primary=""
      onClick={() => track('cta_click', { placement })}
      {...(magnet ? fx('magnet') : null)}
    >
      {label || (flow ? flow.label : START_LABEL)}
      <span className="btn-pill-icon" aria-hidden="true">
        <Icon name="arrow" size={16} />
      </span>
    </Link>
  )
}

export function CheckCta(props) {
  return <StartCta service="ai" {...props} />
}

export function TalkCta({
  className = 'btn-light',
  message = whatsappPrefill.audit,
  whatsappLabel = 'Book a free call',
  contact = '/contact',
  contactLabel = 'Send a message',
  placement
}) {
  if (hasBooking) return <BookingCta className={className} placement={placement} />
  if (hasWhatsApp) return <WhatsAppCta message={message} label={whatsappLabel} className={className} placement={placement} />
  return (
    <Link to={contact} className={className}>
      {contactLabel}
    </Link>
  )
}

/* ---------------------------------------------------------------
   Rehook: the quiet line that ends a band and points onward (the
   story loop's last beat), so no band is a dead end. A question in
   muted type, then an underlined link. Defaults to /start (what do you
   want to build?); pass `to` for an area's plan, the next band or page. A text link, never a button,
   so it never competes with the one primary in view.
   `tone` is 'night' (light text) or 'paper' (dark text).
   --------------------------------------------------------------- */
export function Rehook({ question, label, to = START_PATH, placement, tone = 'night', className = '' }) {
  const toCheck = STARTS.includes(to)
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
