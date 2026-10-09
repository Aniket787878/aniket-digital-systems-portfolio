import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { aiCheck, packages, site, whatsappPrefill } from '../data.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useCurrency, inCurrency } from '../currency.js'
import { WEBHOOK_URL } from '../leadWebhook.js'
import { hasBooking } from '../booking.js'
import { hasWhatsApp, whatsappHref } from '../whatsapp.js'
import { track } from '../analytics.js'
import BookingCta from '../components/BookingCta.jsx'
import WhatsAppCta from '../components/WhatsAppCta.jsx'
import PathStrip from '../components/PathStrip.jsx'
import Icon from '../components/icons.jsx'
import { result, summary } from './aicheck/rules.js'
import './service/showcase/stage.css'
import './AiCheckPage.css'

/*
  The free AI check (/ai-check): step 1 of the path (funnelPath in
  data.js). Six plain questions and a contact step, one per screen; then
  an instant result worked out in the browser (aicheck/rules.js) and the
  next step, the AI Roadmap.

  The answers go through the SAME lead path as the contact form
  (components/ContactForm.jsx): POST to /api/lead with the same fields,
  the answers packed into `workflow_broken` and `service: 'ai'`, so the
  live n8n intake (sheet, alert, auto-reply) files it with no change.
  Same honeypot, same email / WhatsApp fallback if the send fails. The
  result shows either way: it never waits on the network.

  Story loop: the stakes line and the question open the page, the
  result's headfake ("not one big system"), then the rehook into the
  Roadmap.
*/

const STEPS = aiCheck.steps
const CONTACT = STEPS.length // index of the last (contact) step
const TOTAL = STEPS.length + 1
const EASE = [0.22, 1, 0.36, 1]
const ROADMAP = packages.find((pkg) => pkg.name === 'AI Roadmap Session')

