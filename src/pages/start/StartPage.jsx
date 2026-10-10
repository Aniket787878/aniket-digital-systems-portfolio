import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { services, startChoices, whatsappPrefill } from '../../data.js'
import { useDocumentTitle } from '../../useDocumentTitle.js'
import { useCurrency, inCurrency } from '../../currency.js'
import { bookingUrl, hasBooking } from '../../booking.js'
import { hasWhatsApp, whatsappHref } from '../../whatsapp.js'
import { track } from '../../analytics.js'
import Icon from '../../components/icons.jsx'
import '../service/showcase/stage.css'
import '../AiCheckPage.css'
import './Start.css'

/*
  /start: "What do you want to build?" The site's one primary button
  ("Get started") lands here. Three equal choices, each to its own free
  plan: the website plan, the software plan, or the AI check. Each card's
  line and starting price are the area's own `promise` and `from` in
  data.js. For the visitor who does not know yet, a quiet link to the AI
  check; for the one who would rather talk, the call.
*/

const EASE = [0.22, 1, 0.36, 1]
const group = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }
const rise = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
}

export default function StartPage() {
  useDocumentTitle('Get started · Aniket')
  const currency = useCurrency()
  const choices = startChoices.map((c) => ({ ...c, area: services.find((s) => s.slug === c.slug) }))

  /* The call: the booking link once it exists, else WhatsApp, else the
     contact page (the same order as TalkCta). */
  const talk = hasBooking
    ? { href: bookingUrl, label: 'Book a free call' }
    : hasWhatsApp
      ? { href: whatsappHref(whatsappPrefill.start), label: 'Book a free call on WhatsApp' }
      : null

  return (
    <section className="stage ac st" aria-labelledby="st-title">
      <div className="stage-glow ac-glow" aria-hidden="true" />
      <m.div className="container st-inner" variants={group} initial="hidden" animate="show">
        <m.header className="ac-head st-head" variants={rise}>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            Get started · free · about 3 minutes
          </p>
          <h1 className="stage-title ac-title st-title" id="st-title">
            What do you want to <span className="stage-serif">build?</span>
          </h1>
          <p className="stage-lede ac-lede">
            Pick one. Each has a few plain questions of its own, and you see on the spot what fits, what it
            starts at and the next step.
          </p>
        </m.header>

        <ul className="st-choices">
          {choices.map(({ slug, to, label, area }) => (
            <m.li key={slug} variants={rise}>
              <Link to={to} className="stage-glass st-choice" onClick={() => track('start_choose', { choice: slug })}>
                <span className="st-icon" aria-hidden="true">
                  <Icon name={area.icon} size={20} />
                </span>
                <span className="st-name">{area.name}</span>
                <span className="st-line">{area.promise}</span>
                <span className="st-from">From {inCurrency(area.from, currency)}</span>
                <span className="st-cue">
                  {label}
                  <Icon name="arrow" size={16} />
                </span>
              </Link>
            </m.li>
          ))}
        </ul>

        <m.div className="st-quiet" variants={rise}>
          <p>
            Not sure which?{' '}
            <Link to="/ai-check" className="u-link" onClick={() => track('start_choose', { choice: 'not-sure' })}>
              Start with the free AI check
            </Link>
            . It shows where your week loses the most time.
          </p>
          <p>
            Prefer to just talk?{' '}
            {talk ? (
              <a
                className="u-link"
                href={talk.href}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => {
                  track('start_choose', { choice: 'talk' })
                  track('talk_click', {
                    channel: hasBooking ? 'booking' : 'whatsapp',
                    placement: 'start',
                    path: window.location.pathname
                  })
                }}
              >
                {talk.label}
              </a>
            ) : (
              <Link className="u-link" to="/contact" onClick={() => track('start_choose', { choice: 'talk' })}>
                Send a message
              </Link>
            )}
            {hasBooking && hasWhatsApp && (
              <>
                {' '}or{' '}
                <a
                  className="u-link"
                  href={whatsappHref(whatsappPrefill.start)}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() =>
                    track('talk_click', { channel: 'whatsapp', placement: 'start', path: window.location.pathname })
                  }
                >
                  message me on WhatsApp
                </a>
              </>
            )}
            .
          </p>
        </m.div>
      </m.div>
    </section>
  )
}
