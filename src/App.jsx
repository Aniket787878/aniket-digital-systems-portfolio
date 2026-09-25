import { Routes, Route } from 'react-router-dom'
import { MotionConfig, LazyMotion, domAnimation } from 'motion/react'
import ScrollToTop from './components/ScrollToTop.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
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
      {/* First focusable element on the page: lets keyboard and screen-reader
          users jump the fixed header straight to the content. Hidden until
          focused (see .skip-link). */}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main className="main" id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </MotionConfig>
    </LazyMotion>
  )
}
