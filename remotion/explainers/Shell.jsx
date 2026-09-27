import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { C, SANS, useFonts, rise, tween, easeInOut } from '../shared.jsx'
import { DuskScene, PaperGround, sheetClip } from '../DuskScene.jsx'
import { KineticText } from '../KineticText.jsx'
import { EndCard } from '../EndCard.jsx'
import { Icon } from '../icons.jsx'

/*
  The frame every short explainer shares: it opens on the dusk scene with a
  one-line hook, a paper sheet rises over it for the explaining, and the
  sheet slides away to reveal the dusk again for the offer.

    paperAt   global frame the sheet starts rising
    paperEnd  paper-local frame the sheet starts sliding away
    children  a function of the paper-local frame
*/
export function Shell({ hook, hookSub, hookIcon, paperAt, paperEnd, offerKey, children }) {
  useFonts()
  const frame = useCurrentFrame()
  const outroAt = paperAt + paperEnd
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS }}>
      <Sequence durationInFrames={paperAt + 60}>
        <Hook text={hook} sub={hookSub} icon={hookIcon} until={paperAt} />
      </Sequence>
      <Sequence from={outroAt}>
        <EndCard frame={frame - outroAt} offerKey={offerKey} />
      </Sequence>
      <Sequence from={paperAt} durationInFrames={paperEnd + 44}>
        <Sheet end={paperEnd}>{children}</Sheet>
      </Sequence>
    </AbsoluteFill>
  )
}

function Hook({ text, sub, icon, until }) {
  const f = useCurrentFrame()
  const { height: H } = useVideoConfig()
  const ridges = interpolate(rise(f, 0, { stiffness: 40 }), [0, 1], [0.35, 1])
  const i = rise(f, 8)
  return (
    <DuskScene frame={f} push={tween(f, 0, until + 60, easeInOut)} rise={ridges} fade={tween(f, 0, 22)}>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: H * 0.2 }}>
        {icon && (
          <div style={{ marginBottom: 28, width: 76, height: 76, borderRadius: 22, display: 'grid', placeItems: 'center', background: 'rgba(245,135,30,0.14)', border: '1px solid rgba(255,200,154,0.22)', color: C.peach, opacity: i * (1 - tween(f, until - 10, until + 6)), transform: `translateY(${(1 - i) * 16}px)` }}>
            <Icon name={icon} size={40} stroke={2} />
          </div>
        )}
        <KineticText text={text} start={12} stagger={5} size={128} align="center" exit={until - 6} />
        {sub && (
          <div style={{ marginTop: 26 }}>
            <KineticText text={sub} start={34} stagger={3} size={56} color={C.peach} align="center" tracking="-0.035em" exit={until - 4} />
          </div>
        )}
      </AbsoluteFill>
    </DuskScene>
  )
}

function Sheet({ end, children }) {
  const f = useCurrentFrame()
  const { height: H } = useVideoConfig()
  const inP = rise(f, 0, { stiffness: 55 })
  const outP = rise(f, end, { stiffness: 55 })
  const p = f < end ? inP : 1 - outP
  return (
    <AbsoluteFill style={{ clipPath: sheetClip(p, H) }}>
      <PaperGround>
        <AbsoluteFill style={{ transform: `translateY(${((1 - inP) * 140 + outP * 160).toFixed(2)}px)` }}>{children(f)}</AbsoluteFill>
      </PaperGround>
    </AbsoluteFill>
  )
}

/* A headline that swaps as the story advances: each entry leaves as the
   next arrives. items: [{ at, text }] */
export function StepHeadline({ f, items, top = 96, size = 80 }) {
  return (
    <>
      {items.map((it, i) => {
        const next = items[i + 1]
        if (f < it.at - 2 || (next && f > next.at + 30)) return null
        return (
          <div key={i} style={{ position: 'absolute', left: 96, right: 96, top }}>
            <KineticText text={it.text} frame={f} start={it.at} stagger={3} exit={next ? next.at - 8 : it.exit} size={size} color={C.inkDark} accent={C.accentDeep} align="center" />
          </div>
        )
      })}
    </>
  )
}
