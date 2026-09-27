import { useMemo } from 'react'
import { interpolate } from 'remotion'
import { C, SANS, clamp, pop, rise, tween, easeInOut } from './shared.jsx'
import { Icon } from './icons.jsx'

/*
  An n8n-style flow: rounded node cards joined by curved wires. Wires draw
  on (stroke-dashoffset), then a glowing saffron pulse runs along each one
  in turn and the node it reaches lights up. Everything is in canvas px, so
  the caller lays the graph out per aspect ratio.

  node  { id, x, y, w, h, label, sub, icon, appear, lit, layout: 'row' | 'stack' }
        (x, y) is the centre; `appear` and `lit` are frames.
  edge  { from, to, fp, tp, show, run, dur }
        fp/tp are the ports ('l' 'r' 't' 'b'); `show` draws the neutral wire,
        `run` is when the pulse leaves and `dur` how long it takes.
*/

const NORMAL = { l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1] }

export function port(n, side) {
  const [nx, ny] = NORMAL[side]
  return { x: n.x + (nx * n.w) / 2, y: n.y + (ny * n.h) / 2, nx, ny }
}

function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ]
}

/* Geometry for one wire: the path, its length and a lookup from arc length
   to point, so the pulse moves at an even speed along the curve. */
export function wireGeometry(a, b, bend) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const k = bend ?? Math.max(50, Math.min(280, dist * 0.45))
  const p0 = [a.x, a.y]
  const p1 = [a.x + a.nx * k, a.y + a.ny * k]
  const p2 = [b.x + b.nx * k, b.y + b.ny * k]
  const p3 = [b.x, b.y]
  const N = 80
  const pts = []
  const cum = [0]
  for (let i = 0; i <= N; i++) {
    pts.push(cubic(p0, p1, p2, p3, i / N))
    if (i > 0) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  }
  const len = cum[N]
  const at = (s) => {
    const target = Math.max(0, Math.min(len, s))
    let i = 1
    while (i < N && cum[i] < target) i++
    const seg = cum[i] - cum[i - 1] || 1
    const f = (target - cum[i - 1]) / seg
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]
  }
  const d = `M ${p0[0]} ${p0[1]} C ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`
  return { d, len, at, p0, p3 }
}

export function Wire({ geo, frame, show = 0, run, dur = 24, idle = false, idleEvery = 54, dark = false, uid }) {
  const showP = tween(frame, show, show + 22, easeInOut)
  const runP = run == null ? 0 : tween(frame, run, run + dur, easeInOut)
  const { d, len, at } = geo
  const track = dark ? 'rgba(242,240,237,0.22)' : '#d5ccc0'
  const pulses = []
  if (run != null && runP > 0 && runP < 1) pulses.push({ s: runP * len, o: 1, big: true })
  // After a wire has run once, a smaller pulse keeps travelling along it, so
  // a held frame still reads as "this is running".
  if (idle && run != null && frame > run + dur + 6) {
    const t = ((frame - run - dur - 6) % idleEvery) / idleEvery
    const s = easeInOut(t) * len
    pulses.push({ s, o: Math.sin(t * Math.PI), big: false })
  }
  if (showP <= 0) return null
  return (
    <g>
      <path d={d} fill="none" stroke={track} strokeWidth={3} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - showP)} />
      {runP > 0 && (
        <>
          <path d={d} fill="none" stroke={C.accent} strokeWidth={10} strokeOpacity={0.18} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - runP)} filter={`url(#glow-${uid})`} />
          <path d={d} fill="none" stroke={C.accent} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - runP)} />
        </>
      )}
      {pulses.map((p, i) => {
        const [x, y] = at(p.s)
        const tail = p.big ? 90 : 60
        return (
          <g key={i} opacity={p.o}>
            <path
              d={d}
              fill="none"
              stroke={p.big ? '#ffd2a6' : C.accent}
              strokeWidth={p.big ? 6 : 4}
              strokeLinecap="round"
              strokeDasharray={`${tail} ${len + tail}`}
              strokeDashoffset={-(p.s - tail)}
              opacity={0.85}
            />
            <circle cx={x} cy={y} r={p.big ? 22 : 14} fill={C.accent} opacity={0.35} filter={`url(#glow-${uid})`} />
            <circle cx={x} cy={y} r={p.big ? 8 : 5.5} fill="#fff" stroke={C.accent} strokeWidth={3} />
          </g>
        )
      })}
    </g>
  )
}

