/* Minimal monochrome glyphs for the front-desk flow (24px grid, 1.6
   stroke, round caps). Drawn for this showpiece; no brand marks. */

const GLYPHS = {
  wa: (
    <>
      <path d="M4.5 19.5 5.6 16A7.8 7.8 0 1 1 8.4 18.6Z" />
      <path d="M9.5 9.5c.3 2 2.2 4 4.6 4.6" />
    </>
  ),
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
  gmail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  docs: (
    <>
      <path d="M6 3.5h8l4 4v13H6Z" />
      <path d="M14 3.5v4h4M9 12h6M9 15.5h6" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13.5 6.5 5h11l2.5 8.5v5H4Z" />
      <path d="M4 13.5h4.5l1 2h5l1-2H20" />
    </>
  ),
}

export default function Glyph({ name, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
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
