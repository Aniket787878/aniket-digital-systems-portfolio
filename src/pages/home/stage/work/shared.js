import { useSyncExternalStore } from 'react'

/* Shared by StageWork, Doors and Questions: the Stage ease, the
   "arrive out of focus and settle" reveal, and a media-query hook. */

export const EASE = [0.22, 1, 0.36, 1]

/* Props for an element that arrives blurred and settles. Under reduced
   motion it is simply there: MotionConfig would drop the rise but still
   fade and unblur, which is movement the visitor asked not to see. */
export function settle(reduce, delay = 0) {
  if (reduce) return {}
  return {
    initial: { opacity: 0, y: 12, filter: 'blur(10px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true, margin: '0px 0px -10% 0px' },
    transition: { duration: 0.8, ease: EASE, delay }
  }
}

export function useMedia(query) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

/* The first sentence of a longer string: used to shorten copy without
   rewording it. */
export const firstSentence = (s) => s.split(/(?<=[.?!])\s+/)[0]
