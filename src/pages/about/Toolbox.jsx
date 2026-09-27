import { useState } from 'react'
import { m } from 'motion/react'
import { toolbox } from '../../data.js'
import { reveal } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import { PillLabel } from '../../components/ui.jsx'
import { handleTabKey } from './tabs.js'

const EASE = [0.22, 1, 0.36, 1]

/* ---------------------------------------------------------------
   The toolbox, sorted by what each tool does for the client rather
   than shown as a wall of tags. Outcomes on the left, the tools behind
   the selected one on the right.

   Selection follows click, tap and the arrow keys. A mouse hovering a
   row previews it too, but nothing is hover-only: every group is one
   tap away on a phone, where the panel sits right under the list.
   --------------------------------------------------------------- */
export default function Toolbox() {
  const [active, setActive] = useState(0)
  const group = toolbox[active]

  return (
    <section className="night about-toolbox" aria-labelledby="about-toolbox-title">
      <div className="container">
        <m.header className="about-band-head" {...reveal}>
          <PillLabel icon="layers" className="on-night">Toolbox</PillLabel>
          <h2 className="h2" id="about-toolbox-title">
            The tools, sorted by
            <br />
            <span className="soft">what they do for you.</span>
          </h2>
        </m.header>

        <m.div className="about-toolbox-grid" {...reveal}>
          <div
            className="about-toolbox-list"
            role="tablist"
            aria-label="What the tools do"
            aria-orientation="vertical"
          >
            {toolbox.map((g, i) => (
              <button
                key={g.key}
                type="button"
                role="tab"
                id={`about-tool-tab-${g.key}`}
                aria-selected={i === active}
                aria-controls="about-tool-panel"
                tabIndex={i === active ? 0 : -1}
                className={`about-toolbox-row${i === active ? ' is-active' : ''}`}
                onClick={() => setActive(i)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                onKeyDown={(e) => handleTabKey(e, i, toolbox.length, setActive, 'vertical')}
              >
                <span className="about-toolbox-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="about-toolbox-outcome">{g.outcome}</span>
                <span className="about-toolbox-arrow" aria-hidden="true">
                  <Icon name="arrow" size={16} />
                </span>
              </button>
            ))}
          </div>

          <div
            className="about-toolbox-panel"
            role="tabpanel"
            id="about-tool-panel"
            aria-labelledby={`about-tool-tab-${group.key}`}
          >
            <ul key={group.key} className="about-toolbox-tools">
              {group.tools.map((tool, i) => (
                <m.li
                  key={tool.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
                >
                  <h3 className="about-toolbox-name">{tool.name}</h3>
                  <p className="about-toolbox-note">{tool.note}</p>
                </m.li>
              ))}
            </ul>
          </div>
        </m.div>
      </div>
    </section>
  )
}
