# Stage launch films: brief (2 Oct 2026)

Aniket asked to remake **every video on the site** in the style of startup launch
videos (the references are the galleries at whatships.com and
skillry.dev/ai-videos), matching the site's dark "Stage" look. The current films
use the old Dusk look: brown hills, a left-hand step list and cream explainer
cards. They read as a different brand from the site.

## The look (shared by every film)

Ground and light
- **Ground:** `#0b0b0c`, with a faint dot grid. Dots are 1.5 px, every 28 px, at `rgba(255,255,255,0.05)`.
- **Glow:** one soft saffron glow (`#f5871e`, about 18% opacity, large radius) that drifts slowly. It follows the subject, never a fixed corner.
- **Nothing cream or paper-coloured, ever.** No Dusk hills and no brown ridge silhouettes.

Type
- **Headings:** Inter 600, tight tracking (-0.03em), off-white `#f2f0ed`.
- **One serif word per heading:** **Instrument Serif italic**, peach `#ffc89a`, as on the site ("run the *rest.*").
- **Labels:** mono (ui-monospace / SF Mono), 0.08em tracking, muted `#9a958f`.

Screens and colour
- **Screens:** real captures in a dark glass window. Radius 18 px. A 1 px border at `rgba(255,255,255,0.13)`. Inner background `#111111`. A soft saffron rim light on one edge.
  - It may enter tilted (rotateX about 18°, out of focus) and settle flat.
  - The camera then pushes in to the region that matters.
- **Accent:** saffron `#f5871e` for the pointer ring, step counter, wires, chips' live dot and the end-card button. The button text is `#1a0900`.

Launch-video grammar (what makes the references feel like launches, not tutorials)
- **Kinetic type beats:** one short line of 2–6 words fills the frame for 1–1.5 s, then cuts. Use it to open and between acts.
- **Fast, confident cuts:** 0.4–0.6 s ease-in-out moves. Never a slow fade between every step.
- **Real UI floats in 3D:** glass panels at slight angles, a gentle parallax push-in, and depth of field on the panels behind.
- **Numbers that count up**, where there is a true number (e.g. "1,200+ client records", "11 therapists").
- **"What it did" chips:** small glass pills with a saffron live dot, joined by a thin saffron wire, sliding in beside the screen when the product really did that step.
- **The story shape is the site's story loop:** stakes → question → headfake → rehook. The end card has the serif-word heading, the saffron button and the wordmark "Aniket.".
- **A fixed mono tag on every frame**, saying exactly what it is:
  - "Working demo · real screens";
  - "Schematic · client data never shown";
  - "Recorded test run · dummy data";
  - "Illustration".
  Same honesty rules as now.
- Silent site loops; no voice-over. Captions are plain words: no em dashes, no tool or tech names (no "n8n", "PWA", "React"), and "Clinic Staff App", not "Therapist PWA".

Motion feel: think a calm Linear or Vercel launch, not a hype reel. Springy but settled, no shaking or glitch effects. 30 fps.

## What gets remade (same compositions, same output files, so the site code doesn't change)
- **Real-capture demos:** `consent-signer`, `shared-inbox`, `lead-research`. Each needs its film (`Platform-<slug>`), card loop (`Clip-<slug>`), framed loop and posters.
- **Client platform schematics:** `therapist-pwa` ("Clinic Staff App") and `care-journey`. Film plus poster.
- **The home "Watch a build · 1 minute" reel** (`HeroReel`).
- **The five explainers:** `Explainer-brand` (16:9 and vertical), `Explainer-ops-sprint`, `Explainer-ai-assistant` and `Explainer-internal-tool`. The cream flowchart look goes; same story, Stage look.

The output paths and lengths stay close to today's, so `data.js` and the players need no changes.
