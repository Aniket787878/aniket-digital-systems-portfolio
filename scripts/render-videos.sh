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

# Sound (remotion/sound.jsx). The films and the explainers carry a score
# (voice + generated music bed, remotion/audio/score-*.mp3) and the
# synthesised effects. Remotion renders the mix at 320 kb/s, then master()
# below sets it to -14 LUFS under a -2 dBFS limiter (true peak about -1.8)
# and encodes it once as 128 kb/s stereo AAC, with the video stream copied.
# The card loops and the hero reel are rendered --muted: no audio track.
SOUND=(--audio-codec=aac --audio-bitrate=320k)

# Rebuild the scores if a voice or the score script is newer than them
# (python3 with numpy + scipy; see scripts/make-music.py).
if [ -n "$(find remotion/voice/*.mp3 scripts/make-music.py -newer remotion/audio/score-brand.mp3 2>/dev/null)" ] \
   || [ ! -f remotion/audio/score-brand.mp3 ]; then
  python3 scripts/make-music.py
fi

master() { # mp4: measure, gain to -14 LUFS, limit, re-encode the audio only
  local f="$1" i g
  i=$(ffmpeg -hide_banner -nostats -i "$f" -vn -af ebur128 -f null - 2>&1 | sed -n 's/^ *I: *\(-\?[0-9.]*\) LUFS/\1/p' | tail -n1)
  g=$(awk -v i="$i" 'BEGIN { printf "%.2f", -14 - i }')
  ffmpeg -hide_banner -loglevel error -y -i "$f" -map 0:v -map 0:a -c:v copy \
    -af "volume=${g}dB,alimiter=limit=0.75:attack=4:release=60:level=disabled" \
    -ar 48000 -ac 2 -c:a aac -b:a 128k -movflags +faststart "${f%.mp4}.master.mp4"
  mv "${f%.mp4}.master.mp4" "$f"
  echo "mastered $f ($i LUFS, ${g} dB)"
}

