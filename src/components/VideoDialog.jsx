import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { holdScroll } from '../scroll/smooth.js'
import { track } from '../analytics.js'
import Icon from './icons.jsx'

/*
  A native <dialog> lightbox for the films. The film starts the moment it
  opens and loops, muted — that is what every player on the site does
  (CLAUDE.md, Film sound), so the pop-up opens the same way.

  Sound (case-film-sound, 2026-10-09): a film with `sound: true` in
  data.js carries a real audio track, so the bar shows a toggle next to
  Close. The dialog always opens muted, whatever the last film did;
  tapping the toggle is a user gesture, so unmuting is allowed even on
  iOS. A film without `sound` never shows the toggle and plays silent,
  exactly like before. Under reduced motion the native controls stay and
  carry their own mute button instead.

  Closes on Escape, on the close button or on a click outside the video,
  and pauses the film on close so nothing keeps playing unseen. The inner
  `FilmPanel` is keyed on the film's src, so a fresh one mounts every time
  a different film opens — that is what resets the sound toggle to off
  without an effect reaching back into state a prop change already
  explains.
*/
export default function VideoDialog({ film, onClose }) {
  const ref = useRef(null)

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

  /* Only this calls the native dialog.close(): every other close path
     (Escape, the Close button, a click on the backdrop) asks the dialog
     to close and lets the resulting native "close" event run handleClose
     below, so the caller's onClose fires only once the dialog has
     actually left the top layer. A caller that focuses its trigger
     button on close (ProjectDetailPage does) can then do it straight
     away, instead of racing the dialog's own close. */
  const requestClose = () => ref.current?.close()

  const handleClose = () => {
    ref.current?.querySelector('video')?.pause()
    onClose()
  }

  return (
    <dialog
      ref={ref}
      className="video-dialog"
      data-lenis-prevent
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === ref.current) requestClose()
      }}
      aria-label={film ? film.title : 'Video'}
    >
      {film && <FilmPanel key={film.src} film={film} requestClose={requestClose} />}
    </dialog>
  )
}

function FilmPanel({ film, requestClose }) {
  const videoRef = useRef(null)
  const reduce = useReducedMotion()
  const [soundOn, setSoundOn] = useState(false)

  /* Started from code rather than the autoplay attribute, so it starts
     as soon as this panel mounts with the dialog. */
  useEffect(() => {
    const v = videoRef.current
    if (!v || reduce) return
    v.muted = true
    v.play().catch(() => {})
  }, [reduce])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    if (videoRef.current) videoRef.current.muted = !next
    track('film_sound', { on: next, film: film.title })
  }

  return (
    <div className="video-dialog-inner">
      <div className="video-dialog-bar">
        <span>{film.title}</span>
        <div className="video-dialog-actions">
          {film.sound && (
            <button type="button" className="video-dialog-sound" onClick={toggleSound} aria-pressed={soundOn}>
              <Icon name={soundOn ? 'soundOn' : 'soundOff'} size={16} />
              {soundOn ? 'Sound on' : 'Sound off'}
            </button>
          )}
          <button type="button" className="video-dialog-close" onClick={requestClose}>
            Close
          </button>
        </div>
      </div>
      <video ref={videoRef} src={film.src} poster={film.poster} controls={reduce} muted loop playsInline />
    </div>
  )
}
