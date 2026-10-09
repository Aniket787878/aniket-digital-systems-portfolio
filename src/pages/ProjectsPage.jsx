import { projects, whatsappPrefill } from '../data.js'
import ProjectCard from '../components/ProjectCard.jsx'
import { projectCard } from '../components/projectCard.js'
import { CheckCta, TalkCta, Rehook } from '../components/FunnelCta.jsx'
import { useDocumentTitle } from '../useDocumentTitle.js'

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
        research tool are tools I built to work the same ideas, and the next
        three are AI assistants for a fictional physio clinic. The last three
        are demo screens for made-up businesses: designed screens that show a
        flow step by step, not live systems.
      </p>
      {/* The story loop's question, asked before the proof: the visitor
          reads every card below with their own business in mind. */}
      <Rehook
        className="projects-rehook"
        question="Reading these for your own business?"
        label="See which one fits, in three minutes"
        placement="projects-top"
      />
      {/* The same card as the service-page proof grids (components/
          ProjectCard.jsx), so a project looks the same wherever it is
          met. The lead project goes wide; the rest pair up beneath it.
          Each card's meta row carries its number and its truth label
          (illustrated, real screens, recorded test run or made-up
          business); the label never sits on the picture. */}
      <ul className="pc-showcase">
        {projects.map((project, i) => (
          <li key={project.slug}>
            <ProjectCard
              card={projectCard(project.slug)}
              as="h2"
              layout={i === 0 ? 'wide' : undefined}
              showIndex
              metrics={(project.metrics || []).slice(0, 2)}
            />
          </li>
        ))}
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
