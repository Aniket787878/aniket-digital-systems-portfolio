import { useState, useEffect } from 'react'
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, Easing } from 'remotion'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/instrument-serif/400-italic.css'

/*
  The Stage kit: the site's dark "Stage" look (docs/ideas/stage-films-brief.md)
  as film parts. Every film outside remotion/explainers/ is built from these,
  and nothing here imports the old Dusk modules, so the explainers can adopt
  it later without dragging the hills along.

  Ground #0b0b0c with a faint dot grid, one saffron glow that follows the
  subject, Inter 600 headings closing on one Instrument Serif italic word in
  peach, mono labels, glass windows with a saffron rim light.
*/

export const S = {
  ground: '#0b0b0c',
  inner: '#111111',
  ink: '#f2f0ed',
  inkSoft: '#d8d3cc',
  muted: '#9a958f',
  faint: '#6b6762',
  peach: '#ffc89a',
  accent: '#f5871e',
  onAccent: '#1a0900',
  line: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.13)',
  glass: 'linear-gradient(180deg, rgba(28,26,24,0.82), rgba(16,15,14,0.86))',
}

export const SANS = 'Inter, system-ui, sans-serif'
export const SERIF = '"Instrument Serif", Georgia, serif'
/* ui-monospace / SF Mono do not exist in the render container; DejaVu Sans
   Mono is what the headless browser actually has. */
export const MONO = 'ui-monospace, "SF Mono", "DejaVu Sans Mono", Menlo, monospace'

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1)
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1)
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
export const tween = (f, a, b, fn = easeOut) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: fn })
export const lerp = (a, b, t) => a + (b - a) * t
/* Springy but settled: a touch of give, no wobble. */
export const settle = (f, start, cfg) =>
  spring({ frame: f - start, fps: 30, config: { damping: 22, stiffness: 120, mass: 0.9, ...cfg } })

export function useStageFonts() {
  const [handle] = useState(() => delayRender('stage-fonts'))
  useEffect(() => {
    const done = () => continueRender(handle)
    const sample = 'Aa ₹ · ’'
    Promise.all([
      document.fonts.load('600 40px Inter', sample),
      document.fonts.load('500 40px Inter', sample),
      document.fonts.load('400 40px Inter', sample),
      document.fonts.load('italic 400 40px "Instrument Serif"', sample),
    ])
      .then(() => document.fonts.ready)
      .then(done, done)
  }, [handle])
}

/* ---------- ground and light ---------- */

/* #0b0b0c with 1.5px dots every 28px at 5% white, faded at the edges so it
   reads as texture, not a pattern fill. `scale` keeps the dot size right on
   smaller canvases. */
