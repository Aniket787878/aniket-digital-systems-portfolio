/*
  SystemDiagram — the site's own picture of the work.

  Every image slot used to hold an Unsplash photograph of an office. A
  stock photo of a meeting room tells a buyer nothing about a booking
  engine, and a portfolio that leans on them reads as a template. These
  are drawn instead: schematics of the systems described in data.js,
  built from the same tokens as the rest of the page.

  They are deliberately *schematic*, not photoreal. A drawn mock that
  imitates a screenshot would be a claim about software the reader
  cannot open — the same dishonesty as the stock photo, better dressed.
  A diagram is understood to be a diagram. Everything one shows (stage
  names, tool names, the shape of the flow) is already stated in prose
  on the same page.

  One format, 900x480, drawn once per case study and reused in all three
  landscape slots: the work cards, the projects list and the case-study
  banner. It scales with `preserveAspectRatio="xMidYMid meet"`, so a slot
  with a different aspect ratio letterboxes rather than crops, and the
  letterbox is invisible because the SVG ground and the slot background
  are the same colour.

  There is deliberately no portrait format. The process rows' hover slot
  is about 4.7:1, and a diagram scaled into it renders its labels at
  roughly five pixels — so that slot stayed a photograph slot, and sits
  empty until there is a real photograph to put in it.
*/

/* Resolved values rather than var() references: these are painted inside
   an <svg>, where a token that failed to resolve gives no warning and no
   pixels. They track index.css — surface, line, ink, muted, accent. */
const C = {
  ground: '#161616',
  panel: '#1e1e1e',
  panelHi: '#272727',
  stroke: '#343434',
  strokeSoft: '#282828',
  ink: '#ededed',
  muted: '#8f8f8f',
  accent: '#f5871e',
  accentDim: 'rgba(245, 135, 30, 0.16)',
  /* Booked and free slots in the availability grid. Pulled further
     apart than the panel greys because at card size — the work grid
     renders this about 380px wide — a two-step difference collapses
     into one flat block and the grid stops saying anything. */
  slotBusy: '#3a3a3a',
  slotFree: '#121212'
}

const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif'

/* ---------------------------------------------------------------
   Primitives. Everything below is composed from these five, which is
   what keeps four separate drawings looking like one system.
   --------------------------------------------------------------- */

/* Text. `caps` is the small tracked label used for every panel header. */
function T({ x, y, children, size = 13, fill = C.ink, weight = 500, anchor = 'start', caps = false }) {
  return (
    <text
      x={x}
      y={y}
      fontFamily={FONT}
      fontSize={caps ? 11 : size}
      fontWeight={caps ? 600 : weight}
      fill={caps ? C.muted : fill}
      textAnchor={anchor}
      letterSpacing={caps ? 1.1 : 0}
    >
      {caps ? String(children).toUpperCase() : children}
    </text>
  )
}

function Panel({ x, y, w, h, r = 10, fill = C.panel, stroke = C.stroke, dash }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeDasharray={dash}
    />
  )
}

/* A labelled box in a flow. `accent` marks the one step worth looking at
   first — at most one per drawing, or the emphasis stops meaning anything. */
function Node({ x, y, w, h = 44, label, sub, accent = false }) {
  return (
    <g>
      <Panel
        x={x}
        y={y}
        w={w}
        h={h}
        r={8}
        fill={accent ? C.accentDim : C.panelHi}
        stroke={accent ? C.accent : C.stroke}
      />
      <T x={x + 14} y={y + (sub ? 20 : h / 2 + 4)} size={12.5} fill={C.ink}>
        {label}
      </T>
      {sub && (
        <T x={x + 14} y={y + 36} size={11} fill={C.muted} weight={400}>
          {sub}
        </T>
      )}
    </g>
  )
}

/* Arrowheads are drawn as paths rather than <marker> elements: markers
   need a document-unique id, and several of these render on one page. */
function ArrowD({ x, y, len, color = C.stroke }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + len - 5} stroke={color} strokeWidth="1.5" />
      <path d={`M${x - 4} ${y + len - 6} L${x} ${y + len} L${x + 4} ${y + len - 6} Z`} fill={color} />
    </g>
  )
}

function ArrowR({ x, y, len, color = C.stroke }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + len - 5} y2={y} stroke={color} strokeWidth="1.5" />
      <path d={`M${x + len - 6} ${y - 4} L${x + len} ${y} L${x + len - 6} ${y + 4} Z`} fill={color} />
    </g>
  )
}

/* A pill. Used for status, owners and due dates. */
function Chip({ x, y, w, label, accent = false }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={20}
        rx={10}
        fill={accent ? C.accentDim : C.panel}
        stroke={accent ? C.accent : C.stroke}
        strokeWidth="1"
      />
      <T x={x + w / 2} y={y + 14} size={10.5} anchor="middle" fill={accent ? C.accent : C.muted} weight={600}>
        {label}
      </T>
    </g>
  )
}

/* Filler for text that is not meant to be read — a line of body copy in
   a mock. Kept at low contrast so it stays texture, never content. */
