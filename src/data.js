/* ------------------------------------------------------------------
   IMAGES — the one place to touch when you add pictures.

   1. Drop the file into  src/assets/
   2. Import it at the top of this file:   import hero from './assets/hero.jpg'
   3. Set the slot below:                  hero,

   Any slot left as an empty string renders a labelled placeholder well
   instead, so the layout never breaks while the photography is missing.
   ------------------------------------------------------------------ */
export const images = {
  // No hero key: the hero ground is the WebGL shader in HeroCanvas.jsx,
  // with a CSS gradient behind it as the fallback.

  /* One per process step, revealed on hover. Small, wide crops.

     PLACEHOLDERS, same caveat as `projects` and `gallery` below. These
     four are the least important to replace — they are hover decoration
     on a row that reads fine without them — but an empty grey well on
     hover looks broken, which is worse than stock. */
  process: {
    map: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=760&h=520&q=75&auto=format&fit=crop',
    build: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=760&h=520&q=75&auto=format&fit=crop',
    automate: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=760&h=520&q=75&auto=format&fit=crop',
    improve: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=760&h=520&q=75&auto=format&fit=crop'
  },

  /* One per case study, keyed by slug. 4:3 or 3:2 works best.

     PLACEHOLDERS, same caveat as `gallery` below — these want to be
     screenshots of the actual booking flow, consent PDF, ops board and
     intake assistant. A stock photo of an office says nothing a visitor
     could not have assumed. */
  projects: {
    'intelligent-booking-resource-system':
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&h=560&q=75&auto=format&fit=crop',
    'consent-approval-system':
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&h=560&q=75&auto=format&fit=crop',
    'team-operations-system':
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&h=560&q=75&auto=format&fit=crop',
    'claude-form-automation-system':
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&h=560&q=75&auto=format&fit=crop'
  },

  /* The arc in the closing section. Any count works; 8 fills it without
     the cards crowding each other.

     PLACEHOLDERS — these are Unsplash stock, hotlinked off their CDN, and
     they are stand-ins for real screenshots of the systems: booking
     calendars, intake forms, dashboards. Swap each one for the build it
     belongs to before launch. Stock photos of generic offices are the
     single most replaceable thing on a portfolio; a screenshot of a real
     dashboard you shipped is not. */
  gallery: [
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=560&h=760&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=560&h=760&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=560&h=760&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=560&h=760&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=560&h=760&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=560&h=760&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=560&h=760&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=560&h=760&q=75&auto=format&fit=crop'
  ]
}

export const site = {
  name: 'Digital Systems Builder',
  tagline:
    'I build AI and operations automation for service businesses — clinics, studios, agencies and consultancies — so bookings, client intake, follow-ups and team coordination stop running on WhatsApp threads and manual copy-paste.',
  email: 'hello@aniketbuilds.com', // TODO: confirm domain before launch
  whatsapp: '',
  location: 'India · working with clients worldwide',
  availability:
    'Taking on two new builds a month. Next start slot is usually one to two weeks out.',
  pricingAnchor:
    'Most engagements start with an Ops Automation Sprint: fixed scope, from ₹40,000, live in two weeks.'
}

