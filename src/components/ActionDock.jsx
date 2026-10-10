import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { whatsappPrefill, projects } from '../data.js'
import { hasWhatsApp } from '../whatsapp.js'
import WhatsAppCta from './WhatsAppCta.jsx'
import { usePrimaryInView } from '../usePrimaryInView.js'
import { subscribeResultHandoff, getResultHandoff } from '../resultHandoff.js'
import { track } from '../analytics.js'
import './ActionDock.css'

/* ------------------------------------------------------------------
   Spec 1 (mobile-2026-10-09/specialist/proposal.md): the thumb-zone
   action dock. A floating pill at the bottom of the screen, phones
   only, pairing "Free call" (WhatsApp) with the page's own next step —
   so there is always a way to get in touch within thumb's reach, not
   only at the top and bottom of each page.

   It steps aside whenever a page's own primary or WhatsApp button is
   already on screen (usePrimaryInView.js, shared with Nav.jsx, which
   hides its own "Get started" at the same moment — one saffron button
   visible at a time, on a phone as everywhere else).
   ------------------------------------------------------------------ */

const PAGE_NAMES = {
  '/': 'Home',
  '/websites': 'Websites',
  '/software': 'Software',
  '/ai': 'AI',
  '/projects': 'Projects',
  '/about': 'About'
}

function pageName(pathname) {
  if (PAGE_NAMES[pathname]) return PAGE_NAMES[pathname]
  if (pathname.startsWith('/projects/')) {
    const project = projects.find((p) => p.slug === pathname.split('/')[2])
    if (project) return project.title
  }
  return 'Home'
}

/* Known page shapes, so an unmatched path (a 404) never shows the
   dock. */
const KNOWN = [
  /^\/$/,
  /^\/websites$/,
  /^\/software$/,
  /^\/ai$/,
  /^\/projects$/,
  /^\/projects\/[^/]+$/,
  /^\/about$/,
  /^\/contact$/,
  /^\/privacy$/,
  /^\/start$/,
  /^\/start\/(website|software)(\/.*)?$/,
  /^\/ai-check(\/.*)?$/
]

function routeInfo(pathname) {
  if (!KNOWN.some((re) => re.test(pathname))) return { excluded: true }
  if (pathname === '/contact' || pathname === '/privacy' || pathname === '/start') return { excluded: true }

  const result = pathname === '/start/website/result' || pathname === '/start/software/result' || pathname === '/ai-check/result'
  const flowStep = !result && (pathname.startsWith('/start/') || pathname === '/ai-check' || pathname.startsWith('/ai-check/'))
  if (flowStep) return { excluded: true }
  if (result) return { excluded: false, result: true }

  if (pathname === '/websites') return { excluded: false, label: 'Plan your website →', to: '/start/website' }
  if (pathname === '/software') return { excluded: false, label: 'Plan your software →', to: '/start/software' }
  if (pathname === '/ai') return { excluded: false, label: 'Free AI check →', to: '/ai-check' }
  return { excluded: false, label: 'See what it costs →', to: '/start' }
}

function useIsPhone() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 760)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const on = () => setPhone(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
}

export default function ActionDock() {
  const { pathname } = useLocation()
  const isPhone = useIsPhone()
  const primaryInView = usePrimaryInView()
  const handoff = useSyncExternalStore(subscribeResultHandoff, getResultHandoff, () => null)
  const [pastHero, setPastHero] = useState(false)
  const [fieldFocused, setFieldFocused] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 0.6 * window.innerHeight)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  useEffect(() => {
    const isField = (el) => el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
    const onFocusIn = (e) => isField(e.target) && setFieldFocused(true)
    const onFocusOut = (e) => isField(e.target) && setFieldFocused(false)
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('focusout', onFocusOut)
    return () => {
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return undefined
    const onResize = () => setKeyboardOpen(vv.height < 0.75 * window.innerHeight)
    onResize()
    vv.addEventListener('resize', onResize)
    return () => vv.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onMenu = () => setMenuOpen(document.documentElement.classList.contains('nav-menu-open'))
    onMenu()
    window.addEventListener('navmenu', onMenu)
    return () => window.removeEventListener('navmenu', onMenu)
  }, [])

  const info = routeInfo(pathname)
  const shown =
    isPhone && !info.excluded && pastHero && !primaryInView && !fieldFocused && !keyboardOpen && !menuOpen && hasWhatsApp

  useEffect(() => {
    document.body.classList.toggle('has-dock', shown)
    return () => document.body.classList.remove('has-dock')
  }, [shown])

  // Never rendered at all on desktop. On phones it stays mounted so the
  // exit transition can play when a route or scroll position makes it
  // ineligible; data-state plus CSS (ActionDock.css) does the rest.
  if (!isPhone) return null

  const onClick = (event) => {
    const a = event.target.closest('a')
    if (!a) return
    track('dock_click', { action: a.href.includes('wa.me') ? 'whatsapp' : 'next', path: pathname })
  }

  return (
    <nav
      className="action-dock"
      aria-label="Quick actions"
      data-state={shown ? 'shown' : 'hidden'}
      onClick={onClick}
      {...(shown ? {} : { inert: '' })}
    >
      {info.result ? (
        <WhatsAppCta
          message={handoff?.text || whatsappPrefill.audit}
          label={handoff?.label || 'Send my plan on WhatsApp'}
          className="btn-saffron dock-solo"
          placement="dock"
        />
      ) : (
        <>
          <WhatsAppCta
            message={whatsappPrefill.dock.replace('{page}', pageName(pathname))}
            label="Free call"
            className="dock-call"
            placement="dock"
          />
          {info.label && (
            <Link to={info.to} className="btn-saffron dock-next">
              {info.label.replace(' →', '')}
              <span className="btn-pill-icon" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          )}
        </>
      )}
    </nav>
  )
}

