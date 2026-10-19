# Product films and film sound

Moved verbatim from CLAUDE.md. Read before rendering or changing any film. Remotion rules: `remotion/CLAUDE.md`.

**Product films.** Every video on the site is rendered from `remotion/` by
`bash scripts/render-videos.sh [slug|hero]` into `public/videos/` (films,
`clips/` loops, `posters/`). The three working demos are **real captures**:
PNGs of the running apps plus a `steps.json` (caption, clicked element,
zoom region) in `public/walkthroughs/<slug>/`; the film only adds camera,
pointer and captions. The two client platforms are **schematics** —
wireframes of the real flow in `remotion/stage/schematics.jsx`, labelled as
such on every frame, on the card and in the caption, because their real
screens hold client records. Never swap one kind for the other without
changing the label (`films[slug].kind` in `data.js`). The explainer films
(`remotion/explainers/`, target `explainers`) are illustrative motion design
that quotes the real captures; the site shows them only while
`explainersReady` in `data.js` is true, so an unrendered film never ships as
an empty player. Remotion is a dev
dependency only; nothing from it ships in the site bundle. Renders need a
scale giving even pixel sizes (H.264), hence 0.8 for the card loops.

**Film sound: muted everywhere inline, a tap-to-unmute toggle in the pop-up,
since case-film-sound (2026-10-09).** Every film plays muted and looping on
the page itself — the case-study film, the home/about loops — because that is
what lets it autoplay; clicking or tapping it opens the film in the lightbox
(`VideoDialog`). The pop-up also opens muted every time, with a "Sound off" /
"Sound on" toggle in its top bar next to Close — but only for a film whose
`films[slug].sound` or `explainers[key].sound` is `true` in `data.js`, and
only once that film's mp4 actually carries an audio track. A film with no
`sound` flag shows no toggle and stays silent, same as before. Music is
always generated in code, never downloaded or copyrighted, and **any change
to a film's music or the sound flag needs Aniket's approval of a sample
first**. The audio tooling stays in the repo for that: the score
`remotion/audio/score-<film>.mp3` from `python3 scripts/make-music.py` (voice
over a music bed generated in code), effects from `python3 scripts/make-sfx.py`
-> `remotion/sfx/*.wav` placed by `remotion/sound.jsx` (`cue()`,
`<Soundtrack>`), the `master()` step (-14 LUFS, 128 kb/s AAC) and
`python3 scripts/measure-audio.py`. Do not delete them.
After any re-render, bump `FILM_V` in `data.js` so browsers fetch the new files.
