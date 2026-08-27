/*
  Media — renders an image if one has been set in data.js `images`,
  otherwise a labelled placeholder well.

  Keeping the fallback visible (rather than collapsing to nothing) means
  the layout is laid out at its real proportions before the photography
  arrives, so dropping images in later changes pixels, not structure.
*/
export default function Media({ src, alt = '', label = 'Image', className = '' }) {
  const classes = ['media', className].filter(Boolean).join(' ')

  if (src) {
    return (
      <div className={classes}>
        <img className="media-img" src={src} alt={alt} loading="lazy" />
      </div>
    )
  }

  return (
    <div className={classes}>
      <div className="media-placeholder">
        <svg
          className="media-placeholder-icon"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="8.5" cy="9.5" r="1.75" fill="currentColor" />
          <path
            d="M4 17.5 9.2 12.6a2 2 0 0 1 2.7-.06L20 19.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="media-placeholder-label">{label}</span>
      </div>
    </div>
  )
}
