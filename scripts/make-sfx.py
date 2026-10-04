#!/usr/bin/env python3
"""
Synthesises the films' sound effects into remotion/sfx/ (48 kHz, 16-bit WAV).

    python3 scripts/make-sfx.py

Every sound is made here from sine waves and filtered noise, so there is no
sample library and no licence to track. Needs only numpy. The character is a
calm launch film: soft, warm, tactile; nothing bright, nothing cartoonish.
Each file is peak-normalised to -3 dBFS; the film mix sets the real level
per cue (remotion/sound.jsx, LEVEL), so a file can be reshaped here without
touching the mix.

    click       soft UI tap under the pointer's click pulse (~45 ms + room)
    tick        tiny glassy tick when a chip pill lands, quieter than click
    whoosh      air sweep with a rising band: camera pushes, windows arriving
    whoosh-down the same air with a falling band: windows receding, leaving
    thump       deep, rounded hit under a kinetic line's first word
    endtone     warm open chord that blooms as "Book a free call" lands
"""
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), '..', 'remotion', 'sfx')
rng = np.random.default_rng(20261002)  # fixed seed: regenerating is byte-stable


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def biquad(x, kind, f0, q=0.707):
    """RBJ cookbook biquad (lowpass, highpass, bandpass)."""
    w = 2 * np.pi * f0 / SR
    a = np.sin(w) / (2 * q)
    c = np.cos(w)
    if kind == 'lp':
        b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
    elif kind == 'hp':
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    else:  # constant 0 dB peak band-pass
        b = [a, 0, -a]
    den = [1 + a, -2 * c, 1 - a]
    b = [v / den[0] for v in b]
    a1, a2 = den[1] / den[0], den[2] / den[0]
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i, xi in enumerate(x):
        yi = b[0] * xi + b[1] * x1 + b[2] * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, xi, y1, yi
        y[i] = yi
    return y


def sweep_bandpass(x, fc, q):
    """Chamberlin state-variable band-pass whose centre follows fc[n]."""
    y = np.zeros_like(x)
    low = band = 0.0
    damp = 1.0 / q
    for i, xi in enumerate(x):
        f = 2 * np.sin(np.pi * fc[i] / SR)
        low += f * band
        high = xi - low - damp * band
        band += f * high
        y[i] = band
    return y


def pink(n):
    """Pink-ish noise: white noise shaped to -3 dB/octave in the spectrum."""
    spec = np.fft.rfft(rng.standard_normal(n))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    freqs[0] = freqs[1]
    spec /= np.sqrt(freqs)
    out = np.fft.irfft(spec, n)
    return out / np.max(np.abs(out))


def room(sig, rt60=0.5, wet=0.15, predelay=0.008, tone=3500):
    """A small soft room: convolution with decaying, darkened stereo noise."""
    n = int(rt60 * 1.2 * SR)
    tt = np.arange(n) / SR
    decay = np.exp(-6.9 * tt / rt60)
    pre = int(predelay * SR)
    out = []
    for ch in range(2):
        ir = rng.standard_normal(n) * decay
        ir = biquad(ir, 'lp', tone)
        ir[:pre] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        dry = sig[:, ch] if sig.ndim == 2 else sig
        m = len(dry) + n
        k = 1 << int(np.ceil(np.log2(m)))
        r = np.fft.irfft(np.fft.rfft(dry, k) * np.fft.rfft(ir, k), k)[:m]
        out.append(np.concatenate([dry, np.zeros(n)]) + wet * r)
    return np.stack(out, axis=1)


def fade_out(sig, sec):
    n = int(sec * SR)
    env = np.cos(np.linspace(0, np.pi / 2, n)) ** 2
    sig = sig.copy()
    sig[-n:] = (sig[-n:].T * env).T
    return sig


def trim(sig, sec):
    return sig[: int(sec * SR)]


def write(name, sig, peak_db=-3.0, soften=0.0):
    """soften > 0 rounds off the few loudest peaks with a tanh curve before
    normalising: noise and taps have a high crest factor, and shaving it
    lets them sit at the target loudness with true-peak headroom. The
    curve only bends the top few dB, so nothing audible changes."""
    sig = np.asarray(sig, dtype=np.float64)
    sig = sig - (np.mean(sig, axis=0) if sig.ndim == 2 else np.mean(sig))  # no DC
    if soften:
        sig = np.tanh(soften * sig / np.max(np.abs(sig))) / np.tanh(soften)
    sig *= 10 ** (peak_db / 20) / np.max(np.abs(sig))
    pcm = np.round(sig * 32767).astype('<i2')
    ch = 1 if pcm.ndim == 1 else pcm.shape[1]
    path = os.path.join(OUT, f'{name}.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{name:12s} {len(pcm) / SR * 1000:6.0f} ms  {ch} ch  {os.path.getsize(path) // 1024} KB')


def soft_attack(t, sec):
    return np.where(t < sec, np.sin(np.pi / 2 * np.clip(t / sec, 0, 1)) ** 2, 1.0)


# ---------------------------------------------------------------- click
def click():
    """A rounded 'tock': a short pitched body gliding down, a low knock for
    warmth and a breath of filtered air for the touch. No hard transient."""
    t = t_axis(0.06)
    att = soft_attack(t, 0.0012)
    f = 820 + 380 * np.exp(-t / 0.004)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.0085)
    knock = 0.55 * np.sin(2 * np.pi * 230 * t) * np.exp(-t / 0.014)
    air = biquad(rng.standard_normal(len(t)), 'bp', 3200, 0.9) * np.exp(-t / 0.0025) * 0.35
    sig = (body + knock + air) * att
    sig = biquad(sig, 'lp', 5200)
    sig = room(sig, rt60=0.22, wet=0.10, tone=3000)
    return fade_out(trim(sig, 0.16), 0.06)


