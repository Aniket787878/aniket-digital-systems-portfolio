import { useEffect, useRef, useState } from 'react'
import { m, useReducedMotion, useScroll } from 'motion/react'
import './stream.css'

/* This section's segment of the saffron stream of light: a straight 1px
   line in the left gutter (x = --stream-x) from the section's top edge to
   its bottom edge, so it joins the segments above and below. It draws
   itself as the section scrolls through the middle of the screen.

   The viewBox is sized to the section in real pixels (not stretched with
   preserveAspectRatio="none"), so the stroke and its glow stay 1px and
   pathLength maps to the true length. Hidden under 1024px by CSS. */
export default function Stream({ target }) {
  const reduce = useReducedMotion()
  const svgRef = useRef(null)
  const [h, setH] = useState(1000)
  const { scrollYProgress } = useScroll({ target, offset: ['start 60%', 'end 60%'] })

  useEffect(() => {
    const el = svgRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(([entry]) => setH(Math.max(1, Math.round(entry.contentRect.height))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <svg ref={svgRef} className="sw-stream" viewBox={`0 0 8 ${h}`} aria-hidden="true" focusable="false">
      <m.path className="sw-stream-lit" d={`M4 0V${h}`} style={{ pathLength: reduce ? 1 : scrollYProgress }} />
    </svg>
  )
}
