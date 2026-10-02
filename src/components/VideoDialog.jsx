import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/*
  A native <dialog> lightbox for the explainer films. No player chrome:
  the film starts the moment it opens and loops, with its sound on, since
  opening it was a deliberate click. A Sound toggle beside Close mutes it.
  Under reduced motion it waits, with controls, for a deliberate play.
  Closes on Escape, on the close button or on a click outside the video,
  and pauses the film on close so nothing keeps playing unseen.
*/
export default function VideoDialog({ film, onClose }) {
  const ref = useRef(null)
  const videoRef = useRef(null)
  const reduce = useReducedMotion()
  // Kept across opens: whoever turned the sound off once does not want it back.
  const [sound, setSound] = useState(true)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (film && !dialog.open) dialog.showModal()
    if (!film && dialog.open) dialog.close()
  }, [film])

  /* Started from code rather than the autoplay attribute: a browser that
     refuses audible playback (Safari can, even after the click) rejects
     play(), and the film should then still run, muted, not sit frozen. */
  useEffect(() => {
    const v = videoRef.current
    if (!film || !v || reduce) return
    v.muted = !sound
    v.play().catch(() => {
      v.muted = true
      setSound(false)
      v.play().catch(() => {})
    })
    // Only on a new film: toggling sound must not restart playback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [film, reduce])

  const toggleSound = () => {
    const v = videoRef.current
    const next = !sound
    setSound(next)
    if (v) v.muted = !next
  }

  const close = () => {
    videoRef.current?.pause()
    onClose()
  }

  return (
    <dialog
      ref={ref}
      className="video-dialog"
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
              <button
                type="button"
                className="video-dialog-sound"
                aria-label="Sound"
                aria-pressed={sound}
                onClick={toggleSound}
              >
                <SoundIcon on={sound} />
                {sound ? 'Sound off' : 'Sound on'}
              </button>
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
            muted={!sound}
            loop
            playsInline
            // the native controls have their own mute; keep the toggle in step
            onVolumeChange={(e) => setSound(!e.currentTarget.muted)}
          />
        </div>
      )}
    </dialog>
  )
}

/* A speaker with sound waves, or with a cross when muted. */
export function SoundIcon({ on }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 6h2.5l3.5-3v10l-3.5-3h-2.5z" fill="currentColor" stroke="none" />
      {on ? (
        <path d="M10.75 5.5a3.5 3.5 0 0 1 0 5M12.75 3.75a6 6 0 0 1 0 8.5" />
      ) : (
        <path d="M11 6l3.5 4M14.5 6l-3.5 4" />
      )}
    </svg>
  )
}