export function Ground({ scale = 1, drift = 0 }) {
  const step = 28 * scale
  return (
    <AbsoluteFill style={{ background: S.ground }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.05) ${0.75 * scale}px, transparent ${1 * scale}px)`,
          backgroundSize: `${step}px ${step}px`,
          backgroundPosition: `${(drift % step).toFixed(2)}px 0px`,
          maskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, #000 45%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, #000 45%, transparent 100%)',
        }}
      />
    </AbsoluteFill>
  )
}

/* The one saffron glow. (x, y) is where the subject is; the caller moves it. */
export function Glow({ x, y, size = 1100, opacity = 1 }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        opacity,
        background:
          'radial-gradient(circle, rgba(245,135,30,0.18) 0%, rgba(245,135,30,0.075) 32%, rgba(245,135,30,0.02) 52%, transparent 68%)',
        pointerEvents: 'none',
      }}
    />
  )
}

/* ---------- labels ---------- */

export function Wordmark({ size = 30, color = S.ink, style }) {
  return (
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.04em', color, lineHeight: 1, ...style }}>
      Aniket<span style={{ color: S.accent }}>.</span>
    </div>
  )
}

export function Mono({ children, size = 18, color = S.muted, style }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: size, letterSpacing: '0.08em', color, lineHeight: 1.2, whiteSpace: 'nowrap', ...style }}>
      {children}
    </span>
  )
}

export function LiveDot({ size = 10, on = 1 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        flex: 'none',
        width: size,
        height: size,
        borderRadius: '50%',
        background: S.accent,
        boxShadow: `0 0 ${size * 1.4}px rgba(245,135,30,${(0.85 * on).toFixed(2)})`,
      }}
    />
  )
}

/* The honesty tag: a mono pill fixed in the top-right corner. When `text`
   changes, the caller passes both texts and a 0..1 `swap`. */
export function MonoTag({ text, prev, swap = 1, size = 20, top = 46, right = 60 }) {
  const show = (t, o) =>
    o > 0.001 && (
      <span style={{ position: o < 1 && prev ? 'absolute' : 'relative', right: 0, opacity: o, whiteSpace: 'nowrap' }}>{t}</span>
    )
  return (
    <div
      style={{
        position: 'absolute',
        top,
        right,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.6,
        padding: `${size * 0.6}px ${size * 0.95}px ${size * 0.6}px ${size * 0.8}px`,
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(11,11,12,0.6)',
        fontFamily: MONO,
        fontSize: size,
        letterSpacing: '0.08em',
        color: S.muted,
        lineHeight: 1,
      }}
    >
      <LiveDot size={size * 0.42} />
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        {prev && swap < 1 && show(prev, 1 - swap)}
        {show(text, prev ? swap : 1)}
      </span>
    </div>
  )
}

/* ---------- kinetic type ---------- */

/* "What if it *ran itself?*" -> words, each flagged serif or not. A starred
   run may span several words; the stars are dropped. */
export function words(text) {
  let serif = false
  return String(text)
    .split(' ')
    .filter(Boolean)
    .map((raw) => {
      let word = raw
      let on = serif
      if (word.startsWith('*')) {
        on = true
        serif = true
        word = word.slice(1)
      }
      if (/\*[.,?!]*$/.test(word)) {
        serif = false
        word = word.replace(/\*([.,?!]*)$/, '$1')
      }
      return { word, serif: on }
    })
}

/*
  One short line that owns the frame. Words wrapped in *stars* are the
  serif accent (Instrument Serif italic, peach). Words rise and sharpen in
  a quick stagger; at `out` the whole line lifts and blurs away in five
  frames, which reads as a cut rather than a fade.
*/
export function KineticLine({ text, f, start = 0, out, size = 150, stagger = 3, align = 'center', color = S.ink, lineHeight = 1.02, maxWidth }) {
  const lines = String(text).split('\n')
  const leave = out == null ? 0 : tween(f, out, out + 6, Easing.bezier(0.5, 0, 0.75, 0))
  let n = 0
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.035em',
        lineHeight,
        color,
        textAlign: align,
        maxWidth,
        opacity: 1 - leave,
        transform: `translateY(${(-leave * size * 0.18).toFixed(2)}px)`,
        filter: leave > 0.01 ? `blur(${(leave * 14).toFixed(2)}px)` : undefined,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: '0.24em' }}>
          {words(line).map(({ word, serif }, wi) => {
            const i = n++
            const s = settle(f, start + i * stagger, { stiffness: 150, damping: 20 })
            const blur = (1 - Math.min(1, s)) * 14
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  fontFamily: serif ? SERIF : undefined,
                  fontStyle: serif ? 'italic' : undefined,
                  fontWeight: serif ? 400 : undefined,
                  fontSize: serif ? '1.14em' : undefined,
                  letterSpacing: serif ? '-0.01em' : undefined,
                  lineHeight: serif ? 0.9 : undefined,
                  color: serif ? S.peach : undefined,
                  paddingRight: serif ? '0.06em' : undefined,
                  opacity: Math.min(1, s * 1.6),
                  transform: `translateY(${((1 - s) * 0.42).toFixed(4)}em)`,
                  filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
                }}
              >
                {word}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* A heading with one serif word, static (no per-word motion). */
export function SerifHeading({ text, size = 80, color = S.ink, align = 'left', style }) {
  return (
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.035em', lineHeight: 1.04, color, textAlign: align, ...style }}>
      {words(text).map(({ word, serif }, i) => {
        return (
          <span key={i}>
            {i > 0 && ' '}
            {serif ? (
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '1.14em', letterSpacing: '-0.01em', color: S.peach }}>{word}</span>
            ) : (
              word
            )}
          </span>
        )
      })}
    </div>
  )
}

/* ---------- count-up ---------- */

/* "1,200+" counts from 0 to 1,200 and keeps its suffix. */
export function countText(target, t) {
  const m = String(target).match(/^([^\d]*)([\d,]+)(.*)$/)
  if (!m) return target
  const n = Number(m[2].replace(/,/g, ''))
  const v = Math.round(n * t)
  return `${m[1]}${v.toLocaleString('en-IN')}${t >= 1 ? m[3] : ''}`
}

export function CountUp({ value, label, f, start = 0, dur = 36, size = 180 }) {
  const t = tween(f, start, start + dur, Easing.bezier(0.16, 1, 0.3, 1))
  const a = settle(f, start - 4)
  return (
    <div style={{ opacity: Math.min(1, a * 1.5), transform: `translateY(${((1 - a) * 30).toFixed(2)}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.05em', lineHeight: 1, color: S.ink, fontVariantNumeric: 'tabular-nums' }}>
        {countText(value, t)}
      </div>
      <div style={{ marginTop: size * 0.12 }}>
        <Mono size={size * 0.13}>{label}</Mono>
      </div>
    </div>
  )
}