function Line({ x, y, w, o = 0.5 }) {
  return <rect x={x} y={y} width={w} height="6" rx="3" fill={C.stroke} opacity={o} />
}

/* ---------------------------------------------------------------
   Wide (900x480) — one per case study.
   --------------------------------------------------------------- */

/* 01 — Intelligent Booking & Resource System.
   The point of the drawing is the turnaround rule, because that is the
   part a reader cannot infer from the words "booking system". Every
   therapist sets a gap that has to hold between *every* adjacent pair of
   sessions — including the ones already sitting in their personal Google
   Calendar, which the engine does not control and cannot move.

   The third row is the behaviour this replaced. It stays in the picture
   because the fix only reads as a fix beside it: holding the original
   stride cost two bookable hours on any day with a mid-afternoon
   appointment in it.

   Every block is placed from real arithmetic — a 13:00–21:00 day,
   60-minute sessions, a 15-minute gap, one calendar booking at 14:30 —
   so the drawing cannot drift out of agreement with the prose beside it.

   An earlier version of this diagram showed a second-room constraint.
   The system has no concept of a room; that rule never existed. */

const DAY_START = 13
const DAY_HOURS = 8
const DAY_X = 56
const DAY_W = 476
const SESSION = 1
const GAP = 0.25
const BOOKED_FROM = 14.5
const BOOKED_TO = 15.5
const TRACK_H = 26

/* Clock time to pixels. Every block in the drawing goes through these
   two, which is what keeps the padded region exactly one gap wider than
   the booking on each side rather than approximately so. */
const hx = (h) => DAY_X + ((h - DAY_START) / DAY_HOURS) * DAY_W
const hw = (hours) => (hours / DAY_HOURS) * DAY_W
const clock = (h) => `${Math.floor(h)}:${String(Math.round((h - Math.floor(h)) * 60)).padStart(2, '0')}`

const trackY = (i) => 156 + i * 60

/* The empty day. Drawn under every row so the offered blocks read as
   things placed into a span, not as a bar chart. */
function Track({ y }) {
  return (
    <rect
      x={DAY_X}
      y={y}
      width={DAY_W}
      height={TRACK_H}
      rx={6}
      fill={C.slotFree}
      stroke={C.strokeSoft}
      strokeWidth="1.5"
    />
  )
}

/* One offered session, labelled with the start time it is actually
   offered at — 15:45 rather than a tidy 15:30, because the resumed
   cursor inherits the booking's minutes and rounding that away would
   throw bookable time out. */
function Slot({ h, y }) {
  return (
    <g>
      <rect x={hx(h)} y={y} width={hw(SESSION)} height={TRACK_H} rx={5} fill={C.accent} />
      <T x={hx(h) + hw(SESSION) / 2} y={y + 17} size={10.5} fill={C.ground} anchor="middle" weight={600}>
        {clock(h)}
      </T>
    </g>
  )
}

/* The event the engine found in the therapist's own calendar. */
function Booked({ y }) {
  const w = hw(BOOKED_TO - BOOKED_FROM)
  return (
    <g>
      <rect
        x={hx(BOOKED_FROM)}
        y={y}
        width={w}
        height={TRACK_H}
        rx={5}
        fill={C.slotBusy}
        stroke={C.stroke}
        strokeWidth="1.5"
      />
      <T x={hx(BOOKED_FROM) + w / 2} y={y + 17} size={10.5} fill={C.ink} anchor="middle" weight={600}>
        {clock(BOOKED_FROM)}
      </T>
    </g>
  )
}

