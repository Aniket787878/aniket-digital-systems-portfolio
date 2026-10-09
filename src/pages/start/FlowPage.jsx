import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { m } from 'motion/react'
import { budgetBands, carePlan, site, startFlows, whatsappPrefill } from '../../data.js'
import { useDocumentTitle } from '../../useDocumentTitle.js'
import { useCurrency, inCurrency } from '../../currency.js'
import { WEBHOOK_URL } from '../../leadWebhook.js'
import { hasBooking } from '../../booking.js'
import { hasWhatsApp, whatsappHref } from '../../whatsapp.js'
import { track } from '../../analytics.js'
import BookingCta from '../../components/BookingCta.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import PathStrip from '../../components/PathStrip.jsx'
import Icon from '../../components/icons.jsx'
import { Progress, Question, Contact } from '../flow/Steps.jsx'
import { stepIn, EMAIL_OK } from '../flow/shared.js'
import { websiteResult, softwareResult, summary, labelOf, belowStart, INTERNAL_TOOL, PLATFORM } from './rules.js'
import { normalisePhone, planTemp, landingFields } from '../../leadExtras.js'
import { NextStepActions } from '../flow/NextStep.jsx'
import { setResultHandoff, clearResultHandoff } from '../../resultHandoff.js'
import '../service/showcase/stage.css'
import '../AiCheckPage.css'
import './Start.css'

/*
  The free website plan (/start/website) and software plan
  (/start/software): the same engine and look as the free AI check
  (flow/Steps.jsx, AiCheckPage.css), with their own questions
  (startFlows in data.js) and result rules (start/rules.js).

  The answers go through the SAME lead path as the contact form and the
  AI check: POST to /api/lead with the same fields, the answers packed
  into `workflow_broken`, `service` the area's slug ('websites' or
  'software', the values the contact form sends) and the budget band
  they picked. So the live n8n intake files it with no change. Same
  honeypot, same email / WhatsApp fallback if the send fails, and the
  result never waits on the network.
*/

const emptyFor = (flow) =>
  Object.fromEntries(flow.steps.map((s) => [s.id, s.kind === 'many' ? [] : '']))

/* The flow's own address, and its result's: /start/website and
   /start/website/result. The result gets its own URL so a page view
   counts a finished plan (strategy item 11). */
const BASE = { websites: '/start/website', software: '/start/software' }

/* Below the package's starting price? Null when the band is "not sure"
   (or empty), so the temperature can tell "doesn't fit" from "unknown".
   The Custom Platform has no price of its own, so the Internal Tool's
   floor stands in for it: a platform never starts below that. */
function budgetBelow(band, pack) {
  if (!band || band === 'not_sure') return null
  return belowStart(band, pack === PLATFORM ? INTERNAL_TOOL : pack)
}

