import { Routes, Route, useLocation } from 'react-router-dom'
import { MotionConfig, LazyMotion, domAnimation } from 'motion/react'
import ScrollToTop from './components/ScrollToTop.jsx'
import Interactions from './interactions/Interactions.jsx'
import SmoothScroll from './scroll/SmoothScroll.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import ServicePage from './pages/ServicePage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import AiCheckPage from './pages/AiCheckPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ConceptPage from './concepts/ConceptPage.jsx'

export default function App() {
  /* The concept sites (/concepts/*) are other businesses' websites: they
     render full-bleed, without this site's nav, footer and cursor layer. */
  const concept = useLocation().pathname.startsWith('/concepts/')
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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai-check" element={<AiCheckPage />} />
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
      </main>
      {!concept && <Footer />}
    </div>
    </MotionConfig>
    </LazyMotion>
  )
}
