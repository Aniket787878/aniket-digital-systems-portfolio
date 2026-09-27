import { useState, useEffect } from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  continueRender,
  delayRender,
} from 'remotion'
import { projects, images } from '../src/data.js'
import { VIDEO } from './config.js'
import '@fontsource/archivo/700.css'
import '@fontsource/archivo/800.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'

/* Brand tokens, lifted from src/index.css so the video matches the site. */
const C = {
  bg: '#101010',
  surface: '#171717',
  ink: '#ffffff',
  inkSoft: '#d2d2d2',
  muted: '#9a9a9a',
  line: 'rgba(255,255,255,0.10)',
  lineStrong: 'rgba(255,255,255,0.18)',
  accent: '#f5871e',
  accentSoft: 'rgba(245,135,30,0.12)',
}
const DISPLAY = 'Archivo, system-ui, sans-serif'
const SANS = 'Inter, system-ui, sans-serif'

/* Fade in over [a,b], hold, fade out over [c,d]. */
const band = (frame, a, b, c, d) =>
  interpolate(frame, [a, b, c, d], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

const shorten = (t, max) => {
  if (!t || t.length <= max) return t || ''
  const cut = t.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

/* Scene windows (frames @30fps, 600 total = 20s). */
const S = {
  title: [0, 20, 92, 108],
  flow: [108, 128, 236, 252],
  caps: [252, 272, 380, 396],
  metrics: [396, 416, 500, 516],
  signoff: [516, 536, 600, 600],
}

export function ProjectVideo({ slug }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const [handle] = useState(() => delayRender('fonts'))
  useEffect(() => {
    const done = () => continueRender(handle)
    Promise.all([
      document.fonts.load('800 100px Archivo'),
      document.fonts.load('700 40px Archivo'),
      document.fonts.load('600 28px Inter'),
      document.fonts.load('400 24px Inter'),
    ])
      .then(() => document.fonts.ready)
      .then(done, done)
  }, [handle])

  const project = projects.find((p) => p.slug === slug) || projects[0]
  const isDemo = Boolean(images.projects[project.slug])
  const kicker = isDemo ? 'Working demo · self-built' : 'Production platform · built solo'
  const flow = (project.flow || []).slice(0, 6)
  const metrics = (project.metrics || []).slice(0, 3)
  const stack = (project.stack || []).slice(0, 7)
  const highlights = (project.features || project.surfaces || project.decisions || [])
    .map((h) => h.title)
    .slice(0, 4)

  const progress = interpolate(frame, [0, VIDEO.durationInFrames], [0, 1])

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: SANS }}>
      {/* Ground: a single soft, static saffron wash from the top-left. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 55% at 14% -10%, ${C.accentSoft}, transparent 55%)`,
        }}
      />

      <AbsoluteFill style={{ padding: 30 }}>
        <div
          style={{
            flex: 1,
            position: 'relative',
            border: `1px solid ${C.line}`,
            borderRadius: 24,
            overflow: 'hidden',
          }}
        >
          {/* Persistent header */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '26px 40px',
              zIndex: 5,
            }}
          >
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.ink, letterSpacing: '-0.02em' }}>
              Aniket<span style={{ color: C.accent }}>.</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted }}>
              {kicker}
            </div>
          </div>

          {/* Scenes */}
          <TitleScene frame={frame} fps={fps} project={project} />
          <FlowScene frame={frame} fps={fps} flow={flow} />
          <CapsScene frame={frame} fps={fps} highlights={highlights} />
          <MetricsScene frame={frame} fps={fps} metrics={metrics} note={project.outcomeNote} />
          <SignoffScene frame={frame} fps={fps} stack={stack} />

          {/* Persistent progress bar */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,0.08)', zIndex: 5 }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: C.accent }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function Stage({ style, children }) {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '90px 90px 70px',
        ...style,
      }}
    >
      <div style={{ maxWidth: 1000, width: '100%' }}>{children}</div>
    </AbsoluteFill>
  )
}

function eyebrow(text) {
  return (
    <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.accent, marginBottom: 24 }}>
      {text}
    </div>
  )
}

function TitleScene({ frame, fps, project }) {
  const enter = spring({ frame, fps, config: { damping: 18 } })
  const opacity = band(frame, ...S.title)
  const y = interpolate(enter, [0, 1], [24, 0])
  return (
    <Stage frame={frame} fps={fps} style={{ opacity, transform: `translateY(${y}px)` }}>
      {eyebrow('Case study')}
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, lineHeight: 1.02, letterSpacing: '-0.03em', color: C.ink }}>
        {project.title}
      </div>
      <div style={{ marginTop: 26, fontSize: 25, lineHeight: 1.45, color: C.inkSoft, maxWidth: 820, marginInline: 'auto' }}>
        {shorten(project.summary, 150)}
      </div>
    </Stage>
  )
}

