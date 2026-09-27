import { useCurrentFrame } from 'remotion'
import { C, SANS, TRACK, rise } from './shared.jsx'

/*
  Kinetic typography: each word rises into place and resolves from a blur,
  one after another. Inter 500, tight tracking; the design system's big,
  calm type.

  text    a string. "\n" forces a line break; words wrapped in {braces}
          take the accent colour.
  start   frame the first word starts
  stagger frames between words
  exit    optional frame the words start leaving (they lift and blur out)
*/
export function KineticText({
  text,
  start = 0,
  stagger = 4,
  exit,
  exitStagger = 2,
  size = 120,
  weight = 500,
  color = C.ink,
  accent = C.peach,
  lineHeight = 1.04,
  align = 'left',
  tracking = TRACK,
  maxWidth,
  frame: frameProp,
  style,
}) {
  const current = useCurrentFrame()
  const frame = frameProp ?? current
  const lines = String(text).split('\n')
  let n = 0
  const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
  return (
    <div style={{ fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight, letterSpacing: tracking, color, maxWidth, textAlign: align, ...style }}>
      {lines.map((line, li) => {
        let inAccent = false
        return (
          <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: justify, columnGap: '0.24em' }}>
            {line
              .split(' ')
              .filter(Boolean)
              .map((raw, wi) => {
                let word = raw
                if (word.startsWith('{')) {
                  inAccent = true
                  word = word.slice(1)
                }
                const closes = word.endsWith('}')
                if (closes) word = word.slice(0, -1)
                const isAccent = inAccent
                if (closes) inAccent = false
                const i = n++
                const s = rise(frame, start + i * stagger, { stiffness: 80 })
                const e = exit == null ? 0 : rise(frame, exit + i * exitStagger, { stiffness: 110 })
                const blur = (1 - s) * 16 + e * 14
                return (
                  <span
                    key={wi}
                    style={{
                      display: 'inline-block',
                      whiteSpace: 'pre',
                      color: isAccent ? accent : undefined,
                      opacity: Math.min(1, s * 1.5) * (1 - e),
                      transform: `translateY(${((1 - s) * 0.5 - e * 0.3).toFixed(4)}em)`,
                      filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
                    }}
                  >
                    {word}
                  </span>
                )
              })}
          </div>
        )
      })}
    </div>
  )
}

/* The design system's pill label: small icon dot + word, tinted ground. */
export function PillLabel({ children, dark = false, size = 26, style }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: `${size * 0.36}px ${size * 0.8}px ${size * 0.36}px ${size * 0.6}px`,
        borderRadius: 999,
        background: dark ? 'rgba(245,135,30,0.14)' : C.tint,
        border: dark ? '1px solid rgba(255,200,154,0.22)' : '1px solid rgba(184,86,10,0.14)',
        color: dark ? C.peach : C.accentDeep,
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '-0.01em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span style={{ width: size * 0.34, height: size * 0.34, borderRadius: '50%', background: C.accent, flex: 'none' }} />
      {children}
    </div>
  )
}
