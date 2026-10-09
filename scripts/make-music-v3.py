#!/usr/bin/env python3
"""The v3 films' scores: a music bed only (no voice), generated in code, one
file per film -> remotion/audio/score-<film>-v3.mp3 (48 kHz stereo).

  python3 scripts/make-music-v3.py            # every v3 film
  python3 scripts/make-music-v3.py ops        # films whose name contains "ops"

It borrows the synth voices, reverb and limiter from scripts/make-music.py
(imported, not changed) and arranges them for the v3 beat sheets
(films-2026-10-09/shot-list.md, section 3 "Sound palette"):

  * fixed 120 BPM, so a beat is exactly 15 frames and a bar 60: every scene
    start in the films is on the grid and every hit here lands on a frame
  * no voice, so no side-chain ducking; the bed carries the film, so it
    moves more: a pluck motif that changes every 4 bars, the pad opening
    on each film's paper moment (`open`)
  * sections: intro (pad + sub, a quiet pulse), riser into the drop
    (impact, the groove starts), lift (full groove), breaks for the
    headfakes (drums and bass out, the pad pulled down and dark, so the
    music "cuts out"), an impact on each re-entry, and the CTA (groove
    stops, a D major add9 bloom that matches the `end` effect)

The marks below are the films' frame constants; change them with the film.
Mix: the bed is set to BED_LUFS over its groove and limited to -1.5 dBTP;
with the effects on top the film lands near -14 LUFS (check the render with
scripts/measure-audio.py).
"""
import argparse, importlib.util, pathlib, subprocess
import numpy as np
from scipy import signal

ROOT = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("mm", ROOT / "scripts" / "make-music.py")
mm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mm)

SR, FPS = mm.SR, mm.FPS
BEAT_F, BAR_F = 15, 60
OUT = ROOT / "remotion" / "audio"
SEED = 20261009
BED_LUFS = -14.8
TP = -1.5

FILMS = {
    # ExplainerBrandV3 B3: riser 390, drop 480, lift 510, break 990-1050, cta 1560
    "brand-v3": dict(frames=1740, key="B", riser=390, drop=480, lift=510, breaks=[(990, 1050)], cta=1560, open=None, trim=3.8),
    # ExplainerOpsSprintV3: riser 120, drop 180, lift 300, paper 525, break 795-840, cta 900
    "ops-sprint-v3": dict(frames=1140, key="F#", riser=120, drop=180, lift=300, breaks=[(795, 840)], cta=900, open=525, trim=4.0),
    # ExplainerAiAssistantV3: riser 120, drop 195, lift 300, break 600-660, paper 750, cta 870
    "ai-assistant-v3": dict(frames=1080, key="E", riser=120, drop=195, lift=300, breaks=[(600, 660)], cta=870, open=750, trim=4.2),
    # ExplainerInternalToolV3: headfake 270-330 (in the intro), riser 330, drop 420, paper/lift 510, break 690-735, cta 870
    "internal-tool-v3": dict(frames=1080, key="B", riser=330, drop=420, lift=510, breaks=[(270, 330), (690, 735)], cta=870, open=510, trim=5.2),
}

# a motif per 4-bar phrase: indexes into the chord's arpeggio (0..3), -1 rest, 16ths
MOTIFS = [
    [0, -1, 1, -1, 2, -1, 1, -1, 0, -1, 1, -1, 3, -1, 2, -1],
    [0, 2, 1, 3, 2, -1, 1, -1, 0, 2, 1, 3, 2, -1, 3, -1],
    [3, -1, 2, 1, -1, 2, 0, -1, 3, -1, 2, 1, -1, 2, 1, 0],
    [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, -1, 0, -1],
]
D_ADD9 = mm.D_ADD9


def fr2s(fr):
    return int(round(fr / FPS * SR))


