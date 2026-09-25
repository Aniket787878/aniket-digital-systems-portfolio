/*
  Marquee — a seamless, slowly-scrolling strip. The children are rendered
  twice and the track is translated by exactly half its width on a loop, so
  the seam is invisible. It pauses on hover, fades at both edges, and — under
  reduced motion — stops moving and simply wraps (see .marquee in the CSS).

  Duration scales with the number of items so the pixels-per-second speed stays
  constant however many tools are in the row.
*/
export default function Marquee({ children, seconds = 32 }) {
  return (
    <div className="marquee" style={{ '--marquee-duration': `${seconds}s` }}>
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
