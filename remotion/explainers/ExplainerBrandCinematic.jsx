import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion'
import { S, SANS, SERIF, MONO, cl, move, useStageFonts, Ground, Tag, Line, Glass, Bar, EndCard, END_HEADING_AT, END_BUTTON_AT, Mono, arrive } from './stageLook.jsx'
import { countText } from '../stage/kit.jsx'
import { Soundtrack, cue } from '../sound.jsx'
import { tween, settle, easeOut, easeInOut, lerp, fade, STAGGER } from '../cinematic/motion.js'
import { SignalField, Point, Rings, Aurora, Sparkle, SparkleField, Burst, Flash } from '../cinematic/Signals.jsx'

/*
  The brand explainer, cinematic cut, 57.5 s. Signal lines drift and
  tangle, pull into one point, bloom into rings, fan out into a flow, then
  real screens float in glass over an aurora, the true counts sit inside
  rings, and the closing card. The voice (voice/brand.mp3) starts a line at
  0.3, 8.0, 17.0, 29.5, 42.3 and 48.0 s; the picture keeps in step.
*/

const sec = (s) => Math.round(s * 30)

/* ---- beat sheet (frames at 30 fps) ---- */
const B = {
  // 1. stakes
  stakeHead: 9,
  stakeWords: [60, 100, 140, 180],
  stakeOut: 232,
  // 2. the question
  pileLine: 246,
  pileOut: 332,
  pull: 335, // lines start to pull into one point
  pulled: 392,
  bloom: 396,
  ringsWord: 404,
  itselfHead: 412,
  itselfOut: 496,
  ringsOut: 500,
  // 3. the flow
  settlePoint: 504,
  flowHead: 530,
  nodeLit: [525, 615, 705, 795],
  flowOut: 862,
  // 4. real screens
  proof: 885,
  proofHead: 890,
  shot0: 892,
  shotEvery: 118,
  shotHold: 108,
  proofEnd: 1252,
  // 5. numbers
  count: 1264,
  countAt: [1270, 1318, 1364],
  caveat: 1380,
  countOut: 1418, // counters hold to ~47.4 s, clear out before the end heading lands
  countGone: 1428,
  // 6. the card
  end: 1420, // same as ExplainerBrand: button lands at end + 34, ~48.5 s
}
export const BRAND_CINEMATIC_LEN = B.end + 306 // 1726 frames, 57.5 s

const W = 1920
const H = 1080
const CX = W / 2

const STAKES = ['WhatsApp threads.', 'Spreadsheets.', 'Sticky notes.', 'Memory.']
const STAKE_Y = 400
const STAKE_GAP = 112
const LINE_APPEARS = [20, ...B.stakeWords, 36, 84, 200, 250, 262, 274, 286]

const POINT_MID = { x: CX, y: 600 }
const RING_R = 330

const FLOW_Y = 690
const POINT_FLOW = { x: 150, y: FLOW_Y }
const NODES = [
  { x: 490, label: 'Web form', sub: 'A message lands' },
  { x: 870, label: 'AI assistant', sub: 'Sorted' },
  { x: 1250, label: 'Reply', sub: 'Answered' },
  { x: 1630, label: 'Calendar', sub: 'On your calendar' },
]
const NODE_W = 340
const NODE_H = 176

const SHOTS = [
  { file: 'shared-inbox/02.png', label: 'Shared inbox', focus: '30% 15%' },
  { file: 'consent-signer/06.png', label: 'Consent signer', focus: '35% 30%' },
  { file: 'lead-research/05.png', label: 'Lead research', focus: '40% 22%' },
]
const WIN_W = 1400
const WIN_BAR = 64
const WIN_IMG_H = Math.round((WIN_W * 900) / 1440)
const WIN_BODY = 640
const WIN_TOP = 296
const PUSH = 0.42

const COUNTS = [
  { value: '1200+', label: 'client records', x: 400 },
  { value: '11', label: 'therapists', x: 960 },
  { value: '5', label: 'systems shipped', x: 1520 },
]
const COUNT_Y = 500
const COUNT_R = 250
const COUNT_DUR = 36

