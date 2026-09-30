import { m } from 'motion/react'
import { fx } from '../../interactions/attrs.js'
import FlowGraph from '../../components/FlowGraph.jsx'
import { PillLabel, TickList } from '../../components/ui.jsx'
import { reveal } from '../../motion/variants.js'

/* ---------------------------------------------------------------
   2c — How it connects. The FlowGraph draws itself as it enters:
   the tools a business already pays for, one system in the middle,
   the work it now does on its own. Illustrative of the pattern every
   build follows, not a diagram of one client.
   --------------------------------------------------------------- */
export default function Connect() {
  return (
    <section className="paper connect" id="how">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="flow">How it connects</PillLabel>
          <h2 className="h2" {...fx('split')}>
            Your tools, wired into
            <span className="soft">one system that runs itself.</span>
          </h2>
          <p className="center-lede">
            No new software to learn. I connect what you already use, put a
            little AI where it genuinely helps, and hand you the keys.
          </p>
        </m.header>

        <m.div className="connect-panel" {...reveal}>
          <FlowGraph />
        </m.div>

        <TickList
          className="tick-row"
          items={[
            'Built on the tools you already pay for',
            'Runs on your own accounts',
            'A walkthrough at handover'
          ]}
        />
      </div>
    </section>
  )
}
