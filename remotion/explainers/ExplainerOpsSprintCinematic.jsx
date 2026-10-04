import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Icon } from '../icons.jsx'
import { S, SANS, SERIF, useStageFonts, Ground, Tag, Line, Glass, Bar, Chip, Bubble, EndCard, END_HEADING_AT, END_BUTTON_AT, Mono, arrive, move, fadeIn, cl } from './stageLook.jsx'
import { Soundtrack, cue } from '../sound.jsx'
import { tween, settle, easeOut, easeInOut, lerp } from '../cinematic/motion.js'
import { SignalField, Point, Rings, Sparkle, SparkleField, Burst, Flash } from '../cinematic/Signals.jsx'

/*
  Ops Automation Sprint, cinematic cut, 30.4 s. One enquiry at 11:04 pm,
  followed through the automation: the hook (flash, moon in rings, lines
  pulled to one point), the form, an instant WhatsApp reply, the client
  list, the team heads-up, then (on one light paper moment) the next
  morning reminder and the Day 3 / Day 7 follow-ups, and the headfake
  "stops the moment they book". Voice (voice/ops-sprint.mp3) lines start at
  0.2, 4.0, 11.2, 16.3 and 25.3 s. Everything on screen is illustrative.
*/

/* ---- beat sheet (frames at 30 fps) ---- */
const B = {
  // hook, 0 - 4 s
  hookTime: 8, // "11:04 pm."
  hookSub: 58, // "A new enquiry. Your team is asleep."
  hookOut: 104,
  pull: 82, // lines start to pull into one point
  pulled: 116,
  // the story: panel windows [in, out]
  form: [120, 232],
  sendAt: 210, // the "Send enquiry" press
  reply: [236, 326],
  list: [330, 402],
  team: [406, 486],
  remind: [490, 566],
  follow: [570, 684],
  // the light moment
  paperIn: 466,
  paperOut: 684,
  // the headfake
  stop: 690,
  stopOut: 744,
  // end card (same timing logic as ExplainerOpsSprint)
  end: 752,
}
export const OPS_CINEMATIC_LEN = 912 // 30.4 s

const W = 1920
const H = 1080
const CX = W / 2
const STEP = [B.form[0] + 4, B.reply[0], B.list[0], B.team[0], B.remind[0], B.follow[0]]

const NODES = [
  { label: 'Web form', icon: 'form' },
  { label: 'Auto-reply', icon: 'chat' },
  { label: 'Client list', icon: 'database' },
  { label: 'Team', icon: 'bell' },
  { label: 'Reminder', icon: 'sun' },
  { label: 'Follow-up', icon: 'repeat' },
]
const STRIP = { x: 100, y: 852, w: 1720, h: 112 }

const CAPS = [
  { at: B.form[0] + 4, out: B.form[1] - 4, text: 'A lead fills in your {form.}', bx: 1180 },
  { at: B.reply[0] + 2, out: B.reply[1] - 4, text: 'A WhatsApp reply goes out {instantly.}', bx: 1360 },
  { at: B.list[0] + 2, out: B.list[1] - 4, text: 'They land in your client {list.}', bx: 1300 },
  { at: B.team[0] + 2, out: B.team[1] - 4, text: 'Your team gets a {heads-up.}', bx: 1280 },
  { at: B.remind[0] + 2, out: B.remind[1] - 4, text: 'Next morning, a gentle {reminder.}', bx: 1360, paper: true },
  { at: B.follow[0] + 2, out: B.follow[1] - 4, text: 'Then follow-ups on {Day 3 and Day 7.}', bx: 1360, paper: true },
]
const CAP_Y = 92
const CAP_SIZE = 80

