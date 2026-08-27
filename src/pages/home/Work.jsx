import { Link } from 'react-router-dom'
import { projects, images } from '../../data.js'
import Media from '../../components/Media.jsx'

/* ---------------------------------------------------------------
   2 — Selected work. Real case studies, each with its own image
   slot; the card is the link.
   --------------------------------------------------------------- */
export default function Work() {
  return (
    <section className="work">
      <div className="container">
        <div className="split-head">
          <div>
            <p className="kicker">Selected Work</p>
            <h2 className="split-title">Problems, turned into systems</h2>
          </div>
          <p className="split-lede">
            Four builds for service businesses that were running their
            operations by hand. Each one starts with the process, not the tool.
          </p>
        </div>

        <ul className="work-grid">
          {projects.map((project) => (
            <li key={project.slug} className="work-item">
              <Link to={`/projects/${project.slug}`} className="work-card">
                <Media
                  className="work-media"
                  src={images.projects[project.slug]}
                  label={`Project ${project.index}`}
                  alt=""
                />
                <div className="work-body">
                  <div className="work-meta">
                    <span className="work-index">{project.index}</span>
                    {project.private && (
                      <span className="work-tag">Private client</span>
                    )}
                    <span className="work-tag">{project.timeline}</span>
                  </div>
                  <h3 className="work-title">{project.title}</h3>
                  <p className="work-summary">{project.summary}</p>
                  <span className="arrow-link">
                    View system
                    <span className="arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
