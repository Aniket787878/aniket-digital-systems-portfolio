import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { site, budgetBands, whatsappPrefill } from '../data.js'
import { useCurrency } from '../currency.js'
import { hasBooking } from '../booking.js'
import BookingCta from './BookingCta.jsx'
import WhatsAppCta from './WhatsAppCta.jsx'
import { WEBHOOK_URL, formConnected } from '../leadWebhook.js'


/* Announced to screen readers via the polite live region below.
   Error states are announced by their own role="alert" node instead,
   so they are deliberately absent here. */
const STATUS_MESSAGES = {
  sending: 'Sending your message.',
  success: 'Sent. You will get a reply within 24 hours.'
}

const ALL_BANDS = [...budgetBands.usd, ...budgetBands.inr]

function budgetLabel(value) {
  const match = ALL_BANDS.find((option) => option.value === value)
  return match ? match.label : value
}

/* site.whatsapp may be empty, a phone number, or a full link. */
const whatsapp = (site.whatsapp || '').trim()
const whatsappIsUrl = /^https?:\/\//i.test(whatsapp)
const whatsappDigits = whatsapp.replace(/\D/g, '')
const showWhatsapp = whatsappIsUrl || whatsappDigits.length >= 8
const whatsappHref = whatsappIsUrl
  ? whatsapp
  : `https://wa.me/${whatsappDigits}`
const whatsappLabel = whatsappIsUrl ? 'WhatsApp' : whatsapp

/*
  With no webhook the form has nowhere to send, and a form that can only
  answer "not sent" costs a lead every time someone fills it in. So until
  VITE_LEAD_WEBHOOK_URL is set it is not rendered at all: the visitor gets
  the routes that do reach me (the call link once it exists, WhatsApp,
  email). Set the variable and redeploy, and the form comes back as it was.
*/
export default function ContactForm() {
  return formConnected ? <LeadForm /> : <DirectContact />
}

function DirectContact() {
  return (
    <div className="contact-panel contact-direct-panel">
      <h2 className="contact-panel-title">
        {hasBooking ? 'Book a call, or message me.' : 'Message me directly.'}
      </h2>
      <p>
        {hasBooking
          ? 'Pick a 15-minute slot, or send a WhatsApp if that is easier. Tell me which part of the week is eating the most time. That is enough to start.'
          : 'WhatsApp is the quickest way to reach me. Tell me which part of the week is eating the most time. That is enough to start.'}
      </p>
      <div className="contact-direct-actions">
        <BookingCta className="btn-pill btn-pill-accent" />
        <WhatsAppCta
          message={whatsappPrefill.contact}
          label="Message me on WhatsApp"
          className={hasBooking ? 'btn-pill' : 'btn-pill btn-pill-accent'}
        />
      </div>
      <p>
        Or email{' '}
        <a className="u-link" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        . I reply within 24 hours.
      </p>
      <PrivacyNote />
    </div>
  )
}

