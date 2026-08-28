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
  accent: '#ff5c00',
  accentDim: 'rgba(255, 92, 0, 0.16)',
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
   The point of the drawing is the constraint: a slot is only offered
   when therapist, room and buffer are all clear at once. That is the
   part a reader cannot infer from the words "booking system". */
function Booking() {
  const cols = ['09', '10', '11', '12', '13', '14', '15', '16']
  const rows = ['Therapist 1', 'Therapist 2', 'Therapist 3']
  /* Which cells are already taken, per row, and which single cell is on
     offer. These are consistent with each other on purpose: the offered
     cell must be free in its row AND outside the held-room span below,
     or the drawing argues against its own caption. */
  const busy = [[0, 1, 4, 6], [2, 3, 7], [0, 5, 6, 7]]
  const offered = { row: 1, col: 5 }
  /* Columns the second room is already committed to. Deliberately clear
     of `offered.col` — it covers 12 and 13, which is why therapist 2's
     free cells there are not the ones being offered. */
  const roomHeld = [3, 4]
  const colX = (i) => 152 + i * 48
  const rowY = (i) => 120 + i * 52

  return (
    <g>
      <Panel x={32} y={56} w={524} h={392} />
      <T x={52} y={84} caps>Availability</T>

      {cols.map((c, i) => (
        <T key={c} x={colX(i) + 21} y={106} size={10.5} fill={C.muted} anchor="middle" weight={600}>
          {c}
        </T>
      ))}

      {rows.map((r, ri) => (
        <g key={r}>
          <T x={52} y={rowY(ri) + 26} size={12} fill={C.ink}>{r}</T>
          {cols.map((c, ci) => {
            const isOffered = ri === offered.row && ci === offered.col
            const isBusy = busy[ri].includes(ci)
            return (
              <rect
                key={c}
                x={colX(ci)}
                y={rowY(ri)}
                width={42}
                height={40}
                rx={6}
                fill={isOffered ? C.accent : isBusy ? C.slotBusy : C.slotFree}
                stroke={isOffered ? C.accent : C.strokeSoft}
                strokeWidth="1.5"
              />
            )
          })}
        </g>
      ))}

      {/* The room constraint, drawn across the columns it blocks — this
          is why the free cells at 12 and 13 are not on offer. */}
      <rect
        x={colX(roomHeld[0]) - 4}
        y={284}
        width={48 * (roomHeld.length - 1) + 50}
        height={26}
        rx={6}
        fill="none"
        stroke={C.stroke}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <T
        x={colX(roomHeld[0]) + (48 * (roomHeld.length - 1) + 42) / 2}
        y={301}
        size={10.5}
        fill={C.muted}
        anchor="middle"
        weight={600}
      >
        Room 2 held
      </T>

      <line x1={52} y1={340} x2={536} y2={340} stroke={C.strokeSoft} strokeWidth="1.5" />

      {[
        ['Booked', C.slotBusy, C.strokeSoft],
        ['Free', C.slotFree, C.strokeSoft],
        ['Offered', C.accent, C.accent]
      ].map(([label, fill, stroke], i) => (
        <g key={label}>
          <rect x={52 + i * 116} y={362} width={14} height={14} rx={4} fill={fill} stroke={stroke} strokeWidth="1.5" />
          <T x={74 + i * 116} y={374} size={11.5} fill={C.muted} weight={400}>{label}</T>
        </g>
      ))}

      <T x={52} y={414} size={12} fill={C.muted} weight={400}>
        A slot is offered only when therapist, room
      </T>
      <T x={52} y={432} size={12} fill={C.muted} weight={400}>
        and buffer are clear together.
      </T>

      <ArrowR x={562} y={252} len={22} />

      <Panel x={596} y={56} w={272} h={392} />
      <T x={616} y={84} caps>On confirm</T>
      {[
        { label: 'Client lookup', sub: 'matched on phone number' },
        { label: 'Booking written', sub: 'practitioner + room' },
        { label: 'Confirmation sent', sub: 'WhatsApp Cloud API' },
        { label: 'Reminder at T−24h', sub: 'with reschedule link', accent: true }
      ].map((n, i) => (
        <g key={n.label}>
          <Node x={616} y={104 + i * 84} w={232} h={52} label={n.label} sub={n.sub} accent={n.accent} />
          {i < 3 && <ArrowD x={732} y={158 + i * 84} len={24} />}
        </g>
      ))}
      <T x={616} y={430} size={11.5} fill={C.muted} weight={400}>
        No one has to remember to send it.
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

/* ---------------------------------------------------------------
   Registry. Keys are referenced from data.js, so a diagram can be
   swapped for a real screenshot later by changing one string.
   --------------------------------------------------------------- */
const WIDE = '0 0 900 480'

const VARIANTS = {
  booking: { vb: WIDE, draw: Booking, label: 'Schematic: an availability grid where a slot is offered only when practitioner, room and buffer are free together, feeding confirmation and a reminder 24 hours out.' },
  approval: { vb: WIDE, draw: Approval, label: 'Schematic: a consent form signed on the client’s phone, routed for supervisor approval, producing a signed PDF filed automatically.' },
  operations: { vb: WIDE, draw: Operations, label: 'Schematic: a task board with a named owner and due date on every card, over a bar chart of workload per person.' },
  assistant: { vb: WIDE, draw: Assistant, label: 'Schematic: an incoming request classified and drafted by Claude against stored project context, held at a human approval gate before sending.' }
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