const EMPTY = { business: '', enquiries: '', speed: '', time: [], tools: [], team: '' }
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AiCheckPage() {
  useDocumentTitle('Free AI check · Aniket')
  const [answers, setAnswers] = useState(EMPTY)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  /* Honeypot: a field people never see, so only a bot fills it in. */
  const [trap, setTrap] = useState('')
  const [res, setRes] = useState(null)
  const [send, setSend] = useState('idle')
  const [text, setText] = useState('')
  const started = useRef(false)
  const inFlight = useRef(false)
  const headRef = useRef(null)
  const resultRef = useRef(null)
  const moved = useRef(false)

  /* Move focus to the new question (or the result) after every step, so
     keyboard and screen-reader users land on what changed. Not on the
     first render: the page should not grab focus on arrival. */
  useEffect(() => {
    if (!moved.current) return
    const target = res ? resultRef.current : headRef.current
    target?.focus({ preventScroll: true })
    /* On a phone the next question can start above the screen once the
       previous one was scrolled through: bring its card back to the top. */
    const box = target?.closest('.ac-card, .ac-result')
    if (box && box.getBoundingClientRect().top < 0) box.scrollIntoView({ block: 'start' })
  }, [step, res])

  function answer(id, value, many) {
    if (!started.current) {
      started.current = true
      track('ai_check_start')
    }
    setError('')
    setAnswers((prev) => {
      if (!many) return { ...prev, [id]: value }
      const list = prev[id]
      return { ...prev, [id]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] }
    })
  }

  function go(next) {
    moved.current = true
    setError('')
    setStep(next)
  }

  function onNext(event) {
    event.preventDefault()
    const current = STEPS[step]
    const value = answers[current.id]
    const empty = Array.isArray(value) ? value.length === 0 : !value
    if (empty && !current.optional) {
      setError(current.kind === 'many' ? 'Pick at least one to go on.' : 'Pick one to go on.')
      return
    }
    go(step + 1)
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (inFlight.current) return
    const clean = { name: name.trim(), email: email.trim(), phone: phone.trim() }
    setName(clean.name)
    setEmail(clean.email)
    setPhone(clean.phone)
    if (!clean.name || !EMAIL_OK.test(clean.email)) {
      setError('Add your name and an email address, then see your result.')
      return
    }

    const outcome = result(answers)
    const message = summary(answers, outcome, clean.phone)
    setText(message)
    moved.current = true
    setError('')
    setRes(outcome)

    /* A filled honeypot is a bot: show it the result, send nothing. */
    if (trap) {
      setSend('sent')
      return
    }

    track('ai_check_submit', { business: answers.business, enquiries: answers.enquiries })

    const payload = {
      name: clean.name,
      email: clean.email,
      company: '',
      workflow_broken: message,
      service: 'ai',
      budget_band: 'not_sure',
      source: `ai-check · ${document.referrer || 'direct'}`,
      submitted_at: new Date().toISOString()
    }

    inFlight.current = true
    setSend('sending')
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      setSend(response.ok ? 'sent' : 'error')
    } catch (err) {
      console.error('[AiCheck] Failed to send answers:', err)
      setSend('error')
    } finally {
      inFlight.current = false
    }
  }

  function restart() {
    moved.current = true
    started.current = false
    setAnswers(EMPTY)
    setRes(null)
    setSend('idle')
    setStep(0)
  }

  return (
    <section className="stage ac" aria-labelledby="ac-title">
      <div className="stage-glow ac-glow" aria-hidden="true" />
      <div className="container ac-inner">
        <header className="ac-head">
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            Free AI check · about 3 minutes
          </p>
          <p className="ac-stakes">The repeat work in a week is easy to miss. It arrives a few minutes at a time.</p>
          <h1 className="stage-title ac-title" id="ac-title">
            What could AI take off your <span className="stage-serif">plate?</span>
          </h1>
          <p className="stage-lede ac-lede">
            Six plain questions about how your week runs. You get an answer on screen straight away: the three
            jobs worth handing to AI first, what each would look like, and a rough idea of the hours they take.
          </p>
        </header>

        {res ? (
          <Result res={res} send={send} text={text} name={name} email={email} resultRef={resultRef} onRestart={restart} />
        ) : (
          <div className="stage-glass ac-card">
            <Progress step={step} />
            {step < CONTACT ? (
              <Question
                key={STEPS[step].id}
                q={STEPS[step]}
                value={answers[STEPS[step].id]}
                onAnswer={answer}
                onNext={onNext}
                onBack={step > 0 ? () => go(step - 1) : null}
                error={error}
                headRef={headRef}
                last={step === CONTACT - 1}
              />
            ) : (
              <Contact
                name={name}
                email={email}
                phone={phone}
                trap={trap}
                setName={setName}
                setEmail={setEmail}
                setPhone={setPhone}
                setTrap={setTrap}
                onSubmit={onSubmit}
                onBack={() => go(step - 1)}
                error={error}
                headRef={headRef}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function Progress({ step }) {
  const n = step + 1
  return (
    <div className="ac-progress">
      <p className="stage-mono ac-count">
        {step < CONTACT ? `Question ${n} of ${STEPS.length}` : 'Last step'}
      </p>
      <div
        className="ac-bar"
        role="progressbar"
        aria-label="Progress through the check"
        aria-valuemin={1}
        aria-valuemax={TOTAL}
        aria-valuenow={n}
      >
        <span style={{ width: `${(n / TOTAL) * 100}%` }} />
      </div>
    </div>
  )
}

const stepIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: EASE }
}

function Question({ q, value, onAnswer, onNext, onBack, error, headRef, last }) {
  const many = q.kind === 'many'
  const headId = `ac-q-${q.id}`
  const hintId = q.hint ? `${headId}-hint` : undefined
  const errId = `${headId}-error`
  return (
    <m.form className="ac-step" onSubmit={onNext} noValidate {...stepIn}>
      <fieldset className="ac-fieldset" aria-labelledby={headId} aria-describedby={[hintId, error ? errId : null].filter(Boolean).join(' ') || undefined}>
        <h2 className="ac-question" id={headId} tabIndex={-1} ref={headRef}>
          {q.question}
        </h2>
        {q.hint && (
          <p className="ac-hint" id={hintId}>
            {q.hint}
          </p>
        )}
        <div className={`ac-options${many ? ' is-many' : ''}`}>
          {q.options.map((option) => {
            const checked = many ? value.includes(option.value) : value === option.value
            return (
              <label key={option.value} className={`ac-option${checked ? ' is-on' : ''}`}>
                <input
                  type={many ? 'checkbox' : 'radio'}
                  name={q.id}
                  value={option.value}
                  checked={checked}
                  onChange={() => onAnswer(q.id, option.value, many)}
                />
                <span className="ac-mark" aria-hidden="true" />
                <span>{option.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {error && (
        <p className="ac-error" id={errId} role="alert">
          {error}
        </p>
      )}

      <div className="ac-nav">
        {onBack ? (
          <button type="button" className="ac-back" onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn-saffron ac-next">
          {q.optional && (!value || value.length === 0) ? 'Skip' : last ? 'Last step' : 'Next'}
          <span className="btn-pill-icon" aria-hidden="true">
            <Icon name="arrow" size={16} />
          </span>
        </button>
      </div>
    </m.form>
  )
}

function Contact({ name, email, phone, trap, setName, setEmail, setPhone, setTrap, onSubmit, onBack, error, headRef }) {
  return (
    <m.form className="ac-step" onSubmit={onSubmit} noValidate {...stepIn}>
      <h2 className="ac-question" tabIndex={-1} ref={headRef}>
        Last step: who is the result for?
      </h2>
      <p className="ac-hint">
        Your result shows on the next screen straight away. I get a copy of your answers too, so I can reply
        personally. {site.replyPromise}
      </p>

      <div className="ac-fields">
        <div className="ac-field">
          <label htmlFor="ac-name">Your name</label>
          <input
            id="ac-name"
            className="ac-input"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="ac-field">
          <label htmlFor="ac-email">Your email</label>
          <input
            id="ac-email"
            className="ac-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="ac-field">
          <label htmlFor="ac-phone">
            Your WhatsApp number <span className="ac-optional">(optional)</span>
          </label>
          <input
            id="ac-phone"
            className="ac-input"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Honeypot, the same as the contact form's: off-screen, out of
            the tab order and hidden from assistive tech. */}
        <div className="contact-hp ac-hp" aria-hidden="true">
          <label htmlFor="ac-company-website">Company website</label>
          <input
            id="ac-company-website"
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="ac-error" role="alert">
          {error}
        </p>
      )}

      <div className="ac-nav">
        <button type="button" className="ac-back" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="btn-saffron ac-next">
          See my result
          <span className="btn-pill-icon" aria-hidden="true">
            <Icon name="arrow" size={16} />
          </span>
        </button>
      </div>

      <p className="ac-privacy">
        Used only to reply to you. <Link className="u-link" to="/privacy">Privacy note</Link>.
      </p>
    </m.form>
  )
}

const range = ([low, high]) => `${low} to ${high} hours a week`

function Result({ res, send, text, name, email, resultRef, onRestart }) {
  const currency = useCurrency()
  const jobs = res.top.map((j) => j.name.toLowerCase()).join(', ')
  const prefill = whatsappPrefill.aiCheck.replace('{jobs}', jobs)

  /* If the send failed, nothing typed is lost: the same summary goes
     into an email draft or a WhatsApp chat, like the contact form. */
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
    `Free AI check: ${name}`
  )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${text}`)}`
  const waFallback = hasWhatsApp ? whatsappHref(`Hi Aniket, I did the free AI check on your site.\n\nName: ${name}\n\n${text}`) : ''

  /* cta_click for the Roadmap buttons. BookingCta / WhatsAppCta take no
     onClick, so the row listens for any link click inside it. */
  const onActions = (event) => {
    if (event.target.closest('a')) track('cta_click', { placement: 'ai-check-result' })
  }

  return (
    <m.div className="ac-result" {...stepIn}>
      <p className="stage-pill stage-mono">
        <span className="stage-dot" aria-hidden="true" />
        Your result
      </p>
      <h2 className="stage-title ac-result-title" tabIndex={-1} ref={resultRef}>
        Your top three jobs to hand to <span className="stage-serif">AI.</span>
      </h2>
      <p className="ac-headfake">
        Not one big system. Three small jobs, done for you, with a person checking what matters.
      </p>

      <p className="ac-send" role="status" aria-live="polite">
        {send === 'sending' && 'Sending a copy of your answers…'}
        {send === 'sent' && `Sent. I have your answers. ${site.replyPromise}`}
      </p>
      {send === 'error' && (
        <p className="ac-error" role="alert">
          Your result is below, but your answers didn&rsquo;t reach me.{' '}
          <a className="u-link" href={mailto}>
            Send them as an email
          </a>
          {waFallback && (
            <>
              {' '}or{' '}
              <a className="u-link" href={waFallback} target="_blank" rel="noreferrer">
                on WhatsApp
              </a>
            </>
          )}
          . Everything is already filled in.
        </p>
      )}

      <ol className="ac-jobs">
        {res.top.map((job, i) => (
          <li key={job.id} className="stage-glass ac-job">
            <p className="stage-mono ac-job-count">
              <span>{String(i + 1).padStart(2, '0')}</span> / 03
            </p>
            <h3 className="ac-job-name">{job.name}</h3>
            <p className="ac-job-looks">{job.looks}</p>
            <p className="ac-job-hours">
              About {range(job.hours)} <span className="ac-est">rough estimate</span>
            </p>
          </li>
        ))}
      </ol>

      <div className="ac-total">
        <p className="ac-total-line">
          Together, roughly <strong>{range(res.total)}</strong> back.
        </p>
        <p className="ac-total-note">
          Rough estimate, we&rsquo;ll firm it up together. It comes from a simple rule of thumb on your answers
          (enquiries a week and team size), not from measuring your week.
        </p>
      </div>

      <div className="ac-next-step">
        <h2 className="stage-title ac-next-title">
          Want real numbers instead of rough <span className="stage-serif">ones?</span>
        </h2>
        <p className="stage-lede">
          That is step two, the AI Roadmap: a 60-minute session on how your week really runs, then a short
          written plan with every job ranked by time saved against cost, and a fixed quote for the first build.
        </p>
        <PathStrip current={1} tone="dark" label="Where you are on the path" />
        <p className="ac-price">
          <strong>{inCurrency(ROADMAP.price, currency)}</strong>, {ROADMAP.timeline.toLowerCase()}. The fee is taken
          off your build if you go ahead.
        </p>
        <div className="ac-actions" onClick={onActions}>
          {hasBooking ? (
            <>
              <BookingCta className="btn-saffron" label="Book a call about the Roadmap" />
              <WhatsAppCta message={prefill} label="Ask on WhatsApp" className="btn-light" />
            </>
          ) : hasWhatsApp ? (
            <>
              <WhatsAppCta message={prefill} label="Start my AI Roadmap" className="btn-saffron" />
              <Link to="/ai#prices" className="btn-light">
                See what is in it
              </Link>
            </>
          ) : (
            <Link to="/contact?service=ai#write" className="btn-saffron">
              Ask about the Roadmap
            </Link>
          )}
        </div>
        <p className="ac-guarantee">{site.guarantee}</p>
        <button type="button" className="ac-back ac-restart" onClick={onRestart}>
          Start the check again
        </button>
      </div>
    </m.div>
  )
}
