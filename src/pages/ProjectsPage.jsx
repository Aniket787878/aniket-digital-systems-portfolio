import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { projects, whatsappPrefill, mediaKind } from '../data.js'
import ProjectCard from '../components/ProjectCard.jsx'
import { projectCard } from '../components/projectCard.js'
import { StartCta, TalkCta, Rehook } from '../components/FunnelCta.jsx'
import { useMedia, firstSentence } from './home/stage/work/shared.js'
import { track } from '../analytics.js'
import { useDocumentTitle } from '../useDocumentTitle.js'

/* Spec 6 (mobile plan, 11 Oct 2026): on phones, a 3-way switch replaces
   the one long list — Hick's law, honest groups instead of twelve equal
   cards, "In real use" (the two client platforms) first because it's the
   strongest proof. `kind` matches `mediaKind()` in data.js, so the
   counts always come from the same place every card's own label does.
   Desktop keeps the single full list, as before: no switch there. */
const TABS = [
  { id: 'live', label: 'In real use', kind: 'schematic' },
  { id: 'demos', label: 'Working demos', kind: 'real' },
  { id: 'screens', label: 'Demo screens', kind: 'demo' }
]

const LEDE =
  'Complete systems, each designed, built and shipped end to end. The ' +
  'clinic platform runs an eleven-therapist practice every ' +
  'day; the care journey platform, for online recovery care, is in ' +
  'pre-launch. The consent signer, the shared inbox and the lead ' +
  'research tool are tools I built to work the same ideas, and the next ' +
  'three are AI assistants for a fictional physio clinic. The last three ' +
  'are demo screens for made-up businesses: designed screens that show a ' +
  'flow step by step, not live systems.'

export default function ProjectsPage() {
  useDocumentTitle('Projects · Aniket')
  const phone = useMedia('(max-width: 760px)')
  const [params, setParams] = useSearchParams()

  const groups = useMemo(
    () => TABS.map((tab) => ({ ...tab, items: projects.filter((p) => mediaKind(p.slug) === tab.kind) })),
    []
  )

  const activeId = TABS.some((t) => t.id === params.get('show')) ? params.get('show') : TABS[0].id
  const activeGroup = groups.find((g) => g.id === activeId) ?? groups[0]

  function selectTab(id) {
    track('proj_tab', { tab: id })
    const next = new URLSearchParams(params)
    if (id === TABS[0].id) next.delete('show')
    else next.set('show', id)
    setParams(next, { replace: true })
  }

  /* Desktop never filters (as now); phones show only the active tab's
     cards, so "every project is reachable" by switching tabs. */
  const list = phone ? activeGroup.items : projects

  return (
    <section className="container page page-wide">
      <p className="eyebrow">Projects</p>
      <h1 className="page-title">Projects</h1>
      {/* Phones get the short version; the full paragraph (CSS, hidden on
          phones) carries the same facts for wider screens. Both sit in the
          DOM so a screen reader's reading order matches what shows. */}
      <p className="page-lede page-lede-phone">
        {firstSentence(LEDE)} Each one is labelled for what it is.
      </p>
      <p className="page-lede page-lede-full">{LEDE}</p>

      {/* The story loop's question, asked before the proof: the visitor
          reads every card below with their own business in mind. */}
      <Rehook
        className="projects-rehook"
        question="Reading these for your own business?"
        label="Start with what you want to build"
        placement="projects-top"
      />

      <div className="proj-switch" role="tablist" aria-label="Show projects by kind">
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={group.id === activeId}
            className={`proj-tab${group.id === activeId ? ' is-active' : ''}`}
            onClick={() => selectTab(group.id)}
          >
            {group.label} <span className="proj-tab-count">({group.items.length})</span>
          </button>
        ))}
      </div>

      {/* The same card as the service-page proof grids (components/
          ProjectCard.jsx), so a project looks the same wherever it is
          met. The lead project goes wide; the rest pair up beneath it.
          Each card's meta row carries its number and its truth label
          (illustrated, real screens, recorded test run or made-up
          business); the label never sits on the picture. */}
      <ul className="pc-showcase">
        {list.map((project, i) => (
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
        {/* The phone-only rehook, after the 2nd card of whichever tab is
            showing: "never invent content" stays intact (it says nothing
            about the projects, only points at /start). */}
        {phone && list.length > 2 && (
          <li className="pc-rehook" key="rehook">
            <p className="pc-rehook-q">Want one like this for your business?</p>
            <p className="pc-rehook-body">Pick website, software or AI and see what it starts at.</p>
            <Link
              to="/start"
              className="pc-rehook-link"
              onClick={() => track('cta_click', { placement: 'projects-mid' })}
            >
              Start here <span aria-hidden="true">&rarr;</span>
            </Link>
          </li>
        )}
      </ul>

      {/* After the proof, the rehook with context: no dead end at the
          bottom of the list. One primary ("Get started"), the call
          second (components/FunnelCta.jsx). */}
      <section className="case-cta projects-cta" aria-labelledby="projects-cta-title">
        <h2 className="case-cta-title" id="projects-cta-title">
          Want one of these for your business?
        </h2>
        <p className="case-cta-body">
          Pick a website, software or AI and answer a few plain questions. You see, on the spot, what
          fits and what it starts at. Not sure which? The free AI check is there too. Then you know what
          to build, what it costs and the date it goes live.
        </p>
        <div className="case-cta-actions">
          <StartCta placement="projects-close" />
          <TalkCta placement="projects" message={whatsappPrefill.contact} whatsappLabel="Message me on WhatsApp" contactLabel="Start a conversation" />
        </div>
      </section>
    </section>
  )
}
