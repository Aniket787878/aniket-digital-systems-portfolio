import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

/*
  A native <dialog> lightbox for the explainer films. No player chrome:
  the film starts the moment it opens and loops (the films are silent).
  Under reduced motion it waits, with controls, for a deliberate play.
  Closes on Escape, on the close button or on a click outside the video,
  and pauses the film on close so nothing keeps playing unseen.
*/
export default function VideoDialog({ film, onClose }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (film && !dialog.open) dialog.showModal()
    if (!film && dialog.open) dialog.close()
  }, [film])

  const close = () => {
    ref.current?.querySelector('video')?.pause()
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
            <button type="button" className="video-dialog-close" onClick={close}>
              Close
            </button>
          </div>
          <video
            key={film.src}
            src={film.src}
            poster={film.poster}
            autoPlay={!reduce}
            controls={reduce}
            muted
            loop
            playsInline
          />
        </div>
      )}
    </dialog>
  )
}
