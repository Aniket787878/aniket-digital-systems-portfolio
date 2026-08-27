import { site } from './data.js'

/* ------------------------------------------------------------------
   WhatsApp — the buyer's channel, not mine.

   The people this site sells to run their business on WhatsApp: they
   will tap a chat link and they will not compose an email. So WhatsApp
   is the primary call to action wherever both exist, and the contact
   form is the fallback for anyone who prefers to write it out.

   `site.whatsapp` is empty until the number exists. Every consumer
   renders *nothing* rather than a dead link — the same rule the
   `social` list follows — so check `hasWhatsApp` before laying out a
   row that would otherwise collapse to a single button.

   The link component lives in components/WhatsAppCta.jsx; this file is
   plain data so importing it never drags a component along.
   ------------------------------------------------------------------ */

/* wa.me wants digits only: country code first, no +, spaces or dashes.
   Stripping here rather than demanding a pre-cleaned string means
   data.js can hold the number in whatever readable form makes sense. */
const number = site.whatsapp.replace(/\D/g, '')

export const hasWhatsApp = number.length > 0

/* Give every placement its own prefill — see `whatsappPrefill` in
   data.js. The message a lead arrives with is the only signal of which
   part of the page did the convincing. */
export function whatsappHref(message) {
  if (!hasWhatsApp) return ''
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
