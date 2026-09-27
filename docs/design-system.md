# Design system: "Dusk"

Adopted 2026-09-27. Derived from getstage.co, the reference Aniket approved
twice (PRs #14, #15), rebuilt in his own saffron (bhagwa) brand instead of
Stage's lavender. Shared by the site (`src/`) and the films (`remotion/`),
so a video and the page it sits on read as one product.

## Principles

1. **Two grounds.** A dark dusk ground for the cinematic moments (hero, work,
   closing CTA, footer) and a warm light ground for the explaining (how I
   work, services, process, FAQ). The switch itself is part of the rhythm.
2. **One family, light weights.** Inter only. Headings at 500, never bold;
   tight tracking does the work. Big type is calm, not loud.
3. **Saffron is punctuation.** Buttons, the active step, a tick, a wire. Never
   a full-bleed fill behind copy.
4. **Proof is the picture.** Real product films and schematics carry the
   visual weight; decoration only frames them.
5. **Motion explains.** Every animation shows a mechanism (a wire drawing,
   a step advancing, a count rising) or sets a scene (the dusk parallax).
   Nothing moves just to move. All of it respects reduced motion.
6. **No em dashes** in any visible copy. Use a colon, a comma or a full stop.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--night` | `#0b0b0c` | dark ground |
| `--night-2` | `#141416` | dark surfaces |
| `--paper` | `#f5f3ef` | light ground (warm off-white) |
| `--paper-2` | `#ebe7e1` | light surfaces, panels |
| `--ink-dark` | `#161412` | text on paper |
| `--muted-dark` | `#6d6862` | secondary text on paper |
| `--ink` | `#f2f0ed` | text on night |
| `--muted` | `#9a958f` | secondary text on night |
| `--accent` | `#f5871e` | saffron |
| `--accent-deep` | `#b8560a` | saffron text on paper (4.7:1) |
| `--peach` | `#ffc89a` | tinted second headline line on night |
| `--accent-tint` | `#fbe6d2` | saffron panels on paper |
| Dusk gradient | `#0b0b0c → #1d1109 → #5a2a0c → #c8661c → #f7a55a` | hero sky, top to horizon |

Type scale (Inter): display 72/1.0/-0.05em/500 · h2 48/1.05/-0.045em/500 ·
h3 24/1.2/-0.03em/500 · body 17/1.6 · small 14 · label 13/500.

Radii: 999 (pills) · 24 (panels) · 16 (cards) · 12 (media).

## Components

- **Floating pill nav**: dark, centred, logo mark, links, saffron "Let's talk".
- **Pill label**: icon + word, tinted background, above every section heading.
- **Tick list**: saffron filled circle with a white check.
- **Panel**: a soft saffron-tinted rounded field with a white (or night) card
  floating on it, holding a film, a schematic or a flow.
- **Step list**: numbered steps; the active one is filled saffron, with a
  progress line down the side.

## Motion

- Ease: `cubic-bezier(0.22, 1, 0.36, 1)`; durations 0.6 to 0.9s.
- Hero: words blur-in with stagger; three mountain layers parallax on scroll;
  the product card rises and the front ridge overlaps it.
- Statement: words brighten from 20% to 100% as they scroll past.
- Process: sticky; the active step follows scroll position.
- Flow: wires draw (stroke-dashoffset) and pulses travel along them.
- Numbers count up once in view.
