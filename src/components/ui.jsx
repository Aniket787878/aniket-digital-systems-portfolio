import Icon from './icons.jsx'

/* The small shared pieces of the Dusk system (docs/design-system.md). */

/* Icon + word on a tinted pill, above every section heading. */
export function PillLabel({ icon, children, className = '' }) {
  return (
    <span className={`pill-label ${className}`.trim()}>
      {icon && <Icon name={icon} size={15} />}
      {children}
    </span>
  )
}

/* Saffron filled circle with a white tick, then the line. */
export function TickList({ items, className = '' }) {
  return (
    <ul className={`tick-list ${className}`.trim()}>
      {items.map((item) => (
        <li key={item}>
          <span className="tick" aria-hidden="true">
            <Icon name="check" size={12} strokeWidth={2.6} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}
