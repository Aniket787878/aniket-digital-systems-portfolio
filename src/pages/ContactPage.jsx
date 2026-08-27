import ContactForm from '../components/ContactForm.jsx'
import WhatsAppCta from '../components/WhatsAppCta.jsx'
import { hasWhatsApp } from '../whatsapp.js'
import { site, whatsappPrefill } from '../data.js'
import './ContactPage.css'

const NEXT_STEPS = [
  {
    step: '01',
    label: 'A reply within 24 hours',
    detail:
      'From me, not an autoresponder. If it isn’t a fit I’ll say so and point you somewhere better.'
  },
  {
    step: '02',
    label: 'A 20-minute call',
    detail:
      'We walk through how the work moves today — who touches it, where it stalls, what it costs you in hours.'
  },
  {
    step: '03',
    label: 'A one-page proposal, in writing',
    detail:
      'Fixed scope, fixed price, a date it goes live. No hourly billing and no verbal quotes.'
  }
]

export default function ContactPage() {
  return (
    <section className="container page">
      <p className="eyebrow">Contact</p>
      <h1 className="page-title">Tell me which part is breaking</h1>
      <p className="page-lede">
        I build AI and operations automation for service businesses &mdash;
        clinics, studios, agencies and consultancies. If your bookings, client
        intake, follow-ups or team coordination are running on WhatsApp threads,
        spreadsheets and copy-paste, describe the one that eats the most time.
        That is enough to start.
      </p>

      {site.availability && (
        <p className="contact-availability">{site.availability}</p>
      )}

      {/* Someone who reached this page has already decided to talk. Give
          them the fast route before asking them to fill anything in. */}
      {hasWhatsApp && (
        <div className="contact-direct">
          <WhatsAppCta
            message={whatsappPrefill.contact}
            label="Message me on WhatsApp"
            className="btn-pill btn-pill-accent"
          />
          <p className="contact-direct-note">
            Usually the quickest way to reach me. The form below works just
            as well if you would rather write it out.
          </p>
        </div>
      )}

      <div className="contact-next">
        <h2 className="contact-next-title">What happens next</h2>
        <ol className="contact-next-list">
          {NEXT_STEPS.map((item) => (
            <li key={item.step}>
              <span className="contact-next-step">{item.step}</span>
              <span className="contact-next-label">{item.label}</span>
              <p>{item.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <ContactForm />
    </section>
  )
}
