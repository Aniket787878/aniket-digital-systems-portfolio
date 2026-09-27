import { useRef } from 'react'
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react'
import Icon from '../../components/icons.jsx'
import { Ridge } from '../../components/dusk/Mountains.jsx'
import { ridge, starField } from '../../components/dusk/terrain.js'
import { site, whatsappPrefill } from '../../data.js'
import { hasWhatsApp, whatsappHref } from '../../whatsapp.js'
import { hasBooking, bookingUrl } from '../../booking.js'
import { heroContainer, heroItem } from '../../motion/variants.js'

/* Seeded once: the same range on every visit, and not the home hero's. */
const FAR = ridge({ seed: 37, base: 200, amp: 60, detail: 0.8 })
const NEAR = ridge({ seed: 61, base: 280, amp: 42, detail: 1.1 })
const STARS = starField(50, 23)

/* The ways to reach me, quickest first. Each renders only when it works:
   no booking link, no booking card; no number, no WhatsApp card. The
   first one present is the highlighted route (WhatsApp until a booking
   link exists, the same order the rest of the site uses). */
function routes() {
  const list = []
  if (hasBooking) {
    list.push({
      key: 'call',
      icon: 'calendar',
      title: 'Book a 15-minute call',
      text: 'Pick a time that suits you. We talk it through, no cost and no obligation.',
      cue: 'Pick a time',
      href: bookingUrl,
      external: true
    })
  }
  if (hasWhatsApp) {
    list.push({
      key: 'whatsapp',
      icon: 'whatsapp',
      title: 'Message me on WhatsApp',
      text: 'Say hello and tell me what is going on. Usually the quickest way to reach me.',
      tag: 'Quickest',
      cue: 'Open WhatsApp',
      href: whatsappHref(whatsappPrefill.contact),
      external: true
    })
  }
  list.push({
    key: 'form',
    icon: 'pen',
    title: 'Fill in a short form',
    text: 'Five short questions, if you would rather write it out.',
    cue: 'Go to the form',
    href: '#write'
  })
  list.push({
    key: 'email',
    icon: 'mail',
    title: 'Send an email',
    text: 'Write to me directly, whenever suits you.',
    /* A break point after the @, so a narrow card wraps the address
       there instead of mid-word. */
    cue: (
      <>
        {site.email.split('@')[0]}@<wbr />
        {site.email.split('@')[1]}
      </>
    ),
    href: `mailto:${site.email}`
  })
  return list
}

const ROUTES = routes()

/* ---------------------------------------------------------------
   The contact page's dusk header: the same sky, stars and ridges as
   the home hero and closing band (components/dusk), a warm two-line
   ask, and the ways to reach me as cards resting on the range. The far
   ridge drifts a little on scroll; reduced motion keeps it still.
   --------------------------------------------------------------- */
export default function ContactHero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yFar = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120])
  const yStars = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160])

  return (
    <section className="contact-hero" ref={ref} aria-labelledby="contact-title">
      <div className="dusk-sky dusk-sky-low" aria-hidden="true">
        <m.div className="dusk-stars" style={{ y: yStars }}>
          {STARS.map((s) => (
            <i
              key={s.id}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.r,
                height: s.r,
                opacity: s.o,
                animationDelay: `${s.d}s`
              }}
            />
          ))}
        </m.div>
        <div className="dusk-sun" />
      </div>
      <m.div className="dusk-layer dusk-far" style={{ y: yFar }} aria-hidden="true">
        <Ridge d={FAR} fill="#3a1b0b" />
      </m.div>
      <div className="dusk-layer dusk-near" aria-hidden="true">
        <Ridge d={NEAR} fill="var(--night)" />
      </div>

      <m.div className="container contact-hero-inner" variants={heroContainer} initial="hidden" animate="show">
        {site.availability && (
          <m.p className="glass-pill" variants={heroItem}>
            <span className="status-dot" aria-hidden="true" />
            {site.availability}
          </m.p>
        )}
        <m.h1 className="dusk-title contact-title" id="contact-title" variants={heroItem}>
          Tell me what takes up your week.
          <span className="dusk-title-warm"> I&rsquo;ll tell you straight if I can help.</span>
        </m.h1>
        <m.p className="dusk-sub contact-sub" variants={heroItem}>
          Maybe it is answering the same messages, chasing bookings or
          copying details from one place to another. Pick whichever way to
          reach me is easiest for you.
        </m.p>

        <m.ul
          className="contact-routes"
          variants={heroItem}
          aria-label="Ways to reach me"
          data-count={ROUTES.length}
          style={{ '--routes': ROUTES.length }}
        >
          {ROUTES.map((route, i) => (
            <li key={route.key}>
              <a
                className={`contact-route${i === 0 ? ' is-primary' : ''}`}
                href={route.href}
                {...(route.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
              >
                <span className="contact-route-top">
                  <span className="contact-route-icon" aria-hidden="true">
                    <Icon name={route.icon} size={20} />
                  </span>
                  {route.tag && <span className="contact-route-tag">{route.tag}</span>}
                </span>
                <span className="contact-route-title">{route.title}</span>
                <span className="contact-route-text">{route.text}</span>
                <span className="contact-route-cue">
                  <span>{route.cue}</span>
                  <Icon name="arrow" size={16} />
                </span>
              </a>
            </li>
          ))}
        </m.ul>
      </m.div>
    </section>
  )
}
