/* ---------------------------------------------------------------
   AnimatedFlow — an illustrative motion graphic of a project's flow.

   It plays the project's real `flow` stages in sequence: a saffron
   pulse sweeps left to right along the track while each node lights in
   turn, on a loop. This is a DIAGRAM IN MOTION, not a screen recording
   of the running software — the case page captions it as such, so it
   never gets read as a real product demo (the house rule against
   passing anything off as a screenshot/recording).

   Driven entirely by CSS keyframes rather than requestAnimationFrame:
   rAF does not fire in the preview pane (see CLAUDE.md), but CSS
   animations do, so the loop is visible there too. It freezes to a
   resting lit state under prefers-reduced-motion.
   --------------------------------------------------------------- */
export default function AnimatedFlow({ stages = [], className = '' }) {
  const list = Array.isArray(stages) ? stages.filter(Boolean) : []
  if (list.length < 2) return null

  return (
    <div
      className={`aflow ${className}`.trim()}
      style={{ '--aflow-count': list.length }}
      role="img"
      aria-label={`Flow, in sequence: ${list.join(', then ')}.`}
    >
      <div className="aflow-track" aria-hidden="true">
        <div className="aflow-line">
          <span className="aflow-line-fill" />
        </div>
        <ol className="aflow-nodes">
          {list.map((stage, i) => (
            <li key={stage} className="aflow-node" style={{ '--aflow-i': i }}>
              <span className="aflow-dot" />
              <span className="aflow-label">{stage}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