function Booking() {
  /* Row 1: nothing in the way, so the cursor advances by duration + gap.
     Row 2: the booking padded by the gap on both sides, and the cursor
     resuming one gap after it ends. Row 3: the same day under the old
     stride, which stepped on by a whole session instead. */
  const clearDay = [13, 14.25, 15.5, 16.75, 18, 19.25]
  const fixed = [13, 15.75, 17, 18.25, 19.5]
  const stale = [13, 16.75, 18, 19.25]

  return (
    <g>
      <Panel x={32} y={56} w={524} h={392} />
      <T x={52} y={84} caps>Availability</T>
      <T x={52} y={104} size={11.5} fill={C.muted} weight={400}>
        One therapist · 60-minute sessions · 15-minute turnaround
      </T>

      {[13, 15, 17, 19, 21].map((h) => (
        <T key={h} x={hx(h)} y={128} size={10.5} fill={C.muted} anchor="middle" weight={600}>
          {clock(h)}
        </T>
      ))}

      {/* Row 1 — a clear day. */}
      <T x={52} y={trackY(0) - 8} size={11.5} fill={C.ink}>Clear day</T>
      <Track y={trackY(0)} />
      {clearDay.map((h) => (
        <Slot key={h} h={h} y={trackY(0)} />
      ))}

      {/* Row 2 — the rule doing its work. The padding is drawn before the
          booking so the booking sits on top of it: the dashed region is
          what the overlap test actually sees, not a second event. */}
      <T x={52} y={trackY(1) - 8} size={11.5} fill={C.ink}>
        With one 14:30 booking already in the calendar
      </T>
      <Track y={trackY(1)} />
      {/* Filled, not merely outlined: the padding is the whole point of
          this row, and as a hairline it was the least visible thing in a
          drawing built to explain it. */}
      <rect
        x={hx(BOOKED_FROM - GAP)}
        y={trackY(1) - 4}
        width={hw(BOOKED_TO - BOOKED_FROM + GAP * 2)}
        height={TRACK_H + 8}
        rx={7}
        fill={C.panelHi}
        stroke={C.stroke}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <Booked y={trackY(1)} />
      {fixed.map((h) => (
        <Slot key={h} h={h} y={trackY(1)} />
      ))}

      {/* Row 3 — the bug, held at low contrast so it reads as history. */}
      <T x={52} y={trackY(2) - 8} size={11.5} fill={C.muted} weight={400}>
        What it replaced — 14:15 and 15:30 both lost
      </T>
      <g opacity="0.45">
        <Track y={trackY(2)} />
        <Booked y={trackY(2)} />
        {stale.map((h) => (
          <Slot key={h} h={h} y={trackY(2)} />
        ))}
      </g>

      <line x1={52} y1={330} x2={536} y2={330} stroke={C.strokeSoft} strokeWidth="1.5" />

      {[
        { text: 'Offered', fill: C.accent, stroke: C.accent },
        { text: 'In the calendar', fill: C.slotBusy, stroke: C.stroke },
        { text: 'Gap applied to the block', fill: 'none', stroke: C.stroke, dashed: true }
      ].map((item, i) => (
        <g key={item.text}>
          <rect
            x={52 + i * 150}
            y={350}
            width={14}
            height={14}
            rx={4}
            fill={item.fill}
            stroke={item.stroke}
            strokeWidth="1.5"
            strokeDasharray={item.dashed ? '3 3' : undefined}
          />
          <T x={74 + i * 150} y={362} size={11} fill={C.muted} weight={400}>
            {item.text}
          </T>
        </g>
      ))}

      <T x={52} y={398} size={12} fill={C.muted} weight={400}>
        A blocked candidate resumes one gap after the thing
      </T>
      <T x={52} y={416} size={12} fill={C.muted} weight={400}>
        that blocked it ends — not a whole session later.
      </T>

      <ArrowR x={562} y={252} len={22} />

      <Panel x={596} y={56} w={272} h={392} />
      <T x={616} y={84} caps>On confirm</T>
      {[
        { label: 'Slot re-checked', sub: 'against Google free/busy' },
        { label: 'Client upserted', sub: 'keyed on last 10 phone digits' },
        { label: 'Booking row written', sub: 'then the calendar event' },
        { label: 'Confirmation + reminders', sub: 'WhatsApp and email', accent: true }
      ].map((node, i) => (
        <g key={node.label}>
          <Node
            x={616}
            y={104 + i * 84}
            w={232}
            h={52}
            label={node.label}
            sub={node.sub}
            accent={node.accent}
          />
          {i < 3 && <ArrowD x={732} y={158 + i * 84} len={24} />}
        </g>
      ))}
      {/* The last node box ends at 408, so these two baselines are the
          only room left in the panel. A third line would collide. */}
      <T x={616} y={426} size={11.5} fill={C.muted} weight={400}>
        The row is the booking —
      </T>
      <T x={616} y={442} size={11.5} fill={C.muted} weight={400}>
        everything after it is best-effort.
      </T>
    </g>
  )
}

/* 02 — Consent & Approval System. Left is what the client touches,
   middle is the routing that used to be an inbox, right is the artifact
   that used to be a scan on somebody's desktop. */
