import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { holdScroll } from '../scroll/smooth.js'

/*
  A native <dialog> lightbox for the films. No player chrome: the film
  starts the moment it opens and loops, silent. Every film on the site is
  silent since 2026-10-09 (Aniket: the generated score and effects did
  not sound good), so there is no sound toggle, the video is always muted
  and the files carry no audio track (CLAUDE.md, Film sound).
  Under reduced motion it waits, with controls, for a deliberate play.
  Closes on Escape, on the close button or on a click outside the video,
  and pauses the film on close so nothing keeps playing unseen.
*/
export default function VideoDialog({ film, onClose }) {
  const ref = useRef(null)
  const videoRef = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (film && !dialog.open) dialog.showModal()
    if (!film && dialog.open) dialog.close()
  }, [film])

  /* Hold the page still behind the open lightbox: smooth scrolling stops
     (and Lenis clips <html>), so the wheel cannot glide the page away
     underneath the film. Released on close and on unmount. */
  useEffect(() => (film ? holdScroll() : undefined), [film])

  /* Started from code rather than the autoplay attribute, so it starts
     when the dialog opens (the element mounts with the film). */
  useEffect(() => {
    const v = videoRef.current
    if (!film || !v || reduce) return
    v.muted = true
    v.play().catch(() => {})
  }, [film, reduce])

  const close = () => {
    videoRef.current?.pause()
    onClose()
  }

  return (
    <dialog
      ref={ref}
      className="video-dialog"
      data-lenis-prevent
      onClose={close}
      onClick={(e) => {
        if (e.target === ref.current) close()
      }}
      aria-label={film ? film.title : 'Video'}
    >
      {film && (
        <div className="video-dialog-inner">
          <div className="video-dialog-bar">
            <span>{film.title}</span>
            <div className="video-dialog-actions">
              <button type="button" className="video-dialog-close" onClick={close}>
                Close
              </button>
            </div>
          </div>
          <video
            ref={videoRef}
            key={film.src}
            src={film.src}
            poster={film.poster}
            controls={reduce}
            muted
            loop
            playsInline
            // the native controls (reduced motion only) have their own mute
            // button; the films stay silent whatever it is set to
            onVolumeChange={(e) => {
              if (!e.currentTarget.muted) e.currentTarget.muted = true
            }}
          />
        </div>
      )}
    </dialog>
  )
}
