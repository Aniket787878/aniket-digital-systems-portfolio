import { useVideoConfig } from 'remotion'
import { S, SANS, SERIF, MONO } from '../explainers/stageLook.jsx'
import { arriveT, leaveT, ramp, EASE, DUR, STAGGER_WORD, cl, live } from './motion3.js'

/*
  v3 kinetic type (shot list T2). Every word rises out of its own mask
  line (y 110% to 0, blur 6px to 0) on the `arrive` curve, 4 frames apart.
  The outgoing line leaves through the same masks, upward, on `leave`, so a
  line is wiped out through its letters instead of fading. Inter 500 only;
  a word or phrase in {braces} is the one Instrument Serif italic accent.
*/

export const PAPER = { bg: '#f5f3ef', tint: '#fbe6d2', ink: '#161412', soft: '#4a4540', muted: '#6f6963', accent: '#b8560a', line: 'rgba(22,20,18,0.12)' }
export const tone = (t) => (t === 'paper' ? { ink: PAPER.ink, accent: PAPER.accent, muted: PAPER.muted } : { ink: S.ink, accent: S.peach, muted: S.muted })

/* "a {b c} d" -> [{ word, serif, line }] */
export function parseWords(text) {
  const out = []
  String(text)
    .split('\n')
    .forEach((ln, li) => {
      let inSerif = false
      ln.split(' ')
        .filter(Boolean)
        .forEach((raw) => {
          if (raw.includes('{')) inSerif = true
          const serif = inSerif
          if (raw.includes('}')) inSerif = false
          out.push({ word: raw.replace(/[{}]/g, ''), serif, line: li })
        })
    })
  return out
}

/* the frame each word lands on, for the `key` sound */
export const wordStarts = (text, at, stagger = STAGGER_WORD) => parseWords(text).map((_, i) => at + i * stagger)
/* the frame the last word has finished arriving */
export const lineLanded = (text, at, stagger = STAGGER_WORD) => at + (parseWords(text).length - 1) * stagger + DUR.arrive

