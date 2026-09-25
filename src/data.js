/* ------------------------------------------------------------------
   REAL SCREENSHOTS — still the largest gap on this site.

   Every slot here used to hold an Unsplash photograph: an office, a
   laptop, people at a desk. None of them said anything about a booking
   engine, so the site now draws its own schematics instead. They live in
   components/SystemDiagram.jsx and are keyed off each project's
   `diagram` field below.

   A schematic is honest about being a schematic, which a stock photo in
   a product slot is not. It is still not a substitute for a screenshot
   of the running booking flow, the generated consent PDF, the ops board
   or the intake assistant. Those remain the strongest asset this site
   could gain, and they are blocked on Aniket.

   To add one: drop the file into public/ and set the slug below to its
   path. The case-study page renders it beneath the diagram. An empty
   string renders nothing at all — a live page must never show an
   unfinished placeholder well.
   ------------------------------------------------------------------ */
export const images = {
  /* Hover reveal on the four process rows. The slot is a wide, short
     strip — roughly 4.7:1 at desktop — which is fine for a cropped
     photograph and useless for a diagram: a schematic scaled into it
     renders its labels at about five pixels. So this stays a photo slot.
     Empty means the row simply does not reveal anything on hover, which
     is why the step text no longer fades out unless a photo is set. */
  process: {
    map: '',
    build: '',
    automate: '',
    improve: ''
  },

  projects: {
    'mindset-workspace': '',
    udaan: '',
    /* The first real screenshots on the site — Signet, Relay and Prospector
       are self-built tools, so unlike the two client systems their running
       UI can actually be shown. Signet: the sealed document with its audit
       trail. Relay: a live inbox thread with the contact and pipeline
       alongside. Prospector: the lead workspace after a live scrape. All
       captured from the running apps. */
    signet: '/signet-sealed.png',
    relay: '/relay-inbox.png',
    prospector: '/prospector-workspace.png'
  }
}

export const site = {
  name: 'Digital Systems Builder',
  tagline:
    'I build complete production systems end to end — the site, the app, the payments, the backend, the AI and the infrastructure — for founders who need the whole thing built and shipped by one person, not a team to manage.',
  email: 'aniket.html@gmail.com',
  whatsapp: '+91 9136582842', // digits are stripped in whatsapp.js for the wa.me link
  location: 'India · working with clients worldwide',
  availability:
    'Taking on two new builds a month. Next start slot is usually one to two weeks out.',
  pricingAnchor:
    'Most engagements start with an Ops Automation Sprint: fixed scope, from ₹40,000, live in two weeks.',

  /* The hero's proof, lifted from project 01 and condensed.

     It lives here rather than in Hero.jsx for one reason: it states a
     number, and the house rule is that no number appears without the
     caveat that qualifies it. Keeping claim and note in the same object
     makes them awkward to separate by accident. If project 01's outcome
     is ever restated, restate this with it. */
  heroProof: {
    claim: 'Seven hundred and fifty clients, eleven therapists, one app the whole clinic runs on.',
    note: 'From a live practice-management platform — the client and therapist counts are row counts from its production database, not an estimate.',
    slug: 'mindset-workspace',
    linkLabel: 'See the system'
  }
}

