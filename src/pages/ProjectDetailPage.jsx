import { useParams, Link } from 'react-router-dom'
import { projects, site, images, proofTools } from '../data.js'
import SystemDiagram from '../components/SystemDiagram.jsx'
import Media from '../components/Media.jsx'

/* Every field below is optional in data.js — nothing here may assume it exists. */
const toList = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : []

const toText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : '')

/*
  The reason a tool is on the list, where Aniket has already written one.

  These notes are not authored here — they are the same sentences the
  proof strip shows under the hero, which is the point: a buyer reading
  a case study and a buyer skimming the home page get the same answer to
  "why this and not something else", and there is only one place to edit
  when the answer changes.

  Matching is exact first, then prefix, which covers the one place the
  two lists disagree: `stack` says "Claude API" where `proofTools` says
  "Claude". Anything unmatched returns nothing and renders as a plain
  chip — half the entries (Google Calendar, PDF generation, Drive) have
  no stated rationale, and inventing one here would be worse than the
  gap.
*/
const toolNote = (tool) => {
  const name = tool.toLowerCase()
  const hit =
    proofTools.find((t) => t.name.toLowerCase() === name) ||
    proofTools.find((t) => name.startsWith(`${t.name.toLowerCase()} `))
  return hit ? hit.note : ''
}

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const position = projects.findIndex((item) => item.slug === slug)
  const project = position === -1 ? null : projects[position]

  if (!project) {
    return (
      <section className="container error-page">
        <h1>Project not found</h1>
        <p>The project you are looking for does not exist.</p>
        <Link to="/projects">Back to projects</Link>
      </section>
    )
  }

  const title = toText(project.title) || 'Project'
  const summary = toText(project.summary)
  const role = toText(project.role)
  const timeline = toText(project.timeline)
  const stack = toList(project.stack)
  const flow = toList(project.flow)
  const build = toList(project.system)
  const outcome = toList(project.outcome)
  const outcomeNote = toText(project.outcomeNote)
  /* Falls back to the older long-form description if `problem` is not set. */
  const problem = toText(project.problem) || toText(project.description)
  /* Richer, optional case-study blocks. Each is absent on a project that
     does not set it, so an older entry renders exactly as before. */
  const metrics = Array.isArray(project.metrics)
    ? project.metrics.filter((m) => m && (m.n || m.label))
    : []
  const features = Array.isArray(project.features)
    ? project.features.filter((f) => f && f.title)
    : []
  const stages = Array.isArray(project.stages)
    ? project.stages.filter((s) => s && s.title)
    : []
  const surfaces = Array.isArray(project.surfaces)
    ? project.surfaces.filter((s) => s && s.title)
    : []
  const decisions = Array.isArray(project.decisions)
    ? project.decisions.filter((d) => d && d.title)
    : []
  const availability = toText(site && site.availability)

  const eyebrow = [toText(project.index), project.private ? 'Private Client System' : '']
    .filter(Boolean)
    .join(' · ')

  const hasMeta = Boolean(role || timeline || flow.length)
  const banner = images.projects[project.slug]
  const prev = position > 0 ? projects[position - 1] : null
  const next = position < projects.length - 1 ? projects[position + 1] : null

  return (
    <article className="container page">
      <Link to="/projects" className="back-link">
        &larr; All projects
      </Link>

      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {summary && <p className="page-lede">{summary}</p>}

      {/* Outcome-first: the headline results sit above the fold, before the
          reader has to work for them. Every number here is real — a row count
          or a count of things built — never an estimate. */}
      {metrics.length > 0 && (
        <dl className="case-metrics">
          {metrics.map((m, i) => (
            <div className="case-metric" key={i}>
              <dt className="case-metric-n">{m.n}</dt>
              <dd className="case-metric-label">{m.label}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* The system, drawn. Captioned as a schematic on purpose: it is a
          diagram of the architecture, not a picture of the running
          software, and the caption is what keeps that distinction
          honest to a reader who only skims the visuals. */}
      <figure className="case-banner-figure">
        <SystemDiagram className="case-banner" variant={project.diagram} />
        <figcaption className="case-caption">
          Schematic of the system as built. Not a screenshot.
        </figcaption>
      </figure>

      {hasMeta && (
        <dl className="case-meta">
          {role && (
            <div className="case-meta-item">
              <dt className="case-meta-label">Role</dt>
              <dd className="case-meta-value">{role}</dd>
            </div>
          )}
          {timeline && (
            <div className="case-meta-item">
              <dt className="case-meta-label">Timeline</dt>
              <dd className="case-meta-value">{timeline}</dd>
            </div>
          )}
          {flow.length > 0 && (
            <div className="case-meta-item">
              <dt className="case-meta-label">Flow</dt>
              <dd className="case-meta-value case-meta-flow">
                {flow.map((stage, i) => (
                  <span key={stage} className="case-flow-stage">
                    {stage}
                    {i < flow.length - 1 && (
                      <span className="case-flow-arrow" aria-hidden="true">
                        &rarr;
                      </span>
                    )}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      )}

      {problem && (
        <section className="case-section">
          <h2 className="case-section-title">The problem</h2>
          <p className="case-body">{problem}</p>
        </section>
      )}

      {build.length > 0 && (
        <section className="case-section">
          <h2 className="case-section-title">What I built</h2>
          <ol className="case-steps">
            {build.map((item, i) => (
              <li key={i}>
                <span className="case-step-index" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="case-step-text">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {features.length > 0 && (
        <section className="case-section case-section-wide">
          <h2 className="case-section-title">What it does</h2>
          <div className="case-features">
            {features.map((f, i) => (
              <div className="case-feature" key={i}>
                <h3 className="case-feature-title">{f.title}</h3>
                {f.text && <p className="case-feature-text">{f.text}</p>}
                {Array.isArray(f.items) && f.items.length > 0 && (
                  <ul className="case-feature-list">
                    {f.items.map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {stages.length > 0 && (
        <section className="case-section case-section-wide">
          <h2 className="case-section-title">The journey, end to end</h2>
          <ol className="case-journey">
            {stages.map((s, i) => (
              <li className={`case-stage${s.safety ? ' case-stage-safety' : ''}`} key={i}>
                <span className="case-stage-n" aria-hidden="true">
                  {s.safety ? '✳' : String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="case-stage-title">{s.title}</h3>
                  {s.text && <p className="case-stage-text">{s.text}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {surfaces.length > 0 && (
        <section className="case-section case-section-wide">
          <h2 className="case-section-title">One codebase, every point of view</h2>
          <div className="case-features">
            {surfaces.map((s, i) => (
              <div className="case-feature" key={i}>
                {s.role && <span className="case-feature-role">{s.role}</span>}
                <h3 className="case-feature-title">{s.title}</h3>
                {s.text && <p className="case-feature-text">{s.text}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {decisions.length > 0 && (
        <section className="case-section">
          <h2 className="case-section-title">Decisions that shaped it</h2>
          <dl className="case-decisions">
            {decisions.map((d, i) => (
              <div className="case-decision" key={i}>
                <dt className="case-decision-title">{d.title}</dt>
                {d.text && <dd className="case-decision-text">{d.text}</dd>}
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Stack with the reasoning attached, rather than a row of chips.
          A logo-ish list of tools is the part of a case study everyone
          writes and nobody reads; the reason a tool was chosen over the
          obvious alternative is the part a technical reader is actually
          scanning for, and the part a client uses to decide whether
          they are buying judgement or a preference. */}
      {stack.length > 0 && (
        <section className="case-section">
          <h2 className="case-section-title">The stack, and why</h2>
          <dl className="case-stack">
            {stack.map((tool) => {
              const note = toolNote(tool)
              return (
                <div className="case-stack-item" key={tool}>
                  <dt className="case-stack-name">{tool}</dt>
                  {note && <dd className="case-stack-note">{note}</dd>}
                </div>
              )
            })}
          </dl>
        </section>
      )}

      {/* The one slot on the site where a real screenshot belongs. It
          renders only once images.projects[slug] is set in data.js:
          an empty slot shows nothing at all, because a dashed
          placeholder well on a live page reads as a broken build
          rather than as an honest gap. */}
      {banner && (
        <figure className="case-shot">
          <Media
            className="case-shot-media"
            src={banner}
            label="Screenshot"
            alt={`Screenshot from ${title}`}
          />
        </figure>
      )}

      {outcome.length > 0 && (
        <section className="case-section">
          <h2 className="case-section-title">Outcome</h2>
          <ul className="case-outcome">
            {outcome.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          {outcomeNote && <p className="case-note">{outcomeNote}</p>}
        </section>
      )}

      {(prev || next) && (
        <nav className="case-nav" aria-label="More projects">
          {prev && (
            <Link className="case-nav-link" to={`/projects/${prev.slug}`}>
              <span className="case-nav-label">&larr; Previous</span>
              <span className="case-nav-title">{toText(prev.title) || 'Previous project'}</span>
            </Link>
          )}
          {next && (
            <Link className="case-nav-link case-nav-next" to={`/projects/${next.slug}`}>
              <span className="case-nav-label">Next &rarr;</span>
              <span className="case-nav-title">{toText(next.title) || 'Next project'}</span>
            </Link>
          )}
        </nav>
      )}

      <section className="case-cta">
        <h2 className="case-cta-title">Have something like this to build?</h2>
        <p className="case-cta-body">
          Tell me what you are trying to build and where it is stuck. I will map the whole
          thing — product, app, payments, backend, AI, infrastructure — and tell you what
          it takes to ship it.
        </p>
        {availability && <p className="case-cta-note">{availability}</p>}
        <Link to="/contact" className="btn btn-primary">
          Start a conversation
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>
    </article>
  )
}
