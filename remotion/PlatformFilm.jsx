import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { projects } from '../src/data.js'
import { C, SANS, TRACK, BrowserChrome, Wordmark, useFonts, splitTitle, tween, rise, clamp, easeInOut } from './shared.jsx'
import { DuskScene } from './DuskScene.jsx'
import { KineticText, PillLabel } from './KineticText.jsx'
import { SCENES } from './platformScenes.jsx'

/*
  The film for the two client platforms. Their real screens hold client
  records, so they cannot be shown; this is a schematic instead, and it
  says so on every frame. The stages, labels and mechanics are the real
  ones from data.js; only the screens are drawn, in a deliberately
  wireframe style so they are never mistaken for screenshots.

  It opens and closes on the dusk scene; while the stages run, the ridges
  sink and the sky darkens to a night ground so the wireframe reads.
*/

export const P_INTRO = 90
export const P_STAGE = 96
export const P_OUTRO = 150
export const platformLength = (slug) => P_INTRO + SCENES[slug].length * P_STAGE + P_OUTRO

const WIN = { x: 700, y: 170, w: 1120, h: 720 }
const CAVEAT = 'Row counts from a live clinic system.'

export function PlatformFilm({ slug }) {
  useFonts()
  const frame = useCurrentFrame()
  const project = projects.find((p) => p.slug === slug) || { title: slug }
  const scenes = SCENES[slug]
  const [name, sub] = splitTitle(project)
  const total = platformLength(slug)
  const stagesEnd = P_INTRO + scenes.length * P_STAGE

  const local = frame - P_INTRO
  const idx = Math.max(0, Math.min(scenes.length - 1, Math.floor(local / P_STAGE)))
  const f = local - idx * P_STAGE

  const bodyIn = rise(frame, 54, { stiffness: 60 })
  const body = bodyIn * (1 - tween(frame, stagesEnd - 4, stagesEnd + 22))
  const night = tween(frame, 50, 86, easeInOut) * (1 - tween(frame, stagesEnd, stagesEnd + 50, easeInOut))
  const ridges = interpolate(rise(frame, 0, { stiffness: 45 }), [0, 1], [0.3, 1]) * (1 - night)
  const signAt = stagesEnd + 34
  const metrics = (project.metrics || []).slice(0, 3)
  const needsCaveat = metrics.some((m) => /1,200|^11$/.test(String(m.n)))

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS, overflow: 'hidden' }}>
      <DuskScene frame={frame} push={tween(frame, 0, total, easeInOut)} rise={ridges} fade={tween(frame, 0, 20)} horizon={0.74}>
        {/* the night ground for the schematic */}
        <AbsoluteFill style={{ background: `rgba(11,11,12,${(0.72 * night).toFixed(3)})` }} />
        <AbsoluteFill
          style={{
            opacity: night,
            backgroundImage: 'radial-gradient(rgba(242,240,237,0.07) 1.2px, transparent 1.3px)',
            backgroundSize: '34px 34px',
            maskImage: 'radial-gradient(80% 70% at 60% 50%, #000 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(80% 70% at 60% 50%, #000 30%, transparent 85%)',
          }}
        />

        {/* Title */}
        {frame < P_INTRO + 10 && (
          <AbsoluteFill style={{ alignItems: 'center', paddingTop: 200, textAlign: 'center' }}>
            <div style={{ opacity: rise(frame, 4) * (1 - tween(frame, 46, 60)) }}>
              <PillLabel dark size={28}>Production platform</PillLabel>
            </div>
            <div style={{ marginTop: 26 }}>
              <KineticText text={name} start={8} size={136} align="center" exit={48} />
            </div>
            {sub && (
              <div style={{ marginTop: 18 }}>
                <KineticText text={sub} start={16} stagger={3} size={44} color={C.peach} align="center" tracking="-0.03em" exit={50} />
              </div>
            )}
          </AbsoluteFill>
        )}

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
              transform: `translateY(${((1 - bodyIn) * 90).toFixed(2)}px)`,
            }}
          >
            <BrowserChrome url={scenes[idx].url} height={48} />
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
              top: WIN.y + WIN.h + 30,
              fontSize: 30,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: C.inkSoft,
              opacity: tween(f, 8, 22) * (1 - tween(f, P_STAGE - 10, P_STAGE)),
              transform: `translateY(${(1 - tween(f, 8, 24)) * 12}px)`,
            }}
          >
            {scenes[idx].caption}
          </div>
        </AbsoluteFill>

        {/* Sign-off */}
        {frame > stagesEnd && (
          <AbsoluteFill style={{ alignItems: 'center', paddingTop: 130, textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: 120, justifyContent: 'center' }}>
              {metrics.map((m, i) => {
                const s = rise(frame, signAt + i * 8)
                return (
                  <div key={m.label} style={{ opacity: s, transform: `translateY(${(1 - s) * 22}px)`, filter: s < 0.98 ? `blur(${((1 - s) * 10).toFixed(2)}px)` : undefined }}>
                    <div style={{ fontWeight: 500, fontSize: 116, lineHeight: 1, letterSpacing: TRACK, color: C.ink }}>{m.n}</div>
                    <div style={{ marginTop: 16, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: C.inkSoft, maxWidth: 360 }}>{m.label}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 64 }}>
              <KineticText text={'Enquiries answered. Bookings confirmed.\n{Follow-ups sent. Without anyone typing.}'} start={signAt + 20} stagger={3} size={64} align="center" lineHeight={1.12} />
            </div>
            <div style={{ marginTop: 26, maxWidth: 1400, fontSize: 26, lineHeight: 1.45, color: C.inkSoft, opacity: rise(frame, signAt + 40) }}>
              {needsCaveat && <div style={{ color: C.peach }}>{CAVEAT}</div>}
              {project.outcomeNote}
            </div>
          </AbsoluteFill>
        )}
      </DuskScene>

      {/* Chrome that stays on every frame: the wordmark and the honesty tag */}
      <div style={{ position: 'absolute', top: 52, left: 64, zIndex: 10 }}>
        <Wordmark size={36} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 44,
          right: 64,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 20px 10px 16px',
          borderRadius: 999,
          background: 'rgba(11,11,12,0.55)',
          border: '1px solid rgba(255,200,154,0.22)',
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: C.inkSoft,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.accent }} />
        Schematic · client data never shown
      </div>

      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, width: `${interpolate(frame, [0, total], [0, 100], clamp)}%`, background: C.accent }} />
    </AbsoluteFill>
  )
}

