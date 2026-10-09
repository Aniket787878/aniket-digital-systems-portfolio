import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { enableSmoothScroll, refreshSmooth } from './smooth.js'

/*
  Mounted once, in App. Renders nothing: starts the smooth-scroll layer
  (smooth.js decides whether and when) and re-measures the page after each
  route change, once the new page has laid out. The jump to the top on a
  route change is ScrollToTop's job, which calls jumpTo().
*/
export default function SmoothScroll() {
  const { pathname } = useLocation()
  useEffect(() => enableSmoothScroll(), [])
  useEffect(() => refreshSmooth(), [pathname])
  return null
}
