# CLAUDE.md: Motion graphics and video (Remotion)

Applies to everything under `remotion/`. Keep it short; the agent reads it every session.
The render pipeline (`scripts/render-videos.sh`, `public/videos/`) is described in the root CLAUDE.md under "Product films".

## Models (set per session or per subagent)
- Main session: Sonnet 5.5, Medium effort. Writes scenes, animation and audio code.
- Raise to High or use Opus 5.5 only for: storyboard and shot list, complex timing or choreography, syncing animation to audio beats, and the final review of a finished cut.
- Haiku 4.5 subagents: ffmpeg commands, file conversion, trimming, batch renders, reading render logs, asset resizing.
- Escalate one tier only after a failed attempt.

## Workflow (always in this order)
1. BRIEF: restate audience, length, goal and tone in 3 lines. Ask only what blocks the work.
2. SHOT LIST: table of scene, start frame, end frame, on-screen text, motion, sound. STOP and wait for my approval before writing any code.
3. BUILD: one scene per component. Define a beat sheet of named frame constants at the top (e.g. TITLE_IN = 0, FEATURE_1_IN = 90). Never scatter magic frame numbers.
4. CHECK: render stills of key frames and a 3 to 5 second preview clip. Look at them. Fix issues before any full render.
5. RENDER: full render only after I approve the preview.

## Motion rules
- Every element enters and exits with easing or a spring. No hard cuts inside a scene, no teleporting between states.
- Stagger related elements by 3 to 6 frames.
- One focal point per moment. Do not animate more than 3 things at once.
- Keep motion curves and timing in one shared file (motion.ts) and reuse them.
- Text must stay readable: min 48px for titles, 28px for body at 1080p, hold each line long enough to read (about 0.25 s per word).
- Keep safe margins of 5% on all sides.

## Structure for an explainer (default 30 to 60 s)
Hook or problem (3 to 5 s), context (5 to 10 s), demo of the feature (most of the length), call to action (5 to 10 s).

## Sound
- Voiceover on its own track, music at about 15 to 20% of voiceover volume, ducked under speech.
- Short sound effects only on key transitions.
- Generate or edit audio in code (Remotion Audio, ffmpeg, or Python pydub/librosa). Keep source audio in public/audio/.
- The four 16:9 explainers carry a voiceover (en-IN-PrabhatNeural, remotion/voice/*.mp3), made by `python3 scripts/make-voice.py` from per-line start seconds; if a scene moves, edit the seconds there and re-run. They are the `Explainer-*-cinematic` compositions (kit: remotion/cinematic/Signals.jsx); the older `Explainer-*` ones are kept.
- Never use copyrighted music. Use royalty-free or generated audio.

## Brand (Mindset Wellness): fill in before first use
- Colours: primary ___, secondary ___, background ___, accent sand #D4B896. Use the mindset-brand skill if available.
- Fonts: ___ (Futura is the brand font; substitute Jost or Poppins if Futura is unavailable and say so).
- Logo: save once to public/logo.png from https://mindsetwellness.in/wp-content/uploads/2025/06/Mindset-Original-Logo-1024x439.png (the server may block the download; if so, ask me to upload it).
- Contact and address text must match the brand skill exactly. Do not retype from memory.
- Remove legal and registration details from any public video.

## Technical
- Default: 1920x1080, 30 fps, MP4 (H.264). Square 1080x1080 or vertical 1080x1920 only if I ask.
- Put reusable constants (fps, size, colours) in one config file.
- Preview with `npm run dev`. Stills with `npx remotion still`. Full render with `npx remotion render`.
- Keep full renders for last; they are the slow, expensive step.
- Do not install new packages without telling me why.

## Output and delivery
- Name files descriptively: mindset-<topic>-<length>s-v<N>.mp4.
- After each preview, report in 3 lines: what changed, what to check, what is next.
- Do not re-explain the plan or paste code in chat; give file paths.

## Safety
- Do not delete or overwrite earlier versions; increment the version number.
- Only change files inside this project folder.
