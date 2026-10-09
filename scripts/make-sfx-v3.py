#!/usr/bin/env python3
"""The v3 films' new sound effects -> remotion/sfx/*.wav (48 kHz, 16-bit),
plus remotion/sfx/peaks-v3.json: where each effect (old and new) peaks, in
frames from its start, so remotion/cinematic/Sound3.jsx can place every
effect by its measured peak instead of its file start (shot list T9).

    python3 scripts/make-sfx-v3.py

Synthesised from sines and filtered noise with a fixed seed: no samples,
no licences. The existing effects (scripts/make-sfx.py) are not touched.

    pop     the pill changing shape: a soft rounded blip, pitch falling
    key     a very soft tap per word landing (mixed at about -24 dB)
    glass   the light sweep crossing a panel: a quiet high shimmer, 0.4 s
    flood   a low swell that peaks as the flood covers the frame, 0.3 s
    paper   a soft air swish for the paper flood
    strike  a dry scratch for a struck chip
    roll    fast ticking for the odometers, slowing into the last digit
"""
import json, pathlib, wave
import numpy as np
from scipy import signal

SR, FPS = 48000, 30
OUT = pathlib.Path(__file__).resolve().parent.parent / "remotion" / "sfx"
rng = np.random.default_rng(20261009)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def sweep_sine(f0, f1, sec, curve=1.0):
    t = t_axis(sec)
    fr = f0 * (f1 / f0) ** ((t / sec) ** curve)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR)


def room(x, rt=0.25, mix=0.12):
    n = int(rt * SR)
    ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n)
    ir = lp(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum())
    wet = np.pad(signal.fftconvolve(x, ir), (0, 1))[: len(x) + n]
    dry = np.pad(x, (0, n))
    return dry + wet * mix


def norm(x, peak_db=-3.0):
    x = x - x.mean()
    fade = min(len(x), int(0.004 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)
    return x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)


def pop():
    t = t_axis(0.16)
    body = sweep_sine(720, 380, 0.16, 0.5) * np.exp(-t / 0.045)
    sub = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.05) * 0.5
    click = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.002) * 0.15
    att = np.clip(t / 0.003, 0, 1)
    return room((body + sub + click) * att, 0.2, 0.1)


def key():
    t = t_axis(0.07)
    x = bp(rng.standard_normal(len(t)), 1800, 5000) * np.exp(-t / 0.008) * 0.6
    x += np.sin(2 * np.pi * 1300 * t) * np.exp(-t / 0.012) * 0.4
    return room(x * np.clip(t / 0.001, 0, 1), 0.12, 0.08)


def glass():
    t = t_axis(0.45)
    env = np.clip(t / 0.09, 0, 1) ** 2 * np.exp(-np.maximum(t - 0.09, 0) / 0.12)
    x = sum(np.sin(2 * np.pi * f * (1 + 0.002 * np.sin(2 * np.pi * 5 * t)) * t + rng.uniform(0, 6)) * a
            for f, a in ((2489, 0.5), (3729, 0.35), (4978, 0.25), (6272, 0.15)))
    air = bp(rng.standard_normal(len(t)), 5000, 11000) * 0.25
    return room((x + air) * env, 0.5, 0.25)


def flood():
    t = t_axis(0.42)
    rise = np.clip(t / 0.3, 0, 1) ** 2.2
    env = rise * np.exp(-np.maximum(t - 0.3, 0) / 0.05)
    n = rng.standard_normal(len(t))
    f, tt, Z = signal.stft(n, SR, nperseg=1024)
    fc = 180 * (1400 / 180) ** np.clip(tt / 0.3, 0, 1)
    Z *= np.exp(-0.5 * (np.log(np.maximum(f[:, None], 1) / fc[None, :]) / 0.6) ** 2)
    air = signal.istft(Z, SR, nperseg=1024)[1][: len(t)]
    air /= np.abs(air).max() + 1e-9
    low = sweep_sine(55, 90, 0.42) * 0.8
    return room((air * 0.7 + low) * env, 0.3, 0.12)


def paper():
    t = t_axis(0.4)
    env = np.sin(np.pi * np.clip(t / 0.38, 0, 1)) ** 2.5
    x = bp(rng.standard_normal(len(t)), 900, 4500) * env
    x += lp(rng.standard_normal(len(t)), 600) * env * 0.4
    return room(x, 0.25, 0.1)


def strike():
    t = t_axis(0.26)
    grains = (np.sin(2 * np.pi * 70 * t) > 0.2).astype(float)
    x = bp(rng.standard_normal(len(t)), 1800, 6500) * (0.4 + 0.6 * grains)
    env = np.clip(t / 0.01, 0, 1) * np.exp(-t / 0.12)
    return room(x * env, 0.15, 0.06)


def roll():
    t = t_axis(0.7)
    x = np.zeros(len(t))
    # ticks speeding up then slowing into the last digit (the roll curve)
    times = 0.62 * (1 - (1 - np.linspace(0, 1, 14)) ** 2.2)
    tick_t = t_axis(0.02)
    tick = (bp(rng.standard_normal(len(tick_t)), 2500, 7000) * 0.6 + np.sin(2 * np.pi * 2100 * tick_t) * 0.4) * np.exp(-tick_t / 0.003)
    for i, s in enumerate(times):
        a = int(s * SR)
        v = 0.55 + 0.45 * (i == len(times) - 1)
        x[a:a + len(tick)] += tick[: len(x) - a] * v
    return room(x, 0.1, 0.06)


def write(name, x):
    pcm = (np.clip(norm(x), -1, 1) * 32767).astype("<i2")
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def read(path):
    with wave.open(str(path)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float).reshape(-1, w.getnchannels()).mean(axis=1)
        return x, w.getframerate()


if __name__ == "__main__":
    for name, fn in (("pop", pop), ("key", key), ("glass", glass), ("flood", flood), ("paper", paper), ("strike", strike), ("roll", roll)):
        write(name, fn())
    peaks = {}
    for p in sorted(OUT.glob("*.wav")):
        x, sr = read(p)
        env = signal.lfilter([1 - np.exp(-1 / (0.01 * sr))], [1, -np.exp(-1 / (0.01 * sr))], np.abs(x))
        peaks[p.stem] = round(int(env.argmax()) / sr * FPS, 2)
    (OUT / "peaks-v3.json").write_text(json.dumps(peaks, indent=2) + "\n")
    print(json.dumps(peaks))
