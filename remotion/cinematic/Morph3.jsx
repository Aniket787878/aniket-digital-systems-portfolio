import { S, Pointer as StagePointer } from '../explainers/stageLook.jsx'
import { spr, SPRING, ramp, EASE, arriveT, leaveT, cl, lerp } from './motion3.js'

/*
  One shape, never cut (shot list T3). A MorphPill is one rounded box that
  moves between states: centre, size, corner radius, fill and line colour.
  Each change is a spring (or an eased ramp, for floods). The leading edge
  in the direction of travel rides the stiff `lead` spring and the trailing
  edge the softer `trail` one, so the shape stretches as it moves and
  catches up. The content swaps inside the shape with its own short blur
  and rise, laid out at the target size so text never reflows mid-move.

  states: [{ at, x, y, w, h, r, fill, line, glow, o, content, ease }]
    x, y   centre (frame px); r corner radius (capped at half the short side)
    fill / line  [r, g, b, a]
    ease   { dur, curve } to use a ramp instead of springs (floods)
*/

export const COL = {
  saffron: [245, 135, 30, 1],
  night: [20, 20, 22, 1],
  glass: [28, 27, 29, 0.96],
  out: [58, 38, 22, 0.98], // the business's reply: a warm dark tint, opaque so it reads over anything
  paper: [245, 243, 239, 1],
  card: [255, 255, 255, 1],
  tint: [251, 230, 210, 1],
  none: [0, 0, 0, 0],
  lineDim: [255, 255, 255, 0.13],
  lineSaff: [245, 135, 30, 0.55],
  linePaper: [22, 20, 18, 0.12],
}
const rgba = (c) => `rgba(${c[0].toFixed(0)},${c[1].toFixed(0)},${c[2].toFixed(0)},${cl(c[3]).toFixed(3)})`

const DEF = { r: 999, fill: COL.night, line: COL.lineDim, glow: 0, o: 1 }

export function pillAt(f, states) {
  const s0 = { ...DEF, ...states[0] }
  let L = s0.x - s0.w / 2
  let R = s0.x + s0.w / 2
  let T = s0.y - s0.h / 2
  let B = s0.y + s0.h / 2
  let r = s0.r
  let fill = [...s0.fill]
  let line = [...s0.line]
  let glow = s0.glow
  let o = s0.o
  let idx = 0
  let prev = s0
  for (let i = 1; i < states.length; i++) {
    const s = { ...DEF, ...prev, content: undefined, ease: undefined, ...states[i] }
    if (f >= s.at) idx = i
    let pL, pR, pT, pB, pX
    if (s.ease) {
      const p = ramp(f, s.at, s.ease.dur, s.ease.curve || EASE.flood)
      pL = pR = pT = pB = pX = p
    } else {
      const dx = s.x - prev.x
      const dy = s.y - prev.y
      const lead = spr(f, s.at, SPRING.lead)
      const trail = spr(f, s.at, SPRING.trail)
      const set = spr(f, s.at, SPRING.settle)
      pL = Math.abs(dx) < 2 ? set : dx < 0 ? lead : trail
      pR = Math.abs(dx) < 2 ? set : dx > 0 ? lead : trail
      pT = Math.abs(dy) < 2 ? set : dy < 0 ? lead : trail
      pB = Math.abs(dy) < 2 ? set : dy > 0 ? lead : trail
      pX = set
    }
    L += (s.x - s.w / 2 - (prev.x - prev.w / 2)) * pL
    R += (s.x + s.w / 2 - (prev.x + prev.w / 2)) * pR
    T += (s.y - s.h / 2 - (prev.y - prev.h / 2)) * pT
    B += (s.y + s.h / 2 - (prev.y + prev.h / 2)) * pB
    r += (Math.min(s.r, 4000) - Math.min(prev.r, 4000)) * pX
    for (let k = 0; k < 4; k++) {
      fill[k] += (s.fill[k] - prev.fill[k]) * pX
      line[k] += (s.line[k] - prev.line[k]) * pX
    }
    glow += (s.glow - prev.glow) * pX
    o += (s.o - prev.o) * pX
    prev = s
  }
  return { L, R, T, B, r, fill, line, glow, o, idx }
}