export function Words({
  text,
  f,
  at,
  exit,
  stagger = STAGGER_WORD,
  exitStagger = 2,
  size = 96,
  t = 'night',
  color,
  accent,
  align = 'center',
  lineHeight = 1.06,
  tracking = -0.045,
  style,
}) {
  const words = parseWords(text)
  const c = tone(t)
  if (f < at - 1) return null
  if (exit != null && f > exit + (words.length - 1) * exitStagger + DUR.leave + 1) return null
  const lines = []
  words.forEach((w, i) => {
    ;(lines[w.line] = lines[w.line] || []).push({ ...w, i })
  })
  const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
  return (
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: `${tracking}em`, lineHeight, color: color || c.ink, textAlign: align, ...style }}>
      {lines.map((ws, li) => (
        <div key={li} style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: justify, columnGap: '0.25em' }}>
          {ws.map((w) => {
            const a = arriveT(f, at + w.i * stagger)
            const e = exit == null ? 0 : leaveT(f, exit + w.i * exitStagger)
            const y = (1 - a) * 110 - e * 110
            const blur = (1 - a) * 6 + e * 4
            return (
              <span key={w.i} style={{ display: 'inline-block', overflow: 'hidden', padding: '0.08em 0.04em 0.16em', margin: '-0.08em -0.04em -0.16em' }}>
                <span
                  style={{
                    display: 'inline-block',
                    whiteSpace: 'pre',
                    transform: `translateY(${y.toFixed(2)}%)`,
                    filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
                    fontFamily: w.serif ? SERIF : undefined,
                    fontStyle: w.serif ? 'italic' : undefined,
                    fontWeight: w.serif ? 400 : undefined,
                    fontSize: w.serif ? '1.1em' : undefined,
                    lineHeight: w.serif ? 0.95 : undefined,
                    letterSpacing: w.serif ? '0' : undefined,
                    color: w.serif ? accent || c.accent : undefined,
                    paddingRight: w.serif ? '0.04em' : undefined,
                  }}
                >
                  {w.word}
                </span>
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* A full-frame line, centred (or placed by top), for hooks and headfakes. */
export function Headline({ f, text, at, exit, size, t, top, align = 'center', stagger, padX }) {
  const { width: W, height: H } = useVideoConfig()
  const tall = H > W
  const px = padX ?? (tall ? 72 : 120)
  return (
    <div style={{ position: 'absolute', left: px, right: px, top: top ?? 0, bottom: top == null ? 0 : undefined, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 30 }}>
      <Words text={text} f={f} at={at} exit={exit} size={size} t={t} align={align} stagger={stagger} />
    </div>
  )
}

/* The scene title, top-left under the honesty tag. */
export function Caption({ f, text, at, exit, t = 'night', size }) {
  const { width: W, height: H } = useVideoConfig()
  const tall = H > W
  return (
    <div style={{ position: 'absolute', left: tall ? 72 : 96, right: tall ? 72 : 96, top: tall ? 270 : 132, zIndex: 32 }}>
      <Words text={text} f={f} at={at} exit={exit} size={size || (tall ? 72 : 60)} t={t} align="left" stagger={3} lineHeight={1.1} tracking={-0.04} />
    </div>
  )
}

/* The fixed honesty label, inside the 5% margin (and below the top 10% of
   a vertical frame, where phone apps put their buttons). */
export function Tag3({ f, text, at = 0, out, t = 'night' }) {
  const { width: W, height: H } = useVideoConfig()
  const tall = H > W
  const o = live(f, at, out, 12, 8)
  if (o <= 0.001 || !text) return null
  const paper = t === 'paper'
  return (
    <div
      style={{
        position: 'absolute',
        left: tall ? 72 : 96,
        top: tall ? 196 : 54,
        zIndex: 60,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px 10px 16px',
        borderRadius: 999,
        border: `1px solid ${paper ? PAPER.line : S.line}`,
        background: paper ? 'rgba(255,255,255,0.7)' : 'rgba(17,17,17,0.72)',
        fontFamily: MONO,
        fontSize: 28,
        letterSpacing: '0.08em',
        color: paper ? PAPER.muted : S.muted,
        whiteSpace: 'nowrap',
        opacity: o,
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: S.saffron }} />
      {text}
    </div>
  )
}

/*
  Odometer (T9 `roll`): each digit column rolls from its `from` digit to
  its target with extra turns, 2 frames apart, then holds. Non-digits swap
  half-way. from and to are padded to the same length.
*/
export function Odometer({ f, at, to, from, size = 160, color, turns = 1, dur = DUR.roll, style, tracking = -0.05 }) {
  const n = to.length
  const src = (from ?? to.replace(/\d/g, '0')).padStart(n, ' ')
  const chars = to.split('')
  return (
    <span style={{ display: 'inline-flex', fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: `${tracking}em`, lineHeight: 1, color, fontVariantNumeric: 'tabular-nums', ...style }}>
      {chars.map((ch, i) => {
        const p = ramp(f, at + i * 2, dur, EASE.roll)
        if (!/\d/.test(ch)) {
          const show = p > 0.5 ? ch : src[i]
          return (
            <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: show === ' ' ? 0 : 1 }}>
              {show === ' ' ? ch : show}
            </span>
          )
        }
        const a = /\d/.test(src[i]) ? +src[i] : 0
        const b = +ch
        const travel = ((b - a + 10) % 10) + 10 * turns
        const pos = a + travel * p
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', height: '1.08em', verticalAlign: 'top' }}>
            <span style={{ visibility: 'hidden' }}>{ch}</span>
            <span style={{ position: 'absolute', left: 0, top: 0, transform: `translateY(${(-pos * 1.08).toFixed(4)}em)` }}>
              {Array.from({ length: 40 }, (_, k) => (
                <span key={k} style={{ display: 'block', height: '1.08em', lineHeight: '1.08em' }}>
                  {k % 10}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}

/* A saffron strike drawn left to right across whatever it sits on. */
export function Strike({ f, at, dur = 10, color = S.saffron, thick = 6 }) {
  const p = ramp(f, at, dur, EASE.arrive)
  if (p <= 0) return null
  return <div style={{ position: 'absolute', left: -12, top: '50%', height: thick, marginTop: -thick / 2, width: `calc(${(p * 100).toFixed(2)}% + ${(24 * p).toFixed(1)}px)`, background: color, borderRadius: thick, boxShadow: '0 0 18px rgba(245,135,30,0.6)' }} />
}

/* a mono label (>= 28 px) */
export function Label({ children, size = 28, color, style }) {
  return <span style={{ fontFamily: MONO, fontSize: size, letterSpacing: '0.08em', color: color || S.muted, whiteSpace: 'nowrap', ...style }}>{children}</span>
}

/* fade helper for whole groups */
export const groupO = (f, inAt, outAt, inDur, outDur) => cl(live(f, inAt, outAt, inDur, outDur))