function StageRail({ scenes, idx, f, local }) {
  const top = 230
  const gap = 104
  const fill = Math.max(0, Math.min(scenes.length - 1, idx + tween(f, P_STAGE - 14, P_STAGE + 6, easeInOut)))
  return (
    <div style={{ position: 'absolute', left: 110, top, width: 540 }}>
      <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', color: C.peach, marginBottom: 34, marginTop: -70 }}>How it runs, step by step</div>
      {/* spine */}
      <div style={{ position: 'absolute', left: 19, top: 20, width: 2, height: gap * (scenes.length - 1), background: 'rgba(242,240,237,0.14)' }} />
      <div style={{ position: 'absolute', left: 19, top: 20, width: 2, height: gap * (local < 0 ? 0 : fill), background: C.accent }} />
      {scenes.map((s, i) => {
        const on = i === idx && local >= 0
        const done = i < idx && local >= 0
        return (
          <div key={s.stage} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 28, height: gap, marginTop: i === 0 ? -32 : 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                flex: 'none',
                display: 'grid',
                placeItems: 'center',
                background: on ? C.accent : done ? '#3b2410' : C.surface,
                border: `2px solid ${on || done ? C.accent : C.lineStrong}`,
                boxShadow: on ? '0 0 0 10px rgba(245,135,30,0.16)' : 'none',
                fontWeight: 500,
                fontSize: 18,
                color: on ? C.onAccent : done ? C.accent : C.muted,
              }}
            >
              {i + 1}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: on ? 44 : 32, letterSpacing: '-0.035em', color: on ? C.ink : done ? C.inkSoft : C.muted }}>{s.stage}</div>
              {on && <div style={{ marginTop: 4, fontSize: 24, color: C.muted, opacity: tween(f, 6, 18) }}>{s.tag}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
