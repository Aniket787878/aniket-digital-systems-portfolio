#!/usr/bin/env bash
# Renders every film, loop and poster from remotion/ into public/videos/.
#   bash scripts/render-videos.sh              # everything
#   bash scripts/render-videos.sh consent-signer   # one slug's film, loop and poster
#   bash scripts/render-videos.sh hero         # the home hero reel
#   bash scripts/render-videos.sh explainers   # the five explainer films
#   bash scripts/render-videos.sh explainer-ops-sprint   # one explainer
# Set REMOTION_BROWSER to a Chrome/Chromium binary if Remotion should not
# download its own headless shell, and CONCURRENCY to change how many
# frames render in parallel (default 4).
#
# H.264 needs even output sizes, so any --scale must give even pixels:
# 1440x900 at 0.8 is 1152x720.
set -euo pipefail
cd "$(dirname "$0")/.."

ENTRY=remotion/index.jsx
OUT=public/videos
mkdir -p "$OUT/clips" "$OUT/posters" "$OUT/explainers"
BROWSER=()
[ -n "${REMOTION_BROWSER:-}" ] && BROWSER=(--browser-executable="$REMOTION_BROWSER")
PAR=(--concurrency="${CONCURRENCY:-4}")
ONLY="${1:-}"

# crf 28: the zoom camera makes the walkthroughs motion-heavy; 26 put them at
# ~7 MB each, 28 brings them to ~5 MB with no visible loss on the captures.
film() { # composition, output name, poster frame
  npx remotion render "$ENTRY" "$1" "$OUT/$2.mp4" --codec=h264 --crf=28 --x264-preset=slow \
    --pixel-format=yuv420p "${PAR[@]}" "${BROWSER[@]}" --log=error
  npx remotion still "$ENTRY" "$1" "$OUT/posters/$2.jpg" --frame="$3" \
    --image-format=jpeg --jpeg-quality=82 "${BROWSER[@]}" --log=error
}
loop() { # composition, output path, scale
  npx remotion render "$ENTRY" "$1" "$2" --codec=h264 --crf=27 --x264-preset=slow --scale="$3" \
    --pixel-format=yuv420p "${PAR[@]}" "${BROWSER[@]}" --log=error
}
explainer() { # composition, output name, poster frame, crf
  npx remotion render "$ENTRY" "$1" "$OUT/explainers/$2.mp4" --codec=h264 --crf="$4" --x264-preset=slow \
    --pixel-format=yuv420p "${PAR[@]}" "${BROWSER[@]}" --log=error
  npx remotion still "$ENTRY" "$1" "$OUT/posters/$2.jpg" --frame="$3" \
    --image-format=jpeg --jpeg-quality=82 "${BROWSER[@]}" --log=error
}

for slug in consent-signer shared-inbox lead-research; do
  [ -n "$ONLY" ] && [ "$ONLY" != "$slug" ] && continue
  # the site film: told like the platform films, over the real captures
  film "Platform-$slug" "$slug" 160
  loop "Clip-$slug" "$OUT/clips/$slug.mp4" 0.8
  # frame 0 is the loop's wide frame, so the poster and the first frame match
  npx remotion still "$ENTRY" "Clip-$slug" "$OUT/posters/$slug-clip.jpg" --frame=0 \
    --scale=0.8 --image-format=jpeg --jpeg-quality=80 "${BROWSER[@]}" --log=error  # the /projects card: the same loop framed like the platform films
  loop "Framed-$slug" "$OUT/clips/$slug-framed.mp4" 0.6
  npx remotion still "$ENTRY" "Framed-$slug" "$OUT/posters/$slug-framed.jpg" --frame=40 \
    --scale=0.6 --image-format=jpeg --jpeg-quality=82 "${BROWSER[@]}" --log=error
done
for slug in therapist-pwa care-journey; do
  [ -n "$ONLY" ] && [ "$ONLY" != "$slug" ] && continue
  film "Platform-$slug" "$slug" 160
done
if [ -z "$ONLY" ] || [ "$ONLY" = hero ]; then
  loop HeroReel "$OUT/hero-reel.mp4" 1
  npx remotion still "$ENTRY" HeroReel "$OUT/posters/hero-reel.jpg" --frame=0 \
    --image-format=jpeg --jpeg-quality=80 "${BROWSER[@]}" --log=error
fi

# Explainers: composition, output name, poster frame (a frame where the idea
# is fully on screen: the flow lit, the reply sent, the dashboard built),
# CRF. The two ~58s brand cuts use a higher CRF to stay near 6 MB, since
# they are sent over WhatsApp.
EXPLAINERS=(
  "Explainer-brand explainer-brand 842 27"
  "Explainer-brand-vertical explainer-brand-vertical 842 27"
  "Explainer-ops-sprint explainer-ops-sprint 664 25"
  "Explainer-ai-assistant explainer-ai-assistant 574 25"
  "Explainer-internal-tool explainer-internal-tool 500 25"
)
for row in "${EXPLAINERS[@]}"; do
  read -r comp name poster crf <<<"$row"
  [ -n "$ONLY" ] && [ "$ONLY" != explainers ] && [ "$ONLY" != "$name" ] && continue
  explainer "$comp" "$name" "$poster" "$crf"
done

ls -la "$OUT" "$OUT/clips" "$OUT/explainers" "$OUT/posters"
