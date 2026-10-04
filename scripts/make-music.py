#!/usr/bin/env python3
"""The films' score: a generated music bed under a treated voice, one file per
film -> remotion/audio/score-<film>.mp3 (48 kHz stereo).

  python3 scripts/make-music.py                 # every film
  python3 scripts/make-music.py brand           # films whose name contains "brand"
  python3 scripts/make-music.py --stems /tmp/x  # also write voice / bed stems (for measuring)

Run it after scripts/make-voice.py (it reads remotion/voice/<voice>.mp3) and
after a beat in a film moves (the marks below are that film's frame
constants). Needs numpy, scipy and ffmpeg. Everything is synthesised here
from oscillators and filtered noise with a fixed seed: no samples, no
licences, and a re-run is byte-stable.

What the reference reels have and the films lacked (scripts/measure-audio.py):
a continuous bed with a steady pulse around 105-112 BPM, a heavy low end
(kick, sub bass, booms), risers that swell into the reveal and a deep
impact on it, stereo width, and -14 LUFS. So each film gets:

  intro    dark filtered pad, sub drone, a quiet quarter-note pulse
  riser    noise + pitch swell from the mark `riser` into `drop`
  drop     impact (sub boom + air + long tail), the groove starts on a
           downbeat: half-time kick, eighth-note bass, offbeat hats
  lift     the groove fills out: four-on-the-floor, claps, 16th hats, a
           pluck arpeggio with a ping-pong delay, the pad opens up
  break    the headfake: drums and bass drop out, the pad darkens, a riser
           pulls into the re-entry, which lands with an impact
  cta      the end card: impact, the groove stops, a D major add9 bloom
           (the same chord as the `end` effect) rings out to the fade

Keys are B, F# or E minor, the three minor keys that hold D major, so the
end card's chord and the `end` effect always agree. Tempo is picked per film
(100-120 BPM, nearest 110) so the last groove section is a whole number of
beats and the CTA impact lands on the beat.

The voice (en-IN-PrabhatNeural, timing untouched) gets a gentle chain:
high-pass 80 Hz, -2.5 dB at 280 Hz (boxiness), +2 dB at 3 kHz
(presence), 2:1 compression, a de-esser (the compressor alone tripled the
6-16 kHz share), and a short, quiet stereo room. The bed is side-chained to it while a word is spoken (40 ms attack with
60 ms look-ahead, 350 ms release): 12 dB above 180 Hz, where the voice
lives; 8.4 dB below it and 6 dB above 6 kHz, so the kick, sub and hats keep
pulsing under the words. The score is limited
to -1.5 dBTP; the render script masters the finished film to -14 LUFS.
"""
import argparse, importlib.util, pathlib, subprocess, sys
import numpy as np
from scipy import signal

SR, FPS = 48000, 30
ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICE_DIR = ROOT / "remotion" / "voice"
OUT = ROOT / "remotion" / "audio"
SEED = 20261004

# Stage films (remotion/stage/StageFilm.jsx): A0 96, STEP_LEN 78, HF 50,
# 6 steps, actEnd 614, the end card at actEnd + END 72 + END_HEADING_AT 4.
def stage(key, k):
    hf = 96 + 78 * k
    return dict(frames=818, key=key, riser=44, drop=96, lift=hf + 50, breaks=[(hf, hf + 50), (614, 690)], cta=690, stabs=[622])