def build(name, cfg):
    mm.rng = np.random.default_rng(SEED)
    rng = mm.rng
    N = fr2s(cfg["frames"])
    root = mm.PC[cfg["key"]]
    bass_root = 33 + (root - 9) % 12
    I, VI, III, VII = 0, 8, 3, 10
    triad = lambda r: [(root + r) % 12, (root + r + (4 if r in (VI, III, VII) else 3)) % 12, (root + r + 7) % 12]
    prog_main = [I, VI, III, VII]
    prog_intro = [I, I, VI, VI]
    drop, lift, cta = cfg["drop"], cfg["lift"], cfg["cta"]
    breaks = cfg["breaks"]
    in_break = lambda fr: any(a <= fr < b for a, b in breaks)
    beat = BEAT_F / FPS * SR
    bar = BAR_F / FPS * SR

    B = {k: np.zeros((N, 2)) for k in ("pad", "bass", "drums", "arp", "fx", "verb", "air")}
    nbars = int(np.ceil(cfg["frames"] / BAR_F))
    for j in range(nbars):
        fb = j * BAR_F
        at = fr2s(fb)
        if fb >= cta:
            break
        groove = fb >= drop
        ch = prog_main[j % 4] if groove else prog_intro[j % 4]
        notes = mm.voicing(triad(ch))
        # pad every bar (the gates below shape it)
        B["pad"] += 0  # keep the dict order
        mm.place(B["pad"], mm.pad_chord(notes, bar / SR, attack=0.6 if not groove else 0.15, rel=1.2) * (0.9 if groove else 0.8), at)
        br = bass_root + ch % 12 - (12 if ch % 12 > 6 else 0)
        if not groove:
            mm.place(B["bass"], mm.stereo(mm.bass_note(br, bar / SR, 0.35, tau=1.2)), at)
        for q in range(4):
            fq = fb + q * BEAT_F
            if fq >= cta or in_break(fq):
                continue
            bt = at + q * beat
            full = fq >= lift
            if not groove:
                if fb >= BAR_F:  # the quiet pulse from bar 2
                    if q % 2 == 0:
                        mm.place(B["drums"], mm.kick(vel=0.28), bt)
                    else:
                        mm.place(B["drums"], mm.hat(vel=0.2, pan=0.2), bt + beat / 2)
                continue
            if fq < drop:
                continue
            # bass: eighths, octave on the last
            for e in range(2):
                mm.place(B["bass"], mm.stereo(mm.bass_note(br + (12 if (q == 3 and e == 1) else 0), beat / 2 / SR * 0.9, 0.9 if e == 0 else 0.7)), bt + e * beat / 2)
            if q in (0, 2) or full:
                mm.place(B["drums"], mm.kick(vel=1.0 if q in (0, 2) else 0.8), bt)
            if full and q in (1, 3):
                c = mm.clap(0.55)
                mm.place(B["drums"], c, bt)
                mm.place(B["verb"], c * 0.6, bt)
            subs = 4 if full else 2
            for s in range(subs):
                if not full and s == 0:
                    continue
                off = s == (2 if full else 1)
                v = 0.55 if off else (0.28 if s == 0 else 0.36)
                mm.place(B["drums"], mm.hat(open_=off and full, vel=v, pan=0.25 if s % 2 else -0.15), bt + s * beat / subs)
        # the pluck motif: from the drop, changing every 4 bars (sparser before the lift)
        if groove and fb < cta:
            motif = MOTIFS[(j // 4) % len(MOTIFS)]
            arp = [m + 12 for m in notes] + [notes[1] + 24]
            for k16, idx in enumerate(motif):
                fk = fb + k16 * BEAT_F / 4
                if idx < 0 or fk >= cta or in_break(fk):
                    continue
                if fk < lift and k16 % 2:
                    continue
                mm.place(B["arp"], mm.pluck(arp[idx], vel=0.55 if k16 % 4 == 0 else 0.38, pan=-0.4 if k16 % 2 else 0.4), at + k16 * beat / 4)
        # the paper moment: a high shimmer pad an octave up
        if cfg["open"] is not None and cfg["open"] <= fb and not in_break(fb):
            mm.place(B["air"], mm.pad_chord([m + 12 for m in notes], bar / SR, attack=0.4, rel=1.0, spread=0.9) * 0.5, at)

    # ping-pong delay on the arp (dotted eighth)
    d = int(0.75 * beat)
    arp = B["arp"]
    dl = np.zeros_like(arp)
    for k in range(1, 5):
        sh = k * d
        dl[sh:, k % 2] += arp[:-sh].mean(axis=1) * 0.36 ** k
    B["arp"] = arp + mm.filt(dl, "low", 4000)

    # risers: into the drop, into each re-entry (quiet, last 30 frames), into the CTA
    mm.place(B["fx"], mm.riser((fr2s(drop) - fr2s(cfg["riser"])) / SR), fr2s(cfg["riser"]))
    for a, b in breaks:
        if b <= drop:
            continue
        L = min(b - a, 30)
        mm.place(B["fx"], mm.riser(L / FPS) * 0.35, fr2s(b - L))
    mm.place(B["fx"], mm.riser(BAR_F / FPS) * 0.45, fr2s(cta - BAR_F))
    # impacts: drop, re-entries after the drop, CTA
    hits = [(drop, 1.0), (cta, 0.9)] + [(b, 0.8) for a, b in breaks if b > drop]
    for fh, v in hits:
        im = mm.impact(v)
        mm.place(B["fx"], im, fr2s(fh))
        mm.place(B["verb"], im * 0.5, fr2s(fh))

    # CTA: D major add9 bloom and a held low D
    rest = (N - fr2s(cta)) / SR
    mm.place(B["pad"], mm.pad_chord(D_ADD9, rest, attack=0.05, rel=0.01, spread=0.9) * 1.25, fr2s(cta))
    mm.place(B["bass"], mm.stereo(mm.bass_note(38, rest, 0.8, tau=1.6)), fr2s(cta))

    t_fr = np.arange(N) / SR * FPS
    smooth = lambda g, hz=30: signal.filtfilt(*signal.butter(1, hz, fs=SR), g)
    brk = np.zeros(N)
    for a, b in breaks:
        brk[(t_fr >= a) & (t_fr < b)] = 1
    groove_g = ((t_fr >= drop) & (t_fr < cta)).astype(float) * (1 - brk)
    pre = (t_fr < drop).astype(float) * (1 - brk)
    cta_on = (t_fr >= cta).astype(float)
    B["drums"] *= smooth(np.clip(groove_g + pre, 0, 1))[:, None]
    B["arp"] *= smooth(groove_g)[:, None]
    B["bass"] *= smooth(np.clip(groove_g + pre + cta_on, 0, 1))[:, None]
    # the break: the pad drops ~18 dB, so the music reads as cut out
    padg = smooth(1 - brk * 0.88, 60)

    # pad brightness: dark intro and breaks, open in the groove, brightest on the paper moment / CTA
    dark, mid, bright = (mm.filt(B["pad"], "low", f) for f in (650, 1700, 3400))
    lv = np.where(t_fr >= drop, 1.0, 0.0) + np.where(t_fr >= lift, 0.5, 0) + (np.where(t_fr >= cfg["open"], 0.5, 0) if cfg["open"] is not None else 0)
    lv = np.clip(lv * (1 - brk) + cta_on * 2, 0, 2)
    lv = smooth(lv, 2)
    w0, w2 = np.clip(1 - lv, 0, 1), np.clip(lv - 1, 0, 1)
    w1 = 1 - w0 - w2
    pad = (dark * w0[:, None] + mid * w1[:, None] + bright * w2[:, None]) * padg[:, None]
    pad = mm.filt(pad, "high", 140)
    air = mm.filt(B["air"], "high", 600) * padg[:, None]
    B["verb"] += pad * 0.35 + B["arp"] * 0.3 + air * 0.5

    # the kick's breathing on pad and bass, in the groove only
    pump = np.ones(N)
    for fb in range(drop, cta, BEAT_F):
        if in_break(fb):
            continue
        i = fr2s(fb)
        k = np.arange(min(int(beat), N - i)) / SR
        pump[i:i + len(k)] = np.minimum(pump[i:i + len(k)], 1 - 0.3 * np.exp(-k / 0.09))
    bass = mm.filt(B["bass"], "low", 420) * pump[:, None]
    pad = pad * pump[:, None]

    wet = mm.convolve(B["verb"], mm.reverb_ir())
    mix = pad * 0.55 + bass * 0.55 + mm.filt(B["drums"], "high", 30) + mm.filt(B["arp"], "high", 300) * 0.4 + air * 0.35 + B["fx"] * 0.6 + mm.filt(wet, "high", 200) * 0.25
    mix *= mm.fade(N, 0.3)[:, None] * mm.fade(N, 1.0, out=True)[:, None]
    sel = groove_g > 0.5
    # trim: measured on the rendered film (bed + effects through Remotion) so it lands near -14 LUFS
    mix *= 10 ** ((BED_LUFS + cfg.get('trim', 0) - mm.lufs(mix[sel])) / 20)
    mix = mm.limit(mix, TP)
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"score-{name}.mp3"
    pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "libmp3lame", "-b:a", "192k", str(path)], input=pcm.tobytes(), check=True)
    print(f"  {name:18s} {cfg['key']:>2} minor 120 BPM  bed {mm.lufs(mix):5.1f} LUFS  TP {mm.true_peak_db(mix):5.1f} dB -> {path.relative_to(ROOT)}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("only", nargs="?")
    a = ap.parse_args()
    for n, c in FILMS.items():
        if a.only and a.only not in n:
            continue
        build(n, c)
