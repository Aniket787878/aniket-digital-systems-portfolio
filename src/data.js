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
                 the framing, zoom and captions are added. Since 2026-09-27
                 the film is told like the platform films (Platform-<slug>:
                 title, stage rail, window, sign-off), over real captures.
   - 'schematic' The two client platforms. Their screens hold client
                 records, so the film is a labelled wireframe of the real
                 flow and never presents itself as a recording.
   `clip` is the short silent loop the project cards play on hover.
   `framed` is the same idea framed like the platform films (wordmark,
   step rail, browser window, caption), for the /projects showcase, where
   the demos sit beside the two platforms.
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
    clipPoster: '/videos/posters/consent-signer-clip.jpg',
    framed: '/videos/clips/consent-signer-framed.mp4',
    framedPoster: '/videos/posters/consent-signer-framed.jpg'
  },
  'shared-inbox': {
    kind: 'real',
    src: '/videos/shared-inbox.mp4',
    poster: '/videos/posters/shared-inbox.jpg',
    clip: '/videos/clips/shared-inbox.mp4',
    clipPoster: '/videos/posters/shared-inbox-clip.jpg',
    framed: '/videos/clips/shared-inbox-framed.mp4',
    framedPoster: '/videos/posters/shared-inbox-framed.jpg'
  },
  'lead-research': {
    kind: 'real',
    src: '/videos/lead-research.mp4',
    poster: '/videos/posters/lead-research.jpg',
    clip: '/videos/clips/lead-research.mp4',
    clipPoster: '/videos/posters/lead-research-clip.jpg',
    framed: '/videos/clips/lead-research-framed.mp4',
    framedPoster: '/videos/posters/lead-research-framed.jpg'
  }
}

/* ------------------------------------------------------------------
   STILLS: projects that have real screens but no film yet.

   The three n8n assistants were captured as stills (public/walkthroughs/
   <slug>/, with steps.json) before any film was rendered. Until a film
   exists in `films` above, every place that would play one shows the
   `cover` screen instead, cropped to `focus` (a rect in the 1440x900
   capture space; for the chat demos, the whole chat column, so the
   patient's message is not cut off), with a badge that says what it is; the case study steps
   through every captured screen (src/walkthroughs.js). Never an empty
   player. Once a film is rendered and added to `films`, the film wins
   everywhere and this entry can go.

   What the screens are, stated wherever they appear: n8n's real chat
   screens, with each reply recorded from a real test execution on dummy
   data and replayed for the capture (scripts/capture-demos.mjs checks
   every reply word for word against the test log). Not live traffic, not
   real patients.
   ------------------------------------------------------------------ */
export const stills = {
  'appointment-desk': {
    kind: 'real',
    cover: { file: '/walkthroughs/appointment-desk/03.png', focus: { x: 280, y: 458, w: 880, h: 420 } }
  },
  'knowledge-assistant': {
    kind: 'real',
    cover: { file: '/walkthroughs/knowledge-assistant/02.png', focus: { x: 280, y: 530, w: 880, h: 348 } }
  },
  'website-answer-widget': {
    kind: 'real',
    /* Wider than the step's own focus, so the card shows the clinic's
       headline beside the chat panel: the point is that it sits on a
       website. */
    cover: { file: '/walkthroughs/website-answer-widget/04.png', focus: { x: 260, y: 150, w: 1180, h: 664 } }
  }
}

/* The badge and caption for a still, in one place so every surface says
   the same thing about what the picture is. */
export const stillLabel = {
  badge: 'Real screens · recorded test run',
  caption:
    'Real n8n chat screens from a recorded test run on dummy data: each reply was recorded from a real execution and replayed for the capture. Not live traffic, not real patients.'
}

/* 'real' (a working demo) or 'schematic' (a client platform), from the
   film if there is one, else from the still. */
export const mediaKind = (slug) => films[slug]?.kind || stills[slug]?.kind || ''

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

  /* Positioning, in one place (docs/system/05-icp-positioning.md,
     2026-09-30): three service areas, one system underneath. The website
     brings the work in; the software and the AI run the rest. Buyers are
     still service businesses broadly (clinics, studios, agencies, growing
     teams). The hero, the meta description, the JSON-LD and the OG card
     (scripts/render-og.mjs) all read from here. */
  headline: ['Websites that bring the work in.', 'Software and AI that run the rest.'],
  subtitle:
    'Websites, custom software and AI workflows for clinics, studios, agencies and growing teams. Built as one system, live in weeks.',
  /* The home hero's lede: says what the headline doesn't (who it is for,
     what the system does, how fast), instead of repeating it. */
  heroLede:
    'One system for clinics, studios, agencies and growing teams: the site that brings enquiries in, and the software and AI that answer, book and follow up. Live in weeks.',
  tagline:
    'Websites that bring the work in, and software and AI that run the rest. Built as one system for clinics, studios, agencies and growing teams, live in weeks.',

  /* Shown beside the prices. A promise, so it lives with the data it
     qualifies rather than in a component. */
  guarantee:
    'Fixed price, fixed date. If it isn’t live by the date in writing, you don’t pay the second half.',

  email: 'aniket.html@gmail.com',
  whatsapp: '+91 9136582842', // digits are stripped in whatsapp.js for the wa.me link
  location: 'Based in India · working remotely worldwide',
  availability:
    'Taking on new projects. Next start slot is usually one to two weeks out.',
  /* A template, filled from each area's `from` price in `services`, in
     the visitor's currency, so every starting price is stated once. */
  pricingAnchor: 'Websites from {websites}. AI and automation from {ai}. Custom software from {software}.'
}

/* Title, description and share card for index.html. vite.config.js writes
   these into the <head> at build time, together with site.origin. */