export default function FlowPage({ flowKey }) {
  const flow = startFlows[flowKey]
  const base = BASE[flowKey]
  const { view } = useParams()
  const navigate = useNavigate()
  const onResultUrl = view === 'result'
  const steps = flow.steps
  const CONTACT = steps.length
  useDocumentTitle(flow.docTitle)
  const currency = useCurrency()
  const [answers, setAnswers] = useState(() => emptyFor(flow))
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [trap, setTrap] = useState('')
  const [res, setRes] = useState(null)
  const [send, setSend] = useState('idle')
  const [text, setText] = useState('')
  const [temp, setTemp] = useState('warm')
  const started = useRef(false)
  /* Set between the submit and the move to the result URL, so the effect
     below does not mistake that one render for the back button. */
  const toResult = useRef(false)
  const inFlight = useRef(false)
  const headRef = useRef(null)
  const resultRef = useRef(null)
  const moved = useRef(false)

  /* Focus follows the step (not on arrival), as on the AI check. */
  useEffect(() => {
    if (!moved.current) return
    const target = res ? resultRef.current : headRef.current
    target?.focus({ preventScroll: true })
    const box = target?.closest('.ac-card, .ac-result')
    if (box && box.getBoundingClientRect().top < 0) box.scrollIntoView({ block: 'start' })
  }, [step, res])

  /* The result URL and the result state move together. A result URL with
     no result in memory (a refresh, a shared link) goes back to the start
     of the plan; leaving the result URL (the browser's back button) goes
     back to the contact step, with every answer still filled in. */
  useEffect(() => {
    if (onResultUrl) {
      toResult.current = false
      if (!res) navigate(base, { replace: true })
    } else if (res && !toResult.current) {
      setRes(null)
      setSend('idle')
    }
  }, [onResultUrl, res, base, navigate])

  /* The budget question's options are the contact form's bands, in the
     visitor's currency. */
  const resolve = (q) => (q.kind === 'budget' ? { ...q, kind: 'one', options: budgetBands[currency] } : q)

  function answer(id, value, many) {
    if (!started.current) {
      started.current = true
      track('flow_start', { service: flow.service })
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
    const current = steps[step]
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
      setError('Add your name and an email address, then see your plan.')
      return
    }

    const outcome = flowKey === 'websites' ? websiteResult(answers) : softwareResult(answers)
    const message = summary(flowKey, answers, outcome, clean.phone)
    const phoneNorm = normalisePhone(clean.phone)
    const leadTemp = planTemp({ budgetBelow: budgetBelow(answers.budget, outcome.pack), when: answers.when, phone: phoneNorm })
    setText(message)
    setTemp(leadTemp)
    moved.current = true
    setError('')
    setRes(outcome)
    toResult.current = true
    navigate(`${base}/result`)

    /* A filled honeypot is a bot: show it the result, send nothing. */
    if (trap) {
      setSend('sent')
      return
    }

    track('flow_submit', { service: flow.service })

    const payload = {
      name: clean.name,
      email: clean.email,
      company: '',
      workflow_broken: message,
      service: flow.service,
      budget_band: answers.budget || 'not_sure',
      source: `${flow.source} · ${document.referrer || 'direct'}`,
      submitted_at: new Date().toISOString(),
      /* The structured fields (leadExtras.js), after the original ones. */
      phone: phoneNorm,
      timing: answers.when ? labelOf(flow, 'when', answers.when) : '',
      package: `${outcome.pack.name} (${inCurrency(outcome.pack.price, currency)})`,
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
      console.error('[StartFlow] Failed to send answers:', err)
      setSend('error')
    } finally {
      inFlight.current = false
    }
  }

  function restart() {
    moved.current = true
    started.current = false
    setAnswers(emptyFor(flow))
    setRes(null)
    setSend('idle')
    setStep(0)
    navigate(base)
  }

  /* /start/website/anything-else is not a page. */
  if (view && !onResultUrl) return <Navigate to={base} replace />

  return (
    <section className="stage ac" aria-labelledby="ac-title">
      <div className="stage-glow ac-glow" aria-hidden="true" />
      <div className="container ac-inner">
        <header className={`ac-head${res ? ' is-result' : step >= 1 ? ' is-compact' : ''}`}>
          <Link to="/start" className="sf-back">
            <span aria-hidden="true">&larr;</span> Website, software or AI
          </Link>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            {flow.pill}
          </p>
          <p className="ac-stakes">{flow.stakes}</p>
          <h1 className={`stage-title ac-title${res || step >= 1 ? ' sr-only-phone' : ''}`} id="ac-title">
            {flow.title[0]}
            <span className="stage-serif">{flow.title[1]}</span>
          </h1>
          <p className="stage-lede ac-lede">{flow.lede}</p>
        </header>

        {res ? (
          <Result
            flowKey={flowKey}
            res={res}
            temp={temp}
            send={send}
            text={text}
            name={name}
            email={email}
            resultRef={resultRef}
            onRestart={restart}
          />
        ) : (
          <div className="stage-glass ac-card">
            <Progress step={step} questions={steps.length} label="Progress through the plan" />
            {step < CONTACT ? (
              <Question
                key={steps[step].id}
                q={resolve(steps[step])}
                value={answers[steps[step].id]}
                onAnswer={answer}
                onNext={onNext}
                onBack={step > 0 ? () => go(step - 1) : null}
                error={error}
                headRef={headRef}
                last={step === CONTACT - 1}
              />
            ) : (
              <Contact
                idPrefix="sf"
                title="Last step: who is the plan for?"
                hint={`Your plan shows on the next screen straight away. I get a copy of your answers too, so I can reply personally. ${site.replyPromise}`}
                submitLabel="See my plan"
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

function Result({ flowKey, res, temp, send, text, name, email, resultRef, onRestart }) {
  const currency = useCurrency()
  const flow = startFlows[flowKey]
  const website = flowKey === 'websites'
  const { pack } = res
  const prefill = (website ? whatsappPrefill.startWebsite : whatsappPrefill.startSoftware).replace('{pkg}', pack.name)
  const label = website ? 'Free website plan' : 'Free software plan'

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`${label}: ${name}`)}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\n${text}`
  )}`
  const waFallback = hasWhatsApp ? whatsappHref(`Hi Aniket, I did the ${label.toLowerCase()} on your site.\n\nName: ${name}\n\n${text}`) : ''

  const onActions = (event) => {
    if (event.target.closest('a')) track('cta_click', { placement: `${flow.source}-result` })
  }
  const handoffText = `Hi Aniket, I just did the ${label.toLowerCase()} on your site.\n\nName: ${name}\n\n${text}`
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
    setResultHandoff({ text: handoffText, label: 'Send my plan on WhatsApp' })
    return clearResultHandoff
  }, [handoffText])

  return (
    <m.div className="ac-result" {...stepIn}>
      <p className="stage-pill stage-mono">
        <span className="stage-dot" aria-hidden="true" />
        Your plan
      </p>
      <h2 className="stage-title ac-result-title" tabIndex={-1} ref={resultRef}>
        Your starting point: the <span className="stage-serif">{pack.name}.</span>
      </h2>
      <p className="ac-headfake">{res.why}</p>

      <p className="ac-send" role="status" aria-live="polite">
        {send === 'sending' && 'Sending a copy of your answers…'}
        {send === 'sent' && `Sent. I have your answers. ${site.replyPromise}`}
      </p>
      {send === 'error' && (
        <p className="ac-error" role="alert">
          Your plan is below, but your answers didn&rsquo;t reach me.{' '}
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

      <div className="stage-glass sf-pack">
        <div className="sf-pack-head">
          <h3 className="ac-job-name sf-pack-name">{pack.name}</h3>
          <p className="sf-pack-price">
            <strong>{inCurrency(pack.price, currency)}</strong>
            <span className="sf-pack-time">{pack.timeline}</span>
          </p>
        </div>
        <p className="ac-job-looks">{pack.deliverable}</p>
        <ul className="sf-list">
          {pack.includes.map((item) => (
            <li key={item}>
              <Icon name="check" size={14} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Spec 2 (2026-10-09): the hand-off sits right under the price, the
          hottest moment on the result. Same temperature logic as the
          repeated block at the bottom, compact so it shows one button. */}
      <div className="ac-handoff">
        <NextStepActions
          compact
          temp={temp}
          service={flowKey}
          waText={handoffText}
          contact={`/contact?service=${flowKey}#write`}
          onActions={topActions}
          warm={
            <div className="ac-actions ac-actions-solo" onClick={topActions}>
              {hasBooking ? (
                <BookingCta className="btn-saffron ac-handoff-btn" label="Book a free call" />
              ) : hasWhatsApp ? (
                <WhatsAppCta message={prefill} label="Book a free call on WhatsApp" className="btn-saffron ac-handoff-btn" />
              ) : (
                <Link to={`/contact?service=${flowKey}#write`} className="btn-saffron ac-handoff-btn">
                  Ask for a free call
                </Link>
              )}
            </div>
          }
        />
        <p className="ac-handoff-note">
          Opens WhatsApp with your plan named, so you don&rsquo;t have to explain it again. Free 15-minute call, a
          reply within 24 hours.
        </p>
      </div>

      {website ? <Covers res={res} /> : <Modules res={res} />}

      {res.notes.length > 0 && (
        <ul className="sf-notes">
          {res.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      <div className="ac-total">
        <p className="ac-total-line">
          A <strong>starting point</strong>, not a quote.
        </p>
        <p className="ac-total-note">
          We&rsquo;ll firm it up on the call. It comes from simple rules on your answers and my fixed package
          prices, not from seeing your business yet.
        </p>
        {/* The package price is shown here, and only here (2026-10-09): the
            service pages carry one "from" price. The Care Plan's price
            follows it for the same reason. */}
        <p className="ac-total-note">
          Once it is live, the {carePlan.name} is optional: {inCurrency(carePlan.price, currency)}.
        </p>
      </div>

      <div className="ac-next-step">
        <h2 className="stage-title ac-next-title">
          Next: a free call about your <span className="stage-serif">answers.</span>
        </h2>
        <p className="stage-lede">
          We go through what you picked, I say straight what it would take, and you get a one-page proposal
          with a fixed price and the date it goes live.
        </p>
        <PathStrip service={flowKey} current={1} tone="dark" label="Where you are on the path" />
        <NextStepActions
          temp={temp}
          service={flowKey}
          waText={handoffText}
          contact={`/contact?service=${flowKey}#write`}
          onActions={bottomActions}
          warm={
            <div className="ac-actions" onClick={bottomActions}>
              {hasBooking ? (
                <>
                  <BookingCta className="btn-saffron" label="Book a free call" />
                  <WhatsAppCta message={prefill} label="Ask on WhatsApp" className="btn-light" />
                </>
              ) : hasWhatsApp ? (
                <>
                  <WhatsAppCta message={prefill} label="Book a free call on WhatsApp" className="btn-saffron" />
                  <Link to={`/${flowKey}#prices`} className="btn-light">
                    What every build includes
                  </Link>
                </>
              ) : (
                <Link to={`/contact?service=${flowKey}#write`} className="btn-saffron">
                  Ask for a free call
                </Link>
              )}
            </div>
          }
        />
        <p className="ac-guarantee">{site.guarantee}</p>
        <button type="button" className="ac-back ac-restart" onClick={onRestart}>
          Start the plan again
        </button>
      </div>
    </m.div>
  )
}

function Covers({ res }) {
  if (!res.covered.length && !res.extra.length) return null
  return (
    <div className="sf-covers">
      {res.covered.length > 0 && (
        <div>
          <h3 className="stage-mono sf-sub">In the package, for your answers</h3>
          <ul className="sf-list sf-list-wide">
            {res.covered.map((n) => (
              <li key={n.id}>
                <Icon name="check" size={14} />
                {n.text}
              </li>
            ))}
          </ul>
        </div>
      )}
      {res.extra.length > 0 && (
        <div>
          <h3 className="stage-mono sf-sub">Also on your list, priced on the call</h3>
          <ul className="sf-list sf-list-wide sf-list-extra">
            {res.extra.map((n) => (
              <li key={n.id}>
                <Icon name="plus" size={14} />
                {n.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Modules({ res }) {
  return (
    <div className="sf-covers">
      <h3 className="stage-mono sf-sub">The first three screens it would likely have</h3>
      <ol className="ac-jobs">
        {res.modules.map((mod, i) => (
          <li key={mod.id} className="stage-glass ac-job">
            <p className="stage-mono ac-job-count">
              <span>{String(i + 1).padStart(2, '0')}</span> / 03
            </p>
            <h4 className="ac-job-name">{mod.name}</h4>
            <p className="ac-job-looks">{mod.looks}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