export const projects = [
  {
    index: '01',
    slug: 'intelligent-booking-resource-system',
    title: 'Intelligent Booking & Resource System',
    summary:
      'One booking flow for a multi-practitioner clinic — no double-booked slots, no front-desk sheet to reconcile at closing.',
    description:
      'The clinic ran on three practitioners, one shared room calendar and a booking sheet that only the front desk understood. I mapped how a booking actually moved through the day — enquiry, slot check, practitioner match, confirmation, reminder — and rebuilt it as a single flow. Slot availability is now calculated from practitioner and room together, returning clients are recognised on entry instead of being re-typed, and every confirmed booking pushes its own reminder without anyone remembering to send it.',
    flow: ['Therapist', 'Date', 'Slots', 'Client', 'Booking'],
    role: 'Process mapping, system design and full build — from staff interviews to the live booking flow and handover.',
    timeline: '4 weeks',
    stack: ['React', 'Supabase', 'n8n', 'Google Calendar', 'WhatsApp Cloud API'],
    problem:
      'Bookings arrived by WhatsApp, phone and walk-in, and the front desk copied every one into a shared sheet by hand. Two people could promise the same practitioner the same slot and nobody found out until the client was standing at the desk. Rescheduling meant checking the sheet, the calendar and the practitioner personally.',
    system: [
      'Availability engine that checks practitioner, room and buffer time together before a slot is offered',
      'Client lookup on phone number, so returning clients are recognised instead of re-entered',
      'Single booking screen the front desk uses for phone, WhatsApp and walk-in enquiries',
      'Automatic confirmation and day-before reminder on WhatsApp, with the reschedule link attached',
      'Daily practitioner view showing the day, the room and any gaps worth filling'
    ],
    outcome: [
      'Front-desk time on booking admin dropped from roughly two hours a day to under thirty minutes',
      'Double-bookings went from a weekly occurrence to none observed after launch',
      'No-shows down noticeably once automatic day-before reminders went live'
    ],
    outcomeNote: 'Directional — based on observed process time, not audited.'
  },
  {
    index: '02',
    slug: 'consent-approval-system',
    title: 'Consent & Approval System',
    summary:
      'Client intake and sign-off moved from paper and chasing to a form that produces its own signed PDF and files itself.',
    description:
      'Intake needed a consent form, a supervisor sign-off and a filed copy before work could start — three people, three steps, and no way to see where a case was stuck. I replaced the paper trail with a digital form that routes itself: the client signs, the approver gets a link, and the moment it is approved the system generates the signed PDF, files it in the right client folder and notifies both sides. The status of every pending case is visible on one screen instead of living in an inbox.',
    flow: ['Client', 'Consent', 'Approval', 'Confirmation', 'PDF'],
    role: 'Workflow design, form and document build, and the approval routing behind it.',
    timeline: '3 weeks',
    stack: ['n8n', 'Airtable', 'Google Drive', 'PDF generation', 'WhatsApp Cloud API'],
    problem:
      'Consent forms were printed, signed, scanned and emailed around until someone approved them. Half the time a form sat in an inbox for days and nobody knew whose turn it was. Finding an old signed copy meant searching three drives and asking two people.',
    system: [
      'Mobile-friendly consent form the client completes and signs on their own phone',
      'Approval routing that sends the case to the right approver and chases it if it goes quiet',
      'Automatic signed PDF generated on approval, named and filed by client and date',
      'Confirmation to the client and the team the moment sign-off lands',
      'Status board showing every case that is still waiting and who it is waiting on'
    ],
    outcome: [
      'Time from form sent to signed-and-filed dropped from a few days to same day in most cases',
      'Roughly an hour a day of printing, scanning and chasing removed from the admin role',
      'Every signed copy now sits in one predictable place instead of across drives and inboxes'
    ],
    outcomeNote: 'Directional — based on observed process time, not audited.'
  },
  {
    index: '03',
    slug: 'team-operations-system',
    title: 'Team Operations System',
    summary:
      'One place where team tasks, owners and deadlines live — so coordination stopped happening in a WhatsApp group.',
    description:
      'Work was assigned in a group chat, tracked in two spreadsheets and remembered by one person. I built a single operations layer: tasks have an owner and a due date, permissions decide who sees what, and the notifications go to the person responsible rather than to everyone. Managers get one dashboard for what is open, what is late and where the load is sitting, which turned the daily catch-up call into a two-minute glance.',
    flow: ['Task', 'Assignee', 'Team', 'Notification', 'Dashboard'],
    role: 'System architecture, permissions model, dashboard build and team rollout.',
    timeline: '5 weeks',
    stack: ['React', 'Supabase', 'n8n', 'WhatsApp Cloud API', 'Google Sheets'],
    problem:
      'Tasks were handed out in a WhatsApp group and tracked in whichever sheet the person opened first. Nothing had a clear owner, so the same job got done twice or not at all. The only person who knew the real status of the week was the founder, and they were answering status questions all day.',
    system: [
      'Task records with a single named owner, a due date and a visible status',
      'Role-based access so each team only sees the work that belongs to them',
      'Notifications routed to the owner on assignment, on change and before the deadline',
      'Manager dashboard for open work, overdue work and load per person',
      'Weekly summary pushed automatically instead of assembled by hand'
    ],
    outcome: [
      'Status-chasing messages dropped sharply once ownership and due dates were visible',
      'The weekly review went from an hour of assembling updates to reading one dashboard',
      'Missed handovers reduced noticeably after deadline reminders went to owners directly'
    ],
    outcomeNote: 'Directional — based on observed process time, not audited.'
  },
  {
    index: '04',
    slug: 'claude-form-automation-system',
    title: 'Claude Form Automation System',
    summary:
      'An AI intake layer that reads an incoming request, fills the right form and sends the reply — instead of someone rebuilding it each time.',
    description:
      'This client received the same kinds of request over and over, and each one meant opening a template, re-entering details already sitting in the message, and writing a reply from scratch. I built a Claude-powered layer that holds persistent context about the client, their services and their standard language. An incoming request is read, matched to the right form, populated with what is already known, and returned as a draft reply on WhatsApp or email for a human to approve before it goes out. Nothing sends without that approval step.',
    flow: ['Request', 'Claude', 'Context', 'Form', 'WhatsApp / Email'],
    private: true,
    role: 'Automation design, prompt and context engineering, and the human approval step around it.',
    timeline: '3 weeks',
    stack: ['Claude API', 'n8n', 'Airtable', 'Make', 'WhatsApp Cloud API'],
    problem:
      'Every incoming request meant rebuilding the same setup by hand — the right form, the right details, the right wording. The information needed was usually already in the message or in an old thread, but someone had to go find it. Volume was low enough to survive and high enough to eat the morning.',
    system: [
      'Persistent project context so the assistant knows the services, terms and standard wording',
      'Request classifier that matches an incoming message to the correct form and template',
      'Auto-populated draft built from what is already known about the client',
      'Human approval step before anything is sent — nothing goes out unreviewed',
      'Delivery on WhatsApp or email, with the record written back to the client sheet'
    ],
    outcome: [
      'Setup time per request fell from roughly twenty minutes to a two-minute review',
      'Fewer copy-paste errors, since details are pulled from the record rather than retyped',
      'The same person now handles the same volume without it filling the morning'
    ],
    outcomeNote: 'Directional — based on observed process time, not audited.'
  }
]