# Marks are frames from each film's beat sheet (the B / T / F constants).
FILMS = {
    # ExplainerBrandCinematic: B.pull 335 -> B.bloom 396, B.proof 885, B.end 1420 + 4
    "brand": dict(frames=1726, voice="brand", key="B", riser=335, drop=396, lift=885, breaks=[], cta=1424, stabs=[1270]),
    # ExplainerBrand (vertical): F.fake 438 -> F.snap 504, F.proof 880, F.end 1420 + 4
    "brand-vertical": dict(frames=1726, voice="brand", key="B", riser=438, drop=504, lift=880, breaks=[], cta=1424, stabs=[1270]),
    # ExplainerOpsSprintCinematic: B.pull 82 -> B.form 120, B.paperIn 466, B.stop 690, B.end 752 + 4
    "ops-sprint": dict(frames=912, key="F#", riser=82, drop=120, lift=466, breaks=[(690, 756)], cta=756),
    # ExplainerAiAssistantCinematic: T.pull 56 -> T.chat 90, T.fake 402 -> T.approve 452, T.end 700 + 4
    "ai-assistant": dict(frames=900, key="E", riser=56, drop=90, lift=452, breaks=[(402, 452)], cta=704),
    # ExplainerInternalToolCinematic: B.whoHead 297, B.pull 351 -> B.bloom 396, B.rolesHead 552, B.end 708 + 4
    "internal-tool": dict(frames=904, key="B", riser=351, drop=396, lift=552, breaks=[], cta=712, stabs=[297]),
    # headfakeAt from remotion/stage/stories.js and schematics.jsx
    "therapist-pwa": stage("F#", 3),
    "care-journey": stage("B", 4),
    "consent-signer": stage("E", 4),
    "shared-inbox": stage("F#", 3),
    "lead-research": stage("B", 4),
}

PC = {"E": 4, "F#": 6, "B": 11}
D_ADD9 = [62, 66, 69, 74, 76]  # D4 F#4 A4 D5 E5: the end card's chord
BED_LUFS = -17.0  # the bed alone, through the groove, before ducking
VOICE_LUFS = -16.0
SCORE_TP = -1.5
DUCK_DB = 12.0
LOW_DUCK = 0.7  # the kick and sub duck 0.7 x DUCK_DB
TOP_DUCK = 0.5  # the hats (above 6 kHz, little voice there) half of it

rng = np.random.default_rng(SEED)
mtof = lambda m: 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)


# ------------------------------------------------------------------ dsp
def sos(kind, f, order=2):
    f = np.atleast_1d(f)
    return signal.butter(order, f if len(f) > 1 else f[0], btype=kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x, axis=0)


def biquad(kind, f0, gain_db=0.0, q=0.707):
    """RBJ peaking / shelving EQ as an sos row."""
    A, w = 10 ** (gain_db / 40), 2 * np.pi * f0 / SR
    al, c = np.sin(w) / (2 * q), np.cos(w)
    if kind == "peak":
        b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    else:  # high shelf
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
        a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
    return np.array([b + a]) / a[0]


def stereo(x, pan=0.0):
    """Mono -> stereo, constant-power pan (-1 left .. 1 right)."""
    p = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(p), x * np.sin(p)], axis=1) * np.sqrt(2)


def place(bus, sig, at):
    at = int(round(at))
    if at >= len(bus):
        return
    if at < 0:
        sig, at = sig[-at:], 0
    n = min(len(sig), len(bus) - at)
    bus[at:at + n] += sig[:n]


def reverb_ir(rt60=2.2, pre=0.02, tone=4500):
    n = int(rt60 * 1.1 * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-6.9 * t / rt60)[:, None]
    ir = filt(ir, "low", tone)
    ir[: int(pre * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(axis=0))


def convolve(x, ir):
    return np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)


def fade(n, sec, out=False):
    k = min(n, max(1, int(sec * SR)))
    e = np.ones(n)
    r = np.sin(np.linspace(0, np.pi / 2, k)) ** 2
    if out:
        e[-k:] = r[::-1]
    else:
        e[:k] = r
    return e


def k_weight(x):
    s = np.vstack([biquad("shelf", 1681.97, 4.0, 0.7072), sos("high", 38.1)])
    return signal.sosfilt(s, x, axis=0)


def lufs(x, gate=True):
    """BS.1770 integrated loudness (stereo or mono), with gating."""
    if x.ndim == 1:
        x = x[:, None]
    y = k_weight(x)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    p2 = np.cumsum(np.concatenate([np.zeros((1, y.shape[1])), y ** 2]), axis=0)
    idx = np.arange(0, len(y) - blk, hop)
    ms = ((p2[idx + blk] - p2[idx]) / blk).sum(axis=1)
    L = -0.691 + 10 * np.log10(ms + 1e-15)
    if not gate:
        return -0.691 + 10 * np.log10(ms.mean() + 1e-15)
    keep = ms[L > -70]
    rel = -0.691 + 10 * np.log10(keep.mean() + 1e-15) - 10
    keep = ms[(L > -70) & (L > rel)]
    return -0.691 + 10 * np.log10(keep.mean() + 1e-15)


