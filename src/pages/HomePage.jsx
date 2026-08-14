import { Link } from 'react-router-dom'
import { projects } from '../data.js'
import SystemVisual from '../components/SystemVisual.jsx'
import './HomePage.css'

const capabilities = [
  { index: '01', title: 'Digital Systems' },
  { index: '02', title: 'Web & Apps' },
  { index: '03', title: 'AI & Automation' },
  { index: '04', title: 'Growth Systems' }
]

const processSteps = [
  {
    index: '01',
    title: 'Understand',
    text: 'Understand the people, process and actual problem.'
  },
  {
    index: '02',
    title: 'Map',
    text: 'Break the process into workflows, decisions and touchpoints.'
  },
  {
    index: '03',
    title: 'Design',
    text: 'Design the experience and the system behind it.'
  },
  {
    index: '04',
    title: 'Build',
    text: 'Build the product, integrations and infrastructure required.'
  },
  {
    index: '05',
    title: 'Automate',
    text: 'Remove repetitive manual work wherever automation makes sense.'
  },
  {
    index: '06',
    title: 'Add intelligence',
    text: 'Use AI where it genuinely improves understanding, decisions or execution.'
  },
  {
    index: '07',
    title: 'Improve',
    text: 'Measure, learn and keep improving the system.'
  }
]

const buildCategories = [
  {
    title: 'Digital Experiences',
    items: ['Websites', 'Funnels', 'PWAs', 'Apps']
  },
  {
    title: 'Business Systems',
    items: ['Dashboards', 'Internal tools', 'Portals', 'Workflow systems']
  },
  {
    title: 'Intelligent Systems',
    items: ['AI assistants', 'Agents', 'Knowledge systems', 'Content systems']
  },
  {
    title: 'Automation',
    items: ['APIs', 'Integrations', 'Notifications', 'Repetitive workflows']
  }
]

function ProjectMeta({ project }) {
  return (
    <div className="project-meta">
      <span className="meta">{project.index}</span>
      {project.private && <span className="meta">Private Client System</span>}
    </div>
  )
}

export default function HomePage() {
  const featured = projects[0]
  const rest = projects.slice(1)

  return (
    <div className="home">
      {/* Hero — huge statement + supporting text + numbered capabilities */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-grid">
            <div className="hero-headline">
              <p className="hero-eyebrow">Hey, I&rsquo;m Aniket.</p>
              <h1 className="hero-title">
                I turn complicated workflows into better digital systems.
              </h1>
            </div>
            <p className="hero-lede">
              I design and build websites, apps, automations and AI-powered
              systems that make work simpler, faster and more scalable.
            </p>
          </div>
          <ol className="capabilities-row">
            {capabilities.map((item) => (
              <li key={item.index} className="capability">
                <span className="capability-hash">#</span>
                <span className="capability-index">{item.index}</span>
                <span className="capability-title">{item.title}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Large featured system */}
      <section className="featured">
        <p className="kicker">Featured system</p>
        <Link
          to={`/projects/${featured.slug}`}
          className="featured-card"
        >
          <div className="featured-visual">
            <SystemVisual title={featured.title} flow={featured.flow} />
          </div>
          <div className="featured-caption">
            <ProjectMeta project={featured} />
            <div>
              <h2 className="featured-title">{featured.title}</h2>
              <p className="featured-summary">{featured.summary}</p>
            </div>
            <span className="arrow-link">
              View system <span className="arrow">&rarr;</span>
            </span>
          </div>
        </Link>
      </section>

      {/* Editorial statement */}
      <section className="statement">
        <div className="statement-grid">
          <p className="kicker">Why systems</p>
          <div>
            <h2 className="statement-title">
              I like figuring out how things work.
            </h2>
            <p className="statement-copy">
              I enjoy taking complicated ideas, inefficient processes and
              repetitive work and turning them into simpler digital systems.
            </p>
            <p className="statement-copy">
              My work sits across product thinking, web, AI and automation.
            </p>
          </div>
        </div>
      </section>

      {/* Featured systems — varied compositions */}
      <section className="projects">
        <div className="projects-head">
          <p className="kicker">Selected systems</p>
          <h2 className="projects-title">
            Problems I&rsquo;ve turned into systems.
          </h2>
        </div>
        <div className="projects-list">
          {rest.map((project, i) => {
            const kind = i % 3
            if (kind === 2) {
              return (
                <Link
                  key={project.slug}
                  to={`/projects/${project.slug}`}
                  className="project-full"
                >
                  <div className="project-full-visual">
                    <SystemVisual title={project.title} flow={project.flow} />
                  </div>
                  <div className="project-full-caption">
                    <ProjectMeta project={project} />
                    <h3 className="project-full-title">{project.title}</h3>
                    <p className="project-full-summary">{project.summary}</p>
                    <span className="arrow-link">
                      View system <span className="arrow">&rarr;</span>
                    </span>
                  </div>
                </Link>
              )
            }
            const reversed = kind === 1
            return (
              <Link
                key={project.slug}
                to={`/projects/${project.slug}`}
                className={`project-split${reversed ? ' project-split-reverse' : ''}`}
              >
                <div className="project-split-visual">
                  <SystemVisual title={project.title} flow={project.flow} />
                </div>
                <div className="project-split-caption">
                  <ProjectMeta project={project} />
                  <h3 className="project-split-title">{project.title}</h3>
                  <p className="project-split-summary">{project.summary}</p>
                  <span className="arrow-link">
                    View system <span className="arrow">&rarr;</span>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Process */}
      <section className="process">
        <div className="process-head">
          <p className="kicker">Process</p>
          <h2 className="process-title">I don&rsquo;t start with the tool.</h2>
          <p className="process-lede">
            I start by understanding how something works today, where the
            friction exists and what the better system should look like.
          </p>
        </div>
        <ol className="process-steps">
          {processSteps.map((step) => (
            <li key={step.index} className="process-step">
              <span className="process-step-index">{step.index}</span>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-text">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* What I build */}
      <section className="builds">
        <div className="builds-head">
          <p className="kicker">What I build</p>
          <h2 className="builds-title">What I build.</h2>
        </div>
        <ul className="build-list">
          {buildCategories.map((category, i) => (
            <li key={category.title} className="build-item">
              <span className="build-item-index">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="build-item-title">{category.title}</h3>
              <p className="build-item-items">{category.items.join(' \u00b7 ')}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="cta">
        <p className="cta-kicker">Start a system</p>
        <h2 className="cta-title">
          Have something inefficient, complicated or repetitive?
        </h2>
        <p className="cta-lede">Let&rsquo;s figure out the system behind it.</p>
        <Link to="/contact" className="btn btn-cta">
          Get in touch <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>
    </div>
  )
}
