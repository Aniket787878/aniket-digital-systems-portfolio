import { Audio, Sequence, useVideoConfig } from 'remotion'
import click from '../sfx/click.wav'
import tick from '../sfx/tick.wav'
import whoosh from '../sfx/whoosh.wav'
import whooshDown from '../sfx/whoosh-down.wav'
import thump from '../sfx/thump.wav'
import endtone from '../sfx/endtone.wav'
import pop from '../sfx/pop.wav'
import key from '../sfx/key.wav'
import glass from '../sfx/glass.wav'
import flood from '../sfx/flood.wav'
import paper from '../sfx/paper.wav'
import strike from '../sfx/strike.wav'
import roll from '../sfx/roll.wav'
import PEAKS from '../sfx/peaks-v3.json'

/*
  The v3 films' sound: no voice. A bed-only score generated in code
  (scripts/make-music-v3.py -> remotion/audio/score-<film>-v3.mp3, already
  arranged on the films' 120 BPM grid with its drop, breaks and CTA chord)
  and the beat-timed effects on top.

  A cue names the frame of the visual hit. Each effect starts early by its
  measured peak (remotion/sfx/peaks-v3.json, from scripts/make-sfx-v3.py),
  so the loudest moment of the sound lands on that frame, not the file's
  start. Kept apart from remotion/sound.jsx so the v1/v2 films are
  untouched.
*/

const SRC = { click, tick, whoosh, whooshDown, thump, end: endtone, pop, key, glass, flood, paper, strike, roll }
const PEAK_KEY = { whooshDown: 'whoosh-down', end: 'endtone' }

/* Linear gain per kind: the effects sit about 6 dB under the bed's peaks;
   key is the quiet per-word tap (about -24 dB). */
const LEVEL = { click: 0.5, tick: 0.4, whoosh: 0.55, whooshDown: 0.5, thump: 0.6, end: 0.65, pop: 0.45, key: 0.09, glass: 0.32, flood: 0.55, paper: 0.45, strike: 0.5, roll: 0.35 }
const GAIN = 0.8

export const cue3 = (kind, at, gain = 1) => ({ kind, at: Math.round(at - (PEAKS[PEAK_KEY[kind] || kind] ?? 0)), gain })

const SCORES = (() => {
  const ctx = import.meta.webpackContext('../audio', { recursive: false, regExp: /^\.\/score-.*-v3\.mp3$/ })
  return Object.fromEntries(
    ctx.keys().map((k) => {
      const m = ctx(k)
      return [k.replace(/^\.\/score-|\.mp3$/g, ''), typeof m === 'string' ? m : m.default]
    })
  )
})()

export function Soundtrack3({ cues, score }) {
  const { durationInFrames: D } = useVideoConfig()
  const list = cues.filter((c) => c && c.at >= 0 && c.at < D - 1).sort((a, b) => a.at - b.at)
  const src = SCORES[score]
  return (
    <>
      {list.map((c, i) => (
        <Sequence key={i} from={c.at} durationInFrames={Math.min(90, D - c.at)} layout="none" name={`sfx ${c.kind}`}>
          <Audio src={SRC[c.kind]} volume={Math.min(1, LEVEL[c.kind] * c.gain * GAIN)} />
        </Sequence>
      ))}
      {src && <Audio src={src} volume={1} name={`score ${score}`} />}
    </>
  )
}
