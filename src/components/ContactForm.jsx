import { useState } from 'react'
import { site } from '../data.js'

const WEBHOOK_URL = import.meta.env.VITE_LEAD_WEBHOOK_URL

const BUDGET_OPTIONS = [
  { value: '<50k', label: 'Under ₹50k' },
  { value: '50k-2L', label: '₹50k – ₹2L' },
  { value: '2L+', label: '₹2L+' },
  { value: 'not_sure', label: 'Not sure yet' }
]

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [workflowBroken, setWorkflowBroken] = useState('')
  const [budgetBand, setBudgetBand] = useState('')
  const [status, setStatus] = useState('idle')

  const sending = status === 'sending'

  async function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      name,
      email,
      company,
      workflow_broken: workflowBroken,
      budget_band: budgetBand,
      source: document.referrer || 'direct',
      submitted_at: new Date().toISOString()
    }

    setStatus('sending')

    if (!WEBHOOK_URL) {
      console.log(
        '[ContactForm] No VITE_LEAD_WEBHOOK_URL configured — payload not sent:',
        payload
      )
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
    }
  }

  if (status === 'success') {
    return (
      <div className="contact-panel">
        <h2 className="contact-panel-title">Got it.</h2>
        <p>I&apos;ll reply within 24 hours (usually much faster).</p>
        <p>If it&apos;s urgent, WhatsApp me: {'{whatsapp}'}</p>
      </div>
    )
  }

  if (status === 'fallback') {
    return (
      <div className="contact-panel">
        <h2 className="contact-panel-title">We&apos;re getting set up.</h2>
        <p>
          Email us at{' '}
          <a className="u-link" href={`mailto:${site.email}`}>
            {site.email}
          </a>{' '}
          directly.
        </p>
      </div>
    )
  }

  return (
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
          What&apos;s the manual/repetitive workflow you&apos;d want automated?
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

      {status === 'error' && (
        <p className="contact-error" role="alert">
          Couldn&apos;t send — please email{' '}
          <a className="u-link" href={`mailto:${site.email}`}>
            {site.email}
          </a>{' '}
          directly.
        </p>
      )}
    </form>
  )
}
