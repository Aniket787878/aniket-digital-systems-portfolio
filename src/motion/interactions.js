/*
  Small, dependency-free interaction helpers, built in the site's own idiom.

  spotlightMove — writes the pointer position into two custom properties on the
  hovered element, which a `.spotlight::after` radial gradient in the CSS reads.
  Attach it as onPointerMove; the glow itself is CSS, and CSS gates it off under
  reduced motion and on touch, so this stays a pure progressive enhancement.
*/
export function spotlightMove(e) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
