import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

/*
  Counter — counts a numeric value up from zero when it scrolls into view.

  Values here are honest and mixed ("750+", "11", but also "SHA-256", "CSV",
  "0-100"). So it only animates a leading integer and preserves whatever
  suffix follows; anything that doesn't start with a digit renders as-is. Under
  reduced motion, or when there is no number, it simply shows the final value.
*/
export default function Counter({ value, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()

  const match = String(value).match(/^(\d[\d,]*)(.*)$/s)
  const [display, setDisplay] = useState(
    match && !reduce ? `0${match[2] ?? ''}` : String(value)
  )

  useEffect(() => {
    // Only the animation lives here. The static value (no number, or reduced
    // motion) comes from the initial state, so there is no synchronous
    // setState in the effect and no flash of the final number before scroll.
    if (!match || reduce || !inView) return undefined
    const target = parseInt(match[1].replace(/,/g, ''), 10)
    const suffix = match[2] ?? ''
    const duration = 1100
    const start = performance.now()
    let raf = 0
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * target).toLocaleString() + suffix)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, reduce]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
