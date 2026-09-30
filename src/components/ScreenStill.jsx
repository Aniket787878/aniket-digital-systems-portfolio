/*
  One real capture, cropped to the part that matters: the still-image
  stand-in for a film (data.js `stills`). The captures are 1440x900 CSS
  pixels at 2x, and most of a chat screen is empty space above the
  messages, so showing the whole frame in a card would shrink the reply
  itself to a grey smudge. Instead the frame is `aspect` wide and the image
  is scaled and offset so `focus` (a rect in capture space) fills it,
  grown to the frame's shape around its centre and kept inside the image.

  Plain positioning in percentages, so it scales with the frame at every
  width and nothing moves: no transform, which the interaction layer and
  the card hover already use on the parents.
*/
const W = 1440
const H = 900

function fitCrop(focus, aspect) {
  const f = focus || { x: 0, y: 0, w: W, h: H }
  let w = f.w
  let h = f.h
  if (w / h > aspect) h = w / aspect
  else w = h * aspect
  if (w > W) {
    w = W
    h = w / aspect
  }
  if (h > H) {
    h = H
    w = h * aspect
  }
  const x = Math.min(Math.max(f.x + f.w / 2 - w / 2, 0), W - w)
  const y = Math.min(Math.max(f.y + f.h / 2 - h / 2, 0), H - h)
  return { x, y, w, h }
}

export default function ScreenStill({ src, focus, aspect = 16 / 9, alt = '', className = '', eager = false }) {
  const c = fitCrop(focus, aspect)
  return (
    <div className={['screen-still', className].filter(Boolean).join(' ')} style={{ aspectRatio: String(aspect) }}>
      <img
        src={src}
        alt={alt}
        width="2880"
        height="1800"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          width: `${(W / c.w) * 100}%`,
          left: `${(-c.x / c.w) * 100}%`,
          top: `${(-c.y / c.h) * 100}%`
        }}
      />
    </div>
  )
}