function Approval() {
  return (
    <g>
      <Panel x={32} y={56} w={248} h={392} />
      <T x={52} y={84} caps>On the client&rsquo;s phone</T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Line x={52} y={112 + i * 44} w={70} o={0.9} />
          <rect x={52} y={128 + i * 44} width={208} height={26} rx={6} fill={C.ground} stroke={C.strokeSoft} strokeWidth="1.5" />
        </g>
      ))}
      <Line x={52} y={256} w={54} o={0.9} />
      <rect x={52} y={272} width={208} height={72} rx={8} fill={C.ground} stroke={C.strokeSoft} strokeWidth="1.5" />
      <path
        d="M74 322 C92 292 100 336 116 306 C130 282 142 330 160 300 C172 280 186 322 206 300"
        fill="none"
        stroke={C.accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <T x={52} y={372} size={11.5} fill={C.muted} weight={400}>Signed on the device</T>
      <T x={52} y={392} size={11.5} fill={C.muted} weight={400}>they already have.</T>

      <ArrowR x={286} y={252} len={22} />

      <Panel x={320} y={56} w={264} h={392} />
      <T x={340} y={84} caps>Routing</T>
      {[
        { label: 'Sent to client', sub: 'link, no login', done: true },
        { label: 'Client signed', sub: 'timestamped', done: true },
        { label: 'Supervisor approval', sub: 'chased at 24h', accent: true }
      ].map((s, i) => (
        <g key={s.label}>
          <Node x={340} y={112 + i * 92} w={224} h={56} label={s.label} sub={s.sub} accent={s.accent} />
          {s.done && (
            <path
              d={`M${534} ${136 + i * 92} l5 5 l9 -11`}
              fill="none"
              stroke={C.muted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {i < 2 && <ArrowD x={452} y={170 + i * 92} len={30} />}
        </g>
      ))}
      <T x={340} y={412} size={11.5} fill={C.muted} weight={400}>Every waiting case, and</T>
      <T x={340} y={430} size={11.5} fill={C.muted} weight={400}>who it is waiting on.</T>

      <ArrowR x={590} y={252} len={22} />

      <Panel x={624} y={56} w={244} h={392} />
      <T x={644} y={84} caps>Filed automatically</T>
      {/* Page with a folded corner — the generated PDF. */}
      <path
        d="M644 104 h164 l32 32 v200 a8 8 0 0 1 -8 8 h-188 a8 8 0 0 1 -8 -8 v-224 a8 8 0 0 1 8 -8 z"
        fill={C.panelHi}
        stroke={C.stroke}
        strokeWidth="1.5"
      />
      <path d="M808 104 v32 h32" fill="none" stroke={C.stroke} strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => (
        <Line key={i} x={664} y={168 + i * 20} w={i === 3 ? 96 : 152} />
      ))}
      <path
        d="M666 268 C678 250 686 282 698 262 C708 246 718 278 732 260"
        fill="none"
        stroke={C.accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Line x={664} y={296} w={120} o={0.35} />
      <T x={644} y={382} size={11.5} fill={C.muted} weight={400}>Named by client and date,</T>
      <T x={644} y={400} size={11.5} fill={C.muted} weight={400}>filed to the right Drive</T>
      <T x={644} y={418} size={11.5} fill={C.muted} weight={400}>folder on approval.</T>
    </g>
  )
}

/* 03 — Team Operations System. The board is the obvious half; the load
   row underneath is the half that replaced the daily catch-up call. */
function Operations() {
  const columns = [
    { title: 'Open', count: 4, x: 32 },
    { title: 'In progress', count: 3, x: 316 },
    { title: 'Done', count: 9, x: 600 }
  ]
  const cards = [
    [{ who: 'RK', due: 'Overdue', late: true }, { who: 'SM', due: 'Fri' }],
    [{ who: 'AP', due: 'Today' }, { who: 'RK', due: 'Mon' }],
    [{ who: 'SM', due: 'Done', done: true }, { who: 'AP', due: 'Done', done: true }]
  ]

  return (
    <g>
      {columns.map((col, ci) => (
        <g key={col.title}>
          <Panel x={col.x} y={56} w={268} h={288} />
          <T x={col.x + 20} y={84} caps>{col.title}</T>
          <T x={col.x + 248} y={85} size={11} fill={C.muted} anchor="end" weight={600}>{col.count}</T>
          {cards[ci].map((card, i) => (
            <g key={i}>
              <Panel
                x={col.x + 20}
                y={104 + i * 108}
                w={228}
                h={92}
                r={8}
                fill={C.panelHi}
                stroke={card.late ? C.accent : C.stroke}
              />
              <Line x={col.x + 38} y={126 + i * 108} w={150} o={card.done ? 0.35 : 0.9} />
              <Line x={col.x + 38} y={142 + i * 108} w={104} o={card.done ? 0.25 : 0.5} />
              {/* Owner. A task with no named owner is the thing this
                  system exists to stop, so it is drawn on every card. */}
              <circle cx={col.x + 50} cy={172 + i * 108} r={13} fill={C.ground} stroke={C.stroke} strokeWidth="1.5" />
              <T x={col.x + 50} y={176 + i * 108} size={10.5} anchor="middle" fill={C.muted} weight={600}>
                {card.who}
              </T>
              <Chip x={col.x + 72} y={162 + i * 108} w={card.late ? 66 : 52} label={card.due} accent={card.late} />
            </g>
          ))}
        </g>
      ))}

      <Panel x={32} y={368} w={836} h={80} />
      <T x={52} y={396} caps>Load this week</T>
      {[
        { who: 'RK', w: 300, accent: true },
        { who: 'SM', w: 196 },
        { who: 'AP', w: 132 }
      ].map((p, i) => (
        <g key={p.who}>
          <T x={52 + i * 272} y={428} size={11.5} fill={C.muted} weight={600}>{p.who}</T>
          <rect x={80 + i * 272} y={415} width={232} height={16} rx={8} fill={C.ground} stroke={C.strokeSoft} strokeWidth="1.5" />
          <rect x={80 + i * 272} y={415} width={p.w * 0.7} height={16} rx={8} fill={p.accent ? C.accent : C.stroke} />
        </g>
      ))}
    </g>
  )
}

/* 04 — Claude Form Automation System. The gate on the right is the
   whole point: this one is drawn so the approval step is the largest
   element, because "nothing sends unreviewed" is the reassurance a
   nervous buyer is actually shopping for. */
function Assistant() {
  return (
    <g>
      <Panel x={32} y={56} w={244} h={392} />
      <T x={52} y={84} caps>Incoming</T>
      <path
        d="M52 104 h204 a8 8 0 0 1 8 8 v104 a8 8 0 0 1 -8 8 h-180 l-24 20 v-20 a8 8 0 0 1 0 0 v-112 a8 8 0 0 1 0 -8 z"
        fill={C.panelHi}
        stroke={C.stroke}
        strokeWidth="1.5"
      />
      {[0, 1, 2, 3].map((i) => (
        <Line key={i} x={72} y={130 + i * 20} w={i === 3 ? 88 : 164} />
      ))}
      <T x={52} y={276} size={11.5} fill={C.muted} weight={400}>The details needed are</T>
      <T x={52} y={294} size={11.5} fill={C.muted} weight={400}>usually already in the</T>
      <T x={52} y={312} size={11.5} fill={C.muted} weight={400}>message. Someone still</T>
      <T x={52} y={330} size={11.5} fill={C.muted} weight={400}>had to go and find them.</T>

      <ArrowR x={282} y={252} len={22} />

      <Panel x={316} y={56} w={240} h={392} />
      <T x={336} y={84} caps>Claude layer</T>
      {[
        { label: 'Classify request', sub: 'which form is this' },
        { label: 'Load context', sub: 'services, terms, wording' },
        { label: 'Populate draft', sub: 'from the client record' }
      ].map((n, i) => (
        <g key={n.label}>
          <Node x={336} y={112 + i * 92} w={200} h={56} label={n.label} sub={n.sub} />
          {i < 2 && <ArrowD x={436} y={170 + i * 92} len={30} />}
        </g>
      ))}
      <T x={336} y={412} size={11.5} fill={C.muted} weight={400}>Context persists between</T>
      <T x={336} y={430} size={11.5} fill={C.muted} weight={400}>requests, so it stops guessing.</T>

      <ArrowR x={562} y={252} len={22} />

      <Panel x={596} y={56} w={272} h={392} stroke={C.accent} />
      <T x={616} y={84} caps>Human approval</T>
      <Panel x={616} y={104} w={232} h={160} r={8} fill={C.panelHi} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Line key={i} x={636} y={128 + i * 22} w={i === 4 ? 104 : 192} />
      ))}
      {/* The gate. */}
      <rect x={616} y={284} width={110} height={40} rx={8} fill={C.accent} />
      <T x={671} y={309} size={13} anchor="middle" fill="#1a0900" weight={700}>Approve</T>
      <rect x={738} y={284} width={110} height={40} rx={8} fill={C.ground} stroke={C.stroke} strokeWidth="1.5" />
      <T x={793} y={309} size={13} anchor="middle" fill={C.ink} weight={600}>Edit</T>
      <line x1={616} y1={352} x2={848} y2={352} stroke={C.accent} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
      <T x={616} y={382} size={12} fill={C.ink} weight={600}>Nothing sends unreviewed.</T>
      <T x={616} y={406} size={11.5} fill={C.muted} weight={400}>Approved drafts go out on</T>
      <T x={616} y={424} size={11.5} fill={C.muted} weight={400}>WhatsApp or email.</T>
    </g>
  )
}