/* ---------- glass ---------- */

/*
  The glass window: radius 18, 1px border at 13% white, #111 inside, a
  saffron rim light along the top-left edge. The chrome bar is three dim
  dots and a mono address. Children fill the body. Sizes are logical: the
  caller scales the whole window.
*/
export function GlassWindow({ width, bodyH, chrome = 52, url, children, rim = 1, style }) {
  return (
    <div
      style={{
        position: 'absolute',
        width,
        height: bodyH + chrome,
        borderRadius: 18,
        overflow: 'hidden',
        background: S.inner,
        border: `1px solid ${S.border}`,
        boxShadow: [
          '0 0 0 1px rgba(0,0,0,0.5)',
          '0 60px 140px -30px rgba(0,0,0,0.85)',
          `0 -10px 70px -20px rgba(245,135,30,${(0.35 * rim).toFixed(3)})`,
          `inset 0 1px 0 rgba(255,200,154,${(0.35 * rim).toFixed(3)})`,
          `inset 1px 0 0 rgba(255,200,154,${(0.12 * rim).toFixed(3)})`,
        ].join(', '),
        ...style,
      }}
    >
      {chrome > 0 && (
        <div
          style={{
            height: chrome,
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${chrome * 0.42}px`,
            gap: chrome * 0.16,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))',
            borderBottom: `1px solid ${S.line}`,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: chrome * 0.22, height: chrome * 0.22, borderRadius: '50%', background: 'rgba(255,255,255,0.14)' }} />
          ))}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingRight: chrome * 1.1 }}>
            {url && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: chrome * 0.34,
                  letterSpacing: '0.06em',
                  color: S.muted,
                  padding: `${chrome * 0.12}px ${chrome * 0.4}px`,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${S.line}`,
                }}
              >
                {url}
              </span>
            )}
          </div>
        </div>
      )}
      <div style={{ position: 'relative', width, height: bodyH, overflow: 'hidden' }}>{children}</div>
      {/* rim light: a saffron sheen along the top edge, brightest at the left */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: 1.5,
          background: `linear-gradient(90deg, rgba(255,200,154,${(0.9 * rim).toFixed(2)}), rgba(245,135,30,${(0.35 * rim).toFixed(2)}) 40%, transparent 85%)`,
        }}
      />
    </div>
  )
}

