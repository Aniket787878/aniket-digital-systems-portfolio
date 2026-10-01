/* Monochrome glyphs for the hero flow (24px grid, 1.6 stroke), drawn in
   the same hand as the AI showpiece's set so the two read as one. */
const GLYPHS = {
  web: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9h17M6.5 6.8h.01M8.8 6.8h.01" />
    </>
  ),
  desk: (
    <>
      <path d="M12 3.5 13.9 9 19.5 11l-5.6 2L12 18.5 10.1 13 4.5 11 10.1 9Z" />
      <path d="M18.5 3.5v3M17 5h3" />
    </>
  ),
  cal: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  sheet: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M4 9h16M4 14.5h16M10 3.5v17" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.2" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" stroke="none" />
}

export default function Glyph({ name, size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  )
}