/*
  Identity layer — the site sells a solo specialist, so the person has to
  be on it (docs/research/06, gap G2). Everything here is either true and
  already backed by the rest of the site, or a clearly-empty slot for
  Aniket to fill. Same rule as `images` and `testimonials`: no invented
  bio and no stock headshot. `photo` stays '' until a real file lands in
  public/ (the <Media> well renders in its place), and anything only
  Aniket can vouch for — the personal story, a years count, named clients
  — is left as a slot rather than written for him.
*/
export const founder = {
  name: 'Aniket',
  role: 'Automation & systems builder',

  /* One honest paragraph. Asserts only what the case studies, pricing and
     process on the rest of the site already stand behind. */
  intro:
    'I build the operations software service businesses actually run on — booking, intake, follow-ups and team coordination — so the work stops living in WhatsApp threads and spreadsheets. It started with the systems a multi-practitioner wellness practice needed to stop drowning in admin, and it is the same shape of problem in a studio, an agency or a consultancy. You work with the person who builds it, and you own what ships.',

  /* Aniket's own story — how he got here, what he did before — is his to
     write. Left empty on purpose rather than invented; the About page
     renders a labelled slot when it is blank. */
  story: '',

  /* Real headshot → drop it in public/ (e.g. public/aniket.jpg) and set the
     path here. Until then the About page shows the honest placeholder well. */
  photo: '',

  basedIn: 'India · working with clients worldwide',

  /* What a buyer actually gets from a solo builder rather than an agency —
     the real edge behind the model decision in docs/research/06. Each line
     is already promised elsewhere on the site (FAQ, pricing, handover). */
  principles: [
    {
      title: 'One person, start to finish',
      text: 'You talk to the builder, not an account manager. Nothing is lost in a handoff between the person who scoped it and the person who ships it.'
    },
    {
      title: 'You own the system',
      text: 'Automations run on your own accounts, the code sits in your repository, and handover includes a walkthrough so your team can change the obvious things without me.'
    },
    {
      title: 'Fixed scope, fixed price, a live date',
      text: 'A one-page proposal in writing before anything starts. No hourly billing, no verbal quotes, no scope that quietly grows.'
    },
    {
      title: 'Built on the tools you already pay for',
      text: 'I pick the stack to fit the build — React, TypeScript, Postgres, n8n, Claude — and where your team already runs on something that works, I build on it instead of charging you to migrate.'
    }
  ],

  /* Verified facts only. Anything needing a number Aniket has not supplied
     stays out. */
  quickFacts: [
    { label: 'Based', value: 'India · remote worldwide' },
    { label: 'Focus', value: 'Bookings, intake, follow-ups, team ops' },
    { label: 'Core stack', value: 'React · TypeScript · Node · Postgres · n8n · Claude' },
    { label: 'Availability', value: 'Two new builds a month' }
  ]
}

/*
  Social proof slot — the market's #1 trust lever (docs/research/06, gap
  G3), deliberately EMPTY. No invented quotes: CLAUDE.md forbids
  placeholder testimonials, so the Testimonials band renders an honest
  "references on request" state until a real, attributed quote lands here.

  Shape of a real entry:
    { quote, name, role, business }
  Only add one you can attribute to a named client who has agreed to it.
*/
export const testimonials = []

/*
  Prefilled WhatsApp openers, one per placement. Keep them in the buyer's
  voice — this text lands in *their* chat window, so it has to read like
  something they would plausibly have typed. The differences between them
  are deliberate: the opening line is the only way to tell which part of
  the page did the convincing.

  Unused while `site.whatsapp` is empty — see components/WhatsAppCta.jsx.
*/
export const whatsappPrefill = {
  hero: 'Hi Aniket — I saw your site. Can we talk about the bookings at my clinic?',
  /* The free-audit entry point (docs/research/06, gap G5) — highest-intent
     top-of-funnel opener, in the buyer's voice. */
  audit:
    'Hi Aniket — I’d like to book the free 20-minute automation audit. The part of our week that eats the most time is:',
  /* `{offer}` is replaced with the package name by Pricing.jsx. */
  pricing: 'Hi Aniket — I’d like to know more about the {offer} for my business.',
  cta: 'Hi Aniket — there’s a part of our week I’d like to stop doing by hand. Can we talk?',
  contact: 'Hi Aniket — I have a process I’d like to automate. Do you have 20 minutes?',
  footer: 'Hi Aniket — quick question about the systems you build.',
  nav: 'Hi Aniket — I’m on your site and would like to talk about a system for my business.'
}