/* 05 — Mindset Workspace. The point is the path every feature takes —
   four clean layers from the screen down to the data — and the capability
   check that gates who is allowed to do what. The bottom row is where the
   server layer actually reaches: calendar, messaging, payments, and the
   record-to-note pipeline. Nothing here is arithmetic-placed; it is a
   fixed grid, so it cannot drift out of step with the prose. */
function Platform() {
  const layers = [
    { label: 'Page', sub: 'what a person taps' },
    { label: 'Typed query hook', sub: 'one per feature' },
    { label: 'Serverless action', sub: 'under the handler cap', accent: true },
    { label: 'Server route / n8n', sub: 'data service or workflow' }
  ]
  const NODE_W = 180
  const STEP = 218 // node width + arrow gap

  const reach = [
    { label: 'Google Calendar', sub: 'booking, via n8n' },
    { label: 'WhatsApp & SMS', sub: 'MSG91 templates' },
    { label: 'Payments', sub: 'bank gateway, UPI' },
    { label: 'Session → note', sub: 'on-device, then AI' }
  ]
  const PANEL_W = 195
  const PSTEP = 213

  return (
    <g>
      <T x={52} y={88} caps>One request, four layers</T>
      {layers.map((l, i) => {
        const x = 32 + i * STEP
        return (
          <g key={l.label}>
            <Node x={x} y={104} w={NODE_W} h={64} label={l.label} sub={l.sub} accent={l.accent} />
            {i < layers.length - 1 && <ArrowR x={x + NODE_W} y={136} len={38} />}
          </g>
        )
      })}
      {/* The capability check sits on the flow into the server layer — the
          one place who-can-do-what is decided, drawn as the accent step. */}
      <Chip x={498} y={186} w={124} label="capability check" accent />
      <T x={560} y={220} size={11} anchor="middle" fill={C.muted} weight={400}>
        who may edit, force-book, see the whole client book
      </T>

      <line x1={52} y1={252} x2={848} y2={252} stroke={C.strokeSoft} strokeWidth="1.5" />
      <T x={52} y={286} caps>Where the server layer reaches</T>
      {reach.map((r, i) => {
        const x = 32 + i * PSTEP
        return (
          <g key={r.label}>
            <Panel x={x} y={304} w={PANEL_W} h={112} r={8} fill={C.panelHi} />
            <T x={x + 16} y={340} size={13} fill={C.ink} weight={600}>
              {r.label}
            </T>
            <T x={x + 16} y={362} size={11.5} fill={C.muted} weight={400}>
              {r.sub}
            </T>
          </g>
        )
      })}
      <T x={52} y={452} size={12} fill={C.muted} weight={400}>
        Installable app — works offline, records the session on the device.
      </T>
    </g>
  )
}

