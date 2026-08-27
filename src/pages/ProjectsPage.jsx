import { Link } from 'react-router-dom'
import { projects } from '../data.js'

const toList = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : []

const toText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : '')

export default function ProjectsPage() {
  return (
    <section className="container page page-wide">
      <p className="eyebrow">Projects</p>
      <h1 className="page-title">Projects</h1>
      <p className="page-lede">
        Systems built for service businesses that run on bookings, client intake,
        follow-ups and team coordination. Each one replaced a manual process.
      </p>
      <ul className="project-list">
        {projects.map((project) => {
          const stack = toList(project.stack)
          const summary = toText(project.summary)
          const role = toText(project.role)
          const timeline = toText(project.timeline)
          const index = toText(project.index)

          return (
            <li key={project.slug}>
              <Link to={`/projects/${project.slug}`}>
                <div className="case-index-main">
                  <h2>{toText(project.title) || 'Untitled project'}</h2>
                  {summary && <p className="case-index-summary">{summary}</p>}
                  {role && (
                    <p className="case-index-role">
                      <span className="case-index-role-label">Role</span>
                      {role}
                    </p>
                  )}
                  {stack.length > 0 && (
                    <div className="case-index-stack">
                      {stack.map((tool) => (
                        <span className="chip" key={tool}>
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="project-meta case-index-meta">
                  {index && <span>{index}</span>}
                  {timeline && <span>{timeline}</span>}
                  {project.private && <span>Private Client System</span>}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