const CUES = [
  cue('thump', B.stakeHead + 1, 0.8),
  ...B.stakeWords.map((t) => cue('tick', t + 4, 0.35)),
  cue('thump', B.pileLine + 1, 0.8),
  cue('whoosh', B.pull, 0.7),
  cue('whoosh', B.bloom, 0.85),
  cue('thump', B.itselfHead + 1, 0.8),
  cue('whoosh', B.settlePoint, 0.5),
  cue('thump', B.flowHead + 1, 0.8),
  ...B.nodeLit.map((t) => cue('tick', t, 0.7)),
  cue('whooshDown', B.flowOut, 0.6),
  cue('whoosh', B.proof, 0.8),
  ...SHOTS.map((_, i) => cue('click', B.shot0 + i * B.shotEvery + 12, 0.6)),
  cue('whooshDown', B.proofEnd, 0.6),
  cue('thump', B.countAt[0] + 1, 0.8),
  ...B.countAt.slice(1).map((t) => cue('tick', t + 1, 0.55)),
  cue('whooshDown', B.countOut, 0.5),
  cue('thump', B.end + END_HEADING_AT + 1, 0.7),
  cue('end', B.end + END_BUTTON_AT),
]

export function ExplainerBrandCinematic() {
  useStageFonts()
  const f = useCurrentFrame()
  const inProof = f >= B.proof && f < B.proofEnd + 4
  const inFlow = f >= B.settlePoint - 10 && f < B.flowOut + 14
  return (
    <AbsoluteFill>
      <Ground f={f} glow={inFlow ? { x: 960, y: FLOW_Y } : { x: CX, y: 560 }} glowSize={inProof ? 0.6 : 1} />
      <Paper f={f} />
      {f < B.countGone && <Stage f={f} />}
      <Flash f={f} />
      {f >= B.end && <EndCard f={f - B.end} />}
      <Tag text={inProof ? 'Working demo · real screens' : 'Illustration'} />
      <Soundtrack cues={CUES} voice="brand" />
    </AbsoluteFill>
  )
}

/* The one light moment: soft paper to accent-tint, bloomed in and out of the dark. */
const PAPER_R = 1500
function Paper({ f }) {
  const inT = tween(f, B.proof - 20, B.proof + 12, easeOut)
  const outT = tween(f, B.proofEnd - 4, B.proofEnd + 20, easeInOut)
  const R = PAPER_R * Math.max(0, inT - outT)
  if (R < 2) return null
  const m = `radial-gradient(circle at ${CX}px 600px, #000 ${Math.max(0, R - 170)}px, transparent ${R}px)`
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(90% 80% at 30% 20%, #f5f3ef 0%, #ebe7e1 45%, #fbe6d2 100%)', WebkitMaskImage: m, maskImage: m }}>
      <div style={{ position: 'absolute', left: 1100 - 700, top: 700 - 500, width: 1400, height: 1000, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,200,154,0.55), rgba(255,200,154,0))' }} />
    </AbsoluteFill>
  )
}

/* Headline for the paper scene: ink-dark with a deep-saffron serif word. */
function PaperLine({ text, f, start, exit, size }) {
  const out = move(f, exit, 9)
  if (out >= 1 || f < start - 1) return null
  let inSerif = false
  let n = 0
  return (
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.03em', lineHeight: 1.02, color: '#161412', opacity: 1 - out, transform: `translateY(${(-out * 0.18 * size).toFixed(2)}px)`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.24em' }}>
      {text.split(' ').map((raw, wi) => {
        if (raw.includes('{')) inSerif = true
        const serif = inSerif
        if (raw.includes('}')) inSerif = false
        const s = arrive(f, start + n++ * 3, 150)
        return (
          <span key={wi} style={{ display: 'inline-block', whiteSpace: 'pre', fontFamily: serif ? SERIF : undefined, fontStyle: serif ? 'italic' : undefined, fontWeight: serif ? 400 : undefined, fontSize: serif ? '1.12em' : undefined, lineHeight: serif ? 0.9 : undefined, color: serif ? '#b8560a' : undefined, opacity: cl(s * 1.6), transform: `translateY(${((1 - s) * 0.42).toFixed(3)}em)` }}>
            {raw.replace(/[{}]/g, '')}
          </span>
        )
      })}
    </div>
  )
}

