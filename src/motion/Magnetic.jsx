import { useRef } from 'react'
import { m, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

/*
  Magnetic — the wrapped element eases a little toward the cursor while it is
  hovered, then springs back on leave. Used sparingly on the primary CTAs to
  make the highest-intent clicks feel tactile.

  Transform-only (springs on x/y), so it stays on the compositor. Disabled
  entirely under reduced motion and left inert on touch (no pointer to chase).
*/
export default function Magnetic({ children, strength = 0.35, className }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 })

  function onMove(e) {
    if (reduce || e.pointerType === 'touch') return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  function onLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <m.span
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-flex' }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </m.span>
  )
}
