import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { enableInteractions, refreshInteractions } from './controller.js'
import './interactions.css'

/*
  The StringTune interaction layer: mounted once, in App, and renders nothing
  but the cursor ring. Everything else is attributes on the page's own
  elements (attrs.js) that the lazy chunk reads. See CLAUDE.md, "Interaction
  layer", for the rules.
*/
export default function Interactions() {
  const { pathname } = useLocation()

  useEffect(() => enableInteractions(), [])
  useEffect(() => refreshInteractions(), [pathname])

  /* The ring is a StringTune cursor "portal": the library writes its
     position into --x / --y and toggles .-show and .is-* on it while a
     [data-string-cursor-class] element is hovered. React never re-renders
     its className, so those classes are never overwritten.

     It is always mounted, and never swapped for a new node: the library
     collects portals once and keeps a reference to that exact element, so a
     ring that came and went with a media query or a stop/start would leave
     it pointing at a detached node. CSS keeps it display:none unless the
     layer is running for a real mouse on a wide window (interactions.css). */
  return (
    <div className="st-cursor" data-string-cursor="default" data-string-cursor-lerp="0.5" aria-hidden="true">
      <span className="st-cursor-ring" />
    </div>
  )
}
