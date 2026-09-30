import Icon from './icons.jsx'
import { fx } from '../interactions/attrs.js'
import { bookingUrl, hasBooking, BOOKING_LABEL } from '../booking.js'

/* ---------------------------------------------------------------
   "Book a 15-min call": the primary button wherever it appears, once
   site.bookingUrl is set. Renders nothing until then, the same rule as
   WhatsAppCta, so check `hasBooking` (booking.js) before laying out a
   row that depends on it.
   --------------------------------------------------------------- */
export default function BookingCta({ className = '', label = BOOKING_LABEL, magnet = false }) {
  if (!hasBooking) return null

  return (
    <a
      href={bookingUrl}
      className={className}
      target="_blank"
      rel="noreferrer noopener"
      {...(magnet ? fx('magnet') : null)}
    >
      {label}
      <span className="btn-pill-icon" aria-hidden="true">
        <Icon name="calendar" size={16} />
      </span>
    </a>
  )
}
