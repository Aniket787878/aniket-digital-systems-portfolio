import Icon from './icons.jsx'
import { fx } from '../interactions/attrs.js'
import { bookingUrl, hasBooking, BOOKING_LABEL } from '../booking.js'
import { track } from '../analytics.js'

/* ---------------------------------------------------------------
   "Book a 15-min call": the primary button wherever it appears, once
   site.bookingUrl is set. Renders nothing until then, the same rule as
   WhatsAppCta, so check `hasBooking` (booking.js) before laying out a
   row that depends on it.

   Every tap sends talk_click (analytics.js), the same "total get in
   touch taps" number WhatsAppCta sends. Pass `placement` from every
   caller. Fire-and-forget: never blocks the booking link.
   --------------------------------------------------------------- */
export default function BookingCta({ className = '', label = BOOKING_LABEL, magnet = false, placement }) {
  if (!hasBooking) return null

  const onClick = () => track('talk_click', { channel: 'booking', placement, path: window.location.pathname })

  return (
    <a
      href={bookingUrl}
      className={className}
      target="_blank"
      rel="noreferrer noopener"
      onClick={onClick}
      {...(magnet ? fx('magnet') : null)}
    >
      {label}
      <span className="btn-pill-icon" aria-hidden="true">
        <Icon name="calendar" size={16} />
      </span>
    </a>
  )
}
