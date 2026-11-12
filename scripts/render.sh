#!/usr/bin/env bash
# Redraws the README's generated images in docs/assets: actions.gif (every
# action at once, in a grid), actions.png (one frame of each) and crowd.png.
#
#   scripts/render.sh
#
# Needs bun, python3, ImageMagick 7 with Pango, and the JetBrains Mono font.
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
assets=$repo/docs/assets
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
png() { python3 -I "$repo/scripts/ansi2png.py" "$@"; }

bun "$repo/scripts/frames.ts" "$tmp/frames" >/dev/null
mkdir "$tmp/png" "$tmp/grid"
for f in "$tmp"/frames/*.ans; do png "$f" "$tmp/png/$(basename "$f" .ans).png" --size 560x230; done

# The GIF: 32 ticks, each cell looping its own action.
read -ra ranges < "$tmp/frames/ranges.txt" || true
for i in $(seq 0 31); do
  cells=()
  for r in "${ranges[@]}"; do cells+=("$tmp/png/$(printf %04d $(( ${r%%:*} + i % ${r##*:} ))).png"); done
  magick montage "${cells[@]}" -tile 3x -geometry 444x182+4+4 -background '#161616' "$tmp/grid/$(printf %03d "$i").png"
done
# One palette for every frame, and no dithering, so the background holds still.
magick "$tmp"/grid/*.png -append +dither -colors 64 -unique-colors "$tmp/palette.png"
magick -delay 10 -loop 0 "$tmp"/grid/*.png +dither -remap "$tmp/palette.png" -layers Optimize "$assets/actions.gif"

read -ra picks < "$tmp/frames/picks.txt" || true
cells=(); for p in "${picks[@]}"; do cells+=("$tmp/png/$p.png"); done
magick montage "${cells[@]}" -tile 3x -geometry 444x182+4+4 -background '#161616' "$assets/actions.png"

bun "$repo/scripts/crowd.ts" > "$tmp/crowd.ans"
png "$tmp/crowd.ans" "$assets/crowd.png"
ls -la "$assets"/actions.* "$assets/crowd.png"