export const proofTools = [
  {
    name: 'n8n',
    note: 'Where most automations actually run. Self-hosted, so the client owns the workflows.'
  },
  {
    name: 'Claude',
    note: 'For the judgement steps — reading messy input, drafting replies, summarising.'
  },
  {
    name: 'Airtable',
    note: 'Fastest way to give a team a structured record they can still edit by hand.'
  },
  {
    name: 'Supabase',
    note: 'When the data needs real auth, permissions and room to grow.'
  },
  {
    name: 'React',
    note: 'For the screens people use daily — dashboards, portals, booking flows.'
  },
  {
    name: 'Make',
    note: 'Used when a client is already on it and switching would cost more than it saves.'
  }
]

/*
  The three productized offers from docs/system/02-service-catalog.md, in the
  order they are meant to be sold: the Sprint is the front door, the other
  two are what a Sprint client buys next.

  Prices here and `site.pricingAnchor` above are the same numbers stated
  twice — the anchor names Offer A's floor. If a band moves, move both,
  or the site will disagree with itself. The catalog says B and C are
  quoted on calls, so they carry ranges rather than a "from".
*/
export const packages = [
  {
    name: 'Ops Automation Sprint',
    price: '₹40k – ₹80k',
    timeline: 'Live in 2 weeks',
    featured: true,
    forWho: 'Drowning in manual data entry, form handling and follow-ups.',
    deliverable:
      '3–5 automations connecting the tools you already pay for, built in n8n and handed over self-hosted.',
    includes: [
      'Lead capture → CRM → auto-reply → team notify',
      'Consent form → signed PDF → Drive → WhatsApp',
      'Booking → calendar → reminder → follow-up'
    ]
  },
  {
    name: 'AI Assistant Build',
    price: '₹80k – ₹1.5L',
    timeline: 'Live in 3 weeks',
    featured: false,
    forWho: 'A team answering the same questions and lookups over and over.',
    deliverable:
      'A Claude-powered assistant on your own material, reachable from Slack, WhatsApp or a simple web UI.',
    includes: [
      'Client-intake assistant',
      'Internal SOP and policy bot',
      'Sales-quote assistant'
    ]
  },
  {
    name: 'Internal Tool / Dashboard',
    price: '₹1.5L – ₹3L',
    timeline: 'Live in 3–4 weeks',
    featured: false,
    forWho: 'Running the business out of a spreadsheet with no source of truth.',
    deliverable:
      'A lightweight web app on React and Supabase that replaces the spreadsheet without retraining anyone.',
    includes: [
      'Team operations dashboard',
      'Task and permission portal',
      'Resource booking system'
    ]
  }
]

