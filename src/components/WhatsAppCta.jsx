import { hasWhatsApp, whatsappHref } from '../whatsapp.js'

/* ---------------------------------------------------------------
   The WhatsApp button: pill body, glyph in the trailing circle.

   Renders nothing at all until a number exists — see whatsapp.js for
   why, and check `hasWhatsApp` from there before laying out a row that
   would otherwise be left with one button in it.
   --------------------------------------------------------------- */
export default function WhatsAppCta({ message, label, className = '' }) {
  if (!hasWhatsApp) return null

  return (
    <a
      href={whatsappHref(message)}
      className={className}
      target="_blank"
      rel="noreferrer noopener"
    >
      {label}
      <span className="btn-pill-icon" aria-hidden="true">
        <WhatsAppGlyph />
      </span>
    </a>
  )
}

/* Stroke-drawn rather than the filled brand mark, so it sits in the
   same icon language as the arrow and the social row. */
export function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L4 20.1l1.2-4.1a8.4 8.4 0 1 1 15.3-4.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 9.3c.2-.5.5-.5.8-.5h.5c.3 0 .5 0 .7.5l.6 1.4c.1.2 0 .4-.1.6l-.4.5c-.2.2-.2.3-.1.5.3.6 1.2 1.4 1.8 1.8.2.1.4.1.5-.1l.5-.4c.2-.2.4-.2.6-.1l1.4.7c.4.2.5.3.5.6v.5c0 .5-.3.8-.7 1-.4.1-.9.1-1.3 0-2.4-.7-4.6-2.9-5.3-5.3-.2-.5-.2-1.2 0-1.7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