/* A small glass pill ("what it did"): live dot, label, mono state. */
export function Chip({ label, state, t = 1, active = false, size = 24, style }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.55,
        padding: `${size * 0.55}px ${size * 0.9}px ${size * 0.55}px ${size * 0.7}px`,
        borderRadius: 999,
        background: S.glass,
        border: `1px solid ${active ? 'rgba(245,135,30,0.55)' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: active
          ? '0 0 0 1px rgba(0,0,0,0.4), 0 18px 40px -12px rgba(0,0,0,0.7), 0 0 30px -6px rgba(245,135,30,0.35)'
          : '0 0 0 1px rgba(0,0,0,0.4), 0 18px 40px -12px rgba(0,0,0,0.7)',
        fontFamily: SANS,
        whiteSpace: 'nowrap',
        opacity: Math.min(1, t * 1.5),
        transform: `translateX(${((1 - t) * 40).toFixed(2)}px) scale(${(0.94 + 0.06 * t).toFixed(4)})`,
        filter: t < 0.97 ? `blur(${((1 - t) * 8).toFixed(2)}px)` : undefined,
        ...style,
      }}
    >
      <LiveDot size={size * 0.42} on={active ? 1 : 0.4} />
      <span style={{ fontSize: size, fontWeight: 500, letterSpacing: '-0.02em', color: active ? S.ink : S.inkSoft }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: size * 0.72, letterSpacing: '0.06em', color: active ? S.peach : S.muted }}>{state}</span>
    </div>
  )
}

/* The pointer: a white arrow with a saffron ring that blooms on click.
   `click` runs 0..1 over the ring. `k` counter-scales it inside a zoom. */
export function Pointer({ x, y, click = 0, opacity = 1, size = 30, k = 1 }) {
  const press = click > 0 && click < 0.25 ? 1 - Math.abs(click - 0.12) / 0.12 : 0
  const r = interpolate(click, [0, 1], [8, 44], clamp)
  const s = (size / 30) * k
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity, zIndex: 20 }}>
      {click > 0 && click < 1 && (
        <div
          style={{
            position: 'absolute',
            left: -r * s,
            top: -r * s,
            width: r * 2 * s,
            height: r * 2 * s,
            borderRadius: '50%',
            border: `${2.5 * s}px solid ${S.accent}`,
            background: 'rgba(245,135,30,0.12)',
            opacity: 1 - click,
          }}
        />
      )}
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        style={{ position: 'absolute', left: -4, top: -3, transform: `scale(${(s * (1 - press * 0.12)).toFixed(4)})`, transformOrigin: '4px 3px', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.55))' }}
      >
        <path d="M5 3l14 8.2-6.1 1.5 3.6 6.9-2.7 1.4-3.6-6.9L5 18.7z" fill="#ffffff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* The saffron button of the end card. */
export function SaffronButton({ children, size = 34, t = 1 }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.45,
        padding: `${size * 0.62}px ${size * 1.1}px`,
        borderRadius: 999,
        background: S.accent,
        color: S.onAccent,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
        boxShadow: `0 18px 60px rgba(245,135,30,${(0.38 * t).toFixed(3)}), inset 0 1px 0 rgba(255,255,255,0.35)`,
      }}
    >
      {children}
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M13 6l6 6-6 6" stroke={S.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/*
  The end card, as on the site's closing band: a mono pill, the heading
  with its serif word, the saffron button and the wordmark. `f` is local.
  The heading's first word and the button's arrival are exported for the
  films' sound (remotion/sound.jsx).
*/
export const END_HEADING_AT = 4
export const END_BUTTON_AT = 16
export function EndCard({ f, heading = 'Let’s find your first *leak.*', pill = 'free 15-minute call', button = 'Book a free call', scale = 1 }) {
  const u = (k) => settle(f, k)
  const rise = (k, d = 24) => ({ opacity: Math.min(1, u(k) * 1.4), transform: `translateY(${((1 - u(k)) * d * scale).toFixed(2)}px)` })
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -30 * scale }}>
        <div style={rise(0)}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 * scale, padding: `${10 * scale}px ${20 * scale}px`, borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
            <LiveDot size={8 * scale} />
            <Mono size={20 * scale}>{pill}</Mono>
          </div>
        </div>
        <div style={{ marginTop: 34 * scale }}>
          <KineticLine text={heading} f={f} start={END_HEADING_AT} size={124 * scale} stagger={3} />
        </div>
        <div style={{ marginTop: 56 * scale, ...rise(END_BUTTON_AT, 30) }}>
          <SaffronButton size={34 * scale} t={u(END_BUTTON_AT)}>{button}</SaffronButton>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 70 * scale, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...rise(24, 16) }}>
        <Wordmark size={40 * scale} />
      </div>
    </AbsoluteFill>
  )
}

/*
  The "what it did" chips as a tidy stack in one fixed spot (top right,
  under the honesty tag). No wires: each step's chip fades and slides in
  over 0.4 s under the ones before it. `items` is [{ label, state, t }] in
  order, t 0..1 being that chip's arrival. Only the newest `max` stay; when
  one more arrives the oldest fades up and out as the stack shifts.
*/
export function ChipStack({ items, top, right, size = 22, gap, max = 6, opacity = 1 }) {
  const g = gap ?? size * 2.3
  const on = items.filter((it) => it.t > 0.001)
  if (!on.length || opacity <= 0.001) return null
  const newest = on[on.length - 1]
  const over = on.length > max
  const shift = over ? newest.t : 0
  const list = on.slice(-(max + 1))
  return (
    <div style={{ position: 'absolute', top, right, opacity, zIndex: 40 }}>
      {list.map((it, k) => {
        const leaving = over && k === 0
        const slot = (over ? k - shift : k) * g
        const t = leaving ? 1 - shift : it.t
        return (
          <div
            key={it.key}
            style={{
              position: 'absolute',
              right: 0,
              top: slot.toFixed(2) + 'px',
              opacity: Math.min(1, t * 1.25),
              transform: leaving ? `translateY(${(-shift * 10).toFixed(2)}px)` : `translateX(${((1 - it.t) * 26).toFixed(2)}px)`,
            }}
          >
            <Chip label={it.label} state={it.state} t={1} active={it === newest} size={size} />
          </div>
        )
      })}
    </div>
  )
}

/* Chip arrival: a plain 0.4 s ease, so the stack moves as one calm beat. */
export const chipIn = (f, at) => tween(f, at, at + 12, easeOut)

/*
  The pointer for the real captures: a saffron ring (no arrow) that glides
  to the clicked element and gives one soft pulse. Drawn in frame pixels at
  a fixed size, so it never balloons with the camera. `click` runs 0..1.
*/
export function PointerRing({ x, y, click = -1, opacity = 1, size = 34 }) {
  if (opacity <= 0.001) return null
  const r = size / 2
  const press = click > 0 && click < 0.3 ? Math.sin((click / 0.3) * Math.PI) : 0
  const ring = click > 0 && click < 1 ? click : -1
  const rr = r * (1 + 1.7 * Math.max(0, easeOut(Math.max(0, ring))))
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity, zIndex: 30, pointerEvents: 'none' }}>
      {ring > 0 && (
        <div
          style={{
            position: 'absolute',
            left: -rr,
            top: -rr,
            width: rr * 2,
            height: rr * 2,
            borderRadius: '50%',
            boxSizing: 'border-box',
            border: `2px solid rgba(245,135,30,${(0.85 * (1 - ring)).toFixed(3)})`,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: -r,
          top: -r,
          width: size,
          height: size,
          borderRadius: '50%',
          boxSizing: 'border-box',
          border: `${(size * 0.09).toFixed(2)}px solid ${S.accent}`,
          background: `rgba(245,135,30,${(0.16 + press * 0.22).toFixed(3)})`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.35), 0 4px 18px rgba(0,0,0,0.45), 0 0 22px rgba(245,135,30,0.45)',
          transform: `scale(${(1 - press * 0.16).toFixed(4)})`,
        }}
      />
    </div>
  )
}

/*
  The caption for the real-capture films: one line, bottom centre, with
  the mono step counter "02 / 06" before it. `t` is the arrival (0..1),
  `out` the exit.
*/
export function BottomCaption({ i, n, text, t = 1, out = 0, size = 40, bottom, opacity = 1 }) {
  const o = Math.min(1, t * 1.4) * (1 - out) * opacity
  if (o <= 0.001) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        gap: size * 0.55,
        opacity: o,
        transform: `translateY(${((1 - t) * size * 0.35 - out * size * 0.15).toFixed(2)}px)`,
        zIndex: 35,
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: size * 0.5, letterSpacing: '0.08em', color: S.muted, whiteSpace: 'nowrap', position: 'relative', top: -size * 0.06 }}>
        {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
      </span>
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.025em', color: S.ink, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  )
}

/* The soft dark band the caption sits on, along the bottom of the frame. */
export function CaptionScrim({ H, height, opacity = 1 }) {
  if (opacity <= 0.001) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: H - height,
        height,
        opacity,
        zIndex: 34,
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(11,11,12,0) 0%, rgba(11,11,12,0.62) 34%, rgba(11,11,12,0.9) 62%, rgba(11,11,12,0.94) 100%)',
      }}
    />
  )
}
