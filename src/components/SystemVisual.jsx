export default function SystemVisual({ title, flow }) {
  return (
    <div
      className="system-visual"
      role="img"
      aria-label={`${title}: ${flow.join(' \u2192 ')}`}
    >
      <div className="system-visual-grid" />
      <div className="system-visual-flow" aria-hidden="true">
        {flow.map((step, i) => (
          <div key={step} className="system-visual-step">
            <span className="system-visual-node">{step}</span>
            {i < flow.length - 1 && (
              <span className="system-visual-edge">&rarr;</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
