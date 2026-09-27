import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { projects } from '../src/data.js'
import { C, DISPLAY, SANS, BrowserChrome, Wordmark, useFonts, splitTitle, tween, clamp, easeInOut } from './shared.jsx'
import { SCENES } from './platformScenes.jsx'

/*
  The film for the two client platforms. Their real screens hold client
  records, so they cannot be shown; this is a schematic instead, and it
  says so on every frame. The stages, labels and mechanics are the real
  ones from data.js — only the screens are drawn, in a deliberately
  wireframe style so they are never mistaken for screenshots.
*/

export const P_INTRO = 84
export const P_STAGE = 96
export const P_OUTRO = 120
export const platformLength = (slug) => P_INTRO + SCENES[slug].length * P_STAGE + P_OUTRO

const WIN = { x: 700, y: 150, w: 1120, h: 740 }

export function PlatformFilm({ slug }) {
  useFonts()
  const frame = useCurrentFrame()
  const project = projects.find((p) => p.slug === slug)
  const scenes = SCENES[slug]
  const [name, sub] = splitTitle(project.title)
  const total = platformLength(slug)
  const stagesEnd = P_INTRO + scenes.length * P_STAGE

  const local = frame - P_INTRO
  const idx = Math.max(0, Math.min(scenes.length - 1, Math.floor(local / P_STAGE)))
  const f = local - idx * P_STAGE

  const tIn = tween(frame, 0, 24)
  const tOut = tween(frame, 46, 76)
  const body = tween(frame, 56, 90) * (1 - tween(frame, stagesEnd - 4, stagesEnd + 22))
  const oIn = tween(frame, stagesEnd + 16, stagesEnd + 46)
  const metrics = (project.metrics || []).slice(0, 3)

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(60% 50% at 12% -10%, rgba(245,135,30,0.15), transparent 60%), radial-gradient(40% 40% at 95% 105%, rgba(245,135,30,0.07), transparent 60%)',
        }}
      />
      {/* Dot grid — reads as a blueprint, which is what this is. */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.2px)',
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(80% 70% at 60% 50%, #000 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(80% 70% at 60% 50%, #000 30%, transparent 85%)',
        }}
      />

      {/* Honesty tag, on every frame */}
      <div
        style={{
          position: 'absolute',
          top: 44,
          right: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: C.muted,
          zIndex: 10,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.accent }} />
        Schematic · client data never shown
      </div>
      <div style={{ position: 'absolute', top: 38, left: 56, zIndex: 10 }}>
        <Wordmark size={28} />
      </div>

      {/* Title card */}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: tIn * (1 - tOut),
          transform: `translateY(${(1 - tIn) * 24 - tOut * 50}px)`,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.accent }}>
          Production platform · built solo
        </div>
        <div style={{ marginTop: 22, fontFamily: DISPLAY, fontWeight: 800, fontSize: 120, lineHeight: 0.95, letterSpacing: '-0.045em', color: C.ink }}>
          {name}
        </div>
        {sub && <div style={{ marginTop: 22, fontSize: 38, fontWeight: 500, color: C.inkSoft }}>{sub}</div>}
      </AbsoluteFill>

      {/* Stage rail + screen */}
      <AbsoluteFill style={{ opacity: body }}>
        <StageRail scenes={scenes} idx={idx} f={f} local={local} />
        <div
          style={{
            position: 'absolute',
            left: WIN.x,
            top: WIN.y,
            width: WIN.w,
            height: WIN.h,
            borderRadius: 18,
            overflow: 'hidden',
            border: `1px solid ${C.lineStrong}`,
            background: C.page,
            boxShadow: '0 40px 120px rgba(0,0,0,0.55)',
            display: 'flex',
            flexDirection: 'column',
            transform: `translateY(${(1 - tween(frame, 56, 90)) * 80}px)`,
          }}
        >
          <BrowserChrome url={scenes[idx].url} height={40} />
          <div style={{ position: 'relative', flex: 1 }}>
            {scenes.map((scene, i) => {
              const sf = local - i * P_STAGE
              const o = interpolate(sf, [-2, 10, P_STAGE - 8, P_STAGE + 4], [0, 1, 1, 0], clamp)
              if (o <= 0) return null
              const Screen = scene.Screen
              return (
                <div key={scene.stage} style={{ position: 'absolute', inset: 0, opacity: o, transform: `translateX(${(1 - tween(sf, -2, 14)) * 40}px)` }}>
                  <Screen f={sf} />
                </div>
              )
            })}
          </div>
        </div>
        {/* Caption under the window */}
        <div
          style={{
            position: 'absolute',
            left: WIN.x,
            width: WIN.w,
            top: WIN.y + WIN.h + 28,
            fontSize: 26,
            fontWeight: 500,
            color: C.inkSoft,
            opacity: tween(f, 8, 22) * (1 - tween(f, P_STAGE - 10, P_STAGE)),
            transform: `translateY(${(1 - tween(f, 8, 24)) * 12}px)`,
          }}
        >
          {scenes[idx].caption}
        </div>
      </AbsoluteFill>

      {/* Sign-off */}
      <AbsoluteFill
        style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: oIn, transform: `translateY(${(1 - oIn) * 26}px)` }}
      >
        <div style={{ display: 'flex', gap: 110, justifyContent: 'center' }}>
          {metrics.map((m, i) => {
            const s = tween(frame, stagesEnd + 24 + i * 8, stagesEnd + 54 + i * 8)
            return (
              <div key={m.label} style={{ opacity: s, transform: `translateY(${(1 - s) * 18}px)` }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, lineHeight: 1, letterSpacing: '-0.04em', color: C.ink }}>{m.n}</div>
                <div style={{ marginTop: 14, fontSize: 22, color: C.muted, maxWidth: 300 }}>{m.label}</div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 70, fontFamily: DISPLAY, fontWeight: 800, fontSize: 54, letterSpacing: '-0.035em', color: C.ink }}>
          Designed, built and run <span style={{ color: C.accent }}>by one person.</span>
        </div>
        <div style={{ marginTop: 22, fontSize: 18, color: C.muted, maxWidth: 1100 }}>{project.outcomeNote}</div>
      </AbsoluteFill>

      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, width: `${interpolate(frame, [0, total], [0, 100], clamp)}%`, background: C.accent }} />
    </AbsoluteFill>
  )
}

