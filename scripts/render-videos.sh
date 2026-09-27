#!/usr/bin/env bash
# Renders every film, loop and poster from remotion/ into public/videos/.
#   bash scripts/render-videos.sh            # everything
#   bash scripts/render-videos.sh signet     # one slug's film, loop and poster
# Set REMOTION_BROWSER to a Chrome/Chromium binary if Remotion should not
# download its own headless shell.
set -euo pipefail
cd "$(dirname "$0")/.."

ENTRY=remotion/index.jsx
OUT=public/videos
mkdir -p "$OUT/clips" "$OUT/posters"
BROWSER=()
[ -n "${REMOTION_BROWSER:-}" ] && BROWSER=(--browser-executable="$REMOTION_BROWSER")
ONLY="${1:-}"

film() { # composition, output name, poster frame
  npx remotion render "$ENTRY" "$1" "$OUT/$2.mp4" --codec=h264 --crf=26 --x264-preset=slow \
    --pixel-format=yuv420p "${BROWSER[@]}" --log=error
  npx remotion still "$ENTRY" "$1" "$OUT/posters/$2.jpg" --frame="$3" \
    --image-format=jpeg --jpeg-quality=82 "${BROWSER[@]}" --log=error
}
loop() { # composition, output path, scale
  npx remotion render "$ENTRY" "$1" "$2" --codec=h264 --crf=27 --x264-preset=slow --scale="$3" \
    --pixel-format=yuv420p "${BROWSER[@]}" --log=error
}

for slug in signet relay prospector; do
  [ -n "$ONLY" ] && [ "$ONLY" != "$slug" ] && continue
  film "Walkthrough-$slug" "$slug" 190
  loop "Clip-$slug" "$OUT/clips/$slug.mp4" 0.8
  npx remotion still "$ENTRY" "Clip-$slug" "$OUT/posters/$slug-clip.jpg" --frame=60 \
    --scale=0.8 --image-format=jpeg --jpeg-quality=80 "${BROWSER[@]}" --log=error
done
for slug in therapist-pwa udaan; do
  [ -n "$ONLY" ] && [ "$ONLY" != "$slug" ] && continue
  film "Platform-$slug" "$slug" 160
done
if [ -z "$ONLY" ] || [ "$ONLY" = hero ]; then
  loop HeroReel "$OUT/hero-reel.mp4" 1
  npx remotion still "$ENTRY" HeroReel "$OUT/posters/hero-reel.jpg" --frame=60 \
    --image-format=jpeg --jpeg-quality=80 "${BROWSER[@]}" --log=error
fi
ls -la "$OUT" "$OUT/clips" "$OUT/posters"
