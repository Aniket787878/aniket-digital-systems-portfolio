import { useCallback, useEffect, useRef, useState } from 'react'

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* How long a requested play may sit buffering before we give up and offer
   a reload. Long enough for a slow 4G connection to fill the first few
   seconds of a ~1 Mbps film, short enough that a dead request is noticed. */
const STALL_MS = 12000
/* Spinner shows only if buffering lasts longer than this, so a film that
   starts at once never flashes it. */
const SPINNER_DELAY_MS = 350

/*
  A silent, looping product film that behaves like an image until it is
  worth playing.

  - Nothing downloads but the poster until the element is near the
    viewport (preload="none", src attached on first intersection), so a
    page with five films costs five JPEGs on first load. The margin is
    generous (a screen and a half) so in-view films have buffered by the
    time they are on screen.
  - mode="inview" plays while on screen and pauses off it, buffering the
    whole film (preload="auto") once armed.
    mode="hover" plays on pointer hover or keyboard focus of the closest
    `.loop-video-host` ancestor — and falls back to in-view on touch
    screens, which have no hover. It only fetches metadata until hovered.
  - While a requested play is buffering, a spinner sits over the poster.
    If it stalls for STALL_MS or errors, it retries once on its own, then
    shows a "Reload video" button (a quiet notice instead when the film is
    inside a link, since a button inside a link would navigate).
  - Under prefers-reduced-motion it never autoplays: the poster stays,
    and the full film on the case-study page carries controls instead.
*/
export default function LoopVideo({ src, poster, mode = 'inview', className = '', label }) {
  const ref = useRef(null)
  /* idle: poster only · loading: play requested, not yet playing ·
     playing · failed: gave up, offer a reload */
  const [status, setStatus] = useState('idle')
  const [inLink, setInLink] = useState(false)
  const retried = useRef(false)

  const reload = useCallback((e) => {
    e?.preventDefault()
    e?.stopPropagation()
    const video = ref.current
    if (!video) return
    retried.current = false
    setStatus('loading')
    video.load()
    const p = video.play()
    if (p && p.catch) p.catch(() => {})
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video || reducedMotion()) return undefined
    setInLink(Boolean(video.closest('a')))

    const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
    const byHover = mode === 'hover' && canHover
    let visible = false
    let wanted = false
    let spinnerTimer = 0
    let stallTimer = 0

    const clearTimers = () => {
      clearTimeout(spinnerTimer)
      clearTimeout(stallTimer)
    }
    const fail = () => {
      clearTimers()
      if (!retried.current) {
        retried.current = true
        video.load()
        if (wanted) {
          const p = video.play()
          if (p && p.catch) p.catch(() => {})
          stallTimer = setTimeout(fail, STALL_MS)
        }
        return
      }
      setStatus('failed')
    }
    const buffering = () => {
      if (!wanted) return
      clearTimers()
      spinnerTimer = setTimeout(() => setStatus('loading'), SPINNER_DELAY_MS)
      stallTimer = setTimeout(fail, STALL_MS)
    }

    /* The source is attached imperatively, right here, rather than through
       React state. The state version rendered the src a tick AFTER play()
       was called, so the first play() hit a video with no source, failed
       silently, and an in-view film sat on its poster until it was
       scrolled away and back. Setting it on the element first means
       play() always has something to play. */
    const arm = () => {
      if (video.getAttribute('src') !== src) {
        video.preload = byHover ? 'metadata' : 'auto'
        video.setAttribute('src', src)
      }
    }
    const play = () => {
      arm()
      wanted = true
      if (video.readyState < 3) buffering()
      const p = video.play()
      if (p && p.catch) p.catch(() => {})
    }
    const pause = () => {
      wanted = false
      clearTimers()
      video.pause()
      setStatus((s) => (s === 'loading' ? 'idle' : s))
    }

    const onPlaying = () => {
      clearTimers()
      retried.current = false
      setStatus('playing')
    }
    video.addEventListener('playing', onPlaying)
    video.addEventListener('waiting', buffering)
    video.addEventListener('error', fail)

    /* Two observers, two jobs. `near` arms the film (starts buffering) a
       screen and a half before it arrives; `onScreen` plays it once 15% is
       visible and pauses it when it leaves. */
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) arm()
      },
      { rootMargin: '150% 0px' }
    )
    const onScreen = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          if (!byHover) play()
        } else {
          pause()
        }
      },
      { threshold: 0.15 }
    )
    near.observe(video)
    onScreen.observe(video)

    let host = null
    const enter = () => visible && play()
    const leave = () => pause()
    if (byHover) {
      host = video.closest('.loop-video-host') || video
      host.addEventListener('pointerenter', enter)
      host.addEventListener('pointerleave', leave)
      host.addEventListener('focusin', enter)
      host.addEventListener('focusout', leave)
    }

    return () => {
      clearTimers()
      near.disconnect()
      onScreen.disconnect()
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('waiting', buffering)
      video.removeEventListener('error', fail)
      if (host) {
        host.removeEventListener('pointerenter', enter)
        host.removeEventListener('pointerleave', leave)
        host.removeEventListener('focusin', enter)
        host.removeEventListener('focusout', leave)
      }
    }
  }, [mode, src])

  return (
    <>
      <video
        ref={ref}
        className={['loop-video', className].filter(Boolean).join(' ')}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        aria-hidden={label ? undefined : 'true'}
        tabIndex={-1}
      />
      {status === 'loading' && (
        <span className="loop-video-status" role="status" aria-label="Loading video">
          <span className="loop-video-spinner" aria-hidden="true" />
        </span>
      )}
      {status === 'failed' && (
        <span className="loop-video-status">
          {inLink ? (
            <span className="loop-video-note">Video didn&rsquo;t load</span>
          ) : (
            <button type="button" className="loop-video-reload" onClick={reload}>
              Reload video
            </button>
          )}
        </span>
      )}
    </>
  )
}
