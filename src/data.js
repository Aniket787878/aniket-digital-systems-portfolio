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
    'therapist-pwa': '',
    'care-journey': '',
    /* The first real screenshots on the site — the consent signer, the
       shared inbox and the lead research tool are self-built, so unlike the
       two client systems their running UI can actually be shown. The
       signer: the sealed document with its audit trail. The inbox: a live
       thread with the contact and pipeline alongside. The research tool:
       the lead workspace after a live scrape. All captured from the
       running apps. */
    'consent-signer': '/consent-signer-sealed.png',
    'shared-inbox': '/shared-inbox.png',
    'lead-research': '/lead-research-workspace.png'
  }
}

/* ------------------------------------------------------------------
   PRODUCT FILMS — rendered from remotion/ by scripts/render-videos.sh.

   Two kinds, and the site says which on every one:
   - 'real'      The three self-built demos. Every pixel inside the window is
                 a capture of the running app (public/walkthroughs/); only
                 the camera, pointer and captions are added.
   - 'schematic' The two client platforms. Their screens hold client
                 records, so the film is a labelled wireframe of the real
                 flow and never presents itself as a recording.
   `clip` is the short silent loop the project cards play on hover.
   ------------------------------------------------------------------ */
export const films = {
  'therapist-pwa': {
    kind: 'schematic',
    src: '/videos/therapist-pwa.mp4',
    poster: '/videos/posters/therapist-pwa.jpg'
  },
  'care-journey': {
    kind: 'schematic',
    src: '/videos/care-journey.mp4',
    poster: '/videos/posters/care-journey.jpg'
  },
  'consent-signer': {
    kind: 'real',
    src: '/videos/consent-signer.mp4',
    poster: '/videos/posters/consent-signer.jpg',
    clip: '/videos/clips/consent-signer.mp4',
    clipPoster: '/videos/posters/consent-signer-clip.jpg'
  },
  'shared-inbox': {
    kind: 'real',
    src: '/videos/shared-inbox.mp4',
    poster: '/videos/posters/shared-inbox.jpg',
    clip: '/videos/clips/shared-inbox.mp4',
    clipPoster: '/videos/posters/shared-inbox-clip.jpg'
  },
  'lead-research': {
    kind: 'real',
    src: '/videos/lead-research.mp4',
    poster: '/videos/posters/lead-research.jpg',
    clip: '/videos/clips/lead-research.mp4',
    clipPoster: '/videos/posters/lead-research-clip.jpg'
  }
}

/* Explainer films (remotion/explainers, rendered by
   scripts/render-videos.sh explainers). Illustrative motion design, not
   screen recordings, apart from the real captures they quote. */
/* Flip to true once public/videos/explainers/ holds the rendered films.
   Until then the explainer player and the "watch" buttons render nothing,
   so the live site never shows an empty player. */
export const explainersReady = true

export const explainers = {
  brand: {
    title: 'What I build, in one minute',
    src: '/videos/explainers/explainer-brand.mp4',
    vertical: '/videos/explainers/explainer-brand-vertical.mp4',
    poster: '/videos/posters/explainer-brand.jpg'
  },
  'ops-sprint': {
    title: 'Ops Automation Sprint',
    src: '/videos/explainers/explainer-ops-sprint.mp4',
    poster: '/videos/posters/explainer-ops-sprint.jpg'
  },
  'ai-assistant': {
    title: 'AI Assistant Build',
    src: '/videos/explainers/explainer-ai-assistant.mp4',
    poster: '/videos/posters/explainer-ai-assistant.jpg'
  },
  'internal-tool': {
    title: 'Internal Tool / Dashboard',
    src: '/videos/explainers/explainer-internal-tool.mp4',
    poster: '/videos/posters/explainer-internal-tool.jpg'
  }
}

/* ------------------------------------------------------------------
   The product tour on the home page: six moments, two per working demo.
   (It was nine over 600vh of scroll; cut to six when the band shrank to
   250vh, so each beat still gets about a quarter screen of scroll to push
   in, hold and pull out. A beat added here costs scroll speed.) Every image is a real 2x capture of the running app
   (public/walkthroughs/); `spot` is the region the camera zooms into and
   highlights, in the 1440x900 CSS-pixel space the captures were taken at.
   ------------------------------------------------------------------ */
export const screenTour = [
  {
    slug: 'shared-inbox',
    url: 'shared-inbox.app/inbox',
    file: '/walkthroughs/shared-inbox/03.png',
    spot: { x: 160, y: 100, w: 362, h: 570 },
    caption: 'WhatsApp, email and web enquiries land in one shared inbox.'
  },
  {
    slug: 'shared-inbox',
    url: 'shared-inbox.app/inbox',
    file: '/walkthroughs/shared-inbox/03.png',
    spot: { x: 521, y: 62, w: 480, h: 372 },
    caption: 'Reply in one click, and the thread moves itself to pending.'
  },
  {
    slug: 'consent-signer',
    url: 'consent-signer.app/sign',
    file: '/walkthroughs/consent-signer/05.png',
    spot: { x: 332, y: 504, w: 775, h: 380 },
    caption: 'Your client signs with a finger. No account to create.'
  },
  {
    slug: 'consent-signer',
    url: 'consent-signer.app/verify',
    file: '/walkthroughs/consent-signer/08.png',
    spot: { x: 429, y: 90, w: 582, h: 130 },
    caption: 'Change one character afterwards and the public check fails.'
  },
  {
    slug: 'lead-research',
    url: 'lead-research.app/workspace',
    file: '/walkthroughs/lead-research/03.png',
    spot: { x: 176, y: 58, w: 1088, h: 208 },
    caption: 'Paste a few websites. Each one is read live, on the spot.'
  },
  {
    slug: 'lead-research',
    url: 'lead-research.app/leads',
    file: '/walkthroughs/lead-research/06.png',
    spot: { x: 164, y: 115, w: 760, h: 280 },
    caption: 'Anything missing is marked Not found, never guessed.'
  }
]