/* 06 — Udaan. Three layers run at once: a self-paced course that teaches,
   live care that treats, and a safety layer that never switches off. The
   dashed accent link is the part that makes it clinical rather than a
   course site — the course pauses at a gate until a required therapist
   session actually happens. */
function Journey() {
  const movements = ['Understand', 'Regulate', 'Rebuild', 'Become']
  const M_W = 132
  const M_STEP = 170
  const M_X0 = 196
  /* Gate lives in the gap between movement 2 and movement 3. */
  const gateCx = M_X0 + 2 * M_STEP - 20 // gap centre

  return (
    <g>
      {/* Lane 1 — the course. */}
      <Panel x={32} y={72} w={836} h={116} />
      <T x={52} y={100} caps>The course teaches</T>
      <T x={52} y={122} size={11} fill={C.muted} weight={400}>
        12 modules
      </T>
      <T x={52} y={140} size={11} fill={C.muted} weight={400}>
        4 movements
      </T>
      {movements.map((m, i) => (
        <Node key={m} x={M_X0 + i * M_STEP} y={112} w={M_W} h={48} label={`${i + 1}. ${m}`} />
      ))}
      {/* The clinical gate. */}
      <rect
        x={gateCx - 18}
        y={116}
        width={36}
        height={40}
        rx={8}
        fill={C.accentDim}
        stroke={C.accent}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <T x={gateCx} y={142} size={16} anchor="middle" fill={C.accent} weight={700}>
        ✳
      </T>

      {/* Lane 2 — live care. */}
      <Panel x={32} y={212} w={836} h={92} />
      <T x={52} y={240} caps>The live care treats</T>
      {[
        { label: '12 individual', x: 196 },
        { label: '12 group', x: 400 },
        { label: '3 family', x: 604 }
      ].map((s) => (
        <Node key={s.label} x={s.x} y={244} w={180} h={44} label={s.label} />
      ))}
      {/* Dashed accent link: the gate drops into the live-care lane. */}
      <line
        x1={gateCx}
        y1={156}
        x2={gateCx}
        y2={212}
        stroke={C.accent}
        strokeWidth="1.5"
        strokeDasharray="5 5"
        opacity="0.7"
      />
      <T x={gateCx + 16} y={192} size={11} fill={C.muted} weight={400}>
        a required session must happen before the course continues
      </T>

      {/* Lane 3 — safety, always on, spanning everything. */}
      <rect
        x={32}
        y={324}
        width={836}
        height={56}
        rx={10}
        fill="none"
        stroke={C.accent}
        strokeWidth="1.5"
        strokeDasharray="6 5"
      />
      <T x={52} y={350} size={13} fill={C.accent} weight={700}>
        Get Help
      </T>
      <T x={140} y={350} size={12} fill={C.ink} weight={400}>
        on every screen, backed by a crisis-escalation protocol
      </T>
      <T x={52} y={372} size={11} fill={C.muted} weight={400}>
        The safety layer stays on
      </T>

      <T x={52} y={420} size={12} fill={C.muted} weight={400}>
        Gated portal — an account exists only after triage, a screening call and payment.
      </T>
      <T x={52} y={442} size={12} fill={C.muted} weight={400}>
        Four role-scoped views: client, family, therapist, admin — family sees program shape only.
      </T>
    </g>
  )
}

/* Signet — a self-built e-signature tool. The flow runs left to right —
   compose, sign, seal, verify — with the seal as the accent step because
   it is the one that turns a signed form into a defensible record. The
   bottom lane is the audit trail, the thing that makes the seal mean
   something: an append-only log recomputed and checked on the verify
   page. Unlike the other five diagrams, this project has real
   screenshots, which sit in the screenshot slot below the schematic. */
