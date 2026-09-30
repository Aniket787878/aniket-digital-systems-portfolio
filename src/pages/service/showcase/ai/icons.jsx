/* Minimal monochrome glyphs for the "What it did" rail, drawn for this
   showpiece only (24px grid, 1.6 stroke, round caps, no brand marks). */

const GLYPHS = {
  calendar: (
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
  faq: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6a2.4 2.4 0 0 1 4.6 1c0 1.6-2.2 1.8-2.2 3.4" />
      <path d="M12 17v.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 4 19h16Z" />
      <path d="M12 10v4M12 16.5v.01" />
    </>
  ),
}

export default function ToolIcon({ name, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
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