# The optional music bed. Put the track at remotion/audio/music.mp3 (or .m4a
# or .wav) and re-run this script: it is normalised (two-pass loudnorm,
# linear where possible) to -20 LUFS integrated, -2 dBTP, into
# remotion/audio/music-bed.wav, which the films pick up. Remove the track and
# the bed goes too, so the films go back to effects only.
MUSIC_SRC=$(ls remotion/audio/music.mp3 remotion/audio/music.m4a remotion/audio/music.wav 2>/dev/null | head -n1 || true)
BED=remotion/audio/music-bed.wav
if [ -n "$MUSIC_SRC" ]; then
  if [ ! -f "$BED" ] || [ "$MUSIC_SRC" -nt "$BED" ]; then
    m=$(ffmpeg -hide_banner -nostats -i "$MUSIC_SRC" -af loudnorm=I=-20:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
    v() { echo "$m" | sed -n "s/.*\"$1\" : \"\(.*\)\".*/\1/p"; }
    ffmpeg -hide_banner -loglevel error -y -i "$MUSIC_SRC" \
      -af "loudnorm=I=-20:TP=-2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true" \
      -ar 48000 -ac 2 -c:a pcm_s16le "$BED"
    echo "music bed: $MUSIC_SRC -> $BED (was $(v input_i) LUFS)"
  fi
else
  rm -f "$BED"
fi

# crf 28: the zoom camera makes the walkthroughs motion-heavy; 26 put them at
# ~7 MB each, 28 brings them to ~5 MB with no visible loss on the captures.
film() { # composition, output name, poster frame
  npx remotion render "$ENTRY" "$1" "$OUT/$2.mp4" --codec=h264 --crf=28 --x264-preset=slow \
    --pixel-format=yuv420p "${SOUND[@]}" "${PAR[@]}" "${BROWSER[@]}" --log=error
  master "$OUT/$2.mp4"
  npx remotion still "$ENTRY" "$1" "$OUT/posters/$2.jpg" --frame="$3" \
    --image-format=jpeg --jpeg-quality=82 "${BROWSER[@]}" --log=error
}
loop() { # composition, output path, scale: a silent card loop
  npx remotion render "$ENTRY" "$1" "$2" --codec=h264 --crf=27 --x264-preset=slow --scale="$3" \
    --pixel-format=yuv420p --muted "${PAR[@]}" "${BROWSER[@]}" --log=error
}
explainer() { # composition, output name, poster frame, crf
  npx remotion render "$ENTRY" "$1" "$OUT/explainers/$2.mp4" --codec=h264 --crf="$4" --x264-preset=slow \
    --pixel-format=yuv420p "${SOUND[@]}" "${PAR[@]}" "${BROWSER[@]}" --log=error
  master "$OUT/explainers/$2.mp4"
  npx remotion still "$ENTRY" "$1" "$OUT/posters/$2.jpg" --frame="$3" \
    --image-format=jpeg --jpeg-quality=82 "${BROWSER[@]}" --log=error
}

for slug in consent-signer shared-inbox lead-research; do
  [ -n "$ONLY" ] && [ "$ONLY" != "$slug" ] && continue
  # the site film: told like the platform films, over the real captures
  film "Platform-$slug" "$slug" 234
  loop "Clip-$slug" "$OUT/clips/$slug.mp4" 0.8
  # frame 0 is the loop's wide frame, so the poster and the first frame match
  npx remotion still "$ENTRY" "Clip-$slug" "$OUT/posters/$slug-clip.jpg" --frame=0 \
    --scale=0.8 --image-format=jpeg --jpeg-quality=80 "${BROWSER[@]}" --log=error  # the /projects card: the same loop framed like the platform films
  loop "Framed-$slug" "$OUT/clips/$slug-framed.mp4" 0.6
  npx remotion still "$ENTRY" "Framed-$slug" "$OUT/posters/$slug-framed.jpg" --frame=60 \
    --scale=0.6 --image-format=jpeg --jpeg-quality=82 "${BROWSER[@]}" --log=error
done
for slug in therapist-pwa care-journey; do
  [ -n "$ONLY" ] && [ "$ONLY" != "$slug" ] && continue
  film "Platform-$slug" "$slug" 234
done
if [ -z "$ONLY" ] || [ "$ONLY" = hero ]; then
  # rendered --muted: the site only plays the reel as a silent home loop, so
  # an audio track would be bytes nobody hears (its cues stay in HeroReel.jsx
  # for the day it gets a full player)
  npx remotion render "$ENTRY" HeroReel "$OUT/hero-reel.mp4" --codec=h264 --crf=27 --x264-preset=slow \
    --pixel-format=yuv420p --muted "${PAR[@]}" "${BROWSER[@]}" --log=error
  npx remotion still "$ENTRY" HeroReel "$OUT/posters/hero-reel.jpg" --frame=300 \
    --image-format=jpeg --jpeg-quality=80 "${BROWSER[@]}" --log=error
fi

# Explainers: composition, output name, poster frame (a frame where the idea
# is fully on screen: the flow lit, the reply sent, the dashboard built),
# CRF. The four 16:9 films are the cinematic cuts (Explainer-*-cinematic, voiced
# by remotion/voice/*.mp3 from scripts/make-voice.py); the vertical brand cut is
# the earlier layout with the same voice. The two ~58s brand cuts use a higher CRF to stay near 6 MB, since
# they are sent over WhatsApp.
EXPLAINERS=(
  "Explainer-brand-cinematic explainer-brand 600 27"
  "Explainer-brand-vertical explainer-brand-vertical 842 27"
  "Explainer-ops-sprint-cinematic explainer-ops-sprint 150 25"
  "Explainer-ai-assistant-cinematic explainer-ai-assistant 300 25"
  "Explainer-internal-tool-cinematic explainer-internal-tool 520 25"
)
for row in "${EXPLAINERS[@]}"; do
  read -r comp name poster crf <<<"$row"
  [ -n "$ONLY" ] && [ "$ONLY" != explainers ] && [ "$ONLY" != "$name" ] && continue
  explainer "$comp" "$name" "$poster" "$crf"
done

ls -la "$OUT" "$OUT/clips" "$OUT/explainers" "$OUT/posters"
