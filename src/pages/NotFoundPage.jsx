import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="container error-page">
      <p className="eyebrow">404</p>
      <h1>This page doesn&rsquo;t exist</h1>
      <p className="page-lede">
        The link is broken or the page has moved. Nothing went wrong on your
        end &mdash; here is the rest of the site.
      </p>

      <ul className="project-list">
        <li>
          <Link to="/">
            <h2>Home</h2>
            <div className="project-meta">
              <span>Start here</span>
            </div>
          </Link>
        </li>
        <li>
          <Link to="/projects">
            <h2>Projects</h2>
            <div className="project-meta">
              <span>The work</span>
            </div>
          </Link>
        </li>
        <li>
          <Link to="/contact">
            <h2>Get in touch</h2>
            <span className="arrow-link">
              Tell me what you were looking for{' '}
              <span className="arrow">&rarr;</span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  )
}