export function MorphPill({ f, states, z = 20, contentFade = 12, shadow = true, children }) {
  const g = pillAt(f, states)
  if (g.o <= 0.002) return null
  const w = Math.max(0, g.R - g.L)
  const h = Math.max(0, g.B - g.T)
  const rad = Math.min(g.r, w / 2, h / 2)
  const cur = states[g.idx]
  const prevS = g.idx > 0 ? states[g.idx - 1] : null
  const inT = arriveT(f, cur.at + 2, contentFade)
  const outT = prevS ? leaveT(f, cur.at, 7) : 1
  const layer = (s, a, key) => {
    if (!s || !s.content || a <= 0.001) return null
    const sw = s.cw ?? s.w
    const sh = s.ch ?? s.h
    return (
      <div
        key={key}
        style={{
          position: 'absolute',
          left: w / 2 - sw / 2,
          top: h / 2 - sh / 2,
          width: sw,
          height: sh,
          opacity: a,
          filter: a < 0.98 ? `blur(${((1 - a) * 6).toFixed(2)}px)` : undefined,
          transform: `translateY(${((1 - a) * 10).toFixed(2)}px)`,
        }}
      >
        {s.content}
      </div>
    )
  }
  // the previous content stays only until it has wiped out
  const showPrev = prevS && prevS.content && outT < 1 && prevS.content !== cur.content
  return (
    <div
      style={{
        position: 'absolute',
        left: g.L,
        top: g.T,
        width: w,
        height: h,
        borderRadius: rad,
        background: rgba(g.fill),
        boxShadow: [
          `inset 0 0 0 1.5px ${rgba(g.line)}`,
          shadow ? '0 30px 80px -24px rgba(0,0,0,0.6)' : null,
          g.glow > 0.01 ? `0 0 ${(60 * g.glow).toFixed(1)}px rgba(245,135,30,${(0.45 * g.glow).toFixed(3)})` : null,
        ]
          .filter(Boolean)
          .join(', '),
        overflow: 'hidden',
        opacity: cl(g.o),
        zIndex: z,
      }}
    >
      {showPrev && layer(prevS, 1 - outT, 'p')}
      {layer(cur, cur.content === prevS?.content ? 1 : inT, 'c')}
      {children && children(g, { w, h })}
    </div>
  )
}

/* A loader ring and a check, for the pill's busy and done states. */
export function Spinner({ f, size = 40, color = S.onSaffron }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: `rotate(${(f * 14) % 360}deg)` }}>
      <circle cx="20" cy="20" r="15" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="4" />
      <path d="M20 5 A15 15 0 0 1 35 20" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
export function Check({ f, at, size = 44, color = S.onSaffron, stroke = 4.5 }) {
  const p = ramp(f, at, 12, EASE.arrive)
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <path d="M10 23 L19 31 L34 14" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${p.toFixed(3)} 1`} />
    </svg>
  )
}

/* The oversized pointer: travels on the glide curve, then a click pulse. */
export function Pointer3({ f, from, to, moveAt, moveDur = 24, clickAt, inAt, outAt, size = 1.7 }) {
  const t = ramp(f, moveAt, moveDur, EASE.glide)
  const x = lerp(from.x, to.x, t)
  const y = lerp(from.y, to.y, t)
  const o = arriveT(f, inAt ?? moveAt - 10, 10) * (outAt == null ? 1 : 1 - leaveT(f, outAt, 8))
  const press = clickAt == null ? 0 : ramp(f, clickAt - 3, 3) * (1 - ramp(f, clickAt + 2, 6))
  const ring = clickAt == null ? 0 : f >= clickAt ? ramp(f, clickAt, 18, EASE.arrive) : 0
  return <StagePointer x={x} y={y} press={press} ring={ring} opacity={o} size={size} />
}