function Signature() {
  const steps = [
    { label: 'Compose', sub: 'template + signers' },
    { label: 'Sign', sub: 'draw / type + consent' },
    { label: 'Seal', sub: 'SHA-256 over the record', accent: true },
    { label: 'Verify', sub: 'public, live check' }
  ]
  const NODE_W = 180
  const STEP = 218

  return (
    <g>
      <T x={52} y={76} caps>Consent to a sealed record</T>
      {steps.map((s, i) => {
        const x = 32 + i * STEP
        return (
          <g key={s.label}>
            <Node x={x} y={92} w={NODE_W} h={60} label={s.label} sub={s.sub} accent={s.accent} />
            {i < steps.length - 1 && <ArrowR x={x + NODE_W} y={122} len={38} />}
          </g>
        )
      })}

      {/* Left — what the hash is computed over. */}
      <Panel x={32} y={196} w={516} h={112} />
      <T x={52} y={224} caps>What the seal covers</T>
      <T x={52} y={252} size={12} fill={C.muted} weight={400}>
        Full document text
      </T>
      <T x={52} y={274} size={12} fill={C.muted} weight={400}>
        Every signature — drawn or typed
      </T>
      <T x={52} y={296} size={12} fill={C.muted} weight={400}>
        Each signer, timestamp and IP
      </T>

      {/* Right — verification: recompute and compare. */}
      <Panel x={568} y={196} w={300} h={112} fill={C.panelHi} />
      <T x={588} y={224} caps>Verify, anytime</T>
      <T x={588} y={250} size={11.5} fill={C.muted} weight={400}>
        Recompute the seal, compare.
      </T>
      <Chip x={588} y={264} w={128} label="match = authentic" accent />
      <Chip x={726} y={264} w={124} label="mismatch = tampered" />

      {/* Bottom — the audit trail. */}
      <line x1={52} y1={340} x2={848} y2={340} stroke={C.strokeSoft} strokeWidth="1.5" />
      <T x={52} y={372} caps>Audit trail — every event logged</T>
      {[
        { label: 'created', x: 32, w: 78 },
        { label: 'viewed', x: 128, w: 74 },
        { label: 'signed', x: 220, w: 74 },
        { label: 'completed', x: 312, w: 98 }
      ].map((c, i, arr) => (
        <g key={c.label}>
          <Chip x={c.x} y={388} w={c.w} label={c.label} />
          {i < arr.length - 1 && <ArrowR x={c.x + c.w + 3} y={398} len={13} />}
        </g>
      ))}
      <T x={430} y={402} size={12} fill={C.muted} weight={400}>
        printed onto the certificate page of the sealed PDF
      </T>
    </g>
  )
}

/* Relay — a self-built shared inbox and CRM. The top lane collapses three
   channels into one thread and its triage; the bottom lane is the pipeline
   the same contact moves along. The whole point of the drawing is the join
   between them: the inbox and the CRM are one record, not two systems. Like
   Signet, this project has real screenshots, which sit below the schematic. */
function Relay() {
  const channels = ['WhatsApp', 'Email', 'Web form']

  return (
    <g>
      <T x={52} y={72} caps>Many channels, one thread</T>

      {/* Channel sources feeding the inbox. */}
      {channels.map((c, i) => {
        const y = 92 + i * 48
        return (
          <g key={c}>
            <Node x={32} y={y} w={150} h={40} label={c} />
            <ArrowR x={182} y={y + 20} len={62} />
          </g>
        )
      })}

      {/* Inbox → thread → contact. */}
      <Node x={244} y={92} w={168} h={136} label="Shared inbox" sub="one list, every source" />
      <ArrowR x={412} y={160} len={38} />
      <Node x={450} y={120} w={190} h={80} label="Thread + triage" sub="reply · note · assign" />
      <ArrowR x={640} y={160} len={38} />
      <Node x={678} y={120} w={190} h={80} label="Contact record" sub="the same person" accent />

      {/* The pipeline, built in. */}
      <line x1={52} y1={272} x2={848} y2={272} stroke={C.strokeSoft} strokeWidth="1.5" />
      <T x={52} y={304} caps>One pipeline, built in</T>
      {[
        { label: 'Lead', x: 32 },
        { label: 'Qualified', x: 196 },
        { label: 'Active', x: 360 },
        { label: 'Won', x: 524, accent: true },
        { label: 'Lost', x: 688 }
      ].map((s, i, arr) => (
        <g key={s.label}>
          <Node x={s.x} y={324} w={150} h={44} label={s.label} accent={s.accent} />
          {i < arr.length - 1 && <ArrowR x={s.x + 150} y={346} len={14} />}
        </g>
      ))}
      <T x={52} y={410} size={12} fill={C.muted} weight={400}>
        The inbox and the CRM are the same record — reply to a message and move the deal on the same contact.
      </T>
    </g>
  )
}

/* Prospector — a self-built lead-research tool. A URL goes in; the page is
   fetched and read for the business behind it. The accent step is the
   extraction, because reading a real page honestly — structured data first,
   then falling back — is the whole craft. The left panel is what it reads,
   the right is how a lead is scored. Like the other two tools, this one has
   real screenshots, which sit below the schematic. */