/* The retainer layer. Offered after a build ships, never instead of one. */
export const carePlan = {
  name: 'Care Plan',
  price: '₹15k – ₹30k / month',
  blurb:
    'Once a system is live: monitoring, broken automations fixed inside 24 hours, a few hours of improvements each month, and first call on new builds.'
}

export const capabilities = [
  {
    index: '01',
    title: 'Digital Systems',
    blurb:
      'Internal tools, dashboards, client portals and CRM setups that replace the spreadsheet nobody wants to touch.',
    items: ['Dashboards', 'Internal tools', 'Portals', 'CRM']
  },
  {
    index: '02',
    title: 'Web & Apps',
    blurb:
      'Websites, landing pages and installable PWAs, wired into the system behind them rather than sitting on their own.',
    items: ['Websites', 'Funnels', 'PWAs', 'Apps']
  },
  {
    index: '03',
    title: 'AI & Automation',
    blurb:
      'n8n and Claude handling the repeat work: intake, routing, reminders, summaries, drafted replies, document generation.',
    items: ['AI assistants', 'Integrations', 'Notifications', 'Documents']
  },
  {
    index: '04',
    title: 'Growth Systems',
    blurb:
      'Lead capture, follow-up sequences, Google Business Profile and the simple reporting that shows what brought the work in.',
    items: ['Lead capture', 'Follow-ups', 'Google Business', 'Reporting']
  }
]

/* Four steps, not seven. The `image` key points at images.process. */
export const process = [
  {
    index: '01',
    key: 'map',
    title: 'Map',
    text: 'Sit with how the work happens today, and find where it actually breaks.'
  },
  {
    index: '02',
    key: 'build',
    title: 'Build',
    text: 'Design the flow, then build the screens, integrations and infrastructure behind it.'
  },
  {
    index: '03',
    key: 'automate',
    title: 'Automate',
    text: 'Remove the repeat work. Use AI only where it genuinely improves a decision.'
  },
  {
    index: '04',
    key: 'improve',
    title: 'Improve',
    text: 'Watch it run, fix what breaks, keep making it better.'
  }
]

export const faq = [
  {
    q: 'How long does a build take?',
    a: 'Most first engagements are an Ops Automation Sprint: fixed scope, live in two weeks. Larger systems — a booking platform, a full team operations layer — run three to five weeks depending on how many people and tools they touch.'
  },
  {
    q: 'What does it cost?',
    a: 'The sprint starts at ₹40,000 for a fixed scope. Anything bigger is quoted once we have mapped the process, because the price depends on how many systems have to talk to each other, not on how many hours it takes me.'
  },
  {
    q: 'Do I need to already use n8n, Airtable or Supabase?',
    a: 'No. I pick the stack to fit the team, not the other way around. If you are already on Make or Google Sheets and it works, I will build on top of it rather than charge you to migrate.'
  },
  {
    q: 'Who owns the system afterwards?',
    a: 'You do. Automations run on your accounts, the code sits in your repository, and handover includes a walkthrough so someone on your side can change the obvious things without calling me.'
  },
  {
    q: 'Do you work with clients outside India?',
    a: 'Yes. The work is remote either way — mapping calls, async updates, a live walkthrough at handover. Timezone only changes when the calls happen.'
  },
  {
    q: 'What do you need from me to start?',
    a: 'An honest description of the process that is currently annoying you, and thirty minutes with whoever actually runs it day to day. That conversation usually tells us both whether automation is the right answer.'
  }
]

export const footerMenu = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Get in touch', to: '/contact' }
]

/* Set `href` to go live. Empty entries are skipped, not rendered dead. */
export const social = [
  { label: 'LinkedIn', href: '', icon: 'linkedin' },
  { label: 'X', href: '', icon: 'x' },
  { label: 'GitHub', href: 'https://github.com/Aniket787878', icon: 'github' },
  { label: 'Email', href: '', icon: 'mail' }
]
