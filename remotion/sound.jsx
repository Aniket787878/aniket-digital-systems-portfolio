import { Audio, Sequence, interpolate, useVideoConfig } from 'remotion'
import click from './sfx/click.wav'
import tick from './sfx/tick.wav'
import whoosh from './sfx/whoosh.wav'
import whooshDown from './sfx/whoosh-down.wav'
import thump from './sfx/thump.wav'
import endtone from './sfx/endtone.wav'

/*
  The films' sound, in one place. Every sounded composition (the five
  Platform films, HeroReel, the five explainers) builds a list of cues from
  the same timing constants its pictures use and hands it to <Soundtrack>,
  so a cue is frame-accurate and moves when the timing moves. The card loops
  (Clip-, Framed-) build no cues and are rendered --muted.

  The effects are synthesised by scripts/make-sfx.py into remotion/sfx/ and
  bundled by Remotion's webpack from here, so they never ship in the site's
  public/ folder.

    click        the pointer's click pulse            (a soft tap)
    tick         a chip pill landing                  (glassy, quieter)
    whoosh       a camera push, a window arriving     (air, rising band)
    whooshDown   a window receding or leaving         (air, falling band)
    thump        the first word of a kinetic line     (low, rounded)
    end          "Book a free call" landing           (warm chord bloom)

  Music. Drop a track at remotion/audio/music.mp3 (or .m4a/.wav) and re-run
  scripts/render-videos.sh: the script loudness-normalises it to -20 LUFS
  into remotion/audio/music-bed.wav (gitignored), and every sounded film
  then plays it from frame 0 under the effects, cut to the film's length,
  with a 0.5 s fade-in, a 1.5 s fade-out and a ~6 dB duck under the end
  tone. With no music-bed.wav the films render effects-only.
*/

const SRC = { click, tick, whoosh, whooshDown, thump, end: endtone }

/* Linear gain per kind, set by ear-by-numbers against the -18 LUFS
   effects-only target (scripts measure it with ffmpeg ebur128). Every file
   is peak-normalised to -3 dBFS, so these are the whole mix. */
const LEVEL = { click: 0.75, tick: 0.5, whoosh: 0.95, whooshDown: 0.8, thump: 0.85, end: 0.9 }
export const SFX_GAIN = 0.84

/* How many frames before the visual event a sound starts, so its body
   lands on the event rather than after it: the whooshes swell for ~6
   frames into the move. The end tone is cued on the button's spring
   start and plays 4 frames in, when the spring is half-way and the
   button reads as landing. */
const LEAD = { click: 0, tick: 0, whoosh: 4, whooshDown: 3, thump: 0, end: -4 }

/* A cue: kind, the frame of the visual event, and a gain on top of the
   kind's level (0.6 for a lighter move, for example). */
export const cue = (kind, at, gain = 1) => ({ kind, at: Math.round(at) - LEAD[kind], gain })

/* The optional music bed. A missing file is an empty context, not an
   error, so effects-only renders need nothing switched off. */
const MUSIC = (() => {
  const ctx = import.meta.webpackContext('./audio', { recursive: false, regExp: /^\.\/music-bed\.wav$/ })
  const keys = ctx.keys()
  if (!keys.length) return null
  const m = ctx(keys[0])
  return typeof m === 'string' ? m : m.default
})()
export const hasMusic = Boolean(MUSIC)

const MUSIC_FADE_IN = 15 // 0.5 s
const MUSIC_FADE_OUT = 45 // 1.5 s
const DUCK = 0.5 // -6 dB under the end tone

/* cues: [{ kind, at, gain }] from cue(). The music ducks under the end
   tone's cue. */
export function Soundtrack({ cues }) {
  const { durationInFrames: D } = useVideoConfig()
  const list = tidy(cues, D)
  const endAt = list.find((c) => c.kind === 'end')?.at
  return (
    <>
      {list.map((c, i) => (
        <Sequence key={i} from={c.at} durationInFrames={Math.min(90, D - c.at)} layout="none" name={`sfx ${c.kind}`}>
          <Audio src={SRC[c.kind]} volume={Math.min(1, LEVEL[c.kind] * c.gain * SFX_GAIN)} />
        </Sequence>
      ))}
      {MUSIC && <Audio src={MUSIC} volume={(f) => musicVolume(f, D, endAt)} name="music" />}
    </>
  )
}

/* Drop cues outside the film, and a cue of the same kind within 3 frames
   of the one before it (two steps landing together read as one sound). */
function tidy(cues, D) {
  const sorted = cues.filter((c) => c && c.at >= 0 && c.at < D - 1).sort((a, b) => a.at - b.at)
  const last = {}
  return sorted.filter((c) => {
    if (last[c.kind] != null && c.at - last[c.kind] < 3) return false
    last[c.kind] = c.at
    return true
  })
}

function musicVolume(f, D, endAt) {
  const fade = Math.min(
    interpolate(f, [0, MUSIC_FADE_IN], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    interpolate(f, [D - MUSIC_FADE_OUT, D - 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )
  const duck =
    endAt == null
      ? 1
      : interpolate(f, [endAt - 6, endAt, endAt + 36, endAt + 60], [1, DUCK, DUCK, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return fade * duck
}
