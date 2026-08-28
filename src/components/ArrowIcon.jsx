/* The pill-button arrow. Shared by the nav, footer, hero, CTA band, FAQ
   and gallery — six callers, so it lives here rather than in any one
   of them. */
export default function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m0 0-6-6m6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
