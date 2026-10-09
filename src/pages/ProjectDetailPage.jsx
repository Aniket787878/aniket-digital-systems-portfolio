import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { films, projects, site, images, proofTools, whatsappPrefill, mediaKind } from '../data.js'
import { walkthroughs } from '../walkthroughs.js'
import { CheckCta, TalkCta } from '../components/FunnelCta.jsx'
import SystemDiagram from '../components/SystemDiagram.jsx'
import AnimatedFlow from '../components/AnimatedFlow.jsx'
import Media from '../components/Media.jsx'
import Walkthrough from '../components/Walkthrough.jsx'
import { SoundIcon } from '../components/VideoDialog.jsx'
import Counter from '../motion/Counter.jsx'
import { useDocumentTitle } from '../useDocumentTitle.js'

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

  useDocumentTitle(project ? `${project.title} · Aniket` : 'Project not found · Aniket')

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
  const film = films[project.slug]
  /* A demo with real screens and no film yet steps through its captures
     instead (data.js `stills`). A film, once rendered, takes precedence. */
  const steps = film ? [] : walkthroughs[project.slug] || []
  /* Who a project is built on, with the licence. Each entry is a link out
     (`href`), a link to another case study (`to`), or plain text. */
  const credit = Array.isArray(project.credit) ? project.credit.filter((c) => c && c.label) : []
  // Muted, so autoplay is allowed — but not for anyone who asked for less motion.
  const autoPlay = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
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

  const eyebrow = [toText(project.subtitle), mediaKind(project.slug) === 'real' ? 'Working demo' : 'Client project']
    .filter(Boolean)
    .join(' · ')

  const hasMeta = Boolean(role || timeline || flow.length || credit.length)
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
              <dt className="case-metric-n">
                <Counter value={m.n} />
              </dt>
              <dd className="case-metric-label">{m.label}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* The film. Two kinds (data.js `films`), and the caption says which:
          the working demos are real captures of the running app; the client
          platforms are a labelled schematic, never read as footage. */}
      {film ? (
        <figure className="case-video-figure">
          <FilmVideo
            src={film.src}
            poster={film.poster}
            autoPlay={autoPlay}
            label={`${film.kind === 'real' ? 'Walkthrough' : 'Illustrated film'} of ${title}`}
          />
          <figcaption className="case-caption">
            {film.kind === 'real'
              ? 'A walkthrough of the working app. Every screen is real; only the framing, zoom and captions are added.'
              : 'A drawing of the real flow. The real screens hold private client records, so they are drawn rather than shown.'}
          </figcaption>
        </figure>
      ) : steps.length > 0 ? (
        <Walkthrough steps={steps} title={title} />
      ) : (
        flow.length >= 2 && (
          <figure className="case-flow-figure">
            <AnimatedFlow stages={flow} />
            <figcaption className="case-caption">
              The steps in motion: an illustration, not a recording of the
              working app.
            </figcaption>
          </figure>
        )
      )}

      {/* The system, drawn. Captioned as a schematic on purpose: it is a
          diagram of the architecture, not a picture of the running
          software, and the caption is what keeps that distinction
          honest to a reader who only skims the visuals. Only when the
          project names a diagram: SystemDiagram renders nothing for an
          unknown key, and the caption alone would describe a picture that
          is not there. */}
      {project.diagram && (
        <figure className="case-banner-figure">
          <SystemDiagram className="case-banner" variant={project.diagram} />
          <figcaption className="case-caption">
            A drawing of how the system fits together. Not a screenshot.
            {/* Below 810px the diagram stops shrinking (its labels would hit
                ~4px) and scrolls sideways at a legible size instead. Without
                this line the cut-off right edge reads as a broken image rather
                than "there is more this way". Hidden on wide screens where the
                whole diagram is already visible. */}
            <span className="case-scroll-hint" aria-hidden="true">
              Scroll sideways to see the whole drawing &rarr;
            </span>
          </figcaption>
        </figure>
      )}

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
          {credit.length > 0 && (
            <div className="case-meta-item">
              <dt className="case-meta-label">Built on</dt>
              <dd className="case-meta-value case-credit">
                {credit.map((c, i) => (
                  <span key={c.label}>
                    {i > 0 && ', plus '}
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noopener noreferrer">
                        {c.label}
                      </a>
                    ) : c.to ? (
                      <Link to={c.to}>{c.label}</Link>
                    ) : (
                      c.label
                    )}
                    {c.licence && ` (${c.licence})`}
                  </span>
                ))}
              </dd>
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
          <h2 className="case-section-title">One system, a view for everyone</h2>
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
          <h2 className="case-section-title">Why it works this way</h2>
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

      {/* The tools, for developers only. Everything else on this page is
          written for a business owner (Aniket, 2026-09-28: "easy reading
          that a layman can understand"), so the programming names sit in
          a panel that stays closed unless someone asks for it. */}
      {stack.length > 0 && (
        <details className="case-tech">
          <summary className="case-tech-summary">Technical details, for developers</summary>
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
        </details>
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
        {/* The rehook after the proof, with this project's name as the
            context, into the one primary action. */}
        <h2 className="case-cta-title">Want something like the {title} in your business?</h2>
        <p className="case-cta-body">
          Which part of your week is still on WhatsApp threads and spreadsheets:
          bookings, intake, follow-ups or payments? The free AI check shows you in a
          few minutes which of them AI could take on first. Then we can talk about
          what it costs and the date it goes live.
        </p>
        {availability && <p className="case-cta-note">{availability}</p>}
        {/* One primary (the free AI check), the call second
            (components/FunnelCta.jsx). */}
        <div className="case-cta-actions">
          <CheckCta placement="case-study" />
          <TalkCta message={whatsappPrefill.contact} whatsappLabel="Message me on WhatsApp" contactLabel="Start a conversation" />
        </div>
      </section>
    </article>
  )
}

/* The case film plays muted on arrival (that is what lets it autoplay).
   "Sound on" unmutes and starts it again from the top, because the
   soundtrack is cut to the picture and joining it halfway explains
   nothing; pressing again only mutes. */
function FilmVideo({ src, poster, autoPlay, label }) {
  const ref = useRef(null)
  const [sound, setSound] = useState(false)

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (sound) {
      v.muted = true
      setSound(false)
      return
    }
    v.muted = false
    v.currentTime = 0
    setSound(true)
    v.play().catch(() => {
      v.muted = true
      setSound(false)
    })
  }

  return (
    <div className="case-video-wrap">
      <video
        ref={ref}
        className="case-video"
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={!sound}
        loop
        playsInline
        controls={!autoPlay}
        preload="metadata"
        aria-label={label}
        // the native controls (reduced motion) have their own mute
        onVolumeChange={(e) => setSound(!e.currentTarget.muted)}
      />
      <button type="button" className="case-sound" aria-label="Sound" aria-pressed={sound} onClick={toggle}>
        <SoundIcon on={sound} />
        {sound ? 'Sound off' : 'Sound on'}
      </button>
    </div>
  )
}