function LeadForm() {
  const currency = useCurrency()
  const bands = budgetBands[currency]
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [workflowBroken, setWorkflowBroken] = useState('')
  const [budgetBand, setBudgetBand] = useState('')
  /* Honeypot: a field people never see, so only a bot fills it in. */
  const [trap, setTrap] = useState('')
  const [status, setStatus] = useState('idle')

  const inFlight = useRef(false)
  const sending = status === 'sending'

  /* Nothing the visitor typed should be lost if the send fails.
     This link hands the same message to their own mail client. */
  const mailSubject = name
    ? `Automation enquiry: ${name}`
    : 'Automation enquiry'
  const mailBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    budgetBand ? `Budget: ${budgetLabel(budgetBand)}` : null,
    '',
    'The workflow to automate:',
    workflowBroken
  ]
    .filter((line) => line !== null)
    .join('\n')
  const mailtoHref = `mailto:${site.email}?subject=${encodeURIComponent(
    mailSubject
  )}&body=${encodeURIComponent(mailBody)}`

  /* WhatsApp is the buyer's live channel, so offer it as a second escape
     hatch whenever a send fails — the lead still reaches me now, even though
     the form's own inbox (the n8n webhook) may not be wired up yet. It opens
     the chat prefilled with the same details the email carries. */
  const whatsappLeadHref = showWhatsapp
    ? whatsappIsUrl
      ? whatsapp
      : `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
          `Hi Aniket, automation enquiry.\n\n${mailBody}`
        )}`
    : null

  async function handleSubmit(event) {
    event.preventDefault()

    if (inFlight.current) return

    /* A filled honeypot is a bot. Show it the success panel so it has
       no reason to retry, and send nothing. */
    if (trap) {
      setStatus('success')
      return
    }

    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      workflow_broken: workflowBroken.trim()
    }

    setName(trimmed.name)
    setEmail(trimmed.email)
    setCompany(trimmed.company)
    setWorkflowBroken(trimmed.workflow_broken)

    if (
      !trimmed.name ||
      !trimmed.email ||
      trimmed.workflow_broken.length < 20
    ) {
      setStatus('invalid')
      return
    }

    const payload = {
      ...trimmed,
      budget_band: budgetBand,
      source: document.referrer || 'direct',
      submitted_at: new Date().toISOString()
    }

    inFlight.current = true
    setStatus('sending')

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      setStatus(response.ok ? 'success' : 'error')
    } catch (error) {
      console.error('[ContactForm] Failed to send lead:', error)
      setStatus('error')
    } finally {
      inFlight.current = false
    }
  }

  let body

  if (status === 'success') {
    body = (
      <div className="contact-panel">
        <h2 className="contact-panel-title">Got it.</h2>
        <p>I&rsquo;ll reply within 24 hours, usually sooner.</p>
        {showWhatsapp && (
          <p>
            If it&rsquo;s urgent, WhatsApp me at{' '}
            <a
              className="u-link"
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
            >
              {whatsappLabel}
            </a>
            .
          </p>
        )}
      </div>
    )
  } else {
    body = (
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-field">
          <label className="contact-label" htmlFor="contact-name">
            Name
          </label>
          <input
            className="contact-input"
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="contact-field">
          <label className="contact-label" htmlFor="contact-email">
            Email
          </label>
          <input
            className="contact-input"
            id="contact-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {/* Honeypot, see `trap` above. Off-screen rather than display:none,
            which some bots skip; hidden from assistive tech and the tab
            order so no person ever lands in it. */}
        <div className="contact-hp" aria-hidden="true">
          <label htmlFor="contact-company-website">Company website</label>
          <input
            id="contact-company-website"
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(event) => setTrap(event.target.value)}
          />
        </div>

        <div className="contact-field">
          <label className="contact-label" htmlFor="contact-company">
            Company <span className="contact-optional">(optional)</span>
          </label>
          <input
            className="contact-input"
            id="contact-company"
            name="company"
            type="text"
            maxLength={100}
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </div>

        <div className="contact-field">
          <label className="contact-label" htmlFor="contact-workflow">
            What&apos;s the manual/repetitive workflow you&apos;d want
            automated?
          </label>
          <textarea
            className="contact-textarea"
            id="contact-workflow"
            name="workflow_broken"
            rows={6}
            placeholder="What's the manual/repetitive workflow you'd want automated?"
            required
            minLength={20}
            maxLength={1000}
            value={workflowBroken}
            onChange={(event) => setWorkflowBroken(event.target.value)}
          />
        </div>

        <fieldset className="contact-fieldset">
          <legend className="contact-legend">Budget band</legend>
          {bands.map((option) => (
            <label className="contact-radio" key={option.value}>
              <input
                type="radio"
                name="budget_band"
                value={option.value}
                required
                checked={budgetBand === option.value}
                onChange={(event) => setBudgetBand(event.target.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <button
          className="btn btn-primary contact-submit"
          type="submit"
          disabled={sending}
          aria-busy={sending}
        >
          {sending ? 'Sending…' : 'Send it →'}
        </button>

        {status === 'invalid' && (
          <p className="contact-error" role="alert">
            Add your name, your email and a couple of lines about the workflow,
            then send.
          </p>
        )}

        {status === 'error' && (
          <p className="contact-error" role="alert">
            That didn&rsquo;t send.{' '}
            <a className="u-link" href={mailtoHref}>
              Open it as an email
            </a>
            {whatsappLeadHref && (
              <>
                {' '}or{' '}
                <a
                  className="u-link"
                  href={whatsappLeadHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  send it on WhatsApp
                </a>
              </>
            )}
            . Everything you typed is already in it.
          </p>
        )}
      </form>
    )
  }

  return (
    <>
      {/* Mounted from the start so screen readers announce the
          sending / success transitions. Visually hidden. */}
      <p className="contact-status" role="status" aria-live="polite">
        {STATUS_MESSAGES[status] || ''}
      </p>
      {body}
      <PrivacyNote />
    </>
  )
}

function PrivacyNote() {
  return (
    <p className="contact-privacy">
      What happens to what you send:{' '}
      <Link className="u-link" to="/privacy">
        privacy
      </Link>
      .
    </p>
  )
}
