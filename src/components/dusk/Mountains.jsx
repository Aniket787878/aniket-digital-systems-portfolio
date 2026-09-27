/* A dusk ridge layer: see terrain.js for how the silhouette is drawn. */

/* One layer as a full-width SVG. `fill` can be a colour or a gradient id. */
export function Ridge({ d, fill, className, height = 400, children }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 1440 ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {children}
      <path d={d} fill={fill} />
    </svg>
  )
}
