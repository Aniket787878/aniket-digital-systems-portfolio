import { useParams, Link } from 'react-router-dom'
import { projects } from '../data.js'

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const project = projects.find((item) => item.slug === slug)

  if (!project) {
    return (
      <section className="container error-page">
        <h1>Project not found</h1>
        <p>The project you are looking for does not exist.</p>
        <Link to="/projects">Back to projects</Link>
      </section>
    )
  }

  return (
    <article className="container page">
      <Link to="/projects" className="back-link">
        &larr; All projects
      </Link>
      <p className="eyebrow">
        {project.index}
        {project.private ? ' · Private Client System' : ''}
      </p>
      <h1 className="page-title">{project.title}</h1>
      <p className="page-lede">{project.summary}</p>
      <p>{project.description}</p>
    </article>
  )
}