def limit(x, ceiling_db=-1.5, look=0.004, release=0.12):
    """Look-ahead peak limiter on 4x-oversampled peaks (true-peak safe)."""
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    up = signal.resample_poly(x, 4, 1, axis=0)
    pk = np.abs(up).max(axis=1).reshape(-1, 4).max(axis=1)[: len(x)]
    need = np.minimum(1.0, 10 ** (ceiling_db / 20) / np.maximum(pk, 1e-9))
    L = int(look * SR)
    need = minimum_filter1d(need, 2 * L + 1)
    a = np.exp(-1 / (release * SR))
    g = np.minimum(signal.lfilter([1 - a], [1, -a], need - 1, zi=[-(1 - a) * 0])[0] + 1, need)
    g = uniform_filter1d(minimum_filter1d(g, L), L)
    return x * g[:, None]


def true_peak_db(x):
    return 20 * np.log10(np.abs(signal.resample_poly(x, 4, 1, axis=0)).max() + 1e-12)


# ------------------------------------------------------------------ voices
def env_adsr(n, a, d_tau=None, rel=0.0, hold=None):
    t = np.arange(n) / SR
    e = np.clip(t / max(a, 1e-4), 0, 1) ** 2
    if d_tau:
        e *= np.exp(-np.maximum(t - a, 0) / d_tau)
    if hold is not None and rel:
        e *= np.clip(1 - (t - hold) / rel, 0, 1) ** 2
    return e


def saw(f, n, phase=0.0):
    t = np.arange(n) / SR
    return signal.sawtooth(2 * np.pi * f * t + phase)


def pad_chord(notes, dur, attack=0.35, rel=1.2, spread=0.7):
    n = int((dur + rel) * SR)
    out = np.zeros((n, 2))
    for i, m in enumerate(notes):
        pan = spread * (2 * i / max(1, len(notes) - 1) - 1) if len(notes) > 1 else 0
        for cents, dp in ((-9, -0.35), (0, 0.0), (9, 0.35)):
            v = saw(mtof(m) * 2 ** (cents / 1200), n, rng.uniform(0, 2 * np.pi))
            out += stereo(v, np.clip(pan + dp, -1, 1)) * 0.33
    return out * env_adsr(n, attack, rel=rel, hold=dur)[:, None] / len(notes)


def kick(n_sec=0.45, vel=1.0):
    n = int(n_sec * SR)
    t = np.arange(n) / SR
    f = 46 + 95 * np.exp(-t / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.26)
    body = np.tanh(1.6 * body)
    click = filt(rng.standard_normal(n), "high", 1800) * np.exp(-t / 0.003) * 0.25
    return stereo((body + click) * env_adsr(n, 0.002) * vel)


def hat(open_=False, vel=1.0, pan=0.0):
    n = int((0.25 if open_ else 0.08) * SR)
    t = np.arange(n) / SR
    x = filt(rng.standard_normal(n), "high", 6500, 4) * np.exp(-t / (0.09 if open_ else 0.022))
    return stereo(filt(x, "low", 13000) * vel, pan)


def clap(vel=1.0):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    e = sum(np.exp(-np.maximum(t - d, 0) / 0.006) * (t >= d) for d in (0, 0.011, 0.022)) + np.exp(-np.maximum(t - 0.03, 0) / 0.09) * (t >= 0.03)
    x = filt(rng.standard_normal(n), "band", [900, 3200]) * e
    return stereo(x * vel * 0.6)


