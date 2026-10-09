#!/usr/bin/env python3
"""Shrink rendered screen PNGs (the demo screens) without touching the text.

    python3 scripts/compress-png.py FILE.png [FILE.png ...]   # rewrites in place

Why not a plain palette: the screens sit on a CSS radial gradient, and
Chrome dithers gradients, so the dark background is per-pixel noise that
PNG cannot compress (about a third of each file). Two steps:

1. Smooth only the flat areas. Where a 7x7 window barely varies (the
   dithered gradient), replace the pixel with a blur of its flat
   neighbours only, so nothing bleeds in from text or edges. Text, borders
   and anything with real contrast are left exactly as rendered.
2. Map to a palette of at most 88 colours: median cut (smooth tones, the
   gradient) plus octree (keeps small saturated colours such as the
   saffron badge, which median cut alone washes out), each pixel mapped to
   its exact nearest colour, no dithering.

Result: about 100KB a screen instead of about 500KB, same 2x size, text
identical at 1:1. Needs Pillow and numpy (no npm dependency).
"""
import sys

import numpy as np
from PIL import Image

FLAT_STD = 2.5  # per-channel std in a 7x7 window below which a pixel is "background"


def box(a, r):
    """Mean over a (2r+1) square, edges clamped. a: H x W x C float."""
    p = np.pad(a, ((r + 1, r), (r + 1, r), (0, 0)), mode='edge')
    c = p.cumsum(0).cumsum(1)
    k = 2 * r + 1
    s = c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]
    return s / (k * k)


def soft(a, r=6):
    """Three box passes, close to a Gaussian."""
    for _ in range(3):
        a = box(a, r)
    return a


def smooth_flat(img):
    a = np.asarray(img.convert('RGB')).astype(np.float64)
    mean = box(a, 3)
    std = np.sqrt(np.maximum(box(a * a, 3) - mean * mean, 0)).max(axis=2)
    flat = (std < FLAT_STD).astype(np.float64)[..., None]
    # Shrink the mask by a pixel so an edge pixel is never counted flat.
    flat = (box(flat, 1) > 0.999).astype(np.float64)
    weight = soft(flat)
    blurred = soft(a * flat) / np.maximum(weight, 1e-3)
    out = np.where(flat > 0, blurred, a)
    return Image.fromarray(np.clip(np.rint(out), 0, 255).astype(np.uint8))


def palette(img, n, method):
    p = img.quantize(n, method=method, dither=Image.Dither.NONE).getpalette()[: n * 3]
    return np.array(p, dtype=np.int64).reshape(-1, 3)


def quantize(img, smooth_n=48, accent_n=40):
    pal = np.unique(
        np.vstack([palette(img, smooth_n, Image.Quantize.MEDIANCUT), palette(img, accent_n, Image.Quantize.FASTOCTREE)]),
        axis=0,
    )[:256]
    rgb = np.asarray(img).reshape(-1, 3).astype(np.int64)
    key = (rgb[:, 0] << 16) | (rgb[:, 1] << 8) | rgb[:, 2]
    uniq, inverse = np.unique(key, return_inverse=True)
    colours = np.stack([(uniq >> 16) & 255, (uniq >> 8) & 255, uniq & 255], 1)
    index = np.empty(len(colours), np.uint8)
    for i in range(0, len(colours), 4096):
        d = ((colours[i : i + 4096, None, :] - pal[None]) ** 2).sum(2)
        index[i : i + 4096] = d.argmin(1)
    out = Image.fromarray(index[inverse.reshape(-1)].reshape(img.size[1], img.size[0]), 'P')
    out.putpalette(pal.astype(np.uint8).flatten().tolist())
    return out


def main(paths):
    for path in paths:
        before = Image.open(path)
        if before.mode == 'P':
            print(f'  {path}: already a palette PNG, skipped')
            continue
        out = quantize(smooth_flat(before))
        out.save(path, 'PNG', optimize=True)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