# ---------------------------------------------------------------- tick
def tick():
    """Glass: three inharmonic partials, the top ones dying first."""
    t = t_axis(0.05)
    att = soft_attack(t, 0.0007)
    parts = [(1980, 1.0, 0.018), (3130, 0.35, 0.008), (4520, 0.1, 0.004)]  # was 2640 Hz: softer under the bed
    sig = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, a, tau in parts) * att
    sig = biquad(sig, 'hp', 900)
    sig = room(sig, rt60=0.35, wet=0.22, tone=5000)
    return fade_out(trim(sig, 0.2), 0.08)


# ---------------------------------------------------------------- whooshes
def whoosh(rising=True):
    """Filtered pink noise through a band that sweeps across the sound, a
    gentle swell in and a longer fall out, drifting slightly across the
    stereo field. Kept low-mid so it reads as air, not hiss."""
    dur = 0.46 if rising else 0.5
    t = t_axis(dur)
    n = len(t)
    u = t / dur
    if rising:
        fc = 320 * (1900 / 320) ** (u ** 1.3)
        peak = 0.42
    else:
        fc = 1700 * (300 / 1700) ** (u ** 0.8)
        peak = 0.3
    rise = np.sin(np.pi / 2 * np.clip(u / peak, 0, 1)) ** 2
    fall = np.cos(np.pi / 2 * np.clip((u - peak) / (1 - peak), 0, 1)) ** 2
    env = np.where(u < peak, rise, fall)
    common = pink(n)
    chans = []
    for side in (-1, 1):
        src = 0.55 * common + 0.45 * pink(n)  # half shared: wide, still not phasey
        band = sweep_bandpass(src, fc, 1.6)
        band = biquad(band, 'lp', 4200)
        band = biquad(band, 'hp', 140)
        pan = 0.5 + 0.4 * side * (u - 0.5) * (1 if rising else -1)  # travels across the field
        chans.append(band * env * np.sqrt(np.clip(pan, 0, 1)))
    return np.stack(chans, axis=1)


# ---------------------------------------------------------------- thump
def thump():
    """A deep, rounded hit: a sine that settles from 88 to 44 Hz, gently
    saturated so laptop and phone speakers still hear its upper harmonics,
    a soft knock of dark noise on the front, and a short stereo room so it
    sits in the same space as the music bed's impacts."""
    t = t_axis(0.7)
    f = 44 + 44 * np.exp(-t / 0.045)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = soft_attack(t, 0.006) * np.exp(-t / 0.18)
    sig = np.tanh(2.0 * tone * env) / np.tanh(2.0)
    knock = biquad(pink(len(t)), 'lp', 600) * soft_attack(t, 0.003) * np.exp(-t / 0.03) * 0.3
    sig = biquad(sig + knock, 'lp', 1100)
    sig = room(sig, rt60=0.6, wet=0.12, tone=1800)
    return fade_out(trim(sig, 0.7), 0.15)


# ---------------------------------------------------------------- end tone
def endtone():
    """An open D major add9 (D3 A3 D4 F#4 A4 E5), strummed over 70 ms like a
    hand across soft keys. Each voice is a warm additive tone (the upper
    partials fade first, so it darkens as it decays) with a slow bloom pad
    under it, a hair of detune between left and right, in a soft room."""
    dur = 2.4
    t = t_axis(dur)
    notes = [146.83, 220.00, 293.66, 369.99, 440.00, 659.26]
    amps = [0.85, 0.7, 0.55, 0.48, 0.42, 0.26]
    pans = [0.5, 0.38, 0.62, 0.32, 0.68, 0.55]
    partials = [(1, 1.0, 1.0), (2, 0.32, 0.5), (3, 0.1, 0.3), (4.01, 0.04, 0.2)]
    sig = np.zeros((len(t), 2))
    for k, (f0, a, p) in enumerate(zip(notes, amps, pans)):
        off = int(k * 0.014 * SR)
        tt = t[: len(t) - off]
        tau = 0.44 * (220 / f0) ** 0.25  # higher notes ring a little shorter
        voice = np.zeros((len(tt), 2))
        for ch, cents in enumerate((-1.6, 1.6)):
            ff = f0 * 2 ** (cents / 1200)
            v = sum(pa * np.sin(2 * np.pi * ff * r * tt + k) * np.exp(-tt / (tau * td)) for r, pa, td in partials)
            v = v * soft_attack(tt, 0.02)
            bloom = 0.22 * np.sin(2 * np.pi * ff * tt) * soft_attack(tt, 0.16) * np.exp(-tt / 0.55)
            voice[:, ch] = (v + bloom) * a * (np.sqrt(1 - p) if ch == 0 else np.sqrt(p))
        sig[off:] += voice
    for ch in range(2):
        sig[:, ch] = biquad(sig[:, ch], 'lp', 4200)
    sig = room(sig, rt60=1.1, wet=0.28, predelay=0.018, tone=3200)
    return fade_out(trim(sig, dur), 0.5)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    write('click', click(), soften=1.6)
    write('tick', tick())
    write('whoosh', whoosh(True), soften=2.2)
    write('whoosh-down', whoosh(False), soften=2.2)
    write('thump', thump())
    write('endtone', endtone())