def pluck(m, vel=1.0, pan=0.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    x = (0.7 * np.sin(2 * np.pi * f * t) + 0.3 * saw(f * 1.002, n)) * np.exp(-t / 0.11)
    x = filt(x, "low", 3200) * env_adsr(n, 0.003)
    return stereo(x * vel, pan)


def bass_note(m, dur, vel=1.0, tau=0.2):
    n = int((dur + 0.05) * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    x = np.tanh(1.8 * x) * np.exp(-t / tau) * env_adsr(n, 0.004, rel=0.04, hold=dur)
    return x * vel


def riser(sec, top=7000):
    n = max(int(sec * SR), 256)
    u = np.linspace(0, 1, n)
    # noise, band-passed by a centre that climbs (shaped in the STFT)
    out = np.zeros((n, 2))
    for c in range(2):
        f, tt, Z = signal.stft(rng.standard_normal(n), SR, nperseg=1024)
        fc = 250 * (top / 250) ** (np.interp(tt, np.linspace(0, n / SR, n), u) ** 1.4)
        mask = np.exp(-0.5 * (np.log(np.maximum(f[:, None], 1) / fc[None, :]) / 0.5) ** 2)
        _, x = signal.istft(Z * mask, SR, nperseg=1024)
        out[:, c] = x[:n]
    out /= np.abs(out).max() + 1e-9
    env = u ** 2.2 * fade(n, 0.006, out=True)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (1.6 * u ** 1.5)) / SR) * 0.25
    return (out + stereo(tone)) * env[:, None]


def impact(vel=1.0, sub_tau=0.7):
    n = int(2.0 * SR)
    t = np.arange(n) / SR
    f = 30 + 52 * np.exp(-t / 0.08)
    boom = np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / sub_tau)
    air = filt(rng.standard_normal((n, 2)), "low", 2500) * np.exp(-t / 0.09)[:, None] * 0.45
    down = np.zeros((n, 2))
    for c in range(2):  # a falling breath after the hit
        f_, tt, Z = signal.stft(rng.standard_normal(n), SR, nperseg=1024)
        fc = 3000 * (180 / 3000) ** np.clip(tt / 1.4, 0, 1)
        Z *= np.exp(-0.5 * (np.log(np.maximum(f_[:, None], 1) / fc[None, :]) / 0.45) ** 2)
        down[:, c] = signal.istft(Z, SR, nperseg=1024)[1][:n]
    down *= (0.25 / (np.abs(down).max() + 1e-9)) * (np.exp(-t / 0.5) * (1 - np.exp(-t / 0.02)))[:, None]
    return (stereo(boom) + air + down) * env_adsr(n, 0.002)[:, None] * vel


# ------------------------------------------------------------------ the score
def voicing(pcs, centre=60, lo=52, hi=71):
    notes = []
    for pc in pcs:
        cands = [m for m in range(lo, hi + 1) if m % 12 == pc % 12]
        notes.append(min(cands, key=lambda m: abs(m - centre)))
    return sorted(notes)


def pick_tempo(beats_frames):
    """BPM in 100..120, nearest 110, giving a whole number of beats over
    `beats_frames` (the last groove section), so the CTA lands on a beat."""
    sec = beats_frames / FPS
    best = None
    for nb in range(1, 200):
        bpm = 60 * nb / sec
        if 100 <= bpm <= 120 and (best is None or abs(bpm - 110) < abs(best - 110)):
            best = bpm
    return best or 110.0