export const seo = {
  title: 'Websites, software and AI for service businesses · Aniket',
  description:
    'Websites that bring the work in, and software and AI that run the rest. Built as one system for clinics, studios, agencies and growing teams, live in weeks.',
  ogTitle: 'Websites that bring the work in. Software and AI that run the rest.',
  ogImage: '/og.png',
  ogImageAlt:
    'Websites that bring the work in. Software and AI that run the rest. Built as one system by Aniket.'
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
  role: 'Websites, software and AI',

  /* One honest paragraph. Asserts only what the case studies, pricing and
     process on the rest of the site already stand behind. */
  intro:
    'The website that brings the enquiry in, the software that holds it and the AI that does the repeat work, built as one system, so the work stops living in WhatsApp threads and spreadsheets. Clinics, studios, agencies, consultancies and growing teams all hit the same shape of problem. You own what ships.',

  /* Aniket's own story — how he got here, what he did before — is his to
     write. Left empty on purpose rather than invented; the About page
     renders a labelled slot when it is blank. */
  story: '',

  /* The About page portrait. To add the real one (a one-line change):
       1. put the file in public/, e.g. public/aniket.jpg (portrait
          orientation, 4:5, at least 960x1200; it is cropped to 4:5 on wide
          screens and to 16:10 from the top on phones, so keep the face in
          the upper third);
       2. set   photo: '/aniket.jpg',
     While this is '' the page shows a dusk monogram card (pages/about/
     Portrait.jsx) that is plainly not a photograph: never a stock face. */
  photo: '',

  basedIn: 'Based in India · working remotely worldwide',

  /* What a buyer actually gets. Each line is already promised elsewhere on
     the site (pricing timelines, FAQ, handover). No solo-vs-agency framing:
     retired 2026-09-27, see docs/system/05-icp-positioning.md. */
  /* The About page stepper: first message to handover. Every line restates
     a promise already made elsewhere (the reply and the call from the
     contact page, proposal and payment terms from the FAQ and pricing,
     timelines from `packages`, handover and the Care Plan from the FAQ and
     `carePlan`). Nothing new is promised here. */
  steps: [
    {
      key: 'enquiry',
      label: 'Enquiry',
      title: 'You tell me which part is breaking',
      text: 'A message on WhatsApp or through the contact form. The one part of the week that eats the most time is enough to start.',
      gets: ['A personal reply within 24 hours', 'A straight answer if it is not a fit, and a pointer somewhere better']
    },
    {
      key: 'call',
      label: 'Call',
      title: 'A 15-minute call',
      text: 'We walk through how the work moves today: who touches it, where it stalls, what it costs you in hours.',
      gets: ['The one process worth automating first', 'What automating it would take, and whether it is worth doing']
    },
    {
      key: 'scope',
      label: 'Scope',
      title: 'Fixed scope, fixed price, a live date',
      text: 'A one-page proposal in writing before anything starts. No hourly billing, no verbal quotes, no scope that quietly grows.',
      gets: ['Half up front, half on delivery', 'Not live by the date in writing? You do not pay the second half']
    },
    {
      key: 'build',
      label: 'Build',
      title: 'Live in weeks, not quarters',
      text: 'Built on the tools you already pay for, with regular updates as it takes shape, so you see it working early and can change course while that is cheap.',
      gets: ['From 5 days for one task to 3 to 4 weeks for an internal tool', 'Automations on your own accounts from day one']
    },
    {
      key: 'handover',
      label: 'Handover',
      title: 'You own the system',
      text: 'Everything is set up in your name and runs on your own accounts. A live walkthrough at handover means your team can change the obvious things without calling me.',
      gets: ['A walkthrough for whoever runs it day to day', 'Optional Care Plan: broken automations fixed inside 24 hours']
    }
  ],

  principles: [
    {
      title: 'Live in weeks, not quarters',
      text: 'Every offer has a timeline in writing, from 5 days for a single task to 3–4 weeks for an internal tool, so you see it working early and can change course while that is cheap.'
    },
    {
      title: 'You own the system',
      text: 'Everything runs on your own accounts and is set up in your name, and handover includes a walkthrough so your team can change the obvious things without me.'
    },
    {
      title: 'Fixed scope, fixed price, a live date',
      text: 'A one-page proposal in writing before anything starts. No hourly billing, no verbal quotes, no scope that quietly grows.'
    },
    {
      title: 'Built on the tools you already pay for',
      text: 'I pick the tools to fit the job, and where your team already uses something that works, I build on it instead of charging you to move.'
    }
  ],

  /* Verified facts only. Anything needing a number Aniket has not supplied
     stays out. (The stack now lives in `toolbox`, below `proofTools`.) */
  quickFacts: [
    { label: 'Based', value: 'India · remote worldwide' },
    { label: 'Focus', value: 'Websites, software, AI and automation' },
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
  hero: 'Hi Aniket, I saw your site. Can we talk about what my business needs?',
  /* The free-call entry point (docs/research/06, gap G5), highest-intent
     top-of-funnel opener, in the buyer's voice. Was "automation audit";
     widened 2026-09-30 when websites and software joined the offer. */
  audit:
    'Hi Aniket, I’d like to book the free 15-minute call. What I need help with is:',
  /* `{offer}` is replaced with the package name by home/Services.jsx. */
  pricing: 'Hi Aniket, I’d like to know more about the {offer} for my business.',
  cta: 'Hi Aniket, I have something I’d like built. Can we talk?',
  contact: 'Hi Aniket, I’d like to talk about a project. Do you have 20 minutes?',
  /* One per service page (`services[].slug`), so the chat says which
     page did the convincing. */
  websites: 'Hi Aniket, I saw your websites page. I’d like a website for my business.',
  software: 'Hi Aniket, I saw your software page. I’d like to talk about a tool for my business.',
  ai: 'Hi Aniket, I saw your AI page. I’d like to talk about using AI in my business.',
  footer: 'Hi Aniket, quick question about the systems you build.',
  nav: 'Hi Aniket, I’m on your site and would like to talk about a project for my business.'
}

export const projects = [
  {
    index: '01',
    slug: 'therapist-pwa',
    highlights: [
      'Session recordings become a draft clinical note shortly after the session',
      'A booking desk linked to Google Calendar and WhatsApp',
      'Consent forms signed online, saved as a PDF and signed by the clinic'
    ],
    diagram: 'platform',
    title: 'Therapist PWA',
    subtitle: 'Clinic operations platform',
    tagline: 'The system an eleven-therapist clinic runs its whole day on: client records, bookings and an AI that writes up session notes.',
    year: '2025–26',
    summary:
      'Three apps working as one for a mental-health clinic with many therapists: the staff app the team runs its day on (tasks, client records, bookings, consent forms), the online forms clients fill in, and a companion app for clients. Each installs like a normal app, sends notifications, and keeps client records on a private server the public can never reach.',
    metrics: [
      { n: '1,200+', label: 'client records managed day to day' },
      { n: '11', label: 'therapists on one system' },
      { n: '3', label: 'apps working together: staff, client forms, client app' },
      { n: '3', label: 'kinds of session booked: in person, phone and online' }
    ],
    role:
      'I designed and built all of it: the staff app, the client app, the private server behind them, who can see what, and every automation.',
    flow: ['Enquire', 'Book', 'See', 'Note', 'Consent', 'Follow up'],
    /* Shown only inside the closed "Technical details" panel at the foot
       of the case study, for developers. Everything above it is written
       for a business owner. */
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
      'A busy clinic was running on a pile of separate tools: a calendar here, a spreadsheet of clients there, session notes typed up from memory after hours, and follow-ups slipping through the cracks. Nothing talked to anything else, so the same client could be double-booked, a note could go missing, and nobody could see the whole picture in one place. The clinic needed one system its whole team runs on, from the first enquiry to the follow-up, without anyone typing the same details five times, and without client records ever sitting somewhere they should not.',
    system: [
      'Three apps working together: the staff app, the online forms clients fill in (enquiry, screening, consent, booking) and a companion app for clients. None of them keep client records on the phone or laptop; those stay on a private server',
      'The standout feature: the therapist records a session and AI writes the draft note. The recording is saved a minute at a time so nothing is lost if the internet drops, the audio is deleted once it is written up, and the therapist checks the draft before it is saved',
      'Safety checks around the AI, because AI can get things wrong without warning: if a write-up repeats itself or does not read as a proper note, it is rejected and the therapist is told, instead of a made-up note slipping through',
      'A booking desk that shows free slots live, handles in-person, phone and online sessions and repeat bookings, and puts each booking on Google Calendar with a Meet link and a WhatsApp confirmation',
      'Around 1,200 client records with their therapist, case notes, an AI summary that updates after every note, and group sessions where one shared note goes into every attendee’s file. Each therapist sees only their own clients',
      'Consent forms signed online and saved as a sealed PDF, emailed and signed by the clinic; tasks with owners and repeats; and desktop notifications so nothing gets missed'
    ],
    features: [
      {
        title: 'Record a session, get a draft note',
        text: 'The therapist records the session and AI writes it up as it goes, with a draft note ready shortly after the session ends. If something looks wrong, it says so instead of inventing a note.'
      },
      {
        title: 'Booking desk',
        text: 'Live free slots, in-person, phone and online sessions, and repeat bookings, each confirmed on Google Calendar, Meet and WhatsApp without anyone typing it in.'
      },
      {
        title: 'Clients, groups and consent',
        text: 'Around 1,200 client records with case notes and an up-to-date AI summary, group sessions with one shared note, and consent forms signed online and returned as a sealed PDF.'
      },
      {
        title: 'Access, tasks and the client app',
        text: 'Each person sees only what their role allows, tasks have owners and reminders, and clients get their own companion app for check-ins, coping tools and crisis help.'
      }
    ],
    decisions: [
      {
        title: 'The AI is checked, never blindly trusted',
        text: 'Both the transcript and the note are checked before anyone sees them. Once the AI tried to write a heart-health report for a patient who did not exist; the checks caught it, and no therapist ever saw it.'
      },
      {
        title: 'The riskiest feature is deliberately not built yet',
        text: 'The client app has no AI chat coach yet, on purpose. A chatbot talking to someone in a moment of crisis needs crisis detection in front of every reply, wording reviewed by a clinician, and a clear answer to who responds when someone reaches out at 2am. Until then, the Help button links to live 24/7 support meetings.'
      },
      {
        title: 'Built to cost almost nothing to run',
        text: 'The whole system fits inside free hosting plans. New features are added to what already exists instead of adding new paid pieces, so the clinic is not paying a monthly bill for its software.'
      },
      {
        title: 'Client records never sit on a phone or laptop',
        text: 'A private server holds the records, sends the emails, makes the PDFs and talks to the AI. The apps people use only ask it for what they are allowed to see, so real client records never sit on someone’s device.'
      },
      {
        title: 'Locks that are real, not hidden buttons',
        text: 'Who can do what (edit a client, run the front desk, read support notes, see every client) is checked by the server every time. Hiding a button is not the lock; the server is.'
      }
    ],
    outcome: [
      'The clinic’s whole day (tasks, clients, bookings, consent and forms) runs from one app instead of a scatter of tools',
      'Around 1,200 client records across 11 therapists, each therapist seeing only their own clients',
      'Writing up a session became checking an AI draft instead of typing it from memory',
      'Two apps, a private server and the automations behind them, looked after as one system'
    ],
    outcomeNote:
      'Client and therapist counts come straight from the live system. The rest describes the change as the clinic sees it: a fair picture, not an audited figure.'
  },
  {
    index: '02',
    slug: 'care-journey',
    highlights: [
      'A ten-step journey from first enquiry to enrolled client',
      'Check-points that pause the course until a real therapy session happens',
      'A privacy wall between family and client, built into the records'
    ],
    diagram: 'journey',
    title: 'Care Journey Platform',
    subtitle: 'Online recovery-care program',
    tagline: 'A 12-week recovery program: an online course, live therapy and an always-on safety net, in one private portal.',
    year: '2026',
    summary:
      'A 12-week online recovery program that does three things at once: a self-paced course that teaches, live one-to-one and group therapy that treats, and a safety net that is always on, all inside a private portal clients sign in to.',
    metrics: [
      { n: '12', label: 'week program, from first form to graduation' },
      { n: '10', label: 'steps in the client journey, each a real screen' },
      { n: '4', label: 'separate views: client, family, therapist and admin' },
      { n: '5', label: 'check-points where the course waits for a therapist' }
    ],
    role:
      'I designed and built all of it: the client journey, the course, all four portals, how the records are kept private, every connection to outside tools, and the hosting.',
    flow: ['Discover', 'Enquire', 'Screen', 'Assess', 'Pay', 'Enrol'],
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
      'Recovery care is not a video course, and it is not only therapy. It is both at once, with a safety net underneath, and the hard part is holding all three together honestly. A course that lets someone race ahead without ever speaking to a therapist is just content; therapy with no structure between sessions loses people in the gaps; and a platform holding this kind of health information cannot let the wrong person see the wrong thing, ever. The job was to build one platform where the course, the live care and the safety net run together, and where the clinical rules are actually enforced, not just printed in a handbook.',
    system: [
      'A ten-step journey from stranger to enrolled client: someone finds the site and fills in a short form, a coordinator books a screening call, the person is assessed and pays, and only then gets their portal login. Every step is a real, working screen with its own admin tools',
      'A course of 12 modules and 48 lessons in four parts (Understand, Regulate, Rebuild, Become), with worksheets instead of marked quizzes. Lessons unlock by doing the work, not by scoring well',
      'Check-points that pause the course until a therapist session has actually happened. The rule is set in one place, so there is no way around it, not even with a copied link',
      'Course videos and audio that only play for enrolled clients who have reached that lesson and passed its check-points',
      'Privacy built into the records themselves: a family member sees how the program is going but never the client’s journal, check-ins or notes, and a worrying journal entry alerts the team without revealing the words',
      'Booking, payment, email and video all connected and tested, running on free plans and one small server to keep costs down'
    ],
    surfaces: [
      {
        role: 'Client',
        title: 'The portal they live in',
        text: 'A calm home, the modules, a private journal, their schedule, one-tap crisis help, and a toolkit rebuilt from their own written work.'
      },
      {
        role: 'Family',
        title: 'A window, not a door',
        text: 'A relative sees the shape of the program and how it is going, never the journal, the check-ins or the notes. The wall is built into the records, not just hidden on screen.'
      },
      {
        role: 'Therapist',
        title: 'Only their own clients',
        text: 'Their own clients and nobody else’s, with mood tracking, notes the client can see and a shared group room.'
      },
      {
        role: 'Admin',
        title: 'The whole operation',
        text: 'New enquiries, the client list, group scheduling, attendance, everyone’s progress at a glance, the check-point queue and a review of safety alerts.'
      }
    ],
    stages: [
      {
        title: 'Understand',
        text: 'The first part: seeing the problem clearly, with the safety net already on.'
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
        text: 'Turning it into something that holds after the program ends.'
      },
      {
        title: 'Get Help: always on',
        text: 'A crisis button on every screen, backed by a clear plan for who responds, running under all four parts from day one.',
        safety: true
      }
    ],
    decisions: [
      {
        title: 'One place for the clinical rules',
        text: 'Every check-point and permission is decided in one place that every screen and every video asks, so there is no back door where a rule quietly does not apply.'
      },
      {
        title: 'Every client record treated as sensitive',
        text: 'This is real health information, so the most private things need a special flag before any clinician can open them, and even then the alert travels without the private words.'
      },
      {
        title: 'Done by hand where the tools cannot be trusted',
        text: 'The video-call tools in use do not reliably report who attended, so attendance is taken by hand and topped up automatically where possible. An honest record beats a number that looks exact and is wrong.'
      },
      {
        title: 'No AI where a template will do',
        text: 'The program builds fourteen documents for each client, such as a six-part relapse-prevention plan and a letter to their future self, but none of them use AI. Each is put together word for word from answers the client already wrote, and the course itself is real clinical content. In recovery care, something you can trust beats something that merely sounds right.'
      },
      {
        title: 'Kept cheap on purpose',
        text: 'Free plans and one small private server, with no expensive setup, because the program does not need the bill.'
      }
    ],
    outcome: [
      'The course, the live care and the safety net run as one program instead of three separate things',
      'The clinical rules are enforced by the system, not left to memory: a locked lesson is locked everywhere',
      'A firm privacy wall between family and client, guaranteed by how the records are stored, not by people being careful',
      'Set up on a test site; not yet in use with clients'
    ],
    outcomeNote:
      'Module, session, step and check-point counts are real counts from the build. Everything else describes how the platform is designed: a fair picture, not a measured result.'
  },
  {
    index: '03',
    slug: 'consent-signer',
    highlights: [
      'Clinic, studio and agency templates, signed on any phone',
      'A digital seal over the wording and every signature',
      'A public page that proves the document has not been changed'
    ],
    diagram: 'signature',
    title: 'Consent & Contract Signer',
    subtitle: 'E-signatures with a full history',
    tagline: 'Signed on any phone, sealed so nobody can quietly change it, and checkable by anyone on a public page.',
    year: '2026',
    summary:
      'A self-built e-signature tool for service businesses: send a consent form or contract, get it signed with a full record of who signed and when, and receive a sealed PDF that shows if anyone has changed it. No expensive subscription, and no login for the person signing.',
    metrics: [
      { n: '3', label: 'ready-to-sign templates: clinic, studio, agency' },
      { n: '0', label: 'accounts the person signing has to create' },
      { n: '5', label: 'steps recorded: created, sent, opened, signed, completed' },
      { n: '1', label: 'public page anyone can use to check a document' }
    ],
    role:
      'A project of my own: the product, the signing, the tamper-proof seal, the signed PDF and the public check.',
    flow: ['Write', 'Send', 'Sign', 'Seal', 'Check'],
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
      'The businesses that most need a signed consent form or contract on file (a clinic taking informed consent, a studio taking a waiver, an agency getting a proposal signed off) are the ones e-signature tools serve worst. The serious products are priced for big companies, make the person signing create an account, and never show what "signed" actually means. I wanted to see how small an honest version could be: send a link, collect a signature with a full history, and hand back a document anyone can check is genuine, without paying another company to do the important part.',
    system: [
      'Start from a ready-made clinic, studio or agency template, or a blank page, and add the people who need to sign. Each gets their own private link, with no account to create',
      'A signing page that works on a phone: the person reads the document, draws or types their signature and agrees, and the time and device are recorded as they do',
      'A digital seal, like a fingerprint of the whole document and every signature, set the moment the last person signs, so the record is locked rather than just saved',
      'A finished PDF with the document, every signature, and a certificate page showing the seal and the full history',
      'A public page that re-checks the seal against the saved document and says plainly whether it still matches: the check itself, not a promise',
      'A history behind all of it: created, sent, opened, signed, completed. Every step is written down before the document changes'
    ],
    features: [
      {
        title: 'Write and send in one step',
        text: 'Pick a template, change the wording, add who needs to sign, and each person gets a private link. No account for them to make.'
      },
      {
        title: 'Sign on any device',
        text: 'Draw a signature on a phone or type it. Agreement is clear and recorded, with the time and device captured at the moment of signing.'
      },
      {
        title: 'A seal, not just storage',
        text: 'The finished document gets a digital fingerprint covering its wording and every signature. Change one character afterwards and it no longer matches, and the check page catches it.'
      },
      {
        title: 'A check anyone can run',
        text: 'A public page re-checks the seal against the saved document and shows genuine or changed. No account needed, no trust required.'
      }
    ],
    decisions: [
      {
        title: 'A seal anyone can check',
        text: 'The seal uses a standard, openly documented method. Anyone can check it for themselves instead of taking a vendor’s word that a document has not been changed.'
      },
      {
        title: 'Starts small, grows without drama',
        text: 'The same setup runs on a laptop for testing and on a hosted service when it goes live, on free plans: the same low-cost approach as the client systems.'
      },
      {
        title: 'No outside service doing the important part',
        text: 'The signing, the seal and the PDF are all built in, not rented from another company. The point was to build the thing itself.'
      },
      {
        title: 'The shortcuts are stated out loud',
        text: 'As a demo, it has no sender logins and shows signing links to copy instead of emailing them. The notes that come with it say so plainly.'
      }
    ],
    outcome: [
      'The whole loop works: write, sign on a phone, seal and check. Shown, not just described',
      'Tampering is caught: changing a sealed document flips the public check from genuine to changed',
      'The first project on this site shown with real screens from the running app rather than a drawing'
    ],
    outcomeNote:
      'This signer is a working demo I built myself, not a client project, so there are no usage numbers: there are no users yet. The counts above describe what was built. The screens are from the running app.'
  },
  {
    index: '04',
    slug: 'shared-inbox',
    highlights: [
      'WhatsApp, email and website enquiries in one shared inbox',
      'Reply, leave a team note or hand it to a colleague in one place',
      'Every conversation linked to where that client is'
    ],
    diagram: 'shared-inbox',
    title: 'Shared Inbox CRM',
    subtitle: 'Every enquiry and every client in one app',
    tagline: 'WhatsApp, email and website enquiries in one shared inbox, linked to where each client is.',
    year: '2026',
    summary:
      'A self-built shared inbox and simple client tracker for service businesses: every enquiry (WhatsApp, email, website form) in one place, linked to a client record that moves from new enquiry to paying client, so a lead stops living on someone’s personal phone.',
    metrics: [
      { n: '3', label: 'channels in one inbox: WhatsApp, email, website' },
      { n: '5', label: 'stages from new enquiry to won or lost' },
      { n: '1', label: 'record for the enquiry and the client, not two' },
      { n: '0', label: 'monthly per-person fees; it is one small app' }
    ],
    role:
      'A project of my own: the inbox, how conversations are sorted and handed out, the client stages, and the sample data.',
    flow: ['Arrive', 'Sort', 'Reply', 'Move on', 'Win'],
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
      'A service business runs on first conversations: a WhatsApp from a referral, an email asking about fees, a website enquiry at midnight. Almost none of these businesses are set up to hold those conversations well. The enquiry lands on someone’s personal phone; the client record, if it exists at all, lives in a separate spreadsheet; and the moment an enquiry becomes a client, the story of how they got there is gone. I wanted to build the smallest honest version of what the big help-desk and sales tools each do half of: one place where the message and the person are the same record, so replying to a client and moving them forward happen in the same step.',
    system: [
      'One shared inbox for WhatsApp, email and website-form conversations, each marked with where it came from so you always know how to reply',
      'Each conversation shows the two things a team needs beside the messages: the client’s details and stage, and private team notes the client never sees',
      'Sorting built for a team: hand a conversation to someone, and mark it open, waiting or closed. Sending a reply marks it waiting on its own',
      'A client tracker built on the same information: every conversation belongs to a client who moves from new enquiry to qualified, active, then won or lost, shown as a board and a per-client history',
      'Quick and dependable: the everyday buttons keep working on a slow phone or a patchy connection',
      'Filled with a believable morning of sample enquiries, and a button that pretends a client replied, so you can see it work without connecting a real WhatsApp account'
    ],
    features: [
      {
        title: 'One inbox, every channel',
        text: 'WhatsApp, email and website messages in one list, filtered by open, unread, waiting and closed, each marked with where it came from.'
      },
      {
        title: 'Reply and note in one place',
        text: 'Answer the client or leave a note only the team can see, with the client and their stage always in view beside the conversation.'
      },
      {
        title: 'Share the work',
        text: 'Hand a conversation to a colleague and mark it open, waiting or closed. Sending a reply updates it automatically.'
      },
      {
        title: 'Client stages built in',
        text: 'A board of every client by stage, and a client page that links their whole conversation history to where they are.'
      }
    ],
    decisions: [
      {
        title: 'The enquiry and the client are one record',
        text: 'Instead of an inbox stuck onto a separate client list, a conversation belongs to a client from the very first message. Replying and moving a client forward happen in the same place, which is the whole reason the tool exists.'
      },
      {
        title: 'Built to work on a poor connection',
        text: 'The everyday buttons (status, hand-off, stage) work like simple forms, so they respond quickly and keep working on a slow phone or patchy internet.'
      },
      {
        title: 'Pretend replies, clearly labelled',
        text: 'Connecting real WhatsApp and email was beyond a demo, so rather than pretend, there is an honest "pretend a client replied" button, and the notes say exactly where a real connection would plug in.'
      }
    ],
    outcome: [
      'The daily routine works end to end: open a conversation, reply, hand it off, and move the client forward, all on one record',
      'The inbox and the client tracker share the same information: a stage change shows on the conversation, and a reply shows on the board',
      'Filled with realistic enquiries so the demo feels like a real morning of client work, not an empty screen'
    ],
    outcomeNote:
      'This shared inbox is a working demo I built myself, not a client project. Incoming messages are simulated, so the counts describe what was built, not real message volumes. The screens are from the running app.'
  },
  {
    index: '05',
    slug: 'lead-research',
    highlights: [
      'Reads a business website and picks out the contact details',
      'Scores every lead by how easy it is to reach',
      'Shortlist, filter and download the list as a spreadsheet'
    ],
    diagram: 'prospect',
    title: 'Lead Research Tool',
    subtitle: 'Scored leads from any business website',
    tagline: 'Paste a website, get a scored lead with real contact details, ready to download.',
    year: '2026',
    summary:
      'A self-built lead-research tool: paste a business website and it reads the public pages and pulls the name, contact details, location and social links into one clean list, scored and ready to download, for a studio or agency doing its own outreach.',
    metrics: [
      { n: '5', label: 'kinds of detail looked for on every website' },
      { n: '0–100', label: 'score, weighted towards ways to contact them' },
      { n: '0', label: 'paid data services; the tool reads the pages itself' },
      { n: '1', label: 'click to download the whole list as a spreadsheet' }
    ],
    role:
      'A project of my own: the part that reads websites, the scoring, the workspace and the download.',
    flow: ['Paste', 'Read', 'Pick out', 'Score', 'Download'],
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
      'A studio or agency doing its own outreach doesn’t need an expensive sales platform charged per person. It needs a short, clean list of businesses it could actually contact. Building that list by hand means opening twenty tabs and copying a name, an email and an Instagram handle off each one. The job here was the smallest honest version of that: paste the websites and let the tool do the reading, while being straight about the fact that real websites are messy and half of them won’t give up an email.',
    system: [
      'A reader that visits each website and picks out the business details in order of reliability: first the details sites publish specially for search engines, then the page’s title and description, then the page itself for email addresses, phone numbers and social links',
      'A score from 0 to 100 that counts contact details most, so the businesses you can actually reach rise to the top',
      'A workspace that takes a batch of websites at once, reads several side by side, and puts each result into a list you can filter and search',
      'A page per lead showing everything found, and marking anything missing as Not found instead of guessing',
      'Its own simple stages (new, shortlisted, contacted, archived), plus one click to download the whole list as a spreadsheet',
      'Small and quick on purpose: no paid data service and no heavy software behind it, just about a hundred lines that read the page'
    ],
    features: [
      {
        title: 'It actually reads the page',
        text: 'The details a site publishes for search engines, its title and description, and the email, phone and social links on the page, picked out one by one: not guessed, and not bought from a paid service.'
      },
      {
        title: 'Scored by what you can act on',
        text: 'Each lead gets a score that counts contact details most, so a business with an email and a phone ranks above one with only a name.'
      },
      {
        title: 'Honest about the gaps',
        text: 'Websites are inconsistent. A missing email is shown as Not found, never guessed; the score simply reflects how much was there.'
      },
      {
        title: 'Filter, shortlist, download',
        text: 'Filter by status or by whether there is an email, search the list, move leads through your own stages, and download everything as a spreadsheet in one click.'
      }
    ],
    decisions: [
      {
        title: 'The most reliable details first',
        text: 'Many sites publish their details in a tidy format for search engines, so those are read first. If they are missing, the tool falls back to the page title and the links on the page. Starting with the best source is what makes the list trustworthy.'
      },
      {
        title: 'Kept light on purpose',
        text: 'Opening every website in a full web browser would catch a few more details, but it would be slower, heavier and cost more to run. A light reader covers most real business websites and keeps the tool small; the notes say what that trades away.'
      },
      {
        title: 'Record what was found, score the rest',
        text: 'The tool never makes up a missing detail to look complete. Honesty is the feature: a lead you can trust is worth more than a full-looking row you can’t.'
      }
    ],
    outcome: [
      'The reading is real: paste a live website and it is read on the spot. The sample leads came from real public websites, with the emails swapped for placeholders',
      'Leads sort by how easy they are to reach, so the list is useful the moment it is built',
      'The whole list downloads as a spreadsheet, which is the real job of a research tool'
    ],
    outcomeNote:
      'This research tool is a working demo I built myself, not a client project. It reads only public pages and works best on sites that publish their details for search engines; the counts describe what was built. The screens are from the running app.'
  },
  /* The three n8n assistants (2026-09-30). Every sentence below comes from
     n8n/demos/<slug>/README.md and test-log.md; nothing is added. They have
     real screens but no film yet, so `stills` above stands in for `films`.
     `credit` names what each one is built on, with its licence: it renders
     on the case study, and it must stay there. */
  {
    index: '06',
    slug: 'appointment-desk',
    highlights: [
      'Answers fees, hours and policies from the clinic’s own FAQ',
      'Checks the calendar and offers free slots',
      'Clinical questions go to a person; emergencies get a fixed safety reply'
    ],
    title: 'Appointment Desk',
    subtitle: 'An AI front desk for a clinic',
    tagline: 'Answers fees and hours, books free slots into the calendar, and hands anything clinical to a person.',
    year: '2026',
    summary:
      'A front-desk assistant for a fictional physiotherapy clinic, built in n8n. Patients message it; it answers fees, hours and policies from the clinic’s FAQ, checks the calendar and offers free slots, and books, moves or cancels appointments. Clinical questions go to a person, and emergency wording gets a fixed safety reply before any AI runs.',
    credit: [
      {
        label: 'n8n template 3694 by Luciano Gutierrez',
        href: 'https://n8n.io/workflows/3694',
        licence: 'MIT licence'
      }
    ],
    metrics: [
      { n: '0', label: 'AI calls when emergency wording is caught: a fixed safety reply goes out instead' },
      { n: '2', label: 'scheduled jobs: 08:00 confirmations on weekdays, 18:30 follow-ups Monday to Saturday' },
      { n: '16', label: 'tests written up in the test log, all passing' }
    ],
    role:
      'A project of my own, started from a published n8n template: the prompts, the safety screen, the booking and handoff logs, the follow-up jobs and the tests.',
    flow: ['Ask', 'Screen', 'Answer', 'Book', 'Follow up'],
    stack: ['n8n', 'n8n Chat', 'Google Gemini', 'Google Calendar', 'Google Sheets'],
    problem:
      'A clinic front desk answers the same few messages again and again: what does it cost, when are you open, is there a slot on Monday. Those are easy to automate. The hard part is everything around them: a patient describing symptoms, someone typing that they have chest pain, a request to move a booking that is not theirs. The job was a front desk assistant that handles the easy messages on its own and is strict about the rest.',
    system: [
      'A safety screen that runs first: if a message contains emergency wording, such as chest pain or trouble breathing, the patient is told to call 112 or go to the nearest emergency department, the team is flagged, and the AI is never called',
      'An AI assistant that answers fees, hours, address, payment and cancellation questions from a short clinic FAQ',
      'Calendar tools to check free slots, book, move and cancel, with a check that the mobile number matches the booking before anything is moved or cancelled',
      'A sheet that logs every booking action for the owner, and a second sheet for every conversation handed to a person',
      'A weekday 08:00 job that asks tomorrow’s patients to reply CONFIRM, RESCHEDULE or CANCEL',
      'A Monday to Saturday 18:30 job that sends a review request after a visit marked as attended, or a friendly invitation to rebook after a missed one'
    ],
    features: [
      {
        title: 'Answers from the clinic’s FAQ',
        text: 'Fees, hours, address, payment and cancellation, in the clinic’s own words. In the test log the fees answer matched the FAQ exactly.'
      },
      {
        title: 'Offers slots and books them',
        text: 'Asked for next Monday morning, it read the calendar and offered 09:00, 09:30 and 10:00. Given a time, a name and a number, it checked the slot, saved the booking to Google Calendar and logged it.'
      },
      {
        title: 'Clinical questions go to a person',
        text: 'Asked what to take for a swollen knee, it declined, logged the question for the team and offered an assessment. Told to ignore its rules, it gave the same answer.'
      },
      {
        title: 'Emergencies get a fixed reply',
        text: 'Emergency wording skips the AI entirely. The reply is written in advance, so it cannot be improvised.'
      }
    ],
    decisions: [
      {
        title: 'Safety before AI',
        text: 'The emergency check is a plain keyword screen that runs before the AI. It is a safety net, not a diagnosis, and the assistant’s own instructions are a second layer behind it.'
      },
      {
        title: 'Keep as little as possible',
        text: 'The template this started from also collected date of birth and health conditions. That was dropped on purpose: only the name, mobile number and appointment are kept.'
      },
      {
        title: 'Say so when it fails',
        text: 'When the calendar refused a booking in testing, the assistant said it could not finish and offered to hand over to the team, instead of claiming the booking was made.'
      },
      {
        title: 'Built on a template, credited',
        text: 'The starting point is n8n template 3694 by Luciano Gutierrez, shared under the MIT licence. The prompts were rewritten for this clinic, and the safety screen, the follow-up job and the logs were added.'
      }
    ],
    outcome: [
      'The fees answer, the slot offer, the clinical refusal and the emergency reply all ran for real: the AI model wrote the answers, the slots came from a real read of the demo calendar, and the emergency reply came from the screen before the AI. The screens show those replies',
      'A booking also went all the way through for real: the slot was checked, the appointment saved to Google Calendar and the log row written. That run used a stand-in calendar where the AI could only see free or busy, and the test booking was deleted afterwards. Moving, cancelling and confirming were tested with simulated calendar responses',
      'The confirmation and follow-up jobs produced the right message for each test appointment. WhatsApp sending is built but switched off for the demo'
    ],
    outcomeNote:
      'This is a working demo on dummy data for a fictional clinic, not a client project, and none of this is client results. The counts describe what was built and tested. It is not a medical device and makes no HIPAA or GDPR claim. The screens are real n8n chat screens from a recorded test run: each reply was recorded from a real execution and replayed for the capture.'
  },
  {
    index: '07',
    slug: 'knowledge-assistant',
    highlights: [
      'Answers from the clinic’s own documents, with the source named',
      'Reads prices from the services table instead of guessing',
      'Says “I don’t know, please ask the front desk.” when the documents do not say'
    ],
    title: 'Practice Knowledge Assistant',
    subtitle: 'Answers from the clinic’s own documents',
    tagline: 'Staff and patients ask in plain English and get an answer from the clinic’s own documents, with the source named.',
    year: '2026',
    summary:
      'An assistant for a fictional physiotherapy clinic, built in n8n, that answers staff and patient questions from the clinic’s own documents and names the source under every answer. Prices come from the services table, not from memory. If the documents do not say, it replies “I don’t know, please ask the front desk.” instead of guessing.',
    credit: [
      {
        label: 'coleam00/ottomator-agents by Cole Medin',
        href: 'https://github.com/coleam00/ottomator-agents',
        licence: 'MIT licence'
      }
    ],
    metrics: [
      { n: '5', label: 'clinic documents: fees, hours, cancellation, consent and privacy, FAQ' },
      { n: '8', label: 'services in the price table it reads prices from' },
      { n: '26', label: 'sections searched, each tagged with the document it came from' }
    ],
    role:
      'A project of my own, started from an open-source template: the clinic documents, the rules it answers by, the price lookup, the read-only database set-up and the tests.',
    flow: ['Ask', 'Search', 'Read prices', 'Answer', 'Name the source'],
    stack: ['n8n', 'n8n Chat', 'Google Gemini', 'Postgres', 'pgvector', 'Supabase'],
    problem:
      'Every clinic has the answers written down somewhere: the fee list, the cancellation policy, the consent form, the FAQ. Staff still get asked the same questions, and a new receptionist has to hunt for the right document. An assistant could answer, but one that guesses is worse than none: a wrong price or a made-up policy costs trust. The job was an assistant that answers only from the clinic’s own documents, says where each answer came from, and admits when it does not know.',
    system: [
      'The clinic’s documents (fee list, opening hours and contact, cancellation policy, consent and privacy policy, FAQ) split into short sections, each tagged with the document it came from, so every answer can name its source',
      'A services table for anything with a price or a length, looked up instead of remembered, and a calculator for totals and discounts',
      'Rules it answers by: name the source under every answer; if the documents do not say, reply exactly “I don’t know, please ask the front desk.”; never read missing information as a no',
      'No clinical advice: questions about symptoms, exercises, medication or diagnosis are pointed to the physiotherapist or the front desk, with the emergency number, and it holds that line when told to ignore its instructions',
      'Two versions in one workflow: a quick in-memory one for demos, and one on a Postgres database where the assistant can only read'
    ],
    features: [
      {
        title: 'Every answer names its source',
        text: 'Asked about cancelling with 12 hours’ notice, it gave the charge and the one-time courtesy waiver, then “Sources: Cancellation Policy”.'
      },
      {
        title: 'Prices from the table, sums done properly',
        text: 'Asked for a pack of five 45-minute sessions, it took ₹900 from the table and the 10% pack discount from the fee list, and answered ₹4,050.'
      },
      {
        title: '“I don’t know” instead of a guess',
        text: 'Asked about acupuncture or the Wi-Fi password, neither in the documents, it said “I don’t know, please ask the front desk.” An early version answered “We do not offer acupuncture”, so a rule was added: missing information is never proof of a no.'
      },
      {
        title: 'Holds the line',
        text: 'Clinical questions are pointed to a physiotherapist. Told to ignore its instructions and delete the price table, it refused.'
      }
    ],
    decisions: [
      {
        title: 'Label every section with its source',
        text: 'Each section starts with its document’s name before it is stored. It is a cheap version of a known retrieval technique, and it is what makes the source line under each answer dependable.'
      },
      {
        title: 'Numbers from a table, not from memory',
        text: 'Prices and session lengths live in a table the assistant looks up, so a price is read, never recalled.'
      },
      {
        title: 'Read-only, and honest about it',
        text: 'On the database version the assistant’s queries run under a role that can only read, and a test write was refused by the database. It is a strong safeguard, not a guarantee, and the notes say what a real deployment adds: a separate read-only login.'
      },
      {
        title: 'Built on open source, credited',
        text: 'The starting point is Cole Medin’s ottomator-agents templates, shared under the MIT licence. The clinic, the rules, the source labels and the calculator were added for this build.'
      }
    ],
    outcome: [
      'Cancellation, opening hours and consent questions were answered from the right document, with the source named',
      'Price questions were read from the table, and the pack total came out right: five sessions at ₹900, less 10%, is ₹4,050',
      'Questions outside the documents, clinical questions and an attempt to make it change the database were all turned away in the recorded tests'
    ],
    outcomeNote:
      'This is a working demo on dummy data for a fictional clinic, not a client project, and none of this is client results. Every document, price and phone number is invented; the counts describe what was built. The rules are instructions to the AI: they held in every recorded test, but instructions are not a guarantee, so a real clinic would add human review. The screens are real n8n chat screens from a recorded test run: each reply was recorded from a real execution and replayed for the capture.'
  },
  {
    index: '08',
    slug: 'website-answer-widget',
    highlights: [
      'A chat bubble on the clinic’s website',
      'Answers from the clinic’s own documents, with the source named',
      'Can’t answer? It takes a name and number for a callback'
    ],
    title: 'Website Answer Widget',
    subtitle: 'Answers on the page, or takes a callback',
    tagline: 'The Knowledge Assistant as a chat bubble on a clinic website. When it cannot answer, it takes a name and number for the front desk.',
    year: '2026',
    summary:
      'The Practice Knowledge Assistant, placed as a small chat bubble on a clinic’s website. A visitor asks about prices, hours or policies and gets the answer from the clinic’s own documents, with the source named. If the documents do not say, it does not guess: it offers a callback card, and the name, number and question land in a sheet for the front desk.',
    credit: [
      {
        label: '@n8n/chat, n8n’s own chat widget',
        href: 'https://www.npmjs.com/package/@n8n/chat',
        licence: 'n8n Sustainable Use License, not MIT'
      },
      {
        label: 'the Practice Knowledge Assistant',
        to: '/projects/knowledge-assistant'
      }
    ],
    metrics: [
      { n: '3', label: 'things the front desk gets from a callback: name, number and the question asked' },
      { n: '1', label: 'sheet where every callback lands, and nowhere else' }
    ],
    role:
      'A project of my own: the demo clinic page, the chat bubble set-up, the callback card and the workflow that files each callback in a sheet.',
    flow: ['Visit', 'Ask', 'Answer', 'Callback', 'Sheet'],
    stack: ['n8n', '@n8n/chat', 'Google Gemini', 'Google Sheets', 'HTML and CSS'],
    problem:
      'A clinic website gets its questions at all hours: how much is a session, are you open on Saturday, do you do home visits. A contact form makes the visitor wait, and an assistant that guesses can give a wrong price. The job was to put the Knowledge Assistant where the questions arrive, and to turn every question it cannot answer into a callback instead of a dead end.',
    system: [
      'A small chat bubble in the corner of the clinic’s page, using n8n’s own chat widget',
      'Behind it, the Practice Knowledge Assistant: answers from the clinic’s documents, prices from its services table, the source named under each answer',
      'A few lines of script that watch for the fixed reply “I don’t know, please ask the front desk.” and show a callback card under it',
      'A workflow that checks each callback (a name, and a phone number long enough to call), removes angle brackets from what was typed, and adds a row to the front desk’s sheet',
      'A demo clinic page to show it in place: plain HTML with one stylesheet and no build step'
    ],
    features: [
      {
        title: 'Answers on the page',
        text: 'Saturday hours and prices come back from the clinic’s documents while the visitor is still on the site, with the source named.'
      },
      {
        title: 'A callback instead of a dead end',
        text: 'When the documents do not say, the visitor is offered a card to leave a name and number, so the question reaches a person.'
      },
      {
        title: 'Lands where the desk can see it',
        text: 'Each callback is a new row in a sheet: the name, the number and the question they asked.'
      },
      {
        title: 'Checks before it saves',
        text: 'A name and a usable phone number are required. A test with code in the name box and a two-digit number was turned away, and nothing reached the sheet.'
      }
    ],
    decisions: [
      {
        title: 'One assistant, two places',
        text: 'The widget has no knowledge of its own. It asks the Practice Knowledge Assistant, so an answer on the website comes from the same documents as the one staff get.'
      },
      {
        title: 'The “I don’t know” reply does a job',
        text: 'Because the assistant’s refusal is one fixed sentence, the page can recognise it reliably and offer the callback card at exactly that moment.'
      },
      {
        title: 'The licence, stated up front',
        text: 'n8n’s chat widget is not MIT. It uses the n8n Sustainable Use License, which limits commercial use, so its terms are checked against your use before it goes on a client’s public site.'
      }
    ],
    outcome: [
      'A callback was saved end to end in a real test: the row reached the demo sheet and the workflow confirmed it',
      'The screens show a whole visit: an answer with its source, a price from the table, a question it could not answer, and the callback card filled in with dummy details',
      'Nothing is public yet: the chat and the callback workflow stay switched off until a clinic’s site is ready for them'
    ],
    outcomeNote:
      'This is a working demo on dummy data for a fictional clinic, not a client project, and none of this is client results. The screens are the real chat widget from a recorded test run: each reply was recorded from a real execution and replayed for the capture, and the callback in the screens was answered locally. A separate real test saved a callback to the sheet.'
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

/* The About page toolbox: the same tools, sorted by what each does for the
   client rather than listed as a tag wall. Notes come from `proofTools`
   where one exists; the rest describe how the projects above use them. */
export const toolbox = [
  {
    key: 'repeat',
    outcome: 'The repeat work happens on its own',
    tools: [
      { name: 'n8n', note: 'The engine that runs your automations in the background. It sits on your own account, so you own it.' },
      { name: 'WhatsApp · MSG91', note: 'Confirmations and reminders arrive where your clients already are.' },
      { name: 'Google Calendar', note: 'Bookings land on the calendar your team already checks, with the Meet link attached.' },
      { name: 'Razorpay', note: 'Payment taken inside the booking flow, so nobody chases it by hand.' }
    ]
  },
  {
    key: 'judgement',
    outcome: 'Messy input gets read for you',
    tools: [
      { name: 'Claude (AI)', note: 'Reads messy messages, drafts replies and writes summaries, with a person checking the ones that matter.' },
      { name: 'Gemini (AI)', note: 'Turns a recorded session into a draft note that the therapist checks before it is saved.' }
    ]
  },
  {
    key: 'screens',
    outcome: 'Your team gets screens that fit the work',
    tools: [
      { name: 'Websites and web apps', note: 'The screens your team and clients use every day: dashboards, client portals and booking pages.' },
      { name: 'Installable apps', note: 'Adds to a phone or computer like any app, with notifications, and no app store needed.' }
    ]
  },
  {
    key: 'record',
    outcome: 'One record you can trust, always up',
    tools: [
      { name: 'Your own database', note: 'Every client, booking and payment kept in one place you own, instead of a spreadsheet that breaks.' },
      { name: 'Built-in checks', note: 'The system checks its own work, so fixing one thing cannot quietly break another.' },
      { name: 'Hosting that runs itself', note: 'Nothing to maintain or restart. It stays up, and costs next to nothing when it is quiet.' }
    ]
  }
]

/*
  The productized offers, grouped by service area (`lane` matches a
  `services[].slug`). Within an area they are in the order they are meant
  to be sold: the cheapest first yes leads, the larger builds follow.
  Each service page shows its own area; the About page's timeline chart
  shows the ones marked `timeline: true`.

  Prices are per currency. USD is the default for visitors outside India;
  INR is shown to visitors whose browser language or timezone says India,
  or who flip the toggle (src/currency.js). The automation, assistant and
  internal-tool INR bands are unchanged from
  docs/system/02-service-catalog.md. The website, website + AI and roadmap
  prices were added 2026-09-30 as placeholders Aniket agreed to start from;
  they are marked TODO until he confirms them.
*/
export const packages = [
  {
    lane: 'websites',
    name: 'Business Website',
    explainer: null,
    price: {
      usd: 'From $1,200', // proposed 2026-10-01, Aniket to confirm
      inr: 'From ₹25,000' // TODO: placeholder, Aniket to confirm
    },
    timeline: 'Live in 2 weeks',
    timelineChart: true,
    featured: true,
    forWho: 'No website yet, or one that looks dated and never brings in an enquiry.',
    deliverable:
      'A fast, clear website on your own domain, with every enquiry landing straight in your inbox and on WhatsApp.',
    includes: [
      'Up to 5 pages, planned with you on a short call',
      'Built for phones first, and set up for Google search',
      'Enquiry form and WhatsApp button wired to your team'
    ]
  },
  {
    lane: 'websites',
    name: 'Website + AI Assistant',
    explainer: 'ai-assistant',
    price: {
      usd: 'From $2,400', // proposed 2026-10-01, Aniket to confirm
      inr: 'From ₹60,000' // TODO: placeholder, Aniket to confirm
    },
    timeline: 'Live in 3 weeks',
    featured: false,
    forWho: 'Visitors asking the same questions at all hours, and enquiries going cold before anyone replies.',
    deliverable:
      'Everything in the Business Website, plus an assistant on the site that answers from your own information and hands ready buyers to you.',
    includes: [
      'Answers from your own services, prices and policies',
      'Hands over on WhatsApp or email, with a short summary',
      'Every conversation saved, so you can read what it said'
    ]
  },
  {
    lane: 'software',
    name: 'Internal Tool / Dashboard',
    explainer: 'internal-tool',
    price: { usd: '$4,000 – $8,000', inr: '₹1.5L – ₹3L' },
    timeline: 'Live in 3–4 weeks',
    timelineChart: true,
    featured: true,
    forWho: 'Running the business from a spreadsheet nobody fully trusts.',
    deliverable:
      'A simple web app that replaces the spreadsheet, easy enough that nobody needs training.',
    includes: [
      'A dashboard of what your team is working on',
      'A portal for tasks and who can see what',
      'A booking system for rooms, staff or equipment'
    ]
  },
  {
    lane: 'software',
    name: 'Custom Platform',
    explainer: null,
    /* Not a range: the FAQ already says anything this size is quoted
       once the process is mapped, and this card says the same. */
    price: 'Quoted after a call',
    timeline: 'Live in 3–5 weeks',
    featured: false,
    forWho: 'A whole operation to run in one place: clients, bookings, payments, records and the team.',
    deliverable:
      'A complete system with separate views for your team, your clients and you, the kind the clinic on this site runs its day on.',
    includes: [
      'Client and staff apps that install like normal apps',
      'Bookings, payments and signed forms in one flow',
      'Each person sees only what they are allowed to'
    ]
  },
  {
    lane: 'ai',
    name: 'AI Roadmap Session',
    explainer: null,
    price: {
      usd: '$490', // proposed 2026-10-01, Aniket to confirm
      inr: '₹15,000' // TODO: placeholder, Aniket to confirm
    },
    timeline: 'Ready in 1 week',
    featured: false,
    forWho: 'You know AI could save your team time, but not where to start or what is worth paying for.',
    deliverable:
      'A working session on how your week really runs, then a short written plan of where AI and automation would pay off first.',
    includes: [
      'A 60-minute session with you and your team',
      'Every idea ranked by time saved against cost',
      'A fixed quote for the first build, with this fee taken off it'
    ]
  },
  {
    lane: 'ai',
    name: 'Automation Quick-Win',
    explainer: null,
    price: {
      usd: '$690', // proposed 2026-10-01, Aniket to confirm
      inr: '₹25,000' // TODO: placeholder, Aniket to confirm
    },
    timeline: 'Live in 5 days',
    timelineChart: true,
    featured: true,
    forWho: 'One job that eats an hour a day and should just happen on its own.',
    deliverable:
      'One task that runs by itself, on the tools you already use. For example: someone fills in your website form, gets an instant reply, and your team gets a message.',
    includes: [
      'A 15-minute call to pick the task',
      'Built, tested and live in 5 days',
      'A short walkthrough so you own it'
    ]
  },
  {
    lane: 'ai',
    name: 'Ops Automation Sprint',
    explainer: 'ops-sprint',
    price: { usd: '$1,900 – $3,200', inr: '₹40k – ₹80k' },
    timeline: 'Live in 2 weeks',
    featured: false,
    forWho: 'Too much time spent copying details, chasing forms and following up.',
    deliverable:
      '3 to 5 jobs set to run on their own, connecting the tools you already pay for, and handed over to you.',
    includes: [
      'New enquiry saved, answered and passed to your team',
      'Consent form signed, saved as a PDF and sent on WhatsApp',
      'Booking added to the calendar, with a reminder and a follow-up'
    ]
  },
  {
    lane: 'ai',
    name: 'AI Assistant Build',
    explainer: 'ai-assistant',
    price: { usd: '$2,900 – $4,900', inr: '₹80k – ₹1.5L' },
    timeline: 'Live in 3 weeks',
    timelineChart: true,
    featured: false,
    forWho: 'A team answering the same questions and lookups over and over.',
    deliverable:
      'An AI assistant that knows your own documents and answers, on WhatsApp, Slack or a simple web page.',
    includes: [
      'An assistant for new client questions',
      'An assistant that answers staff from your own rules',
      'An assistant that drafts quotes'
    ]
  }
]

/* The retainer layer. Offered after a build ships, never instead of one. */
export const carePlan = {
  name: 'Care Plan',
  price: { usd: '$250 – $500 / month', inr: '₹15k – ₹30k / month' },
  blurb:
    'Once a system is live: I keep an eye on it, fix anything that breaks within 24 hours, spend a few hours a month improving it, and you get first call on new builds.'
}

/*
  The three service areas, each with its own page (/websites, /software,
  /ai, rendered by pages/ServicePage.jsx) and a door on the home page's
  Services band. Positioning: docs/system/05-icp-positioning.md
  (2026-09-30). One site, three doors: outreach links point straight at
  an area's page, so a buyer for one never has to wade through the others,
  while the proof that crosses all three stays in one place.

  `proof` lists what backs each area, most convincing first. A string is a
  project slug (its card links to the case study); an object is proof that
  is not a project (`this-site`, `intake`), rendered by the service page.
  `note` replaces the project tagline with the part that matters here.
  Never list a demo as client work: the badge on every card says which.
*/
export const services = [
  {
    slug: 'websites',
    path: '/websites',
    name: 'Websites',
    /* The contact form's "What do you need?" option, and the example
       in its message box when this option is picked. */
    formLabel: 'A website',
    example: 'For example: we have no proper website, and people ask for our prices and timings on WhatsApp all day.',
    icon: 'globe',
    docTitle: 'Websites · Aniket',
    title: ['Websites that bring the work in.', 'And answer it the moment it lands.'],
    sub: 'A fast, clear site for your business, with the enquiry form, booking and WhatsApp wired straight into how you already work. Add an AI assistant and it answers questions at midnight too.',
    promise: 'A fast site that turns visitors into enquiries, wired into your inbox, calendar and WhatsApp.',
    points: [
      { icon: 'globe', title: 'Built for phones first', text: 'Most of your visitors arrive on a phone. The site is designed there first, and loads fast on a weak connection.' },
      { icon: 'inbox', title: 'Every enquiry lands', text: 'The form and the WhatsApp button reach your team straight away, and the visitor gets a reply at once.' },
      { icon: 'spark', title: 'An assistant, if you want one', text: 'Answers the common questions from your own information, then hands ready buyers to you.' }
    ],
    from: { usd: '$1,200', inr: '₹25,000' },
    media: { kind: 'image', src: '/this-site.jpg', badge: 'This site · real screens', alt: 'The home page of this website: a dusk sky over mountain ridges, with the headline and the call buttons' },
    proofHead: ['The proof is the page you are on.', 'Built, hosted and wired up by me.'],
    proof: [
      {
        key: 'this-site',
        title: 'This website',
        subtitle: 'Designed and built end to end',
        note: 'The pages, the films and the form. Every enquiry is saved to a sheet, I get an alert, you get a reply straight away, and anything unanswered after a day comes back to me the next morning.',
        image: '/this-site.jpg',
        badge: 'Real screens',
        to: '/contact',
        cta: 'Try the form'
      },
      {
        slug: 'care-journey',
        note: 'A public site that takes a visitor from first enquiry through screening and payment to a private portal, in one flow.'
      },
      {
        slug: 'website-answer-widget',
        note: 'A chat bubble for a clinic site: it answers from the clinic’s own documents, and when it cannot, it takes a name and number for a callback.'
      }
    ],
    faq: [
      {
        q: 'Who owns the website and the domain?',
        a: 'You do. The domain, the hosting and the enquiry inbox are set up in your name, on your own accounts, and handover includes a walkthrough so you are never locked in.'
      },
      {
        q: 'Can it take bookings and payments?',
        a: 'Yes. Bookings can land on the calendar your team already checks, and payment can be taken in the same flow, the way the Care Journey Platform on this site takes it.'
      },
      {
        q: 'What does the AI assistant actually do?',
        a: 'It answers from the information you give it: your services, prices, hours and policies. When a question needs a person, or someone is ready to book, it hands over to you on WhatsApp or email with a short summary. You can read every conversation it has.'
      },
      {
        q: 'I already have a website. Can you fix it instead?',
        a: 'Often, yes. If the site itself is fine and the problem is that enquiries go nowhere, wiring the form into your inbox and WhatsApp may be all it needs, and that is an Automation Quick-Win, not a new website.'
      }
    ]
  },
  {
    slug: 'software',
    path: '/software',
    name: 'Software',
    formLabel: 'Software or an app',
    example: 'For example: we keep clients and bookings in three spreadsheets, and nobody trusts any of them.',
    icon: 'code',
    docTitle: 'Custom software · Aniket',
    title: ['Software built around how you work.', 'Not the other way round.'],
    sub: 'Internal tools, client portals and complete platforms that replace the spreadsheet and the WhatsApp threads. One system your team actually opens every morning.',
    promise: 'Dashboards, portals and platforms that replace the spreadsheet nobody trusts.',
    points: [
      { icon: 'layers', title: 'Screens that fit the work', text: 'Built around how your team already works, so nobody needs training to use it.' },
      { icon: 'lock', title: 'Each person sees their part', text: 'Clients, staff and managers each get their own view, and the lock is real, not a hidden button.' },
      { icon: 'database', title: 'One record you own', text: 'Every client, booking and payment in one place, on your own accounts.' }
    ],
    from: { usd: '$4,000', inr: '₹1.5L' },
    media: { kind: 'clip', slug: 'shared-inbox', badge: 'Real screens' },
    proofHead: ['Two platforms in real use.', 'Three working tools, running now.'],
    proof: ['therapist-pwa', 'care-journey', 'consent-signer', 'shared-inbox', 'lead-research'],
    faq: [
      {
        q: 'Why not just buy an off-the-shelf tool?',
        a: 'Often you should, and I will say so on the call. Custom makes sense when the tool you would buy makes your team work around it, charges per person for features you never use, or cannot keep private records private.'
      },
      {
        q: 'Who owns the code and the data?',
        a: 'You do. Everything runs on your own accounts and is set up in your name, and handover includes a walkthrough so your team can change the obvious things without calling me.'
      },
      {
        q: 'Does it work on phones?',
        a: 'Yes. The clinic system on this site installs on a phone or a computer like a normal app, with notifications, and no app store.'
      },
      {
        q: 'Can it connect to the tools we already use?',
        a: 'Yes. Calendars, WhatsApp, payments, email and spreadsheets are the usual ones, and where your team already uses something that works, I build on it instead of charging you to move.'
      }
    ]
  },
  {
    slug: 'ai',
    path: '/ai',
    name: 'AI',
    formLabel: 'AI or automation',
    example: 'For example: we answer the same booking questions on WhatsApp all day, then copy every booking into a spreadsheet by hand.',
    icon: 'spark',
    docTitle: 'AI and automation · Aniket',
    title: ['AI that does the repeat work.', 'With a person checking what matters.'],
    sub: 'Enquiries answered, notes drafted, follow-ups sent and leads sorted, on the tools you already use. Start with a plan of where AI pays off, or with one task fully automated in five days.',
    promise: 'Assistants and automations that answer, draft and follow up, on the tools you already pay for.',
    points: [
      { icon: 'chart', title: 'Start with a plan', text: 'Where AI would save your team the most time, ranked, before you spend on a build.' },
      { icon: 'flow', title: 'The repeat work runs itself', text: 'Enquiries saved and answered, reminders sent, forms filed, on your own accounts.' },
      { icon: 'check', title: 'A person checks what matters', text: 'The AI drafts, a person approves wherever a wrong answer would cost you.' }
    ],
    from: { usd: '$490', inr: '₹15,000' },
    media: { kind: 'explainer', key: 'ai-assistant', badge: 'Illustrated' },
    proofHead: ['AI already at work.', 'In a clinic, on this site, and in three demos.'],
    proof: [
      {
        slug: 'therapist-pwa',
        note: 'A recorded session becomes a draft clinical note shortly after it ends. The therapist reads and approves it before anything is saved.'
      },
      {
        slug: 'appointment-desk',
        note: 'Answers fees and hours, books free slots into the calendar, and hands clinical questions to a person. Emergency wording gets a fixed safety reply before any AI runs.'
      },
      {
        slug: 'knowledge-assistant',
        note: 'Answers staff and patients from the clinic’s own documents with the source named, and says “I don’t know, please ask the front desk.” rather than guess.'
      },
      'website-answer-widget',
      {
        key: 'intake',
        title: 'The form on this site',
        subtitle: 'An automation running right now',
        note: 'Send a message and watch it work: it is saved to a sheet, I get an alert, you get a reply straight away, and if I have not answered within a day it comes back to me the next morning.',
        image: '/this-site-form.jpg',
        badge: 'Real screens',
        to: '/contact',
        cta: 'Try it'
      },
      {
        slug: 'care-journey',
        note: 'Booking, payment, email and video connected into one ten-step journey, and fourteen documents built for each client from their own answers, with no AI wherever a template does the job better.'
      }
    ],
    faq: [
      {
        q: 'Will the AI make things up?',
        a: 'It answers from the information you give it, and wherever a wrong answer would cost you, a person checks it first. In the clinic system the AI drafts the session note, and the therapist approves it before it is saved.'
      },
      {
        q: 'Which AI do you use?',
        a: 'Whichever fits the job: Claude for reading messy messages and drafting replies, Gemini for turning a recorded session into a draft note. Where a simple template does the job, there is no AI at all.'
      },
      {
        q: 'What happens in the AI Roadmap Session?',
        a: 'We walk through how your week really runs, then you get a short written plan: where AI and automation would save the most time, ranked by payoff against cost, and a fixed quote for the first build if you want one.'
      },
      {
        q: 'Do we need to change the tools we use?',
        a: 'No. The automations run on the tools you already pay for, on your own accounts, so you own them.'
      }
    ]
  }
]

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
    text: 'Plan how it should work, then build the screens and connect your tools.'
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
    a: 'A website is live in about two weeks, or three with an AI assistant built in. One task fully automated is live in 5 days, and a set of automations in two weeks. An internal tool takes three to four weeks, and larger systems (a booking platform, a full operations layer for a clinic, studio or agency) run three to five weeks depending on how many people and tools they touch.'
  },
  {
    q: 'What does it cost?',
    a: {
      usd: 'Websites start at $1,200, or $2,400 with an AI assistant built in. One task fully automated is a fixed $690, and an AI Roadmap Session is $490, taken off your first build if you go ahead. An internal tool runs $4,000 to $8,000. Anything bigger is quoted once we have mapped the process, because the price depends on how many systems have to talk to each other, not on how many hours it takes me. Every price is fixed before work starts: half to begin, half when it goes live.',
      inr: 'Websites start at ₹25,000, or ₹60,000 with an AI assistant built in. One task fully automated is a fixed ₹25,000, and an AI Roadmap Session is ₹15,000, taken off your first build if you go ahead. An internal tool runs ₹1.5L to ₹3L. Anything bigger is quoted once we have mapped the process, because the price depends on how many systems have to talk to each other, not on how many hours it takes me. Every price is fixed before work starts: half to begin, half when it goes live.'
    }
  },
  {
    q: 'Do I have to pick one of the three?',
    a: 'No. Most projects start in one and grow into the others: the website brings the enquiry in, the software keeps track of it, and the automations do the repeat work around it. Tell me what is going wrong and I will say which part to start with.'
  },
  {
    q: 'Do I need to already use a particular tool?',
    a: 'No. I pick the tools to fit your business, not the other way around. If your team already runs on a calendar, a CRM or Google Sheets that works, I build on top of it rather than charge you to move.'
  },
  {
    q: 'What if it isn’t live on the date?',
    a: 'Every build has a fixed price and a live date in writing. Half is paid up front and half on delivery. If it isn’t live by that date, you don’t pay the second half.'
  },
  {
    q: 'Who owns the system afterwards?',
    a: 'You do. Everything runs on your own accounts and is set up in your name, and handover includes a walkthrough so someone on your side can change the obvious things without calling me.'
  },
  {
    q: 'Do you work with clients outside India?',
    a: 'Yes, anywhere. The work is remote either way: a short call to map it, written updates as it takes shape, a live walkthrough at handover. Timezone only changes when the calls happen.'
  },
  {
    q: 'Is client data safe?',
    a: 'Client records stay on your own accounts, and each person only sees what they are allowed to see: the lock is real, not just a hidden button. The clinic system on this site keeps its client records on a private server the public can never reach.'
  }
]

export const footerMenu = [
  { label: 'Home', to: '/' },
  { label: 'Websites', to: '/websites' },
  { label: 'Software', to: '/software' },
  { label: 'AI', to: '/ai' },
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
