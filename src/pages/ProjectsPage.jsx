import { Link } from 'react-router-dom'
import { fx } from '../interactions/attrs.js'
import { projects, films, stills, stillLabel, mediaKind, whatsappPrefill } from '../data.js'
import LoopVideo from '../components/LoopVideo.jsx'
import ScreenStill from '../components/ScreenStill.jsx'
import { CheckCta, TalkCta, Rehook } from '../components/FunnelCta.jsx'
import { useDocumentTitle } from '../useDocumentTitle.js'

const toText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : '')

export default function ProjectsPage() {
  useDocumentTitle('Projects · Aniket')
  return (
    <section className="container page page-wide">
      <p className="eyebrow">Projects</p>
      <h1 className="page-title">Projects</h1>
      <p className="page-lede">
        Complete systems, each designed, built and shipped end to end. The
        clinic platform runs an eleven-therapist practice every
        day; the care journey platform, for online recovery care, is in
        pre-launch. The consent signer, the shared inbox and the lead
        research tool are tools I built to work the same ideas, and the last
        three are AI assistants for a fictional physio clinic.
      </p>
      {/* The story loop's question, asked before the proof: the visitor
          reads every card below with their own business in mind. */}
      <Rehook
        className="projects-rehook"
        question="Reading these for your own business?"
        label="See which one fits, in three minutes"
        placement="projects-top"
      />
      {/* A showcase, not a list: every project leads with its film. The
          working demos play real captures on hover; the client platforms
          play a schematic, and the badge on the media says which. A demo
          with real screens but no film yet shows one still, cropped to the
          reply that matters, with its own badge. */}
      <ul className="showcase">
        {projects.map((project, i) => {
          const summary = toText(project.summary)
          const index = toText(project.index)
          const film = films[project.slug]
          const still = !film && stills[project.slug]
          const real = mediaKind(project.slug) === 'real'
          const metrics = (project.metrics || []).slice(0, 2)

          return (
            <li key={project.slug} className={`showcase-item${i % 2 ? ' showcase-item-alt' : ''}`}>
              <Link to={`/projects/${project.slug}`} className="showcase-card loop-video-host" {...fx('lerp', 'view')}>
                <div className={`showcase-media${real ? '' : ' is-schematic'}`}>
                  {film && (
                    <LoopVideo
                      mode="hover"
                      src={real ? film.framed : film.src}
                      poster={real ? film.framedPoster : film.poster}
                      className="showcase-video"
                    />
                  )}
                  {still && (
                    <ScreenStill
                      src={still.cover.file}
                      focus={still.cover.focus}
                      className="showcase-video"
                    />
                  )}
                  <span className={`showcase-badge${real ? ' is-real' : ''}`}>
                    {still ? stillLabel.badge : real ? 'Real screens' : 'Illustrated · client records never shown'}
                  </span>
                </div>
                <div className="showcase-body">
                  <div className="showcase-meta">
                    {index && <span className="showcase-index">{index}</span>}
                    <span className="showcase-kind">
                      {real ? 'Working demo' : 'Production platform'}
                    </span>
                  </div>
                  <h2 className="showcase-title">{toText(project.title) || 'Untitled project'}</h2>
                  {summary && <p className="showcase-summary">{summary}</p>}
                  {metrics.length > 0 && (
                    <div className="showcase-metrics">
                      {metrics.map((metric) => (
                        <div key={metric.label}>
                          <span className="showcase-metric-n">{metric.n}</span>
                          <span className="showcase-metric-label">{metric.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="arrow-link showcase-link">
                    Read the case study
                    <span className="arrow" aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* After the proof, the rehook with context: no dead end at the
          bottom of the list. One primary (the free AI check), the call
          second (components/FunnelCta.jsx). */}
      <section className="case-cta projects-cta" aria-labelledby="projects-cta-title">
        <h2 className="case-cta-title" id="projects-cta-title">
          Want one of these for your business?
        </h2>
        <p className="case-cta-body">
          You don&rsquo;t need to know which one yet. The free AI check asks a few plain questions about
          your week and shows you, on the spot, the three jobs worth handing over first. Then you know
          what to build, what it costs and the date it goes live.
        </p>
        <div className="case-cta-actions">
          <CheckCta placement="projects-close" />
          <TalkCta message={whatsappPrefill.contact} whatsappLabel="Message me on WhatsApp" contactLabel="Start a conversation" />
        </div>
      </section>
    </section>
  )
}