def bed(cfg):
    N = int(round(cfg["frames"] / FPS * SR))
    s = lambda fr: fr / FPS * SR  # frames -> samples
    root = PC[cfg["key"]]
    bass_root = 33 + (root - 9) % 12  # A1 .. G#2
    I, VI, III, VII = 0, 8, 3, 10
    triad = lambda r: [(root + r) % 12, (root + r + (4 if r in (VI, III, VII) else 3)) % 12, (root + r + 7) % 12]
    prog_main = [I, VI, III, VII]
    prog_intro = [I, I, VI, VI]

    drop, cta = cfg["drop"], cfg["cta"]
    breaks = sorted(cfg["breaks"])
    # groove sections: [start, end) frame ranges where the beat plays
    groove, cur = [], drop
    for a, b in breaks:
        groove.append((cur, a))
        cur = b
    if cur < cta:
        groove.append((cur, cta))
    bpm = pick_tempo(groove[-1][1] - groove[-1][0])
    beat = 60 / bpm * SR
    bar = 4 * beat
    lift = cfg.get("lift") or cta

    buses = {k: np.zeros((N, 2)) for k in ("pad", "bass", "drums", "arp", "fx", "verb")}
    rev = reverb_ir()

    # intro: a dark pad and drone, bars counted back from the drop
    nb = int(np.ceil(s(drop) / bar)) + 1
    for j in range(nb):
        at = s(drop) - (nb - j) * bar
        ch = prog_intro[j % 4]
        place(buses["pad"], pad_chord(voicing(triad(ch)), bar / SR, attack=0.8, rel=1.5) * 0.9, at)
        place(buses["bass"], stereo(bass_note(bass_root + ch % 12 - (12 if ch % 12 > 6 else 0), bar / SR, 0.35, tau=1.2)), at)
        for q in range(4):  # the quiet pulse
            place(buses["drums"], kick(vel=0.22) if q % 2 == 0 else hat(vel=0.18, pan=0.2), at + q * beat)

    # groove sections
    for gi, (a, b) in enumerate(groove):
        nbars = int(np.ceil((s(b) - s(a)) / bar))
        for j in range(nbars):
            at = s(a) + j * bar
            ch = prog_main[j % 4]
            f_bar = at / SR * FPS
            hi = f_bar >= lift
            notes = voicing(triad(ch))
            place(buses["pad"], pad_chord(notes, bar / SR, attack=0.12, rel=1.0) * (1.0 if hi else 0.85), at)
            br = bass_root + ch % 12 - (12 if ch % 12 > 6 else 0)
            for e in range(8):  # eighth-note bass, root and octave on the last
                place(buses["bass"], stereo(bass_note(br + (12 if e == 7 else 0), beat / 2 / SR * 0.9, 0.9 if e % 2 == 0 else 0.7)), at + e * beat / 2)
            for q in range(4):
                bt = at + q * beat
                if q in (0, 2) or hi:
                    place(buses["drums"], kick(vel=1.0 if q in (0, 2) else 0.75), bt)
                if hi and q in (1, 3):
                    c = clap(0.55)
                    place(buses["drums"], c, bt); place(buses["verb"], c * 0.6, bt)
                for sub in range(4 if hi else 2):  # offbeat eighths, 16ths after the lift
                    if not hi and sub == 0:
                        continue
                    off = sub == (2 if hi else 1)
                    v = 0.6 if off else (0.3 if sub == 0 else 0.38)
                    place(buses["drums"], hat(open_=off and hi, vel=v, pan=0.25 if sub % 2 else -0.15), bt + sub * beat / (4 if hi else 2))
            if hi:  # 16th pluck arpeggio over the chord, up an octave
                arp = [m + 12 for m in notes] + [notes[1] + 24]
                for k16 in range(16):
                    pl = pluck(arp[(k16 * 3) % len(arp)], vel=0.55 if k16 % 4 == 0 else 0.35, pan=-0.4 if k16 % 2 else 0.4)
                    place(buses["arp"], pl, at + k16 * beat / 4)

    # the ping-pong delay on the arp: dotted eighth
    d = int(0.75 * beat)
    arp = buses["arp"]
    delayed = np.zeros_like(arp)
    fb = 0.38
    for k in range(1, 5):
        sh = k * d
        if sh >= N:
            break
        src = arp[:-sh].mean(axis=1) * fb ** k
        ch = k % 2
        delayed[sh:, ch] += src
    buses["arp"] = arp + filt(delayed, "low", 4000)

    # breaks: pad darker, a riser into the re-entry
    for a, b in breaks:
        L = min(s(b) - s(a), bar)
        place(buses["fx"], riser(L / SR) * 0.5, s(b) - L)
    # riser into the drop
    place(buses["fx"], riser((s(drop) - s(cfg["riser"])) / SR), s(cfg["riser"]))
    # into the CTA, unless a break already rises into it
    if not any(b == cta for _, b in breaks):
        place(buses["fx"], riser(bar / SR) * 0.6, s(cta) - bar)

    # impacts: the drop, each re-entry, the lift, the stabs, the CTA
    hits = [(drop, 1.0)] + [(b, 0.8) for _, b in breaks if b != cta] + [(cta, 1.0)]
    if cfg.get("lift") and all(abs(cfg["lift"] - h) > 6 for h, _ in hits):
        hits.append((cfg["lift"], 0.6))
    hits += [(f, 0.55) for f in cfg.get("stabs", [])]
    for f, v in hits:
        im = impact(v)
        place(buses["fx"], im, s(f))
        place(buses["verb"], im * 0.5, s(f))

    # CTA: the D major add9 bloom and a held bass D
    rest = (N - s(cta)) / SR
    place(buses["pad"], pad_chord(D_ADD9, rest, attack=0.05, rel=0.01, spread=0.9) * 1.2, s(cta))
    place(buses["bass"], stereo(bass_note(38, rest, 0.8, tau=1.6)), s(cta))

    # gates: the beat stops in breaks and from the CTA; the pad opens with intensity
    t_fr = np.arange(N) / SR * FPS
    gate = np.zeros(N)
    for a, b in groove:
        gate[(t_fr >= a) & (t_fr < b)] = 1
    gate = signal.filtfilt(*signal.butter(1, 30, fs=SR), gate)  # ~5 ms edges
    intro_bass = (t_fr < drop).astype(float)
    cta_on = (t_fr >= cta).astype(float)
    for k in ("drums", "arp"):
        buses[k] *= np.maximum(gate, intro_bass * (k == "drums"))[:, None]
    buses["bass"] *= np.clip(gate + intro_bass + cta_on, 0, 1)[:, None]

    # pad brightness: dark intro and breaks, open in the groove, brightest after lift / CTA
    dark = filt(buses["pad"], "low", 650)
    mid = filt(buses["pad"], "low", 1700)
    bright = filt(buses["pad"], "low", 3200)
    lv = np.where(t_fr >= cta, 2, np.where(t_fr >= lift, 2, 1)) * gate + cta_on * 2
    lv = signal.filtfilt(*signal.butter(1, 2, fs=SR), np.clip(lv, 0, 2))
    w0, w2 = np.clip(1 - lv, 0, 1), np.clip(lv - 1, 0, 1)
    w1 = 1 - w0 - w2
    pad = dark * w0[:, None] + mid * w1[:, None] + bright * w2[:, None]
    pad = filt(pad, "high", 140)
    buses["verb"] += pad * 0.35 + buses["arp"] * 0.3

    # kick side-chain pump on bass and pad (the reels' breathing)
    pump = np.ones(N)
    for a, b in groove:
        n_beats = int((s(b) - s(a)) / beat) + 1
        for q in range(n_beats):
            i = int(s(a) + q * beat)
            k = np.arange(min(int(beat), N - i)) / SR
            if len(k) > 0:
                pump[i:i + len(k)] = np.minimum(pump[i:i + len(k)], 1 - 0.35 * np.exp(-k / 0.09))
    buses["bass"] = filt(buses["bass"], "low", 420) * pump[:, None]
    pad = pad * pump[:, None]

    wet = convolve(buses["verb"], rev)
    mix = {
        "pad": pad * 0.55,
        "bass": buses["bass"] * 0.55,
        "drums": filt(buses["drums"], "high", 30) * 1.0,
        "arp": filt(buses["arp"], "high", 300) * 0.35,
        "fx": buses["fx"] * 0.6,
        "verb": filt(wet, "high", 200) * 0.25,
    }
    out = sum(mix.values())
    out *= fade(N, 0.4)[:, None] * fade(N, 1.5, out=True)[:, None]
    return out, bpm, groove, mix