function Prospect() {
  const steps = [
    { label: 'Paste URL', sub: 'one or many' },
    { label: 'Fetch page', sub: 'server-side' },
    { label: 'Extract', sub: 'the business behind it', accent: true },
    { label: 'Scored lead', sub: 'ranked by reach' }
  ]
  const NODE_W = 180
  const STEP = 218

  return (
    <g>
      <T x={52} y={72} caps>From a URL to a lead</T>
      {steps.map((s, i) => {
        const x = 32 + i * STEP
        return (
          <g key={s.label}>
            <Node x={x} y={92} w={NODE_W} h={60} label={s.label} sub={s.sub} accent={s.accent} />
            {i < steps.length - 1 && <ArrowR x={x + NODE_W} y={122} len={38} />}
          </g>
        )
      })}

      {/* Left — what the extractor reads, in priority order. */}
      <Panel x={32} y={196} w={430} h={120} />
      <T x={52} y={224} caps>What it reads, in order</T>
      <T x={52} y={250} size={12} fill={C.muted} weight={400}>
        JSON-LD structured data
      </T>
      <T x={52} y={272} size={12} fill={C.muted} weight={400}>
        Open Graph &amp; meta tags
      </T>
      <T x={52} y={294} size={12} fill={C.muted} weight={400}>
        mailto / tel links, social profiles
      </T>

      {/* Right — scoring. */}
      <Panel x={478} y={196} w={390} h={120} fill={C.panelHi} />
      <T x={498} y={224} caps>Scored by contactability</T>
      <rect x={498} y={244} width={250} height={8} rx={4} fill={C.ground} />
      <rect x={498} y={244} width={158} height={8} rx={4} fill={C.accent} />
      <T x={760} y={252} size={11} fill={C.muted} weight={400}>
        63 / 100
      </T>
      <Chip x={498} y={274} w={64} label="new" accent />
      <Chip x={572} y={274} w={92} label="shortlisted" />
      <Chip x={674} y={274} w={86} label="contacted" />

      {/* Bottom — the honesty rule + export. */}
      <line x1={52} y1={344} x2={848} y2={344} stroke={C.strokeSoft} strokeWidth="1.5" />
      <T x={52} y={378} size={12} fill={C.muted} weight={400}>
        A field that isn&rsquo;t found is left blank, never invented — the score reflects what was actually there.
      </T>
      <T x={52} y={400} size={12} fill={C.muted} weight={400}>
        Filter, shortlist, and export the whole list as CSV.
      </T>
    </g>
  )
}

/* ---------------------------------------------------------------
   Registry. Keys are referenced from data.js, so a diagram can be
   swapped for a real screenshot later by changing one string.
   --------------------------------------------------------------- */
const WIDE = '0 0 900 480'

const VARIANTS = {
  platform: { vb: WIDE, draw: Platform, label: 'Schematic: a practice-management app where every feature crosses four layers — page, typed query hook, serverless action gated by a capability check, and a server route or n8n workflow — reaching Google Calendar, messaging, payments and an on-device session-to-note pipeline.' },
  journey: { vb: WIDE, draw: Journey, label: 'Schematic: an online recovery platform running three layers at once — a self-paced course of 12 modules across four movements, live individual, group and family care, and an always-on Get Help safety layer — with a clinical gate that pauses the course until a required therapist session happens.' },
  booking: { vb: WIDE, draw: Booking, label: 'Schematic: one therapist’s day, showing a 15-minute turnaround padding an existing calendar booking on both sides, and the next slot resuming one gap after that booking ends rather than a whole session later.' },
  approval: { vb: WIDE, draw: Approval, label: 'Schematic: a consent form signed on the client’s phone, routed for supervisor approval, producing a signed PDF filed automatically.' },
  operations: { vb: WIDE, draw: Operations, label: 'Schematic: a task board with a named owner and due date on every card, over a bar chart of workload per person.' },
  assistant: { vb: WIDE, draw: Assistant, label: 'Schematic: an incoming request classified and drafted by Claude against stored project context, held at a human approval gate before sending.' },
  signature: { vb: WIDE, draw: Signature, label: 'Schematic: a consent-and-contract signing tool — compose from a template, sign by drawing or typing with consent, seal the document with a SHA-256 hash over its text and every signature, and verify it on a public page that recomputes the seal. An append-only audit trail of created, viewed, signed and completed events is printed onto the certificate page of the sealed PDF.' },
  relay: { vb: WIDE, draw: Relay, label: 'Schematic: a shared client inbox and CRM — WhatsApp, email and web-form conversations collapse into one thread with reply, internal-note, assign and status triage, tied to a contact record that moves along a lead, qualified, active, won or lost pipeline. The inbox and the CRM are the same record.' },
  prospect: { vb: WIDE, draw: Prospect, label: 'Schematic: a lead-research tool — paste one or more business URLs, fetch each page server-side, and extract the business behind it from JSON-LD structured data, Open Graph and meta tags, and mailto, tel and social links. Each lead is scored by contactability and moves through new, shortlisted and contacted; a field that is not found is left blank, and the list exports as CSV.' }
}

export default function SystemDiagram({ variant, className = '' }) {
  const config = VARIANTS[variant]
  /* An unknown key renders nothing rather than an empty frame — a blank
     panel in a layout is harder to spot in review than a missing one. */
  if (!config) return null

  const Draw = config.draw
  return (
    <div className={['media', 'diagram', className].filter(Boolean).join(' ')}>
      <svg
        className="diagram-svg"
        viewBox={config.vb}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={config.label}
      >
        <Draw />
      </svg>
    </div>
  )
}
