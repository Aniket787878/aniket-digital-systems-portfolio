import { useReducedMotion } from 'motion/react'

/*
  The current in the stream of light. Every section draws its own piece
  of the stream (a scroll-drawn path, a scaled line, the curves into the
  loop and round the close button), each in its own way. Rather than
  teach five components to carry moving parts, the current lives in the
  line's paint: one repeating gradient, mounted once per page, that every
  piece strokes with (`stroke: url(#stage-current)` in HomePage.css).
  Moving the gradient moves bright packets down every piece at once, and
  the drawing (dash-based or scaled) keeps working untouched.

  userSpaceOnUse resolves in each referencing svg's own pixels, so the
  packets keep one size and speed everywhere. The svg is zero-size, not
  display:none: a gradient inside a display:none svg paints nothing.
  Reduced motion: the gradient stands still, so the line keeps its
  packets as a still pattern.
*/
export const CURRENT_PERIOD = 520

// Two comets per period, moving down: a long tail that brightens into a
// white-hot head, then a hard cut, which is what reads as current rather
// than a gradient. The second comet is short, so the rhythm is uneven.
const STOPS = [
  [0, 'dim'],
  [0.12, 'dim'],
  [0.3, 'warm'],
  [0.37, 'hot'],
  [0.39, 'core'],
  [0.4, 'dim'],
  [0.7, 'dim'],
  [0.79, 'hot'],
  [0.812, 'core'],
  [0.822, 'dim'],
  [1, 'dim']
]

const COLOUR = {
  dim: 'rgba(245, 135, 30, 0.34)',
  warm: 'rgba(245, 135, 30, 0.7)',
  hot: '#ff9d3c',
  core: '#fff4e4'
}

export default function Current() {
  const reduce = useReducedMotion()
  return (
    <svg className="stage-current-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient
          id="stage-current"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={CURRENT_PERIOD}
          spreadMethod="repeat"
        >
          {STOPS.map(([at, kind]) => (
            <stop key={at} offset={at} stopColor={COLOUR[kind]} />
          ))}
          {!reduce && (
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              from="0 0"
              to={`0 ${CURRENT_PERIOD}`}
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
        </linearGradient>
      </defs>
    </svg>
  )
}
