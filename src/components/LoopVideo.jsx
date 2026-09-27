import { useEffect, useRef, useState } from 'react'

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/*
  A silent, looping product film that behaves like an image until it is
  worth playing.

  - Nothing downloads but the poster until the element is near the
    viewport (preload="none", src attached on first intersection), so a
    page with five films costs five JPEGs on first load.
  - mode="inview" plays while on screen and pauses off it.
    mode="hover" plays on pointer hover or keyboard focus of the closest
    `.loop-video-host` ancestor — and falls back to in-view on touch
    screens, which have no hover.
  - Under prefers-reduced-motion it never autoplays: the poster stays,
    and the full film on the case-study page carries controls instead.
*/
export default function LoopVideo({ src, poster, mode = 'inview', className = '', label }) {
  const ref = useRef(null)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video || reducedMotion()) return undefined

    const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
    const byHover = mode === 'hover' && canHover
    let visible = false

    const play = () => {
      setArmed(true)
      const p = video.play()
      if (p && p.catch) p.catch(() => {})
    }
    const pause = () => video.pause()

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (entry.isIntersecting) {
          setArmed(true)
          if (!byHover) play()
        } else {
          pause()
        }
      },
      { rootMargin: '200px 0px', threshold: 0.15 }
    )
    io.observe(video)

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
      io.disconnect()
      if (host) {
        host.removeEventListener('pointerenter', enter)
        host.removeEventListener('pointerleave', leave)
        host.removeEventListener('focusin', enter)
        host.removeEventListener('focusout', leave)
      }
    }
  }, [mode])

  return (
    <video
      ref={ref}
      className={['loop-video', className].filter(Boolean).join(' ')}
      src={armed ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      tabIndex={-1}
    />
  )
}