function Stage({ f }) {
  return (
    <>
      <Stakes f={f} />
      <Question f={f} />
      <Flow f={f} />
      <Proof f={f} />
      <Numbers f={f} />
    </>
  )
}

/* ---------------- 1 + 2. stakes, the pile, the pull, the bloom ---------------- */

function Stakes({ f }) {
  if (f > B.ringsOut) return null
  const pull = tween(f, B.pull, B.pulled, (x) => x)
  // the tangle thins as it pulls in, so the point can take over
  const lineOpacity = (1 - tween(f, B.pulled - 6, B.pulled + 8)) * (1 - 0.25 * tween(f, B.stakeWords[0] - 4, B.stakeOut))
  const pt = tween(f, B.pulled - 14, B.pulled) * (1 - tween(f, B.bloom + 6, B.bloom + 22, easeInOut))
  return (
    <>
      <SignalField f={f} appear={LINE_APPEARS} converge={pull} point={POINT_MID} opacity={Math.max(0, lineOpacity)} seed={3} bright />
      <Burst f={f} at={B.stakeHead + 6} x={CX} y={600} size={620} peak={0.7} out={B.pull - 20} />
      <SparkleField f={f} count={9} seed={5} at={B.stakeHead + 20} size={24} />
      <Point x={POINT_MID.x} y={POINT_MID.y} size={20 * (0.5 + 0.5 * easeOut(pt))} opacity={pt} />

      {/* 1. stakes */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center' }}>
        <Line text="Your business runs on…" f={f} start={B.stakeHead} exit={B.stakeOut} size={104} />
      </div>
      {STAKES.map((t, i) => (
        <div key={t} style={{ position: 'absolute', left: 0, right: 0, top: STAKE_Y + i * STAKE_GAP, display: 'flex', justifyContent: 'center' }}>
          <Line text={t} f={f} start={B.stakeWords[i]} exit={B.stakeOut} size={76} color={S.inkSoft} weight={500} />
        </div>
      ))}

      {/* 2. the pile, then the question */}
      <div style={{ position: 'absolute', left: 140, right: 140, top: 400, display: 'flex', justifyContent: 'center' }}>
        <Line text="Every enquiry, re-typed by {hand.}" f={f} start={B.pileLine} exit={B.pileOut} size={96} />
      </div>
      <Rings f={f} start={B.bloom} x={POINT_MID.x} y={POINT_MID.y + 40} radius={RING_R} inner={0.5} word="itself" wordSize={84} wordAt={B.ringsWord} out={B.ringsOut} />
      <Burst f={f} at={B.itselfHead + 6} x={1100} y={150} size={600} out={B.itselfOut - 6} />
      <Sparkle f={f} x={1560} y={110} size={34} at={B.itselfHead + 14} period={80} />
      <Sparkle f={f} x={380} y={190} size={26} at={B.itselfHead + 34} period={96} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', justifyContent: 'center' }}>
        <Line text="What if it ran {itself?}" f={f} start={B.itselfHead} exit={B.itselfOut} size={104} />
      </div>
    </>
  )
}

function Question() {
  return null
}

/* ---------------- 3. the flow: one point fans out into four lit nodes ---------------- */

function fanPath(i) {
  const n = NODES[i]
  const y = FLOW_Y
  const bend = (i - 1.5) * 150
  return `M${POINT_FLOW.x} ${y} C ${POINT_FLOW.x + 160} ${y + bend}, ${n.x - NODE_W / 2 - 200} ${y - bend * 0.6}, ${n.x - NODE_W / 2} ${y}`
}

function Flow({ f }) {
  if (f < B.settlePoint - 10 || f > B.flowOut + 16) return null
  const born = tween(f, B.settlePoint, B.settlePoint + 26, easeInOut)
  const out = tween(f, B.flowOut, B.flowOut + 14, easeInOut)
  const px = lerp(POINT_MID.x, POINT_FLOW.x, born)
  const py = lerp(POINT_MID.y + 40, POINT_FLOW.y, born)
  const op = (1 - out) * Math.min(1, tween(f, B.settlePoint - 8, B.settlePoint + 4))
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 7px rgba(245,135,30,0.6))' }}>
        {/* the fan: point to every node, drawn as the node's turn comes */}
        {NODES.map((n, i) => {
          const draw = tween(f, B.settlePoint + 18 + i * 6, B.settlePoint + 52 + i * 6)
          return <path key={`fan${i}`} d={fanPath(i)} fill="none" stroke={S.peach} strokeWidth={1.6} pathLength={1} strokeDasharray={`${draw.toFixed(3)} 1`} opacity={0.55} />
        })}
        {/* the path the enquiry takes, node to node */}
        {NODES.slice(0, 3).map((n, i) => {
          const a = n.x + NODE_W / 2
          const b = NODES[i + 1].x - NODE_W / 2
          const draw = tween(f, B.nodeLit[i] + 4, B.nodeLit[i] + 30)
          return <line key={`link${i}`} x1={a} y1={FLOW_Y} x2={b} y2={FLOW_Y} stroke={S.saffron} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw.toFixed(3)} 1`} />
        })}
      </svg>
      <Point x={px} y={py} size={20} opacity={op} glow={0.9} />
      {NODES.map((n, i) => {
        const appear = settle(f, B.settlePoint + 24 + i * STAGGER * 2)
        const lit = tween(f, B.nodeLit[i] - 4, B.nodeLit[i] + 14)
        const subIn = settle(f, B.nodeLit[i] + 2)
        return (
          <div key={n.label}>
            <Glass
              rim="top"
              lit={lit}
              style={{
                left: n.x - NODE_W / 2,
                top: FLOW_Y - NODE_H / 2,
                width: NODE_W,
                height: NODE_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 44,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                opacity: Math.min(1, appear * 1.5),
                transform: `translateY(${((1 - appear) * 30).toFixed(2)}px) scale(${(1 + lit * 0.04).toFixed(4)})`,
                color: lit > 0.5 ? S.ink : S.inkSoft,
              }}
            >
              {n.label}
            </Glass>
            <div style={{ position: 'absolute', left: n.x - 220, width: 440, top: FLOW_Y + NODE_H / 2 + 32, textAlign: 'center', opacity: Math.min(1, subIn * 1.5), transform: `translateY(${((1 - subIn) * 14).toFixed(2)}px)` }}>
              <Mono size={36} color={S.peach}>{n.sub}</Mono>
            </div>
          </div>
        )
      })}
      <Burst f={f} at={B.flowHead + 14} x={1450} y={265} size={600} out={B.flowOut - 6} />
      <Sparkle f={f} x={1790} y={190} size={36} at={B.flowHead + 20} period={80} />
      <Sparkle f={f} x={700} y={400} size={26} at={B.flowHead + 40} period={100} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 190, display: 'flex', justifyContent: 'center' }}>
        <Line text="Every enquiry, answered in {seconds.}" f={f} start={B.flowHead} exit={B.flowOut - 6} size={104} />
      </div>
    </AbsoluteFill>
  )
}

/* ---------------- 4. real screens in glass over an aurora ---------------- */

function Proof({ f }) {
  if (f < B.proof - 12 || f > B.proofEnd + 16) return null
  const bg = tween(f, B.proof - 10, B.proof + 24) * (1 - tween(f, B.proofEnd - 4, B.proofEnd + 14, easeInOut))
  return (
    <AbsoluteFill>
      <Burst f={f} at={B.proofHead + 14} x={1230} y={150} size={560} mode="paper" out={B.proofEnd - 10} />
      <Sparkle f={f} x={1500} y={120} size={32} at={B.proofHead + 20} period={84} color={S.saffron} />
      <Sparkle f={f} x={250} y={330} size={34} at={B.proof + 20} period={90} color={S.saffron} />
      <Sparkle f={f} x={1700} y={820} size={28} at={B.proof + 50} period={110} color={S.saffron} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 120, display: 'flex', justifyContent: 'center' }}>
        <PaperLine text="Real screens, running {real} businesses." f={f} start={B.proofHead} exit={B.proofEnd - 8} size={72} />
      </div>
      {SHOTS.map((s, i) => (
        <ShotWindow key={s.file} f={f} s={s} at={B.shot0 + i * B.shotEvery} last={i === SHOTS.length - 1} />
      ))}
    </AbsoluteFill>
  )
}

function ShotWindow({ f, s, at }) {
  const outAt = at + B.shotHold
  if (f < at - 1 || f > outAt + 16) return null
  const a = settle(f, at, { damping: 24, stiffness: 90 })
  const out = tween(f, outAt, outAt + 14, easeInOut)
  const push = 1 + PUSH * tween(f, at + 6, outAt + 14, easeInOut)
  const bob = Math.sin((f - at) * 0.05) * 6
  return (
    <div
      style={{
        position: 'absolute',
        left: CX - WIN_W / 2,
        top: WIN_TOP,
        width: WIN_W,
        height: WIN_BAR + WIN_BODY,
        opacity: Math.min(1, a * 1.5) * (1 - out),
        transform: `translateY(${((1 - a) * 80 - out * 50 + bob).toFixed(2)}px) scale(${(0.92 + 0.08 * a).toFixed(4)})`,
        filter: out > 0.02 ? `blur(${(out * 8).toFixed(2)}px)` : undefined,
      }}
    >
      <Glass rim="left" style={{ left: 0, top: 0, width: WIN_W, height: WIN_BAR + WIN_BODY, overflow: 'hidden', boxShadow: '0 60px 90px -30px rgba(120,60,10,0.45), 0 18px 40px -12px rgba(22,20,18,0.45)' }}>
        <Bar title={s.label} label="working demo" size={30} />
        <div style={{ width: WIN_W, height: WIN_BODY, overflow: 'hidden', position: 'relative' }}>
          <Img src={staticFile(`walkthroughs/${s.file}`)} style={{ display: 'block', width: WIN_W, height: WIN_IMG_H, transformOrigin: s.focus, transform: `scale(${push.toFixed(4)})`, marginTop: -(WIN_IMG_H - WIN_BODY) * 0.08 }} />
        </div>
      </Glass>
    </div>
  )
}

/* ---------------- 5. the true counts inside rings ---------------- */

function Numbers({ f }) {
  if (f < B.count - 4 || f >= B.countGone) return null
  const out = tween(f, B.countOut, B.countGone, easeInOut)
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {COUNTS.map((c, i) => {
        const start = B.countAt[i]
        const t = tween(f, start + 4, start + 4 + COUNT_DUR, (x) => 1 - Math.pow(1 - x, 4))
        return (
          <Rings key={c.label} f={f} start={start - 8} x={c.x} y={COUNT_Y} radius={COUNT_R} count={3} inner={0.65} wordAt={start}>
            <div style={{ textAlign: 'center', fontFamily: SANS }}>
              <div style={{ fontWeight: 600, fontSize: 92, letterSpacing: '-0.05em', lineHeight: 1, color: S.ink, fontVariantNumeric: 'tabular-nums' }}>{countText(c.value, t)}</div>
            </div>
          </Rings>
        )
      })}
      {COUNTS.map((c, i) => {
        const a = settle(f, B.countAt[i] + 8)
        return (
          <div key={c.label} style={{ position: 'absolute', left: c.x - 260, width: 520, top: COUNT_Y + COUNT_R + 56, textAlign: 'center', opacity: Math.min(1, a * 1.5), transform: `translateY(${((1 - a) * 18).toFixed(2)}px)` }}>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 54, letterSpacing: '-0.03em', color: S.inkSoft }}>{c.label}</span>
          </div>
        )
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 950, display: 'flex', justifyContent: 'center', opacity: settle(f, B.caveat) }}>
        <Mono size={30}>Real figures from live work</Mono>
      </div>
    </AbsoluteFill>
  )
}