def treat_voice(name, N):
    # a 2:1 compressor lifts sibilants relative to vowels, so a de-esser follows it
    chain = ("highpass=f=80:poles=2,equalizer=f=280:t=q:w=1:g=-2.5,equalizer=f=3000:t=q:w=1.2:g=2,"
             "acompressor=threshold=0.2:ratio=2:attack=15:release=150,deesser=i=0.5")
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(VOICE_DIR / f"{name}.mp3"), "-af", chain,
                                   "-ar", str(SR), "-ac", "1", "-f", "f32le", "-"])
    v = np.frombuffer(raw, np.float32).astype(np.float64)
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    st = stereo(v) / np.sqrt(2)  # centre, unity per channel
    room = convolve(filt(st, "high", 300), reverb_ir(rt60=0.45, pre=0.014, tone=5000))
    out = st + room * 10 ** (-19 / 20)
    return out * 10 ** ((VOICE_LUFS - lufs(out)) / 20), v


def duck_gain(v):
    """Side-chain from the voice: depth DUCK_DB while a word is spoken."""
    e = np.sqrt(signal.lfilter([1 - np.exp(-1 / (0.01 * SR))], [1, -np.exp(-1 / (0.01 * SR))], v ** 2))
    edb = 20 * np.log10(e + 1e-9)
    act = (edb > edb.max() - 32).astype(float)
    look = int(0.06 * SR)
    act = np.concatenate([act[look:], np.zeros(look)])  # duck a little before the word
    # hold through the small gaps inside a phrase (150 ms)
    from scipy.ndimage import maximum_filter1d
    act = maximum_filter1d(act, int(0.15 * SR), origin=-int(0.07 * SR))
    target = act * DUCK_DB
    att, rel = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.35 * SR))
    # attack/release follower (vectorised in blocks of constant direction would be complex; loop in chunks)
    g = np.empty_like(target)
    y = 0.0
    for i in range(0, len(target), 480):  # 10 ms control rate
        tv = target[i:i + 480].max()
        c = att ** 480 if tv > y else rel ** 480
        y = tv + (y - tv) * c
        g[i:i + 480] = y
    g = signal.filtfilt(*signal.butter(1, 40, fs=SR), g)
    return 10 ** (-g / 20), act


