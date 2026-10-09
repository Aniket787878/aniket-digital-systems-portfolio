import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { MotionConfig, LazyMotion, domAnimation } from 'motion/react'
import ScrollToTop from './components/ScrollToTop.jsx'
import Interactions from './interactions/Interactions.jsx'
import SmoothScroll from './scroll/SmoothScroll.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
// Home stays eager: it's the main landing page, almost every visit touches it.
import HomePage from './pages/HomePage.jsx'

/* Every other route is a separate chunk (React.lazy), so a visitor landing
   on one page never downloads/parses the other ten. Route behaviour
   (paths, keys, redirects, scroll restoration, analytics) is unchanged;
   only *when* each page's code loads is different. */
const ServicePage = lazy(() => import('./pages/ServicePage.jsx'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const AiCheckPage = lazy(() => import('./pages/AiCheckPage.jsx'))
const StartPage = lazy(() => import('./pages/start/StartPage.jsx'))
const FlowPage = lazy(() => import('./pages/start/FlowPage.jsx'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))
const ConceptPage = lazy(() => import('./concepts/ConceptPage.jsx'))

/* Suspense fallback: just the page background at full viewport height, so
   there's no spinner and nav/footer (rendered outside <Routes>, untouched by
   this) never shift. */
function RouteFallback() {
  return <div aria-hidden="true" style={{ minHeight: '100vh' }} />
}

/* Idle-time prefetch of the two routes most visits reach next from home
   ("Get started" -> /start, and the service pages), so the chunk is already
   cached by the time the visitor clicks. Never blocks the initial render. */
function usePrefetchLikelyNextRoute() {
  useEffect(() => {
    let cancelled = false
    const run = () => {
      if (cancelled) return
      import('./pages/ServicePage.jsx')
      import('./pages/start/StartPage.jsx')
    }
    const id =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(run, { timeout: 2500 })
        : window.setTimeout(run, 400)
    return () => {
      cancelled = true
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(id)
      window.clearTimeout(id)
    }
  }, [])
}

export default function App() {
  /* The concept sites (/concepts/*) are other businesses' websites: they
     render full-bleed, without this site's nav, footer and cursor layer. */
  const concept = useLocation().pathname.startsWith('/concepts/')
  usePrefetchLikelyNextRoute()
  return (
    /* LazyMotion + the lightweight `m` component load only the `domAnimation`
       feature set (animations, variants, gestures, whileInView), which is
       roughly half the weight of importing the full `motion` component — and
       `strict` makes a stray `motion.*` fail loudly rather than silently pull
       the whole bundle back in.

       reducedMotion="user" makes every animation respect the OS "reduce
       motion" setting: movement is dropped and only the end state shows. One
       switch that keeps the new animations accessible without per-component
       guards. */
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
    <div className="app">
      {/* Renders nothing. Resets the scroll offset that BrowserRouter
          carries across navigations. */}
      <ScrollToTop />
      {/* Renders nothing. Smooth wheel scrolling (src/scroll), site-wide,
          the concept sites included; Lenis is a lazy chunk fetched after
          first paint. */}
      <SmoothScroll />
      {/* The StringTune layer (src/interactions). Renders only the cursor ring;
          the library itself is a lazy chunk fetched after first paint. */}
      {!concept && <Interactions />}
      {/* First focusable element on the page: lets keyboard and screen-reader
          users jump the fixed header straight to the content. Hidden until
          focused (see .skip-link). */}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!concept && <Nav />}
      <main className="main" id="main" tabIndex={-1}>
        {/* The three service routes are keyed so moving between them remounts
            the page. StringSplit rewrites a heading's innerHTML into word
            spans; if React reused that heading for another area's text it
            would update a text node that is no longer in the document. */}
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ai-check/:view?" element={<AiCheckPage />} />
            {/* "Get started": what do you want to build? Each choice has its
                own free plan; AI's is the existing check. The plans are keyed
                so moving between them starts fresh. */}
            <Route path="/start" element={<StartPage />} />
            <Route path="/start/website/:view?" element={<FlowPage key="websites" flowKey="websites" />} />
            <Route path="/start/software/:view?" element={<FlowPage key="software" flowKey="software" />} />
            <Route path="/start/ai" element={<Navigate to="/ai-check" replace />} />
            <Route path="/websites" element={<ServicePage key="websites" slug="websites" />} />
            <Route path="/software" element={<ServicePage key="software" slug="software" />} />
            <Route path="/ai" element={<ServicePage key="ai" slug="ai" />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/concepts/:slug" element={<ConceptPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {!concept && <Footer />}
    </div>
    </MotionConfig>
    </LazyMotion>
  )
}