function FlowScene({ frame, fps, flow }) {
  const opacity = band(frame, ...S.flow)
  const local = frame - S.flow[0]
  const count = flow.length
  const step = 16
  return (
    <Stage frame={frame} fps={fps} style={{ opacity }}>
      {eyebrow('How it runs, end to end')}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginTop: 20 }}>
        {flow.map((stage, i) => {
          const start = 16 + i * step
          const s = spring({ frame: local - start, fps, config: { damping: 15 } })
          const lit = interpolate(local - start, [0, 6, 30], [0, 1, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const fill = interpolate(local, [start - step + 4, start], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: i === count - 1 ? '0 0 auto' : '1 1 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flex: '0 0 auto', opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)` }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: lit > 0.7 ? C.accent : lit > 0 ? C.accentSoft : C.surface, border: `2px solid ${lit > 0 ? C.accent : C.lineStrong}`, boxShadow: lit > 0.7 ? `0 0 0 8px rgba(245,135,30,${0.18 * lit})` : 'none' }} />
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, color: lit > 0.2 ? C.ink : C.muted, whiteSpace: 'nowrap' }}>{stage}</div>
              </div>
              {i < count - 1 && (
                <div style={{ flex: '1 1 0', height: 2, margin: '0 10px', marginBottom: 37, background: 'rgba(255,255,255,0.14)', position: 'relative', minWidth: 22 }}>
                  <div style={{ position: 'absolute', inset: 0, transformOrigin: 'left center', transform: `scaleX(${fill})`, background: C.accent }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Stage>
  )
}

function CapsScene({ frame, fps, highlights }) {
  const opacity = band(frame, ...S.caps)
  const local = frame - S.caps[0]
  return (
    <Stage frame={frame} fps={fps} style={{ opacity }}>
      {eyebrow('What it does')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760, marginInline: 'auto', textAlign: 'left' }}>
        {highlights.map((h, i) => {
          const s = spring({ frame: local - 14 - i * 14, fps, config: { damping: 16 } })
          return (
            <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 26px', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateX(${interpolate(s, [0, 1], [-24, 0])}px)` }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.accent, flex: 'none' }} />
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, color: C.ink }}>{h}</div>
            </div>
          )
        })}
      </div>
    </Stage>
  )
}

function MetricsScene({ frame, fps, metrics, note }) {
  const opacity = band(frame, ...S.metrics)
  const local = frame - S.metrics[0]
  return (
    <Stage frame={frame} fps={fps} style={{ opacity }}>
      {eyebrow('By the numbers')}
      <div style={{ display: 'flex', gap: 70, justifyContent: 'center', flexWrap: 'wrap' }}>
        {metrics.map((m, i) => {
          const s = spring({ frame: local - 12 - i * 8, fps, config: { damping: 14 } })
          return (
            <div key={m.label} style={{ textAlign: 'center', opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px)` }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, lineHeight: 1, color: C.ink, letterSpacing: '-0.03em' }}>{m.n}</div>
              <div style={{ marginTop: 14, color: C.muted, fontSize: 20, maxWidth: 260, marginInline: 'auto' }}>{m.label}</div>
            </div>
          )
        })}
      </div>
      {note && (
        <div style={{ marginTop: 44, color: C.muted, fontSize: 14, maxWidth: 720, marginInline: 'auto', opacity: 0.85 }}>{shorten(note, 130)}</div>
      )}
    </Stage>
  )
}

function SignoffScene({ frame, fps, stack }) {
  // Fades in and holds to the end (no fade-out band).
  const opacity = interpolate(frame, [S.signoff[0], S.signoff[1]], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const local = frame - S.signoff[0]
  const s = spring({ frame: local, fps, config: { damping: 18 } })
  return (
    <Stage frame={frame} fps={fps} style={{ opacity, transform: `translateY(${interpolate(s, [0, 1], [18, 0])}px)` }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 820, marginInline: 'auto', marginBottom: 42 }}>
        {stack.map((t) => (
          <span key={t} style={{ fontSize: 15, fontWeight: 500, color: C.inkSoft, border: `1px solid ${C.lineStrong}`, borderRadius: 999, padding: '7px 16px' }}>{t}</span>
        ))}
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: C.ink, letterSpacing: '-0.03em' }}>
        Aniket<span style={{ color: C.accent }}>.</span>
      </div>
      <div style={{ marginTop: 16, color: C.inkSoft, fontSize: 24 }}>Complete production systems. End to end. Solo.</div>
    </Stage>
  )
}