const CUES = [
  cue('thump', B.hookTime + 1, 0.85),
  cue('thump', B.hookSub + 1, 0.5),
  cue('whoosh', B.pull, 0.7),
  ...CAPS.map((c) => cue('thump', c.at + 1, 0.55)),
  cue('whoosh', B.form[0] - 2, 0.6),
  cue('click', B.sendAt, 1),
  cue('whoosh', B.reply[0], 0.7),
  cue('whoosh', B.list[0], 0.5),
  cue('whoosh', B.team[0], 0.5),
  cue('whoosh', B.paperIn + 8, 0.7),
  cue('whoosh', B.follow[0], 0.5),
  ...STEP.map((s) => cue('tick', s + 8, 0.7)),
  cue('whooshDown', B.paperOut, 0.7),
  cue('thump', B.stop + 1, 0.9),
  cue('whooshDown', B.stopOut, 0.5),
  cue('thump', B.end + END_HEADING_AT + 1, 0.7),
  cue('end', B.end + END_BUTTON_AT),
]

export function ExplainerOpsSprintCinematic() {
  useStageFonts()
  const f = useCurrentFrame()
  const gx = f < B.form[0] ? CX : lerp(700, 1220, cl((f - B.form[0]) / (B.follow[1] - B.form[0])))
  return (
    <AbsoluteFill>
      <Ground f={f} glow={{ x: gx, y: 520 }} />
      <Paper f={f} />
      {f < B.end + 6 && (
        <>
          <Hook f={f} />
          <Story f={f} />
          <Stop f={f} />
        </>
      )}
      <Flash f={f} />
      {f >= B.end && <EndCard f={f - B.end} />}
      <Tag />
      <Soundtrack cues={CUES} voice="ops-sprint" />
    </AbsoluteFill>
  )
}

