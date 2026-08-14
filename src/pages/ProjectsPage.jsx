import { Link } from 'react-router-dom'
import { projects } from '../data.js'

export default function ProjectsPage() {
  return (
    <section className="container page">
      <p className="eyebrow">Projects</p>
      <h1 className="page-title">Projects</h1>
      <p className="page-lede">Systems I have built.</p>
      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link to={`/projects/${project.slug}`}>
              <h2>{project.title}</h2>
              <div className="project-meta">
                <span>{project.index}</span>
                {project.private && <span>Private Client System</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
