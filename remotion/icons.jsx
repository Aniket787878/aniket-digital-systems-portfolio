/* Line glyphs for the flow nodes and illustrative UI. 24px grid, drawn with
   the current colour so a node can recolour them when it lights up. No
   product logos: these are generic marks, on purpose. */

/* Functions, not elements: JSX at module scope would run before Remotion
   has React on the page. */
const P = {
  form: () => (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
    </>
  ),
  spark: () => (
    <>
      <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  database: () => (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.8" />
      <path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6" />
      <path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
    </>
  ),
  chat: () => (
    <>
      <path d="M4.5 11.5c0-4 3.4-7 7.5-7s7.5 3 7.5 7-3.4 7-7.5 7c-1.1 0-2.2-.2-3.1-.6L4.5 19.5l1.1-3.6c-.7-1.3-1.1-2.8-1.1-4.4z" />
      <path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01" strokeWidth="2.6" />
    </>
  ),
  calendar: () => (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
      <path d="M9 14.5l2 2 4-4" />
    </>
  ),
  repeat: () => (
    <>
      <path d="M17 3.5l3 3-3 3" />
      <path d="M4 11.5v-1a4 4 0 0 1 4-4h12" />
      <path d="M7 20.5l-3-3 3-3" />
      <path d="M20 12.5v1a4 4 0 0 1-4 4H4" />
    </>
  ),
  bell: () => (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  clock: () => (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  moon: () => <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />,
  sun: () => (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
    </>
  ),
  doc: () => (
    <>
      <path d="M7 3.5h7l4 4v13H7z" />
      <path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6" />
    </>
  ),
  tag: () => (
    <>
      <path d="M3.5 12.5V4.5h8l9 9-8 8z" />
      <circle cx="8" cy="9" r="1.4" />
    </>
  ),
  shield: () => (
    <>
      <path d="M12 3.5l7 2.8v5.2c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6.3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  grid: () => (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15" />
    </>
  ),
  phone: () => (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />
  ),
  check: () => <path d="M5 12.5l4.5 4.5L19 7.5" />,
  send: () => (
    <>
      <path d="M4 11.5l16-7-6.5 16-2.5-6.5z" />
      <path d="M11 14l9-9.5" />
    </>
  ),
  user: () => (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20.5c1-3.6 4-5.5 7.5-5.5s6.5 1.9 7.5 5.5" />
    </>
  ),
  mail: () => (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  arrow: () => <path d="M5 12h14M13 6l6 6-6 6" />,
  alert: () => (
    <>
      <path d="M12 4l9 15.5H3z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  chart: () => (
    <>
      <path d="M4 20.5h16" />
      <path d="M7 16.5v-4M11.5 16.5v-8M16 16.5v-6" />
    </>
  ),
  lock: () => (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5v-3a4 4 0 0 1 8 0v3" />
    </>
  ),
}

export function Icon({ name, size = 28, color = 'currentColor', stroke = 1.9, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none', display: 'block', ...style }}
      aria-hidden="true"
    >
      {(P[name] || P.spark)()}
    </svg>
  )
}