function StageRail({ scenes, idx, f, local }) {
  const top = 190
  const gap = 104
  const fill = Math.max(0, Math.min(scenes.length - 1, idx + tween(f, P_STAGE - 14, P_STAGE + 6, easeInOut)))
  return (
    <div style={{ position: 'absolute', left: 110, top, width: 520 }}>
      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.accent, marginBottom: 34, marginTop: -60 }}>
        How it runs, end to end
      </div>
      {/* spine */}
      <div style={{ position: 'absolute', left: 17, top: 18, width: 2, height: gap * (scenes.length - 1), background: 'rgba(255,255,255,0.12)' }} />
      <div style={{ position: 'absolute', left: 17, top: 18, width: 2, height: gap * (local < 0 ? 0 : fill), background: C.accent }} />
      {scenes.map((s, i) => {
        const on = i === idx && local >= 0
        const done = i < idx && local >= 0
        return (
          <div key={s.stage} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 28, height: gap, marginTop: i === 0 ? -34 : 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                flex: 'none',
                display: 'grid',
                placeItems: 'center',
                background: on ? C.accent : done ? '#3b2410' : C.surface,
                border: `2px solid ${on || done ? C.accent : C.lineStrong}`,
                boxShadow: on ? '0 0 0 10px rgba(245,135,30,0.16)' : 'none',
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 15,
                color: on ? '#1a0900' : done ? C.accent : C.muted,
              }}
            >
              {i + 1}
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: on ? 40 : 30, letterSpacing: '-0.03em', color: on ? C.ink : done ? C.inkSoft : C.muted, transition: 'none' }}>
                {s.stage}
              </div>
              {on && <div style={{ marginTop: 4, fontSize: 18, color: C.muted, opacity: tween(f, 6, 18) }}>{s.tag}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