/* The one light moment: paper to accent-tint, bloomed in and out of the dark. */
function Paper({ f }) {
  const inT = tween(f, B.paperIn, B.paperIn + 30, easeOut)
  const outT = tween(f, B.paperOut - 6, B.paperOut + 22, easeInOut)
  const R = 1500 * Math.max(0, inT - outT)
  if (R < 2) return null
  const m = `radial-gradient(circle at ${CX}px 520px, #000 ${Math.max(0, R - 170)}px, transparent ${R}px)`
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(90% 80% at 30% 20%, #f5f3ef 0%, #ebe7e1 45%, #fbe6d2 100%)', WebkitMaskImage: m, maskImage: m }}>
      <div style={{ position: 'absolute', left: 1000 - 700, top: 560 - 500, width: 1400, height: 1000, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,200,154,0.55), rgba(255,200,154,0))' }} />
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

/* ---------------- hook: the hour, and nobody there ---------------- */

const HOOK_POINT = { x: CX, y: 520 }
const LINE_APPEARS = [3, 6, 9, 12, 15, 18, 22, 26, 30, 34, 38, 42]

function Hook({ f }) {
  if (f > B.pulled + 20) return null
  const pull = tween(f, B.pull, B.pulled, (x) => x)
  const lineOp = 1 - tween(f, B.pulled - 2, B.pulled + 14)
  const pt = tween(f, B.pulled - 14, B.pulled) * (1 - tween(f, B.form[0] + 2, B.form[0] + 16, easeInOut))
  const moon = settle(f, 10)
  return (
    <>
      <SignalField f={f} appear={LINE_APPEARS} converge={pull} point={HOOK_POINT} opacity={Math.max(0, lineOp) * (0.55 + 0.45 * pull)} seed={11} bright />
      <Burst f={f} at={B.hookTime + 2} x={CX} y={620} size={640} peak={0.75} out={B.hookOut - 10} />
      <SparkleField f={f} count={8} seed={9} at={B.hookTime + 12} size={24} area={{ x0: 140, x1: 1780, y0: 120, y1: 940 }} />
      <Rings f={f} start={B.hookTime - 2} x={CX} y={290} radius={190} count={3} inner={0.5} wordAt={B.hookTime + 4} out={B.hookOut - 8}>
        <div style={{ color: S.peach, opacity: settle(f, B.hookTime + 4), transform: `scale(${(0.8 + 0.2 * moon).toFixed(3)})`, filter: 'drop-shadow(0 0 18px rgba(245,135,30,0.7))' }}>
          <Icon name="moon" size={92} stroke={1.8} />
        </div>
      </Rings>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center' }}>
        <Line text="11:04 pm." f={f} start={B.hookTime} exit={B.hookOut} size={184} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center' }}>
        <Line text={'A new enquiry. Your team is {asleep.}'} f={f} start={B.hookSub} exit={B.hookOut} size={68} color={S.inkSoft} weight={500} stagger={2} />
      </div>
      <Point x={HOOK_POINT.x} y={HOOK_POINT.y} size={22 * (0.5 + 0.5 * easeOut(pt))} opacity={pt} />
    </>
  )
}

/* ---------------- the story ---------------- */

const PANELS = []

function Story({ f }) {
  if (f < B.form[0] - 4 || f > B.stopOut) return null
  const reached = STEP.reduce((acc, s, i) => (f >= s + 6 ? i : acc), -1)
  const stripT = arrive(f, B.form[0] - 6, 110) * (1 - tween(f, B.follow[1] + 2, B.follow[1] + 14, easeInOut))
  const paperNow = f >= B.paperIn + 14 && f < B.paperOut
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      {/* ambient signal lines, calm behind the panels */}
      <AmbientLines f={f} />
      {!paperNow && <SparkleField f={f} count={3} seed={21} at={B.form[0]} size={22} area={{ x0: 70, x1: 300, y0: 230, y1: 800 }} />}
      {!paperNow && <SparkleField f={f} count={3} seed={25} at={B.form[0] + 8} size={22} area={{ x0: 1620, x1: 1850, y0: 260, y1: 800 }} />}
      {paperNow && <Sparkle f={f} x={250} y={420} size={30} at={B.paperIn + 30} period={90} color={S.saffron} />}
      {paperNow && <Sparkle f={f} x={1700} y={600} size={34} at={B.paperIn + 44} period={100} color={S.saffron} />}
      {/* captions */}
      {CAPS.map((c, i) => (
        <CaptionBlock key={i} f={f} c={c} />
      ))}
      {/* panels */}
      {STAGES.map((St, k) => {
        const [from, to] = [B.form, B.reply, B.list, B.team, B.remind, B.follow][k]
        if (f < from || f > to + 16) return null
        const inT = arrive(f, from + 2, 120)
        const outT = move(f, to, 12)
        const blur = (1 - inT) * 12 + outT * 10
        return (
          <div
            key={k}
            style={{ position: 'absolute', left: 0, right: 0, top: 250, height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1800, opacity: cl(inT * 1.6) * (1 - outT) }}
          >
            <div style={{ transform: `translateY(${((1 - inT) * 46 - outT * 30).toFixed(2)}px) rotateX(${((1 - inT) * 16).toFixed(2)}deg) scale(${(SCALE[k] - outT * 0.04).toFixed(4)})`, filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : undefined, position: 'relative' }}>
              <St f={f - from} />
            </div>
          </div>
        )
      })}
      {/* landing pulses: a point blooms where each step arrives */}
      {STEP.slice(1).map((s, i) => {
        const t = tween(f, s - 6, s + 6) * (1 - tween(f, s + 6, s + 22))
        return t > 0.01 ? <Point key={i} x={CX} y={520} size={20 * (0.6 + 0.4 * t)} opacity={t} /> : null
      })}
      <Strip f={f} reached={reached} t={stripT} />
    </AbsoluteFill>
  )
}

function AmbientLines({ f }) {
  const op = tween(f, B.form[0], B.form[0] + 24) * (1 - tween(f, B.follow[1] - 20, B.follow[1] + 10)) * (1 - 0.7 * tween(f, B.paperIn, B.paperIn + 26))
  if (op <= 0.01) return null
  return <SignalField f={f} appear={[0, 4, 8, 12, 16, 20, 24, 28]} converge={0} opacity={0.4 * op} seed={4} tangle={0.7} />
}

function CaptionBlock({ f, c }) {
  if (f < c.at - 2 || f > c.out + 16) return null
  return (
    <>
      <Burst f={f} at={c.at + 10} x={c.bx} y={CAP_Y + 50} size={460} peak={c.paper ? 0.9 : 0.8} mode={c.paper ? 'paper' : 'screen'} out={c.out - 6} />
      <div style={{ position: 'absolute', left: 96, right: 96, top: CAP_Y, display: 'flex', justifyContent: 'center' }}>
        {c.paper ? <PaperLine text={c.text} f={f} start={c.at} exit={c.out} size={CAP_SIZE} /> : <Line text={c.text} f={f} start={c.at} exit={c.out} size={CAP_SIZE} stagger={3} />}
      </div>
    </>
  )
}

/* The flow strip: six steps, lit as each runs. */
function Strip({ f, reached, t }) {
  if (t < 0.01) return null
  const cw = STRIP.w / NODES.length
  const prog = cl((reached + 0.5) / NODES.length)
  const progNow = lerp(0, 1, cl(prog))
  return (
    <Glass rim={null} style={{ left: STRIP.x, top: STRIP.y, width: STRIP.w, height: STRIP.h, opacity: cl(t * 1.5), transform: `translateY(${((1 - t) * 40).toFixed(2)}px)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, width: `${(progNow * 100).toFixed(2)}%`, background: `linear-gradient(90deg, ${S.saffron}, ${S.peach})`, boxShadow: '0 0 16px rgba(245,135,30,0.7)' }} />
      {NODES.map((n, i) => {
        const on = i <= reached
        const lit = fadeIn(f, STEP[i] + 6, 8)
        return (
          <div key={n.label} style={{ position: 'absolute', left: i * cw, top: 0, width: cw, height: STRIP.h - 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 15, flex: 'none', display: 'grid', placeItems: 'center', background: on ? S.saffron : 'rgba(245,135,30,0.12)', color: on ? S.onSaffron : S.peach, boxShadow: on ? `0 0 ${(28 * lit).toFixed(0)}px rgba(245,135,30,0.55)` : 'none' }}>
              <Icon name={n.icon} size={30} stroke={2} />
            </div>
            <span style={{ fontFamily: SANS, fontSize: 28, letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: on ? S.ink : S.muted }}>{n.label}</span>
          </div>
        )
      })}
    </Glass>
  )
}

/* ---------------- the headfake: stops the moment they book ---------------- */

function Stop({ f }) {
  if (f < B.stop - 12 || f > B.stopOut + 16) return null
  const pull = tween(f, B.stop + 4, B.stopOut - 2, (x) => x)
  const op = tween(f, B.stop - 8, B.stop + 10) * (1 - tween(f, B.stopOut - 4, B.stopOut + 12))
  const pt = tween(f, B.stopOut - 18, B.stopOut - 2) * (1 - tween(f, B.stopOut + 2, B.stopOut + 14))
  return (
    <>
      <SignalField f={f} appear={[B.stop - 8, B.stop - 6, B.stop - 4, B.stop - 2, B.stop, B.stop + 2, B.stop + 4, B.stop + 6, B.stop + 8, B.stop + 10]} converge={pull} point={{ x: CX, y: 840 }} opacity={0.4 * op} seed={17} bright />
      <Burst f={f} at={B.stop + 12} x={1300} y={640} size={640} out={B.stopOut - 8} />
      <Sparkle f={f} x={1620} y={250} size={34} at={B.stop + 6} period={70} />
      <Sparkle f={f} x={300} y={820} size={28} at={B.stop + 20} period={90} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center' }}>
        <Line text={'Stops the moment\nthey {book.}'} f={f} start={B.stop} exit={B.stopOut} size={150} lineHeight={1.04} stagger={4} />
      </div>
      <Point x={CX} y={840} size={22 * (0.5 + 0.5 * pt)} opacity={pt} />
    </>
  )
}

/* ---------- the six panels (from ExplainerOpsSprint; f is local to the step) ---------- */

function Field({ label, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <Mono size={19}>{label}</Mono>
      <div style={{ marginTop: 8, height: 58, borderRadius: 12, border: `1px solid ${S.line}`, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 27, letterSpacing: '-0.015em' }}>{children}</div>
    </div>
  )
}

function typed(text, f, a, b) {
  return text.slice(0, Math.round(cl((f - a) / (b - a)) * text.length))
}

function StageForm({ f }) {
  const g = f
  const SEND = B.sendAt - B.form[0]
  const sent = g > SEND + 2
  const press = cl(1 - Math.abs(g - SEND) / 4)
  const lit = tween(g, SEND - 20, SEND) * (1 - tween(g, SEND + 4, SEND + 20))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
      <Glass rim="left" lit={0.3 + lit * 0.7} style={{ position: 'relative', width: 640, padding: '28px 34px 32px' }}>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>Book a consultation</div>
        <Field label="Name">
          <div style={{ width: `${cl((g - 14) / 24) * 46}%`, height: 12, borderRadius: 12, background: 'rgba(255,255,255,0.16)' }} />
        </Field>
        <Field label="What do you need?">
          {typed('An evening slot, first visit', g, 40, 100)}
          <span style={{ width: 2.5, height: 28, background: S.saffron, marginLeft: 3, opacity: g < SEND - 6 && Math.floor(g / 8) % 2 === 0 ? 1 : 0 }} />
        </Field>
        <div style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 999, fontSize: 26, fontWeight: 600, background: sent ? 'rgba(245,135,30,0.16)' : S.saffron, color: sent ? S.peach : S.onSaffron, border: `1px solid ${sent ? 'rgba(245,135,30,0.5)' : S.saffron}`, transform: `scale(${(1 - press * 0.06).toFixed(4)})`, boxShadow: sent ? 'none' : `0 0 ${(20 + 30 * lit).toFixed(0)}px rgba(245,135,30,${(0.35 + 0.4 * lit).toFixed(2)})` }}>
          {sent && <Icon name="check" size={24} stroke={2.6} />}
          {sent ? 'Sent' : 'Send enquiry'}
        </div>
      </Glass>
      <div style={{ width: 330 }}>
        <Chip icon="moon" label="11:04 pm" lit={1} size={30} style={{ position: 'relative', opacity: fadeIn(g, 10, 10) }} />
        <div style={{ marginTop: 20, fontSize: 28, color: S.muted, lineHeight: 1.3, opacity: fadeIn(g, 24, 10) }}>Nobody is at the desk.</div>
      </div>
    </div>
  )
}

function StageReply({ f }) {
  const a = arrive(f, 10)
  return (
    <Glass rim="right" lit={0.4} style={{ position: 'relative', width: 720, overflow: 'hidden' }}>
      <Bar title="New enquiry" label="WhatsApp" icon="user" />
      <div style={{ padding: '26px 30px 30px', display: 'flex', justifyContent: 'flex-end', opacity: cl(a * 1.5), transform: `translateY(${((1 - a) * 26).toFixed(2)}px)` }}>
        <Bubble side="out" width={580} text="Hi! Thanks for getting in touch. Here’s a link to pick a time that suits you." time="11:04 pm" tag="Sent instantly" />
      </div>
    </Glass>
  )
}

function StageList({ f }) {
  const row = arrive(f, 12, 120)
  const cols = '1.2fr 1fr 1fr'
  const bar = (w) => <div style={{ width: w, height: 12, borderRadius: 12, background: 'rgba(255,255,255,0.08)' }} />
  return (
    <Glass rim="top" style={{ position: 'relative', width: 1000, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 30px', borderBottom: `1px solid ${S.hair}` }}>
        <Icon name="database" size={28} color={S.peach} />
        <span style={{ fontSize: 30, letterSpacing: '-0.025em' }}>Leads</span>
        <span style={{ marginLeft: 'auto' }}>
          <Mono size={20}>Every enquiry, one record</Mono>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 30px', borderBottom: `1px solid ${S.hair}` }}>
        {['Source', 'Received', 'Stage'].map((c) => (
          <Mono key={c} size={20}>{c}</Mono>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', padding: '0 30px', height: row * 74, overflow: 'hidden', background: 'rgba(245,135,30,0.1)', borderLeft: `3px solid ${S.saffron}`, fontSize: 27, borderBottom: `1px solid ${S.hair}`, opacity: cl(row * 1.4) }}>
        <div>Web form</div>
        <div>11:04 pm</div>
        <div>
          <span style={{ padding: '6px 16px', borderRadius: 999, background: S.saffron, color: S.onSaffron, fontSize: 23, fontWeight: 600 }}>New</span>
        </div>
      </div>
      {[0, 1].map((r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', padding: '0 30px', height: 70, borderBottom: r === 0 ? `1px solid ${S.hair}` : 'none' }}>
          {bar('60%')}
          {bar('50%')}
          {bar('40%')}
        </div>
      ))}
    </Glass>
  )
}

function StageTeam({ f }) {
  const a = arrive(f, 6, 140)
  const b = arrive(f, 24)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <Glass rim="left" lit={0.5} style={{ position: 'relative', width: 660, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 20, opacity: cl(a * 1.5), transform: `translateY(${((1 - a) * -30).toFixed(2)}px)` }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, display: 'grid', placeItems: 'center', background: S.saffron, color: S.onSaffron, flex: 'none' }}>
          <Icon name="bell" size={30} stroke={2.1} />
        </div>
        <div>
          <div style={{ fontSize: 30, letterSpacing: '-0.02em' }}>New lead from the web form</div>
          <div style={{ marginTop: 6, fontSize: 24, color: S.muted }}>Assigned to the front desk</div>
        </div>
      </Glass>
      <Glass rim={null} style={{ position: 'relative', width: 660, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 18, opacity: cl(b * 1.5), transform: `translateY(${((1 - b) * 20).toFixed(2)}px)` }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${S.saffron}`, flex: 'none' }} />
        <div style={{ fontSize: 29, letterSpacing: '-0.02em' }}>Call back before 10 am</div>
        <span style={{ marginLeft: 'auto' }}>
          <Mono size={20} color={S.peach}>Task</Mono>
        </span>
      </Glass>
    </div>
  )
}

function StageRemind({ f }) {
  const a = arrive(f, 14)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
      <div style={{ opacity: fadeIn(f, 4, 10), width: 260 }}>
        <Chip icon="sun" label="9:00 am" lit={1} size={30} style={{ position: 'relative' }} />
        <div style={{ marginTop: 18, fontSize: 28, color: '#4a4540' }}>Next morning</div>
      </div>
      <div style={{ opacity: cl(a * 1.5), transform: `translateY(${((1 - a) * 24).toFixed(2)}px)`, background: 'linear-gradient(180deg, rgba(26,26,28,0.96), rgba(17,17,17,0.97))', borderRadius: 36, boxShadow: '0 40px 80px -24px rgba(120,60,10,0.45), 0 14px 30px -10px rgba(22,20,18,0.4)' }}>
        <Bubble side="out" width={640} text="Good morning! A quick reminder: your booking link is here whenever you’re ready." time="9:00 am" />
      </div>
    </div>
  )
}

