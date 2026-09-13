import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/* Scroll offset per history entry, keyed by location.key.

   Deliberately a module-level Map and not sessionStorage. The only thing
   persisting it would buy is surviving a reload, and that is precisely the
   case that must NOT restore: a reload starts a fresh document where every
   first entry is keyed "default", so a stored "default" from the page you
   opened three navigations ago would drag an unrelated page to that offset.
   In memory, a reload starts empty and lands at the top, which is what a
   freshly loaded URL should do. It also means no try/catch around a
   storage API that throws outright in some privacy modes. */
const positions = new Map()

/*
  Scroll position across navigations. Renders nothing.

  BrowserRouter does none of this — only the data routers get
  <ScrollRestoration> — so React swapped the markup and left window.scrollY
  exactly where it was. "View system" from a work card 1867px down the home
  page landed 1867px down the case study, on "The stack, and why". Every
  "Get in touch" landed on the footer of /contact, because /contact is
  shorter than the page you left and the offset clamps to the bottom.

  Forward navigation goes to the top. Back and forward return you to where
  you actually were, which the browser cannot do for us here: it restores
  before React has rendered the taller page, so the offset clamps to nothing
  and the restore is silently lost. Hence keeping the offsets ourselves.

  Three details, each load-bearing:

  - behaviour is "instant" because index.css sets scroll-behavior: smooth on
    <html>. Without the override the browser animates the whole new page
    past the reader on every navigation.

  - the save lives in the cleanup of a *layout* effect, not a passive one.
    Layout cleanup runs before the next layout effect, so it records where
    the reader was standing before the scroll-to-top happens. In a passive
    effect it would run after, and faithfully save zero every time.

  - it keys on location.key, not pathname, so tapping the nav link for the
    page you are already on also returns you to the top. That is a real
    click path — it is what the mobile menu offers.
*/
export default function ScrollToTop() {
  const { key } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    const saved = positions.get(key)
    const top = navigationType === 'POP' && typeof saved === 'number' ? saved : 0
    window.scrollTo({ top, left: 0, behavior: 'instant' })

    return () => {
      positions.set(key, Math.round(window.scrollY))
    }
  }, [key, navigationType])

  return null
}