/* The hero showreel: the strongest beats of the three working demos. */
export const heroReel = {
  src: '/videos/hero-reel.mp4',
  poster: '/videos/posters/hero-reel.jpg',
  caption: 'A shared inbox, a consent signer and a lead research tool, real screens from the running apps.'
}

export const site = {
  name: 'Digital Systems Builder',

  /* The site's public origin, no trailing slash. ONE place: vite.config.js
     reads it at build time to write the canonical link, og:url, og:image,
     the JSON-LD, robots.txt and sitemap.xml. When the branded domain
     resolves, change this line and redeploy. (aniketbuilds.com does not
     resolve yet, so the live Vercel URL stands in.) */
  origin: 'https://aniket-portfolio-six-bice.vercel.app',

  /* The 15-minute call link (Cal.com). ONE place: while this is empty every
     primary button falls back to WhatsApp / the contact page. Paste the link
     here and "Book a 15-min call" becomes the primary button in the hero,
     nav, services, contact page and case-study CTA, with WhatsApp demoted to
     the second button. See components/BookingCta.jsx. */
  bookingUrl: '',

  /* Positioning, in one place: service businesses broadly (clinics,
     studios, agencies, growing teams). The clinic system is the proof,
     not the market. The hero, the meta description, the JSON-LD and the
     OG card (scripts/render-og.mjs) all read from here. */
  headline: ['Enquiries answered. Bookings confirmed.', 'Follow-ups sent. Without anyone typing.'],
  subtitle:
    'Custom systems and automations for clinics, studios, agencies and growing teams, live in weeks.',
  tagline:
    'Enquiries answered, bookings confirmed and follow-ups sent without anyone typing. Custom systems and automations for clinics, studios, agencies and growing teams, live in weeks.',

  /* Shown beside the prices. A promise, so it lives with the data it
     qualifies rather than in a component. */
  guarantee:
    'Fixed price, fixed date. If it isn’t live by the date in writing, you don’t pay the second half.',

  email: 'aniket.html@gmail.com',
  whatsapp: '+91 9136582842', // digits are stripped in whatsapp.js for the wa.me link
  location: 'Based in India · working remotely worldwide',
  availability:
    'Taking on new projects. Next start slot is usually one to two weeks out.',
  /* A template, filled from the first entry in `packages` (the entry
     offer) in the visitor's currency, so the price is stated once. */
  pricingAnchor: 'The usual starting point is an {offer}: one workflow, end to end, {price}, {timeline}.',
}

/* Title, description and share card for index.html. vite.config.js writes
   these into the <head> at build time, together with site.origin. */
export const seo = {
  title: 'Enquiries answered. Bookings confirmed. · Aniket',
  description:
    'Enquiries answered, bookings confirmed and follow-ups sent without anyone typing. Custom systems and automations for clinics, studios, agencies and growing teams, live in weeks.',
  ogTitle: 'Enquiries answered. Bookings confirmed. Follow-ups sent.',
  ogImage: '/og.png',
  ogImageAlt:
    'Enquiries answered. Bookings confirmed. Follow-ups sent. Without anyone typing. Custom systems and automations by Aniket.'
}

/*
  Identity layer — the About page puts a real person behind the work, so
  he has to be on it (docs/research/06, gap G2). Everything here is either true and
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
    'I build the software service businesses actually run on: booking, intake, follow-ups, payments and AI, so the work stops living in WhatsApp threads and spreadsheets. It started with the system an eleven-therapist clinic needed to stop drowning in admin, and it is the same shape of problem in a studio, an agency or a growing team. You own what ships.',

  /* Aniket's own story — how he got here, what he did before — is his to
     write. Left empty on purpose rather than invented; the About page
     renders a labelled slot when it is blank. */
  story: '',

  /* Real headshot → drop it in public/ (e.g. public/aniket.jpg) and set the
     path here. Until then the About page shows the honest placeholder well. */
  photo: '',

  basedIn: 'Based in India · working remotely worldwide',

  /* What a buyer actually gets. Each line is already promised elsewhere on
     the site (pricing timelines, FAQ, handover). No solo-vs-agency framing:
     retired 2026-09-27, see docs/system/05-icp-positioning.md. */
  principles: [
    {
      title: 'Live in weeks, not quarters',
      text: 'Every offer has a timeline in writing, from 5 days for a single workflow to 3–4 weeks for an internal tool, so you see it working early and can change course while that is cheap.'
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
      text: 'I pick the stack to fit the build (React, TypeScript, Postgres, n8n, Claude), and where your team already runs on something that works, I build on it instead of charging you to migrate.'
    }
  ],

  /* Verified facts only. Anything needing a number Aniket has not supplied
     stays out. */
  quickFacts: [
    { label: 'Based', value: 'India · remote worldwide' },
    { label: 'Focus', value: 'Booking, intake, follow-ups, payments, AI' },
    { label: 'Core stack', value: 'React · TypeScript · Node · Postgres · n8n · Claude' },
    { label: 'Availability', value: 'Taking new projects' }
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
  hero: 'Hi Aniket, I saw your site. Can we talk about a system for my business?',
  /* The free-audit entry point (docs/research/06, gap G5) — highest-intent
     top-of-funnel opener, in the buyer's voice. */
  audit:
    'Hi Aniket, I’d like to book the free 15-minute automation audit. The part of our week that eats the most time is:',
  /* `{offer}` is replaced with the package name by home/Services.jsx. */
  pricing: 'Hi Aniket, I’d like to know more about the {offer} for my business.',
  cta: 'Hi Aniket, there’s a part of our week I’d like to stop doing by hand. Can we talk?',
  contact: 'Hi Aniket, I have a process I’d like to automate. Do you have 20 minutes?',
  footer: 'Hi Aniket, quick question about the systems you build.',
  nav: 'Hi Aniket, I’m on your site and would like to talk about a system for my business.'
}

