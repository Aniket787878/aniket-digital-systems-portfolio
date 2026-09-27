import { useSyncExternalStore } from 'react'

/* Phones and reduced motion get a film's poster, not the film: the product
   films are ~5MB each, which would be most of a phone's first load, and
   screen captures are unreadable at 390px anyway. A media-query store
   rather than CSS, because the point is that the <video> never exists
   there, so nothing is fetched. */
const STILL_QUERY = '(max-width: 640px), (prefers-reduced-motion: reduce)'

const subscribe = (cb) => {
  const mq = window.matchMedia(STILL_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const snapshot = () => window.matchMedia(STILL_QUERY).matches

export const useStillMedia = () => useSyncExternalStore(subscribe, snapshot, () => true)