function StageFollow({ f }) {
  const rows = [
    { day: 'Day 3', text: 'Checking in: any questions I can answer?', state: 'Sent', at: 8 },
    { day: 'Day 7', text: 'Still keen? Here are this week’s open slots.', state: 'Scheduled', at: 34 },
  ]
  return (
    <Glass rim="left" style={{ position: 'relative', width: 1040, padding: '10px 32px 24px' }}>
      {rows.map((r, i) => {
        const a = arrive(f, r.at)
        return (
          <div key={r.day} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 0', borderBottom: i === 0 ? `1px solid ${S.hair}` : 'none', opacity: cl(a * 1.5), transform: `translateX(${((1 - a) * 30).toFixed(2)}px)` }}>
            <span style={{ flex: 'none', padding: '8px 18px', borderRadius: 999, background: 'rgba(245,135,30,0.14)', border: '1px solid rgba(245,135,30,0.35)', color: S.peach, fontSize: 25 }}>{r.day}</span>
            <span style={{ fontSize: 29, letterSpacing: '-0.02em' }}>{r.text}</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              <Mono size={20} color={i === 0 ? S.peach : S.muted}>{r.state}</Mono>
            </span>
          </div>
        )
      })}
    </Glass>
  )
}

const SCALE = [1.14, 1.3, 1.14, 1.3, 1.22, 1.14]
const STAGES = [StageForm, StageReply, StageList, StageTeam, StageRemind, StageFollow]