export const projects = [
  {
    index: '01',
    slug: 'therapist-pwa',
    highlights: [
      'Session recordings become a draft clinical note shortly after the session',
      'A booking desk synced to Google Calendar and WhatsApp',
      'Consent signed, sealed as a PDF and countersigned in a queue'
    ],
    diagram: 'platform',
    title: 'Therapist PWA',
    subtitle: 'Clinic operations platform',
    tagline: 'The CRM, booking desk and AI note-taker an eleven-therapist clinic runs its day on.',
    year: '2025–26',
    summary:
      'Three apps under one roof for a multi-therapist mental-health clinic: the staff CRM the team runs its day on (tasks, client records, the booking desk, consent), the public forms clients fill in, and a client-facing recovery-companion PWA. All installable, with desktop push, fronting a private data service that owns the clinic’s data.',
    metrics: [
      { n: '1,200+', label: 'client records managed day to day' },
      { n: '11', label: 'therapists on one system' },
      { n: '12', label: 'serverless functions: the whole API, by design' },
      { n: '3', label: 'apps under one roof: staff CRM, client forms, client PWA' }
    ],
    role:
      'Designer and engineer: both React apps, the serverless API, the private data service, the access model and every automation behind it.',
    flow: ['Enquire', 'Book', 'See', 'Note', 'Consent', 'Follow up'],
    stack: [
      'React 19',
      'Vite',
      'TanStack Router & Query',
      'Zustand',
      'Radix UI',
      'Tailwind CSS v4',
      'PWA, installable + web push',
      'Node data service',
      'PostgreSQL',
      'Vercel serverless',
      'Oracle Cloud VM',
      'n8n',
      'Google Calendar / Meet',
      'MSG91 (WhatsApp)',
      'Google Gemini',
      'IndexedDB (offline chunk queue)'
    ],
    problem:
      'A busy clinic was running on a pile of disconnected tools, a calendar here, a spreadsheet of clients there, session notes typed up from memory after hours, follow-ups slipping through the cracks. Nothing talked to anything else, so the same client could be double-booked, a note could go missing, and nobody could see the whole picture in one place. What the practice needed was a single system its whole team runs on, from the first enquiry to the follow-up, without anyone re-keying the same details five times, and without client records ever sitting somewhere they should not.',
    system: [
      'Three apps in one repo: the staff CRM, the public forms clients fill in (enquiry, screening, consent, booking), and a client-facing recovery-companion PWA, all fronting a private data service, so client data never lives in the browser tier',
      'The flagship: a session-recording → clinical-note pipeline on Google Gemini: the browser records in 60-second chunks queued in IndexedDB with retries, each is transcribed and its audio dropped, and on stop the full transcript is written into a draft note the therapist reviews',
      'Guardrails around the AI, because it fails quietly otherwise: each chunk is a complete audio file (a headerless one makes the model invent dialogue), a degenerate-loop check catches the transcriber repeating itself, and a note that is not well-formed English fails loudly so the therapist re-drafts instead of trusting a fabrication',
      'A booking desk that runs each action through visual n8n workflows to Google Calendar / Meet and WhatsApp, with real-time availability, three session modes (in person, telephonic, online) and recurring bookings capped and gated server-side',
      'Around 1,200 client records with therapist assignment, case notes, rolling AI case summaries regenerated after each note, and group sessions with a shared note read into every attendee’s file, visibility scoped per therapist and enforced on the server, down to a notes-locked flag',
      'A consent pipeline (client signs, a sealed PDF generated server-side, stored, emailed and countersigned from a forms queue), a per-person access model checked on every request, tasks with owners and repeats, and desktop push through the service worker and VAPID',
    ],
    features: [
      {
        title: 'Session recording → AI clinical note',
        text: 'The therapist records; a chunked Gemini pipeline transcribes as it goes and drafts a clinical note shortly after the session ends, with loop- and hallucination-guards that fail loudly rather than invent a note.'
      },
      {
        title: 'Booking desk',
        text: 'Real-time availability, three session modes and recurring bookings, each action driven through n8n to Google Calendar / Meet and WhatsApp, capped and gated on the server.'
      },
      {
        title: 'Clients, groups & consent',
        text: 'Around 1,200 client records with case notes and rolling AI summaries, group sessions with a shared note, and a consent pipeline that signs, seals and countersigns a server-generated PDF.'
      },
      {
        title: 'Roles, tasks & the client PWA',
        text: 'A granular per-person access model enforced server-side, tasks with owners and repeats, desktop push, and a separate client-facing recovery-companion PWA (check-ins, craving protocol, crisis help).'
      }
    ],
    decisions: [
      {
        title: 'The AI note pipeline is guarded, not trusted',
        text: 'The transcriber and the note model both fail loudly: chunks are whole audio files (a headerless one makes the model fabricate dialogue), a degenerate-loop check catches runaway repetition, and a malformed note is rejected. Once the model tried to write a cardiology work-up for a patient who did not exist, the guard is why no therapist ever saw it.'
      },
      {
        title: 'The riskiest feature is deliberately unbuilt',
        text: 'The client app has no AI coach yet, on purpose, a chatbot talking to someone in acute craving does not ship without crisis detection in front of every reply, a clinician-reviewed prompt, and an agreed answer to who responds when a client discloses self-harm at 2am. Until then, Help links to live 24/7 meetings.'
      },
      {
        title: 'Twelve serverless functions, on purpose',
        text: 'The entire API is exactly twelve serverless functions, the host’s free-tier ceiling. New features add an action to an existing handler instead of a new file, so the whole thing keeps running at no infra cost.'
      },
      {
        title: 'The browser never touches the data tier',
        text: 'A private data service owns Postgres, email, PDF generation, messaging and the AI calls, reached only through a tunnel; the public apps call it through a thin serverless layer, so real client data never sits in the browser.'
      },
      {
        title: 'Permissions live on the server',
        text: 'Who can do what (edit a client, work the front desk, read peer-support notes, see the whole client book) is checked on the server, so a hidden button is genuinely locked, not merely out of sight.'
      }
    ],
    outcome: [
      'The clinic’s day (tasks, clients, bookings, consent and forms) runs from one installable app instead of a scatter of tools',
      'Around 1,200 client records across 11 therapists, managed day to day with assignment-scoped access',
      'Writing up a session became checking an AI-drafted summary instead of typing it from memory',
      'Two apps, a private data service and the automations behind them, maintained as one system'
    ],
    outcomeNote:
      'Client and therapist counts are row counts from the live system. The rest describes the change from the clinic’s side, directional, not an audited metric.'
  },
  {
    index: '02',
    slug: 'care-journey',
    highlights: [
      'A ten-stage journey from first enquiry to enrolled client',
      'Clinical gates that lock the course until a real session happens',
      'A privacy wall between family and client, enforced in the data'
    ],
    diagram: 'journey',
    title: 'Care Journey Platform',
    subtitle: 'Online recovery-care program',
    tagline: 'A 12-week recovery program: course, live therapy and an always-on safety layer in one gated portal.',
    year: '2026',
    summary:
      'A 12-week online recovery program that runs three things at once: a self-paced course that teaches, live one-to-one and group therapy that treats, and an always-on safety layer that never switches off, all behind a private, gated portal.',
    metrics: [
      { n: '12', label: 'week program, from intake to graduation' },
      { n: '10', label: 'stages in the client journey, each a real screen' },
      { n: '4', label: 'separate role-scoped views on one platform' },
      { n: '5', label: 'clinical gates that pause the course for care' }
    ],
    role:
      'Designer and engineer: the client journey, the course engine, all four portals, the private data model, every integration and the infrastructure.',
    flow: ['Discover', 'Triage', 'Screen', 'Assess', 'Pay', 'Enrol'],
    stack: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Tailwind CSS v4',
      'shadcn/ui',
      'PostgreSQL (Drizzle ORM)',
      'Better-Auth',
      'Cloudflare Pages (@opennextjs/cloudflare)',
      'Cloudflare R2',
      'Cloudflare Tunnel',
      'n8n',
      'Cal.com',
      'Razorpay'
    ],
    problem:
      'Recovery care is not a video course, and it is not only therapy, it is both at once, with a safety net underneath. The hard part is holding all three together honestly. A course that lets someone race ahead without ever speaking to a therapist is just content; therapy with no structure between sessions loses people in the gaps; and a platform handling this kind of health data cannot let the wrong person see the wrong thing, ever. The job was to build one platform where the course, the live care and the safety layer run together, and where the clinical rules are actually enforced, not just printed in a handbook.',
    system: [
      'A ten-stage journey from stranger to enrolled client: someone discovers the site, fills a triage form (which creates a lead, not yet an account), a coordinator books a screening call, the person is assessed, pays, and only then is given a portal account, each stage a real working screen with its own data and admin tools',
      'A course engine of 12 modules and 48 lessons across four movements (Understand, Regulate, Rebuild, Become), worksheets instead of scored quizzes, unlocking by doing the work rather than by a grade',
      'Clinical gates that pause the course until a required therapist session actually happens, and the rule is enforced in one place, so even a hand-made link hits the same lock as a button on the screen',
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
        text: 'A relative sees the shape of the program and how it is going, never the journal, the check-ins or the notes. The boundary is enforced in the data, not just the design.'
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
        text: 'The first movement, seeing the problem clearly, with the safety layer already on.'
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
        title: 'Get Help: always on',
        text: 'A crisis button on every screen, backed by an escalation protocol, running under all four movements from day one.',
        safety: true
      }
    ],
    decisions: [
      {
        title: 'One place for the clinical rules',
        text: 'Every gate and permission is decided in a single source of truth that both the screen and the media links ask, so there is no back door where a rule quietly does not apply.'
      },
      {
        title: 'Treat every client row as sensitive',
        text: 'This is real health data, so access is controlled at the data layer: the sensitive things need an explicit escalation flag before any clinician can read them, and even then the flag travels without the private text.'
      },
      {
        title: 'Manual-first where the tools cannot be trusted',
        text: 'The video tiers in use do not reliably report who attended, so attendance is taken by hand and topped up by a signed webhook, an honest default beats a number that looks precise and is wrong.'
      },
      {
        title: 'No model where a template will do',
        text: 'The program “builds” fourteen artifacts for each client, the six-part relapse-prevention plan, the letter to future self, but none use a model: each is assembled verbatim from worksheet answers the client already wrote, and the curriculum is real clinical content, not generated. In recovery care, a deterministic artifact you can trust beats a plausible one you cannot.'
      },
      {
        title: 'Cost-constrained by choice',
        text: 'Free tiers and one small self-hosted server, reached over a private tunnel, no Kubernetes, no managed sprawl, because the program does not need the bill.'
      }
    ],
    outcome: [
      'The course, the live care and the safety layer run as one program instead of three disconnected things',
      'The clinical rules are enforced by the system, not left to memory, a locked lesson is genuinely locked, everywhere',
      'A hard privacy wall between family and client is guaranteed by the data model, not by people being careful',
      'Deployed on staging; not yet in use with clients'
    ],
    outcomeNote:
      'Module, session, stage and gate counts are real counts from the build. Everything else describes how the platform is designed, directional, not an audited outcome.'
  },
  {
    index: '03',
    slug: 'consent-signer',
    highlights: [
      'Clinic, studio and agency templates, signed on any phone',
      'A SHA-256 seal over the text and every signature',
      'A public page that proves the document is unchanged'
    ],
    diagram: 'signature',
    title: 'Consent & Contract Signer',
    subtitle: 'E-signatures with an audit trail',
    tagline: 'Signed on any phone, sealed against tampering, and verifiable by anyone on a public page.',
    year: '2026',
    summary:
      'A self-built e-signature tool for service businesses: send a consent form or contract, collect a signature that carries a real audit trail, and get back a sealed, tamper-evident PDF, without an enterprise contract or a login for the person signing.',
    metrics: [
      { n: '3', label: 'signer-ready templates: clinic, studio, agency' },
      { n: 'SHA-256', label: 'seal recomputed and checked on a public page' },
      { n: '0', label: 'third-party e-signature services; the sealing and PDF are mine' },
      { n: '5', label: 'audit events logged: created, sent, viewed, signed, completed' }
    ],
    role:
      'Self-initiated build: the product, the signature capture, the tamper-evident sealing, the certificate PDF and the verification flow.',
    flow: ['Compose', 'Send', 'Sign', 'Seal', 'Verify'],
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Drizzle ORM',
      'libSQL / SQLite (Turso in production)',
      'pdf-lib',
      'Web Crypto, SHA-256',
      'Vercel'
    ],
    problem:
      'The businesses that most need a signed consent form or contract on file, a clinic taking informed consent, a studio taking a waiver, an agency getting a statement of work signed off, are the ones e-signature tools serve worst. The serious products are priced and shaped for enterprises, make the person signing create an account, and hide what "signed" actually means behind a black box. I wanted to see how small an honest version could be: send a link, collect a signature with a real audit trail, and hand back a document whose authenticity anyone can check, without a signing API doing the part that matters.',
    system: [
      'A composer that starts from a realistic clinic, studio or agency template, or blank, and takes the people who need to sign, each getting their own unguessable signing link with no account to create',
      'A signing page that works on a phone: the signer reads the document, draws or types a signature, and consents, with their timestamp, IP and device recorded as they do',
      'A tamper-evident seal, a SHA-256 computed over the document’s full text and every signature, set the moment the last signer is done, so the record is sealed rather than merely stored',
      'A certificate PDF generated with pdf-lib: the document, each signature embedded, and a certificate page carrying the seal and the full event log',
      'A public verification page that recomputes the seal over the current stored record and says plainly whether it still matches, the check, not a claim of it',
      'An append-only audit trail behind all of it: created, sent, viewed, signed, completed, every state change writes a row before it touches the document'
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
        text: 'The finished document is hashed over its text and every signature. Change one character afterwards and the seal no longer matches, and the verify page catches it.'
      },
      {
        title: 'Verification anyone can run',
        text: 'A public page recomputes the seal live against the stored record and shows authentic or tampered, no account, no trust required, just the check.'
      }
    ],
    decisions: [
      {
        title: 'A seal you can reproduce, not a black box',
        text: 'The seal is a plain SHA-256 over a canonical view of the record. Anyone can read how it is built and recompute it themselves, rather than take a signing vendor’s word that a document is intact.'
      },
      {
        title: 'One database that scales from a file to a URL',
        text: 'libSQL is a local SQLite file in development and a hosted Turso database in production by changing two environment variables, the same "runs on a free tier, deploys without drama" posture as the client systems.'
      },
      {
        title: 'No signing API doing the important part',
        text: 'The signature capture, the hashing and the PDF are all in the repo. The point of the exercise was to build the mechanism, not to wire up someone else’s.'
      },
      {
        title: 'Name the cut corners out loud',
        text: 'As a demo it has no sender-side accounts and shows signing links to copy rather than emailing them. The README says so plainly, the limitations are stated, not hidden.'
      }
    ],
    outcome: [
      'The full loop works end to end: compose, sign on a phone, seal, and verify, demonstrated, not described',
      'Tamper detection is proven, altering a sealed document flips the public verification page from authentic to a seal mismatch',
      'It is the first project on this site with real product screenshots rather than a schematic standing in for one'
    ],
    outcomeNote:
      'This signer is a self-initiated working demo, not a client deployment, so there are no usage numbers here, because there are no users yet. The counts above describe what was built. The screenshots are of the running app.'
  },
  {
    index: '04',
    slug: 'shared-inbox',
    highlights: [
      'WhatsApp, email and web enquiries in one shared inbox',
      'Reply, leave a note or assign without leaving the thread',
      'Every conversation tied to a stage in the pipeline'
    ],
    diagram: 'shared-inbox',
    title: 'Shared Inbox CRM',
    subtitle: 'Every enquiry and the pipeline in one app',
    tagline: 'WhatsApp, email and web enquiries in one shared inbox, tied to a pipeline.',
    year: '2026',
    summary:
      'A self-built shared client inbox and lightweight CRM for service businesses: every enquiry (WhatsApp, email, web form) in one thread view, tied to a contact record that moves through the pipeline, so a lead stops living in someone’s personal phone.',
    metrics: [
      { n: '3', label: 'channels (WhatsApp, email, web form) in one inbox' },
      { n: '5', label: 'pipeline stages from first enquiry to won' },
      { n: '1', label: 'record for the enquiry and the client, not two' },
      { n: '0', label: 'per-seat inbox subscriptions; it is one small app' }
    ],
    role:
      'Self-initiated build: the inbox, the thread and triage model, the CRM pipeline, the data model and the seed.',
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
      'A service business runs on first conversations, a WhatsApp from a referral, an email asking about fees, a web-form enquiry at midnight, and almost none of them are set up to hold those conversations well. The enquiry lands in someone’s personal phone; the client record, if it exists at all, lives in a separate spreadsheet; and the moment an enquiry becomes a client, the context of how they got there is gone. I wanted to build the smallest honest version of the thing the big support desks and CRMs each do half of: one place where the message and the person are the same record, so replying to a client and moving a deal forward happen in the same motion.',
    system: [
      'A shared inbox that collapses WhatsApp, email and web-form conversations into one list, each thread marked with the channel it arrived on so you always know how to reply',
      'A thread view with the two things a team actually needs beside the messages: the contact’s details and pipeline stage, and internal notes the client never sees',
      'Triage built for a team: assign a conversation, and set it open, pending or closed, where sending a reply moves it to pending on its own',
      'A CRM that is the same data seen differently: every conversation is attached to a contact that moves lead → qualified → active → won or lost, shown as a pipeline board and a per-contact history',
      'Server-rendered throughout, so the triage controls are real forms that work without JavaScript, only the composer and the inbox filter are client-side',
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
        text: 'Assign a conversation and move it through open, pending and closed, sending a reply advances it automatically.'
      },
      {
        title: 'The pipeline is built in',
        text: 'A board of every contact by stage, and a contact page that ties their whole conversation history to where they are in the pipeline.'
      }
    ],
    decisions: [
      {
        title: 'The enquiry and the client are one record',
        text: 'Rather than an inbox bolted to a separate CRM, a conversation belongs to a contact from the first message. Moving a deal and replying to a client act on the same row, which is the whole reason the tool exists.'
      },
      {
        title: 'Server-rendered, so triage works without JavaScript',
        text: 'Status, assignment and stage changes are plain forms backed by server actions. Only the composer and the inbox filter need the client, so the core of the app is robust and fast by default.'
      },
      {
        title: 'Simulate the inbound rather than fake the integration',
        text: 'Real WhatsApp and email webhooks were out of scope for a demo, so instead of pretending they exist, there is an honest "simulate a client reply" control, and the README says exactly where a real provider would plug in.'
      }
    ],
    outcome: [
      'The daily loop works end to end: open a thread, reply, triage, and advance the contact down the pipeline, on one record',
      'The inbox and the CRM genuinely share data, a stage change on the contact page shows on the thread, and a reply shows on the pipeline',
      'Seeded with realistic enquiries so the demo behaves like a real morning of client work, not an empty shell'
    ],
    outcomeNote:
      'This shared inbox is a self-initiated working demo, not a client deployment. Inbound channels are simulated, so the counts above describe what was built, not real message volumes. The screenshots are of the running app.'
  },
  {
    index: '05',
    slug: 'lead-research',
    highlights: [
      'Reads structured data, meta tags and contact links',
      'Scores every lead by how reachable it is',
      'Shortlist, filter and export the list to CSV'
    ],
    diagram: 'prospect',
    title: 'Lead Research Tool',
    subtitle: 'Scored leads from any business website',
    tagline: 'Paste a website, get a scored, exportable lead with real contact details.',
    year: '2026',
    summary:
      'A self-built lead-research tool: paste a business website and the tool reads its public pages and pulls the name, contact details, location and socials into one clean, scored, exportable list, for the studio or agency doing its own outreach.',
    metrics: [
      { n: '5', label: 'signals read per page: JSON-LD, OG, email, phone, socials' },
      { n: '0–100', label: 'completeness score, weighted to contact details' },
      { n: '0', label: 'third-party scraping APIs; the extractor is in the repo' },
      { n: 'CSV', label: 'the whole list exports in one click' }
    ],
    role:
      'Self-initiated build: the extractor, the scoring, the workspace, the data model and the CSV export.',
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
      'A studio or agency doing its own outreach doesn’t need a sales platform with a per-seat licence and a CRM bolted on, it needs a short, clean list of businesses it could actually contact. Building that list by hand means opening twenty tabs and copying a name, an email and an Instagram handle off each one. The job here was the smallest honest version of that: paste the URLs, and let the tool do the reading, while being straight about the fact that real web pages are messy and half of them won’t give up an email.',
    system: [
      'A server-side extractor that fetches a page and reads the business behind it in priority order: JSON-LD structured data first, then Open Graph and meta tags, then the page itself for mailto and tel links and social profiles',
      'A completeness score from 0 to 100, weighted toward contact details, so the businesses you can actually reach rise to the top of the list',
      'A workspace that takes a batch of URLs at once, scrapes them with a little concurrency, and drops each result into a filterable, searchable table',
      'A per-lead view showing every extracted field, and marking the ones that were not found as not found, rather than inventing them',
      'A pipeline of its own, new, shortlisted, contacted, archived, plus a one-click CSV export of the whole list',
      'No headless browser and no scraping API: the extractor is about a hundred readable lines built on a lightweight HTML parser'
    ],
    features: [
      {
        title: 'It actually reads the page',
        text: 'Structured data, Open Graph, and the page’s own mailto / tel and social links, parsed into fields server-side, not scraped blindly or run through a paid API.'
      },
      {
        title: 'Scored by what you can act on',
        text: 'Each lead gets a completeness score weighted toward contact details, so a business with an email and a phone outranks one with only a name.'
      },
      {
        title: 'Honest about the gaps',
        text: 'Web pages are inconsistent. A missing email is shown as “Not found”, never guessed, the score simply reflects how much was there.'
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
        text: 'A real Chromium would read JavaScript-rendered sites but cost speed, memory and complexity. A lightweight HTML parser covers most real business pages and keeps the whole tool small, the README names the trade-off.'
      },
      {
        title: 'Record what was found, score the rest',
        text: 'The tool never fabricates a missing field to look complete. Honesty is the feature: a lead you can trust is worth more than a full-looking row you can’t.'
      }
    ],
    outcome: [
      'The extraction is real, pasting a live URL fetches and parses it on the spot, and the seeded rows were extracted from real public pages, with contact emails swapped for placeholders',
      'Leads sort by how reachable they are, so the list is useful the moment it is built',
      'The whole list exports to CSV, which is the actual job of a research tool'
    ],
    outcomeNote:
      'This research tool is a self-initiated working demo, not a client deployment. It reads only public pages and is best pointed at sites that publish structured data; the counts describe what was built. The screenshots are of the running app.'
  }
]