def build(film, cfg, stems=None):
    N = int(round(cfg["frames"] / FPS * SR))
    voice, vmono = treat_voice(cfg.get("voice", film), N)
    music, bpm, groove, _ = bed(cfg)
    # the bed's level, set on its groove sections before ducking
    sel = np.zeros(N, bool)
    for a, b in groove:
        sel[int(a / FPS * SR): int(b / FPS * SR)] = True
    music *= 10 ** ((BED_LUFS - lufs(music[sel])) / 20)
    g, act = duck_gain(vmono)  # the full DUCK_DB as a gain curve
    dry = music.copy()
    # split at 180 Hz (zero-phase, so low + rest == music): the voice lives
    # above it, so that part ducks the full depth and the kick and sub only
    # LOW_DUCK of it, keeping the pulse and the weight under the words
    low = signal.sosfiltfilt(sos("low", 180, 4), music, axis=0)
    top = signal.sosfiltfilt(sos("high", 6000, 4), music - low, axis=0)
    music = low * (g ** LOW_DUCK)[:, None] + (music - low - top) * g[:, None] + top * (g ** TOP_DUCK)[:, None]
    score = limit(voice + music, SCORE_TP)
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"score-{film}.mp3"
    pcm = (np.clip(score, -1, 1) * 32767).astype("<i2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "libmp3lame", "-b:a", "160k", str(path)], input=pcm.tobytes(), check=True)
    if stems:
        sd = pathlib.Path(stems); sd.mkdir(parents=True, exist_ok=True)
        for nm, x in (("voice", voice), ("bed", music), ("bed-dry", dry)):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(sd / f"{film}-{nm}.wav")],
                           input=x.astype("<f4").tobytes(), check=True)
    print(f"  {film:15s} {cfg['key']:>2} minor {bpm:5.1f} BPM  score {lufs(score):5.1f} LUFS  TP {true_peak_db(score):5.1f} dB"
          f"  -> {path.relative_to(ROOT)} ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("only", nargs="?")
    ap.add_argument("--stems")
    a = ap.parse_args()
    for film, cfg in FILMS.items():
        if a.only and a.only not in film:
            continue
        rng = np.random.default_rng(SEED)  # each film byte-stable on its own
        globals()["rng"] = rng
        build(film, cfg, a.stems)
