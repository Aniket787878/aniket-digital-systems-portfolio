import { useRef, useState } from 'react'
import { site } from '../data.js'

const WEBHOOK_URL = import.meta.env.VITE_LEAD_WEBHOOK_URL

const BUDGET_OPTIONS = [
  { value: '<50k', label: 'Under ₹50k' },
  { value: '50k-2L', label: '₹50k – ₹2L' },
  { value: '2L+', label: '₹2L+' },
  { value: 'not_sure', label: 'Not sure yet' }
]

/* Announced to screen readers via the polite live region below.
   Error states are announced by their own role="alert" node instead,
   so they are deliberately absent here. */
const STATUS_MESSAGES = {
  sending: 'Sending your message.',
  success: 'Sent. You will get a reply within 24 hours.',
  fallback:
    'Not sent. The form is not connected yet — use the email link on screen instead.'
}

function budgetLabel(value) {
  const match = BUDGET_OPTIONS.find((option) => option.value === value)
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

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [workflowBroken, setWorkflowBroken] = useState('')
  const [budgetBand, setBudgetBand] = useState('')
  const [status, setStatus] = useState('idle')

  const inFlight = useRef(false)
  const sending = status === 'sending'

  /* Nothing the visitor typed should be lost if the send fails.
     This link hands the same message to their own mail client. */
  const mailSubject = name
    ? `Automation enquiry — ${name}`
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

  async function handleSubmit(event) {
    event.preventDefault()

    if (inFlight.current) return

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

    if (!WEBHOOK_URL) {
      console.log(
        '[ContactForm] No VITE_LEAD_WEBHOOK_URL configured — payload not sent:',
        payload
      )
      inFlight.current = false
      setStatus('fallback')
      return
    }

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
  } else if (status === 'fallback') {
    body = (
      <div className="contact-panel">
        <h2 className="contact-panel-title">That didn&rsquo;t send.</h2>
        <p>
          The form isn&rsquo;t connected to its inbox yet, so your message was
          not delivered. Better you hear that than have it disappear.
        </p>
        <p>
          This opens an email with everything you just typed already in it.
          Send that and it reaches me.
        </p>
        <p>
          <a className="btn btn-primary" href={mailtoHref}>
            Email it instead <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
        <p>
          Or write to{' '}
          <a className="u-link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
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
          {BUDGET_OPTIONS.map((option) => (
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
            </a>{' '}
            instead — everything you typed is already in it.
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
    </>
  )
}