/* The moving "built with" strip: every name here is in a project's
   `stack` above or in proofTools below — nothing the work doesn't use. */
export const stackMarquee = [
  'React',
  'Next.js',
  'TypeScript',
  'Node',
  'PostgreSQL',
  'n8n',
  'Claude',
  'Gemini',
  'Tailwind CSS',
  'Drizzle ORM',
  'Vercel',
  'Cloudflare Workers',
  'Razorpay',
  'Google Calendar',
  'WhatsApp · MSG91',
  'PWA · offline'
]

export const proofTools = [
  {
    name: 'n8n',
    note: 'Where most automations actually run. Self-hosted, so the client owns the workflows.'
  },
  {
    name: 'Claude',
    note: 'For the judgement steps: reading messy input, drafting replies, summarising.'
  },
  {
    name: 'Postgres',
    note: 'The system of record: real relations, constraints and room to grow, not a spreadsheet pretending to be a database.'
  },
  {
    name: 'React & Next.js',
    note: 'The screens people use every day: dashboards, portals, booking flows, server-rendered where the project needs it.'
  },
  {
    name: 'TypeScript',
    note: 'Types across the whole stack, so a change to the data cannot quietly break a screen three files away.'
  },
  {
    name: 'Node & serverless',
    note: 'The backend and APIs on Vercel or Cloudflare Workers, nothing to babysit, and it scales to zero when idle.'
  }
]