export function FlowNode({ n, frame, dark = false }) {
  const a = n.appear == null ? 1 : pop(frame, n.appear)
  const fadeA = n.appear == null ? 1 : rise(frame, n.appear)
  const l = n.lit == null ? 0 : rise(frame, n.lit, { stiffness: 140 })
  const stack = n.layout === 'stack'
  const iconBox = n.iconBox ?? (stack ? 60 : 66)
  const bg = dark ? C.surface : C.card
  const line = dark ? C.lineStrong : C.cardLine
  const litBorder = `rgba(245,135,30,${0.35 + 0.55 * l})`
  const sub = n.subLit && l > 0.02 ? n.subLit : n.sub
  return (
    <div
      style={{
        position: 'absolute',
        left: n.x - n.w / 2,
        top: n.y - n.h / 2,
        width: n.w,
        height: n.h,
        boxSizing: 'border-box',
        borderRadius: n.radius ?? 22,
        background: bg,
        border: `1.5px solid ${l > 0.01 ? litBorder : line}`,
        boxShadow: `0 0 0 ${(8 * l).toFixed(2)}px rgba(245,135,30,${(0.14 * l).toFixed(3)}), 0 ${dark ? 24 : 18}px ${dark ? 60 : 44}px rgba(22,20,18,${dark ? 0.4 : 0.09}), 0 1px 2px rgba(22,20,18,0.06)`,
        display: 'flex',
        flexDirection: stack ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: stack ? 'center' : 'flex-start',
        gap: stack ? 14 : 20,
        padding: stack ? '0 14px' : '0 24px',
        fontFamily: SANS,
        opacity: Math.min(1, fadeA * 1.4) * (n.fade ?? 1),
        transform: `scale(${(0.86 + 0.14 * a).toFixed(4)})`,
        filter: fadeA < 0.98 ? `blur(${((1 - fadeA) * 10).toFixed(2)}px)` : undefined,
      }}
    >
      <div
        style={{
          width: iconBox,
          height: iconBox,
          borderRadius: iconBox * 0.26,
          flex: 'none',
          display: 'grid',
          placeItems: 'center',
          background: l > 0.5 ? C.accent : dark ? 'rgba(245,135,30,0.14)' : C.tint,
          color: l > 0.5 ? '#fff' : dark ? C.peach : C.accentDeep,
          boxShadow: l > 0.5 ? `0 8px 22px rgba(245,135,30,${0.35 * l})` : 'none',
        }}
      >
        <Icon name={n.icon} size={iconBox * 0.5} stroke={2} />
      </div>
      <div style={{ minWidth: 0, textAlign: stack ? 'center' : 'left' }}>
        <div style={{ fontSize: n.labelSize ?? 30, fontWeight: 500, letterSpacing: '-0.025em', color: dark ? C.ink : C.inkDark, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{n.label}</div>
        {sub && (
          <div
            style={{
              marginTop: 6,
              fontSize: n.subSize ?? 26,
              fontWeight: 500,
              letterSpacing: '-0.015em',
              color: l > 0.02 && n.subLit ? (dark ? C.peach : C.accentDeep) : dark ? C.muted : C.mutedDark,
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              opacity: n.subLit ? interpolate(l, [0, 0.4], [0.9, 1], clamp) : 1,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {/* the success tick, n8n style */}
      <div
        style={{
          position: 'absolute',
          right: -13,
          top: -13,
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: C.accent,
          border: `3px solid ${dark ? C.bg : C.paper}`,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          opacity: l,
          transform: `scale(${(0.4 + 0.6 * l).toFixed(3)})`,
        }}
      >
        <Icon name="check" size={18} stroke={3} />
      </div>
    </div>
  )
}

export function FlowGraph({ nodes, edges, frame, width, height, idle = true, dark = false, uid = 'fg', children, style }) {
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes])
  const geos = useMemo(
    () => edges.map((e) => wireGeometry(port(byId[e.from], e.fp || 'r'), port(byId[e.to], e.tp || 'l'), e.bend)),
    [edges, byId]
  )
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width, height, ...style }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {edges.map((e, i) => (
          <Wire key={i} geo={geos[i]} frame={frame} show={e.show} run={e.run} dur={e.dur} idle={idle && e.idle !== false} idleEvery={e.idleEvery} dark={dark} uid={uid} />
        ))}
        {/* port dots */}
        {edges.map((e, i) => {
          const showP = tween(frame, e.show ?? 0, (e.show ?? 0) + 10)
          const litA = e.run == null ? 0 : tween(frame, e.run, e.run + 4)
          const litB = e.run == null ? 0 : tween(frame, e.run + (e.dur ?? 24) - 2, e.run + (e.dur ?? 24) + 4)
          const g = geos[i]
          return (
            <g key={`p${i}`} opacity={showP}>
              {[
                [g.p0, litA],
                [g.p3, litB],
              ].map(([p, lit], k) => (
                <circle key={k} cx={p[0]} cy={p[1]} r={7} fill={lit > 0.5 ? C.accent : dark ? C.surface : '#fff'} stroke={lit > 0.5 ? C.accent : dark ? 'rgba(242,240,237,0.35)' : '#c9bfb2'} strokeWidth={2.5} />
              ))}
            </g>
          )
        })}
      </svg>
      {nodes.map((n) => (
        <FlowNode key={n.id} n={n} frame={frame} dark={dark} />
      ))}
      {children}
    </div>
  )
}
