import { site } from './data.js'

/* ------------------------------------------------------------------
   The booking link (Cal.com), the same pattern as whatsapp.js: plain
   data, no component, so importing it never drags one along.

   `hasBooking` is the one switch. While site.bookingUrl is empty every
   placement keeps its WhatsApp / contact-page behaviour; once it is set,
   "Book a 15-min call" becomes the primary button everywhere and
   WhatsApp moves to second place. See components/BookingCta.jsx.
   ------------------------------------------------------------------ */
export const bookingUrl = (site.bookingUrl || '').trim()
export const hasBooking = /^https?:\/\//i.test(bookingUrl)
export const BOOKING_LABEL = 'Book a 15-min call'