/*
  The productized offers, in the order they are meant to be sold: the
  Quick-Win is the entry offer (one workflow, low risk, a fast first yes),
  the Sprint is what a Quick-Win client buys next, and the other two are
  the larger builds. The first entry is the one `site.pricingAnchor` names.

  Prices are per currency. USD is the default for visitors outside India;
  INR is shown to visitors whose browser language or timezone says India,
  or who flip the toggle (src/currency.js). The existing INR bands are
  unchanged from docs/system/02-service-catalog.md.
*/
export const packages = [
  {
    name: 'Automation Quick-Win',
    explainer: null,
    price: {
      usd: '$490',
      inr: '₹25,000' // TODO: placeholder, Aniket to confirm
    },
    timeline: 'Live in 5 days',
    entry: true,
    featured: true,
    forWho: 'One job that eats an hour a day and should just happen on its own.',
    deliverable:
      'One workflow, end to end, on the tools you already use. For example: web form → CRM → instant reply → team alert.',
    includes: [
      'A 15-minute call to pick the workflow',
      'Built, tested and live in 5 days',
      'A short walkthrough so you own it'
    ]
  },
  {
    name: 'Ops Automation Sprint',
    explainer: 'ops-sprint',
    price: { usd: '$1,500 – $2,500', inr: '₹40k – ₹80k' },
    timeline: 'Live in 2 weeks',
    featured: false,
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
    explainer: 'ai-assistant',
    price: { usd: '$2,500 – $4,500', inr: '₹80k – ₹1.5L' },
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
    explainer: 'internal-tool',
    price: { usd: '$4,000 – $8,000', inr: '₹1.5L – ₹3L' },
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
  price: { usd: '$250 – $500 / month', inr: '₹15k – ₹30k / month' },
  blurb:
    'Once a system is live: monitoring, broken automations fixed inside 24 hours, a few hours of improvements each month, and first call on new builds.'
}

/* Budget bands on the contact form, per currency, lined up with the
   offers above. The INR values are the ones the n8n workflow and
   docs/specs/contact-form.md already know; the USD values are new and are
   passed through as-is (the workflow only prints the band). */
export const budgetBands = {
  usd: [
    { value: 'usd:<1.5k', label: 'Under $1,500' },
    { value: 'usd:1.5k-5k', label: '$1,500 – $5,000' },
    { value: 'usd:5k+', label: '$5,000+' },
    { value: 'not_sure', label: 'Not sure yet' }
  ],
  inr: [
    { value: '<50k', label: 'Under ₹50k' },
    { value: '50k-2L', label: '₹50k – ₹2L' },
    { value: '2L+', label: '₹2L+' },
    { value: 'not_sure', label: 'Not sure yet' }
  ]
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

/* An answer may be a string, or { usd, inr } where it quotes a price, so
   it follows the same currency toggle as the price cards. */
export const faq = [
  {
    q: 'How long does a build take?',
    a: 'An Automation Quick-Win is live in 5 days. An Ops Automation Sprint is live in two weeks. Larger systems (a booking platform, a full operations layer for a clinic, studio or agency) run three to five weeks depending on how many people and tools they touch.'
  },
  {
    q: 'What does it cost?',
    a: {
      usd: 'The Quick-Win is a fixed $490 for one workflow, end to end. A Sprint runs $1,500 to $2,500. Anything bigger is quoted once we have mapped the process, because the price depends on how many systems have to talk to each other, not on how many hours it takes me.',
      inr: 'The Quick-Win is a fixed ₹25,000 for one workflow, end to end. A Sprint runs ₹40,000 to ₹80,000. Anything bigger is quoted once we have mapped the process, because the price depends on how many systems have to talk to each other, not on how many hours it takes me.'
    }
  },
  {
    q: 'Do I need to already use a particular tool?',
    a: 'No. I pick the stack to fit the practice, not the other way around. If your team already runs on a calendar, a CRM or Google Sheets that works, I build on top of it rather than charge you to migrate.'
  },
  {
    q: 'What if it isn’t live on the date?',
    a: 'Every build has a fixed price and a live date in writing. Half is paid up front and half on delivery. If it isn’t live by that date, you don’t pay the second half.'
  },
  {
    q: 'Who owns the system afterwards?',
    a: 'You do. Automations run on your accounts, the code sits in your repository, and handover includes a walkthrough so someone on your side can change the obvious things without calling me.'
  },
  {
    q: 'Do you work with clients outside India?',
    a: 'Yes, anywhere. The work is remote either way: a short call to map it, async updates, a live walkthrough at handover. Timezone only changes when the calls happen.'
  },
  {
    q: 'Is client data safe?',
    a: 'Client records stay on your own accounts and servers, and access is checked on the server, not just hidden in the screen. The Therapist PWA on this site keeps its data behind a private service the browser never touches.'
  }
]

export const footerMenu = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'About', to: '/about' },
  { label: 'Get in touch', to: '/contact' },
  { label: 'Privacy', to: '/privacy' }
]

/* Set `href` to go live. Empty entries are skipped, not rendered dead. */
export const social = [
  { label: 'LinkedIn', href: '', icon: 'linkedin' },
  { label: 'X', href: '', icon: 'x' },
  { label: 'GitHub', href: 'https://github.com/Aniket787878', icon: 'github' },
  { label: 'Email', href: '', icon: 'mail' }
]
