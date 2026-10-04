/* Shared timing and easing for the cinematic films. Re-exports the Stage
   curves so every film moves the same way. */
import { easeOut, easeInOut, tween, settle, lerp, clamp } from '../stage/kit.jsx'

export { easeOut, easeInOut, tween, settle, lerp, clamp }

export const FPS = 30
export const sec = (s) => Math.round(s * FPS)

/* stagger between related elements (frames) */
export const STAGGER = 4
/* default enter / exit lengths (frames) */
export const ENTER = 18
export const EXIT = 12

/* pseudo-random, deterministic: same value every render */
export const rand = (i, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export const fade = (f, inAt, outAt, inDur = ENTER, outDur = EXIT) =>
  tween(f, inAt, inAt + inDur) * (1 - tween(f, outAt, outAt + outDur, easeInOut))
