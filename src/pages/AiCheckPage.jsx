import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
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
import { result, summary } from './aicheck/rules.js'
import { normalisePhone, aiTemp, landingFields } from '../leadExtras.js'
import { NextStepActions } from './flow/NextStep.jsx'
import { setResultHandoff, clearResultHandoff } from '../resultHandoff.js'
import { Progress, Question, Contact } from './flow/Steps.jsx'
import { stepIn, EMAIL_OK } from './flow/shared.js'
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
const ROADMAP = packages.find((pkg) => pkg.name === 'AI Roadmap Session')

const EMPTY = { business: '', enquiries: '', speed: '', time: [], tools: [], team: '' }

/* The check's own address, and its result's (/ai-check/result), so a
   page view counts a finished check (strategy item 11). */
const BASE = '/ai-check'

export default function AiCheckPage() {
  useDocumentTitle('Free AI check · Aniket')
  const { view } = useParams()
  const navigate = useNavigate()
  const onResultUrl = view === 'result'
  const currency = useCurrency()
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
  const [temp, setTemp] = useState('warm')
  const started = useRef(false)
  /* Set between the submit and the move to the result URL (see the
     effect below). */
  const toResult = useRef(false)
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

  /* The result URL and the result state move together: no result in
     memory on the result URL (a refresh) goes back to the first question;
     the back button from the result goes back to the contact step. */
  useEffect(() => {
    if (onResultUrl) {
      toResult.current = false
      if (!res) navigate(BASE, { replace: true })
    } else if (res && !toResult.current) {
      setRes(null)
      setSend('idle')
    }
  }, [onResultUrl, res, navigate])

  function answer(id, value, many) {
    if (!started.current) {
      started.current = true
      track('ai_check_start')
      track('flow_start', { service: 'ai' })
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
    const phoneNorm = normalisePhone(clean.phone)
    const leadTemp = aiTemp({ enquiries: answers.enquiries, team: answers.team, phone: phoneNorm })
    setText(message)
    setTemp(leadTemp)
    moved.current = true
    setError('')
    setRes(outcome)
    toResult.current = true
    navigate(`${BASE}/result`)

    /* A filled honeypot is a bot: show it the result, send nothing. */
    if (trap) {
      setSend('sent')
      return
    }

    track('ai_check_submit', { business: answers.business, enquiries: answers.enquiries })
    track('flow_submit', { service: 'ai' })

    const payload = {
      name: clean.name,
      email: clean.email,
      company: '',
      workflow_broken: message,
      service: 'ai',
      budget_band: 'not_sure',
      source: `ai-check · ${document.referrer || 'direct'}`,
      submitted_at: new Date().toISOString(),
      /* The structured fields (leadExtras.js). The check asks no date, so
         timing stays empty; the package is step 2, the AI Roadmap, at the
         price the result shows. */
      phone: phoneNorm,
      timing: '',
      package: `${ROADMAP.name} (${inCurrency(ROADMAP.price, currency)})`,
      lead_temp: leadTemp,
      ...landingFields()
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
    navigate(BASE)
  }

  /* /ai-check/anything-else is not a page. */
  if (view && !onResultUrl) return <Navigate to={BASE} replace />

  return (
    <section className="stage ac" aria-labelledby="ac-title">
      <div className="stage-glow ac-glow" aria-hidden="true" />
      <div className="container ac-inner">
        <header className={`ac-head${res ? ' is-result' : step >= 1 ? ' is-compact' : ''}`}>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            Free AI check · about 3 minutes
          </p>
          <p className="ac-stakes">The repeat work in a week is easy to miss. It arrives a few minutes at a time.</p>
          <h1 className={`stage-title ac-title${res || step >= 1 ? ' sr-only-phone' : ''}`} id="ac-title">
            What could AI take off your <span className="stage-serif">plate?</span>
          </h1>
          <p className="stage-lede ac-lede">
            Six plain questions about how your week runs. You get an answer on screen straight away: the three
            jobs worth handing to AI first, what each would look like, and a rough idea of the hours they take.
          </p>
        </header>

        {res ? (
          <Result res={res} temp={temp} send={send} text={text} name={name} email={email} resultRef={resultRef} onRestart={restart} />
        ) : (
          <div className="stage-glass ac-card">
            <Progress step={step} questions={STEPS.length} />
            {step < CONTACT ? (
              <Question
                key={STEPS[step].id}
                q={STEPS[step]}
                value={answers[STEPS[step].id]}
                onAnswer={answer}
                onNext={onNext}
                onAutoAdvance={() => go(step + 1)}
                onBack={step > 0 ? () => go(step - 1) : null}
                error={error}
                headRef={headRef}
                last={step === CONTACT - 1}
              />
            ) : (
              <Contact
                idPrefix="ac"
                title="Last step: who is the result for?"
                hint={`Your result shows on the next screen straight away. I get a copy of your answers too, so I can reply personally. ${site.replyPromise}`}
                submitLabel="See my result"
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

const range = ([low, high]) => `${low} to ${high} hours a week`

function Result({ res, temp, send, text, name, email, resultRef, onRestart }) {
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
  const handoffText = `Hi Aniket, I just did the free AI check on your site.\n\nName: ${name}\n\n${text}`
  const topActions = (event) => {
    onActions(event)
    if (event.target.closest('a,button')) track('result_cta', { position: 'top', temp })
  }
  const bottomActions = (event) => {
    onActions(event)
    if (event.target.closest('a,button')) track('result_cta', { position: 'bottom', temp })
  }

  /* Tells the phone action dock (Spec 1) which message to send once the
     in-page hand-off above has scrolled out of view. */
  useEffect(() => {
    setResultHandoff({ text: handoffText, label: 'Send my result on WhatsApp' })
    return clearResultHandoff
  }, [handoffText])

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
          <a
            className="u-link"
            href={mailto}
            onClick={() => track('talk_click', { channel: 'email', placement: 'result-error', path: window.location.pathname })}
          >
            Send them as an email
          </a>
          {waFallback && (
            <>
              {' '}or{' '}
              <a
                className="u-link"
                href={waFallback}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  track('talk_click', { channel: 'whatsapp', placement: 'result-error', path: window.location.pathname })
                }
              >
                on WhatsApp
              </a>
            </>
          )}
          . Everything is already filled in.
        </p>
      )}

      {/* Spec 2 (2026-10-09): the total moves up next to the result title
          and the hand-off follows it right away, so the number and the
          button sit together, the hottest moment on the result. */}
      <div className="ac-total">
        <p className="ac-total-line">
          Together, roughly <strong>{range(res.total)}</strong> back.
        </p>
        <p className="ac-total-note">
          Rough estimate, we&rsquo;ll firm it up together. It comes from a simple rule of thumb on your answers
          (enquiries a week and team size), not from measuring your week.
        </p>
      </div>

      <div className="ac-handoff">
        <NextStepActions
          compact
          temp={temp}
          service="ai"
          waText={handoffText}
          contact="/contact?service=ai#write"
          onActions={topActions}
          placement="result-top"
          warm={
            <div className="ac-actions ac-actions-solo" onClick={topActions}>
              {hasBooking ? (
                <BookingCta className="btn-saffron ac-handoff-btn" label="Book a call about the Roadmap" placement="result-top" />
              ) : hasWhatsApp ? (
                <WhatsAppCta
                  message={prefill}
                  label="Start my AI Roadmap on WhatsApp"
                  className="btn-saffron ac-handoff-btn"
                  placement="result-top"
                />
              ) : (
                <Link to="/contact?service=ai#write" className="btn-saffron ac-handoff-btn">
                  Ask about the Roadmap
                </Link>
              )}
            </div>
          }
        />
        <p className="ac-handoff-note">
          Opens WhatsApp with your result named, so you don&rsquo;t have to explain it again. Free 15-minute call, a
          reply within 24 hours.
        </p>
      </div>

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

      <div className="ac-next-step">
        <h2 className="stage-title ac-next-title">
          Want real numbers instead of rough <span className="stage-serif">ones?</span>
        </h2>
        <p className="stage-lede">
          That is step two, the AI Roadmap: a 60-minute session on how your week really runs, then a short
          written plan with every job ranked by time saved against cost, and a fixed quote for the first build.
        </p>
        <PathStrip current={1} tone="dark" label="Where you are on the path" />
        {/* The Roadmap's price is shown here, on the result, not on /ai
            (2026-10-09): pages carry one "from" price per area. */}
        <p className="ac-price">
          <strong>{inCurrency(ROADMAP.price, currency)}</strong>, {ROADMAP.timeline.toLowerCase()}. The fee is taken
          off your build if you go ahead.
        </p>
        <NextStepActions
          temp={temp}
          service="ai"
          waText={handoffText}
          contact="/contact?service=ai#write"
          onActions={bottomActions}
          placement="result-bottom"
          warm={
            <div className="ac-actions" onClick={bottomActions}>
              {hasBooking ? (
                <>
                  <BookingCta className="btn-saffron" label="Book a call about the Roadmap" placement="result-bottom" />
                  <WhatsAppCta message={prefill} label="Ask on WhatsApp" className="btn-light" placement="result-bottom" />
                </>
              ) : hasWhatsApp ? (
                <>
                  <WhatsAppCta message={prefill} label="Start my AI Roadmap" className="btn-saffron" placement="result-bottom" />
                  <Link to="/ai#prices" className="btn-light">
                    What every build includes
                  </Link>
                </>
              ) : (
                <Link to="/contact?service=ai#write" className="btn-saffron">
                  Ask about the Roadmap
                </Link>
              )}
            </div>
          }
        />
        <p className="ac-guarantee">{site.guarantee}</p>
        <button type="button" className="ac-back ac-restart" onClick={onRestart}>
          Start the check again
        </button>
      </div>
    </m.div>
  )
}
