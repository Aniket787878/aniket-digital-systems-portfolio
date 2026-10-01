import { useEffect, useState, useSyncExternalStore } from 'react'

/* Desktop layout (tilted window, pinned bands, the stream of light). */
const WIDE = '(min-width: 1024px)'
const subscribeWide = (cb) => {
  const mq = window.matchMedia(WIDE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
export const useWide = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => true
  )

/* A looping clock in ms. Runs only while `running`; resumes where it
   stopped, so scrolling away and back never skips a step. */
export function useLoopClock(running, total) {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!running) return undefined
    let raf
    let last = performance.now()
    const frame = (now) => {
      const dt = Math.min(100, now - last)
      last = now
      setT((v) => (v + dt) % total)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [running, total])
  return t
}

/* True while the tab is visible: no animation frames for a hidden tab. */
export function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  useEffect(() => {
    const on = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return visible
}
