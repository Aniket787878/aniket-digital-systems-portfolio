import { useParams, Link } from 'react-router-dom'
import { projects, site } from '../data.js'
import SystemVisual from '../components/SystemVisual.jsx'

/* Every field below is optional in data.js — nothing here may assume it exists. */
const toList = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : []

const toText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : '')

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
  const availability = toText(site && site.availability)

  const eyebrow = [toText(project.index), project.private ? 'Private Client System' : '']
    .filter(Boolean)
    .join(' · ')

  const hasMeta = Boolean(role || timeline || stack.length)
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
          {stack.length > 0 && (
            <div className="case-meta-item">
              <dt className="case-meta-label">Stack</dt>
              <dd className="case-meta-value">
                <div className="project-stack case-meta-stack">
                  {stack.map((tool) => (
                    <span className="chip" key={tool}>
                      {tool}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
          )}
        </dl>
      )}

      {flow.length > 0 && (
        <figure className="case-visual">
          <SystemVisual title={title} flow={flow} />
        </figure>
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
        <h2 className="case-cta-title">Running a process that looks like this?</h2>
        <p className="case-cta-body">
          Tell me what the workflow is and where it breaks. I will map it and tell you what
          can be automated, what should stay manual, and what it takes to build.
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