export const projects = [
  {
    index: '01',
    slug: 'mindset-workspace',
    diagram: 'platform',
    title: 'Mindset Workspace PWA App',
    summary:
      'A full practice-management app for a multi-therapist mental-health clinic — the one place a client is booked, seen, recorded, documented, billed and followed up. It installs like a phone app, works offline, and records each session on the device.',
    metrics: [
      { n: '750+', label: 'clients imported and in daily use' },
      { n: '11', label: 'therapists working out of one system' },
      { n: '4', label: 'clean layers every feature passes through' },
      { n: '1', label: 'person designed, built and ships it' }
    ],
    role:
      'Sole designer and engineer — the app, the offline layer, the serverless API, the self-hosted backend, every automation and the payment integration.',
    flow: ['Book', 'See', 'Record', 'Document', 'Bill', 'Follow up'],
    stack: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'PWA — offline + on-device recording',
      'Vercel serverless',
      'Oracle Cloud VPS (Docker + Postgres)',
      'n8n',
      'Google Calendar API',
      'MSG91 (WhatsApp / SMS)',
      'HDFC SmartGateway (UPI)',
      'Anthropic API'
    ],
    problem:
      'A busy clinic was running on a pile of disconnected tools — a calendar here, a spreadsheet of clients there, session notes typed up from memory after hours, payments chased by hand. Nothing talked to anything else, so the same client could be double-booked, a note could go missing, and nobody could see the whole picture in one place. What the practice needed was a single system that carried a client all the way through — from the first booking to the follow-up — without anyone re-keying the same details five times.',
    system: [
      'One installable app the whole clinic runs on — it works offline and records the session right on the device, so a dropped connection never costs a note',
      'A booking engine with real-time availability, custom and forced times, and three session modes (in person, telephonic, online), kept in step with each therapist’s Google Calendar',
      'A client record that is hard to mess up — several contacts per person, soft-delete instead of real delete, and duplicate detection that spots the same phone number and offers to merge',
      'A recording-to-note pipeline: the session is captured, broken into chunks, transcribed, and turned into a structured clinical note for the therapist to check — the writing-up that used to eat the evening',
      'A per-person permission system that decides exactly what each role can do — who can edit a client, force a booking, see the whole client book — enforced on the server, not just hidden in the screen',
      'Calendar and messaging kept in visual workflows, and payments taken over a bank gateway with every message signed and verified end to end'
    ],
    features: [
      {
        title: 'Booking & availability',
        text: 'Real-time slots, custom and forced times, and three session modes, all reconciled against each therapist’s Google Calendar.'
      },
      {
        title: 'Client management',
        text: 'Add, edit and soft-delete; several contacts per client; duplicate detection and merge by phone number; and a bulk import that brought 750+ existing clients in at once.'
      },
      {
        title: 'Session recording → clinical note',
        text: 'Records in the app on the device, transcribes it, and drafts a structured clinical note for the therapist to review — instead of writing every note from memory.'
      },
      {
        title: 'The front desk, and everything around it',
        text: 'A day register, task management with owners and email alerts, group sessions, public enquiry / screening / consent forms, a WhatsApp helper bot, and role-scoped onboarding for new therapists.'
      }
    ],
    decisions: [
      {
        title: 'Record on the device, not in the cloud first',
        text: 'Sessions are captured on the device and keep working offline, so a weak clinic connection never loses a recording or a note mid-session.'
      },
      {
        title: 'Permissions live on the server',
        text: 'Who can do what is checked on the server, not just hidden in the screen — so a hidden button is genuinely locked, not merely out of sight.'
      },
      {
        title: 'Stay inside the free tier, on purpose',
        text: 'The serverless API was deliberately kept under the host’s handler limit by grouping actions instead of one file per endpoint, and the backend runs on a single self-hosted box — no Kubernetes — because the practice needs neither the bill nor the complexity.'
      },
      {
        title: 'Change the database like it is production, because it is',
        text: 'Schema changes are rehearsed inside a transaction before they land, shipping is checked through the real screens and endpoints rather than a passing query, and the codebase carries a living map updated in the same commit as the change.'
      }
    ],
    outcome: [
      'The whole practice — booking, clients, notes, tasks, billing, follow-up — runs from one app instead of a scatter of tools',
      '750+ clients across 11 therapists moved in and are managed day to day',
      'Writing up a session went from a from-memory chore to checking a draft the app already prepared',
      'One person can keep the entire system running because every feature is built the same way and documented as it ships'
    ],
    outcomeNote:
      'The client and therapist counts are row counts from the live system. The rest describes the change from the clinic’s side — directional, not an audited metric.'
  },
  {
    index: '02',
    slug: 'udaan',
    diagram: 'journey',
    title: 'Udaan — Online Recovery-Care Platform',
    summary:
      'A 12-week online recovery program that runs three things at once: a self-paced course that teaches, live one-to-one and group therapy that treats, and an always-on safety layer that never switches off — all behind a private, gated portal. Built for a clinical provider.',
    metrics: [
      { n: '12', label: 'week program, from intake to graduation' },
      { n: '10', label: 'stages in the client journey, each a real screen' },
      { n: '4', label: 'separate role-scoped views on one platform' },
      { n: '5', label: 'clinical gates that pause the course for care' }
    ],
    role:
      'Sole designer and engineer — the client journey, the course engine, all four portals, the private data model, every integration and the infrastructure.',
    flow: ['Discover', 'Triage', 'Screen', 'Assess', 'Pay', 'Enrol'],
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'PostgreSQL (Drizzle ORM)',
      'Better-Auth',
      'Cloudflare Workers',
      'Cloudflare R2',
      'n8n',
      'Cal.com',
      'Razorpay',
      'Tailscale'
    ],
    problem:
      'Recovery care is not a video course, and it is not only therapy — it is both at once, with a safety net underneath. The hard part is holding all three together honestly. A course that lets someone race ahead without ever speaking to a therapist is just content; therapy with no structure between sessions loses people in the gaps; and a platform handling this kind of health data cannot let the wrong person see the wrong thing, ever. The job was to build one platform where the course, the live care and the safety layer run together — and where the clinical rules are actually enforced, not just printed in a handbook.',
    system: [
      'A ten-stage journey from stranger to enrolled client: someone discovers the site, fills a triage form (which creates a lead, not yet an account), a coordinator books a screening call, the person is assessed, pays, and only then is given a portal account — each stage a real working screen with its own data and admin tools',
      'A course engine of 12 modules across four movements — Understand, Regulate, Rebuild, Become — that unlocks by doing the work, never by a score',
      'Clinical gates that pause the course until a required therapist session actually happens — and the rule is enforced in one place, so even a hand-made link hits the same lock as a button on the screen',
      'Course video and audio served through short-lived signed links that check enrolment, order and the gates before anything plays',
      'A privacy boundary built into the data itself: a family member sees the shape of the program but never the client’s journal, check-ins or notes, and a flagged journal entry sends the alert, never the words',
      'Booking, intake payment, email and media all wired in and verified, running on free tiers and a single self-hosted box by choice'
    ],
    surfaces: [
      {
        role: 'Client',
        title: 'The portal they live in',
        text: 'A calm home, the modules, a private journal, their schedule, one-tap crisis help, and a “toolkit” rebuilt from their own written work.'
      },
      {
        role: 'Family',
        title: 'A window, not a door',
        text: 'A relative sees the shape of the program and how it is going — never the journal, the check-ins or the notes. The boundary is enforced in the data, not just the design.'
      },
      {
        role: 'Therapist',
        title: 'A scoped caseload',
        text: 'Only their own clients, with mood tracking, client-visible notes and a shared cohort room.'
      },
      {
        role: 'Admin',
        title: 'The whole operation',
        text: 'Lead pipeline, roster, cohort scheduling, attendance, a cohort-wide progress grid, the gate queue and safety-event review.'
      }
    ],
    stages: [
      {
        title: 'Understand',
        text: 'The first movement — seeing the problem clearly, with the safety layer already on.'
      },
      {
        title: 'Regulate',
        text: 'Building the day-to-day tools, paced by real therapist sessions rather than a progress bar.'
      },
      {
        title: 'Rebuild',
        text: 'The longer middle, where the course and the live care do the most work together.'
      },
      {
        title: 'Become',
        text: 'Consolidating into something that holds after the program ends.'
      },
      {
        title: 'Get Help — always on',
        text: 'A crisis button on every screen, backed by an escalation protocol, running under all four movements from day one.',
        safety: true
      }
    ],
    decisions: [
      {
        title: 'One place for the clinical rules',
        text: 'Every gate and permission is decided in a single source of truth that both the screen and the media links ask — so there is no back door where a rule quietly does not apply.'
      },
      {
        title: 'Treat every client row as sensitive',
        text: 'This is real health data, so access is controlled at the data layer: the sensitive things need an explicit escalation flag before any clinician can read them, and even then the flag travels without the private text.'
      },
      {
        title: 'Manual-first where the tools cannot be trusted',
        text: 'The video tiers in use do not reliably report who attended, so attendance is taken by hand and topped up by a signed webhook — an honest default beats a number that looks precise and is wrong.'
      },
      {
        title: 'Cost-constrained by choice',
        text: 'Free tiers and one small self-hosted server, reached over a private tunnel — no Kubernetes, no managed sprawl, because the program does not need the bill.'
      }
    ],
    outcome: [
      'The course, the live care and the safety layer run as one program instead of three disconnected things',
      'The clinical rules are enforced by the system, not left to memory — a locked lesson is genuinely locked, everywhere',
      'A hard privacy wall between family and client is guaranteed by the data model, not by people being careful',
      'Live on staging, built and run end to end by one person'
    ],
    outcomeNote:
      'Module, session, stage and gate counts are real counts from the build. Everything else describes the platform’s design from the builder’s seat — directional, not an audited outcome.'
  },
  {
    index: '03',
    slug: 'signet',
    diagram: 'signature',
    title: 'Signet — Consent & Contract Signing',
    summary:
      'A self-built e-signature tool for service businesses: send a consent form or contract, collect a signature that carries a real audit trail, and get back a sealed, tamper-evident PDF — without an enterprise contract or a login for the person signing.',
    metrics: [
      { n: '3', label: 'signer-ready templates — clinic, studio, agency' },
      { n: 'SHA-256', label: 'seal recomputed and checked on a public page' },
      { n: '0', label: 'third-party e-signature services — the sealing and PDF are mine' },
      { n: '1', label: 'person: design, engineering and the cryptography' }
    ],
    role:
      'Self-initiated build — the product, the signature capture, the tamper-evident sealing, the certificate PDF and the verification flow.',
    flow: ['Compose', 'Send', 'Sign', 'Seal', 'Verify'],
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Drizzle ORM',
      'libSQL / SQLite (Turso in production)',
      'pdf-lib',
      'Web Crypto — SHA-256',
      'Vercel'
    ],
    problem:
      'The businesses that most need a signed consent form or contract on file — a clinic taking informed consent, a studio taking a waiver, an agency getting a statement of work signed off — are the ones e-signature tools serve worst. The serious products are priced and shaped for enterprises, make the person signing create an account, and hide what "signed" actually means behind a black box. I wanted to see how small an honest version could be: send a link, collect a signature with a real audit trail, and hand back a document whose authenticity anyone can check — without a signing API doing the part that matters.',
    system: [
      'A composer that starts from a realistic clinic, studio or agency template — or blank — and takes the people who need to sign, each getting their own unguessable signing link with no account to create',
      'A signing page that works on a phone: the signer reads the document, draws or types a signature, and consents, with their timestamp, IP and device recorded as they do',
      'A tamper-evident seal — a SHA-256 computed over the document’s full text and every signature — set the moment the last signer is done, so the record is sealed rather than merely stored',
      'A certificate PDF generated with pdf-lib: the document, each signature embedded, and a certificate page carrying the seal and the full event log',
      'A public verification page that recomputes the seal over the current stored record and says plainly whether it still matches — the check, not a claim of it',
      'An append-only audit trail behind all of it: created, sent, viewed, signed, completed — every state change writes a row before it touches the document'
    ],
    features: [
      {
        title: 'Compose & send in one step',
        text: 'Pick a template, edit the wording, add signers, and every signer gets a private link. No outbox, no account for them to make.'
      },
      {
        title: 'Sign on any device',
        text: 'Draw a signature on a phone or type it; consent is explicit and recorded; the signer’s time, IP and user-agent are captured at the moment they sign.'
      },
      {
        title: 'A seal, not just storage',
        text: 'The finished document is hashed over its text and every signature. Change one character afterwards and the seal no longer matches — and the verify page catches it.'
      },
      {
        title: 'Verification anyone can run',
        text: 'A public page recomputes the seal live against the stored record and shows authentic or tampered — no account, no trust required, just the check.'
      }
    ],
    decisions: [
      {
        title: 'A seal you can reproduce, not a black box',
        text: 'The seal is a plain SHA-256 over a canonical view of the record. Anyone can read how it is built and recompute it themselves, rather than take a signing vendor’s word that a document is intact.'
      },
      {
        title: 'One database that scales from a file to a URL',
        text: 'libSQL is a local SQLite file in development and a hosted Turso database in production by changing two environment variables — the same "runs on a free tier, deploys without drama" posture as the client systems.'
      },
      {
        title: 'No signing API doing the important part',
        text: 'The signature capture, the hashing and the PDF are all in the repo. The point of the exercise was to build the mechanism, not to wire up someone else’s.'
      },
      {
        title: 'Name the cut corners out loud',
        text: 'As a demo it has no sender-side accounts and shows signing links to copy rather than emailing them. The README says so plainly — the limitations are stated, not hidden.'
      }
    ],
    outcome: [
      'The full loop works end to end: compose, sign on a phone, seal, and verify — demonstrated, not described',
      'Tamper detection is proven — altering a sealed document flips the public verification page from authentic to a seal mismatch',
      'It is the first project on this site with real product screenshots rather than a schematic standing in for one'
    ],
    outcomeNote:
      'Signet is a self-initiated working demo, not a client deployment — so there are no usage numbers here, because there are no users yet. The counts above describe what was built. The screenshots are of the running app.'
  },
  {
    index: '04',
    slug: 'relay',
    diagram: 'relay',
    title: 'Relay — Shared Inbox & CRM',
    summary:
      'A self-built shared client inbox and lightweight CRM for service businesses: every enquiry — WhatsApp, email, web form — in one thread view, tied to a contact record that moves through the pipeline, so a lead stops living in one person’s phone.',
    metrics: [
      { n: '3', label: 'channels — WhatsApp, email, web form — in one inbox' },
      { n: '5', label: 'pipeline stages from first enquiry to won' },
      { n: '1', label: 'record for the enquiry and the client — not two' },
      { n: '0', label: 'per-seat inbox subscriptions — it is one small app' }
    ],
    role:
      'Self-initiated build — the inbox, the thread and triage model, the CRM pipeline, the data model and the seed.',
    flow: ['Arrive', 'Triage', 'Reply', 'Advance', 'Win'],
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Drizzle ORM',
      'libSQL / SQLite (Turso in production)',
      'React Server Components',
      'Vercel'
    ],
    problem:
      'A service business runs on first conversations — a WhatsApp from a referral, an email asking about fees, a web-form enquiry at midnight — and almost none of them are set up to hold those conversations well. The enquiry lands in someone’s personal phone; the client record, if it exists at all, lives in a separate spreadsheet; and the moment an enquiry becomes a client, the context of how they got there is gone. I wanted to build the smallest honest version of the thing the big support desks and CRMs each do half of: one place where the message and the person are the same record, so replying to a client and moving a deal forward happen in the same motion.',
    system: [
      'A shared inbox that collapses WhatsApp, email and web-form conversations into one list, each thread marked with the channel it arrived on so you always know how to reply',
      'A thread view with the two things a team actually needs beside the messages: the contact’s details and pipeline stage, and internal notes the client never sees',
      'Triage built for more than one person: assign a conversation, and set it open, pending or closed — where sending a reply moves it to pending on its own',
      'A CRM that is the same data seen differently: every conversation is attached to a contact that moves lead → qualified → active → won or lost, shown as a pipeline board and a per-contact history',
      'Server-rendered throughout, so the triage controls are real forms that work without JavaScript — only the composer and the inbox filter are client-side',
      'A demo seeded with a believable morning of enquiries, and a control that fabricates an inbound reply so the live-inbox behaviour can be seen without a real messaging integration'
    ],
    features: [
      {
        title: 'One inbox, every channel',
        text: 'WhatsApp, email and web-form threads in a single list, filterable by open, unread, pending and closed, each badged with its source.'
      },
      {
        title: 'Reply and note in one place',
        text: 'Answer the client or leave a note only the team can see, with the contact and their pipeline stage always in view beside the thread.'
      },
      {
        title: 'Triage like a team',
        text: 'Assign a conversation and move it through open, pending and closed — sending a reply advances it automatically.'
      },
      {
        title: 'The pipeline is built in',
        text: 'A board of every contact by stage, and a contact page that ties their whole conversation history to where they are in the pipeline.'
      }
    ],
    decisions: [
      {
        title: 'The enquiry and the client are one record',
        text: 'Rather than an inbox bolted to a separate CRM, a conversation belongs to a contact from the first message. Moving a deal and replying to a client act on the same row — which is the whole reason the tool exists.'
      },
      {
        title: 'Server-rendered, so triage works without JavaScript',
        text: 'Status, assignment and stage changes are plain forms backed by server actions. Only the composer and the inbox filter need the client, so the core of the app is robust and fast by default.'
      },
      {
        title: 'Simulate the inbound rather than fake the integration',
        text: 'Real WhatsApp and email webhooks were out of scope for a demo, so instead of pretending they exist, there is an honest "simulate a client reply" control — and the README says exactly where a real provider would plug in.'
      }
    ],
    outcome: [
      'The daily loop works end to end: open a thread, reply, triage, and advance the contact down the pipeline — on one record',
      'The inbox and the CRM genuinely share data — a stage change on the contact page shows on the thread, and a reply shows on the pipeline',
      'Seeded with realistic enquiries so the demo behaves like a real morning of client work, not an empty shell'
    ],
    outcomeNote:
      'Relay is a self-initiated working demo, not a client deployment. Inbound channels are simulated, so the counts above describe what was built, not real message volumes. The screenshots are of the running app.'
  },
  {
    index: '05',
    slug: 'prospector',
    diagram: 'prospect',
    title: 'Prospector — Lead-Research Scraper',
    summary:
      'A self-built lead-research tool: paste a business website and Prospector reads its public pages and pulls the name, contact details, location and socials into one clean, scored, exportable list — for the studio or agency doing its own outreach.',
    metrics: [
      { n: '5', label: 'signals read per page — JSON-LD, OG, email, phone, socials' },
      { n: '0–100', label: 'completeness score, weighted to contact details' },
      { n: '0', label: 'third-party scraping APIs — the extractor is in the repo' },
      { n: 'CSV', label: 'the whole list exports in one click' }
    ],
    role:
      'Self-initiated build — the extractor, the scoring, the workspace, the data model and the CSV export.',
    flow: ['Paste', 'Fetch', 'Extract', 'Score', 'Export'],
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'node-html-parser',
      'Drizzle ORM',
      'libSQL / SQLite (Turso in production)',
      'Vercel'
    ],
    problem:
      'A studio or agency doing its own outreach doesn’t need a sales platform with a per-seat licence and a CRM bolted on — it needs a short, clean list of businesses it could actually contact. Building that list by hand means opening twenty tabs and copying a name, an email and an Instagram handle off each one. The job here was the smallest honest version of that: paste the URLs, and let the tool do the reading — while being straight about the fact that real web pages are messy and half of them won’t give up an email.',
    system: [
      'A server-side extractor that fetches a page and reads the business behind it in priority order: JSON-LD structured data first, then Open Graph and meta tags, then the page itself for mailto and tel links and social profiles',
      'A completeness score from 0 to 100, weighted toward contact details, so the businesses you can actually reach rise to the top of the list',
      'A workspace that takes a batch of URLs at once, scrapes them with a little concurrency, and drops each result into a filterable, searchable table',
      'A per-lead view showing every extracted field — and marking the ones that were not found as not found, rather than inventing them',
      'A pipeline of its own — new, shortlisted, contacted, archived — plus a one-click CSV export of the whole list',
      'No headless browser and no scraping API: the extractor is about a hundred readable lines built on a lightweight HTML parser'
    ],
    features: [
      {
        title: 'It actually reads the page',
        text: 'Structured data, Open Graph, and the page’s own mailto / tel and social links — parsed into fields server-side, not scraped blindly or run through a paid API.'
      },
      {
        title: 'Scored by what you can act on',
        text: 'Each lead gets a completeness score weighted toward contact details, so a business with an email and a phone outranks one with only a name.'
      },
      {
        title: 'Honest about the gaps',
        text: 'Web pages are inconsistent. A missing email is shown as “Not found”, never guessed — the score simply reflects how much was there.'
      },
      {
        title: 'Filter, shortlist, export',
        text: 'Filter by status or “has email”, search the list, move leads through your own pipeline, and export everything to CSV in one click.'
      }
    ],
    decisions: [
      {
        title: 'Structured data first, then fall back',
        text: 'Sites that ship JSON-LD get read cleanly; the rest fall back to Open Graph, meta tags and links on the page. Reading the good signal first and degrading gracefully is what makes the output trustworthy.'
      },
      {
        title: 'No headless browser, on purpose',
        text: 'A real Chromium would read JavaScript-rendered sites but cost speed, memory and complexity. A lightweight HTML parser covers most real business pages and keeps the whole tool small — the README names the trade-off.'
      },
      {
        title: 'Record what was found, score the rest',
        text: 'The tool never fabricates a missing field to look complete. Honesty is the feature: a lead you can trust is worth more than a full-looking row you can’t.'
      }
    ],
    outcome: [
      'The extraction is real — pasting a live URL fetches and parses it on the spot, and the seeded rows are genuine extractions from real public pages',
      'Leads sort by how reachable they are, so the list is useful the moment it is built',
      'The whole list exports to CSV, which is the actual job of a research tool'
    ],
    outcomeNote:
      'Prospector is a self-initiated working demo, not a client deployment. It reads only public pages and is best pointed at sites that publish structured data; the counts describe what was built. The screenshots are of the running app.'
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
    name: 'Postgres',
    note: 'The system of record: real relations, constraints and room to grow — not a spreadsheet pretending to be a database.'
  },
  {
    name: 'React & Next.js',
    note: 'The screens people use every day — dashboards, portals, booking flows — server-rendered where the project needs it.'
  },
  {
    name: 'TypeScript',
    note: 'Types across the whole stack, so a change to the data cannot quietly break a screen three files away.'
  },
  {
    name: 'Node & serverless',
    note: 'The backend and APIs on Vercel or Cloudflare Workers — nothing to babysit, and it scales to zero when idle.'
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
      'A lightweight web app on React and Postgres that replaces the spreadsheet without retraining anyone.',
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
  { label: 'About', to: '/about' },
  { label: 'Get in touch', to: '/contact' }
]

/* Set `href` to go live. Empty entries are skipped, not rendered dead. */
export const social = [
  { label: 'LinkedIn', href: '', icon: 'linkedin' },
  { label: 'X', href: '', icon: 'x' },
  { label: 'GitHub', href: 'https://github.com/Aniket787878', icon: 'github' },
  { label: 'Email', href: '', icon: 'mail' }
]
