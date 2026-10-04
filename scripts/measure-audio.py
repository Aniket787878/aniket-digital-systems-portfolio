#!/usr/bin/env python3
"""Objective sound checks for the films (we cannot listen in CI, so measure).

  python3 scripts/measure-audio.py public/videos/explainers/explainer-brand.mp4 ...
  python3 scripts/measure-audio.py --json out.json FILE...   # also dump numbers
  python3 scripts/make-music.py brand --stems /tmp/stems
  python3 scripts/measure-audio.py --voice /tmp/stems/brand-voice.wav --music /tmp/stems/brand-bed.wav \
      --music-dry /tmp/stems/brand-bed-dry.wav FILE

Per file: integrated loudness, LRA and true peak (ffmpeg ebur128), the
spectrum split into five bands, stereo width, how continuous the bed is
(quiet-floor of the 400 ms loudness vs its median), tempo and pulse clarity
(librosa), onset density, and, around each picture cut (ffmpeg scene
detection), whether a transient lands on it and whether energy rises into it.

Speech activity comes from --voice (a voice stem: exact) or, for a finished
mix like a reference reel, from faster-whisper word timestamps (pip install
faster-whisper librosa). With --music (the bed stem as played) the script
also reports how far the bed sits under speech.
"""
import argparse, json, re, subprocess, sys
import numpy as np
from scipy import signal

SR = 48000
BANDS = [("sub", 20, 60), ("bass", 60, 250), ("lowmid", 250, 2000), ("presence", 2000, 6000), ("air", 6000, 16000)]


def decode(path, ch=2):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, ch)


def ebur(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    tail = out[out.rfind("Summary:"):]
    g = lambda k: float(re.search(k + r":\s+(-?[\d.]+|-inf)", tail).group(1).replace("-inf", "-99"))
    return g(r"I"), g(r"LRA"), g(r"Peak")


def bandpass(x, lo, hi):
    sos = signal.butter(4, [lo, min(hi, SR / 2 - 100)], btype="band", fs=SR, output="sos")
    return signal.sosfiltfilt(sos, x)


def env_db(x, win=0.4, hop=0.1):
    w, h = int(win * SR), int(hop * SR)
    n = max(1, (len(x) - w) // h)
    p = np.array([np.mean(x[i * h:i * h + w] ** 2) for i in range(n)])
    return 10 * np.log10(p + 1e-12)


def speech_from_voice(path):
    v = decode(path, 1)[:, 0]
    e = env_db(v, 0.05, 0.01)
    act = e > (e.max() - 35)
    return act, 0.01


def speech_from_asr(path):
    from faster_whisper import WhisperModel
    m = WhisperModel("tiny.en", device="cpu", compute_type="int8")
    segs, _ = m.transcribe(path, vad_filter=True, word_timestamps=True)
    words = [(w.start, w.end) for s in segs for w in (s.words or [])]
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]))
    act = np.zeros(int(dur / 0.01) + 1, bool)
    for a, b in words:
        act[int(a / 0.01):int(b / 0.01) + 1] = True
    return act, 0.01


def cuts(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-an", "-vf", "select='gt(scene,0.25)',showinfo", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    t = [float(x) for x in re.findall(r"pts_time:([\d.]+)", out)]
    keep = []  # a dissolve fires on several frames: keep the first of a run
    for x in t:
        if not keep or x - keep[-1] > 0.5:
            keep.append(x)
    return keep


def measure(path, voice=None, music=None, music_dry=None):
    import librosa
    r = {"file": path}
    r["I"], r["LRA"], r["TP"] = ebur(path)
    st = decode(path, 2)
    L, R = st[:, 0].astype(np.float64), st[:, 1].astype(np.float64)
    mono = (L + R) / 2
    side = (L - R) / 2
    r["dur"] = round(len(mono) / SR, 2)
    r["width_dB"] = round(10 * np.log10(np.mean(side ** 2) / (np.mean(mono ** 2) + 1e-12) + 1e-12), 1)  # side vs mid
    f, p = signal.welch(mono, SR, nperseg=8192)
    tot = p[(f >= 20) & (f < 16000)].sum()
    for name, lo, hi in BANDS:
        r[name + "%"] = round(100 * p[(f >= lo) & (f < hi)].sum() / tot, 1)
    e = env_db(mono)
    r["floor_dB"] = round(np.percentile(e, 10) - np.median(e), 1)  # near 0 = continuous bed; very negative = gaps of silence
    r["silent%"] = round(100 * np.mean(e < -55), 1)
    y = librosa.resample(mono.astype(np.float32), orig_sr=SR, target_sr=22050)
    oenv = librosa.onset.onset_strength(y=y, sr=22050)
    tempo, _ = librosa.beat.beat_track(onset_envelope=oenv, sr=22050)
    r["tempo"] = round(float(np.atleast_1d(tempo)[0]), 1)
    ac = librosa.autocorrelate(oenv - oenv.mean())
    ac = ac / (ac[0] + 1e-12)
    fps = 22050 / 512
    r["pulse"] = round(float(ac[int(0.3 * fps):int(1.0 * fps)].max()), 2)  # 0 none .. ~0.5+ steady beat
    on = librosa.onset.onset_detect(onset_envelope=oenv, sr=22050, units="time")
    r["onsets/s"] = round(len(on) / r["dur"], 2)
    # picture cuts: a hit on the cut (onset strength within +-150 ms vs median) and a rise into it
    hp = env_db(bandpass(mono, 2000, 12000), 0.1, 0.05)
    hits, rises = [], []
    for c in cuts(path):
        i = int(c * fps)
        w = oenv[max(0, i - 6):i + 7]
        if len(w):
            hits.append(w.max() / (np.median(oenv) + 1e-9))
        j = int(c / 0.05)
        if j - 20 >= 0 and j < len(hp):
            rises.append(hp[j - 2] - hp[j - 20])
    r["cuts"] = len(hits)
    r["cut_hit_x"] = round(float(np.median(hits)), 1) if hits else None
    r["cut_rise_dB"] = round(float(np.median(rises)), 1) if rises else None
    act, step = speech_from_voice(voice) if voice else speech_from_asr(path)
    r["speech%"] = round(100 * act.mean(), 1)
    # sub band (30-90 Hz, almost no voice) in vs out of speech: the mix-level duck
    sub = env_db(bandpass(mono, 30, 90), 0.2, step)
    n = min(len(sub), len(act))
    sp, ns = sub[:n][act[:n]], sub[:n][~act[:n]]
    r["sub_duck_dB"] = round(float(np.median(ns) - np.median(sp)), 1) if len(sp) and len(ns) else None
    if voice and music:
        v = decode(voice, 1)[:, 0]
        m = decode(music, 1)[:, 0]
        k = min(len(v), len(m))
        ve, me = env_db(v[:k], 0.2, step), env_db(m[:k], 0.2, step)
        n = min(len(ve), len(me), len(act))
        a = act[:n]
        r["voice_over_music_dB"] = round(float(np.median(ve[:n][a] - me[:n][a])), 1)
        if music_dry:  # the bed before and after its side-chain, over the spoken frames
            d = env_db(decode(music_dry, 1)[:k, 0], 0.2, step)[:n]
            r["music_duck_dB"] = round(float(np.median(d[a] - me[:n][a])), 1)
            dv = env_db(bandpass(decode(music_dry, 1)[:k, 0], 300, 4000), 0.2, step)[:n]
            mv = env_db(bandpass(m[:k], 300, 4000), 0.2, step)[:n]
            r["vband_duck_dB"] = round(float(np.median(dv[a] - mv[a])), 1)  # 300 Hz - 4 kHz, where the words are
        else:  # confounded by the arrangement (intro, breaks), but needs no dry stem
            r["music_duck_dB"] = round(float(np.median(me[:n][~a]) - np.median(me[:n][a])), 1)
    return r


COLS = ["I", "LRA", "TP", "sub%", "bass%", "lowmid%", "presence%", "air%", "width_dB", "floor_dB", "silent%", "tempo", "pulse",
        "onsets/s", "cuts", "cut_hit_x", "cut_rise_dB", "speech%", "sub_duck_dB", "voice_over_music_dB", "music_duck_dB", "vband_duck_dB"]

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--voice")
    ap.add_argument("--music")
    ap.add_argument("--music-dry")
    ap.add_argument("--json")
    a = ap.parse_args()
    rows = [measure(f, a.voice, a.music, a.music_dry) for f in a.files]
    print("file".ljust(28) + " ".join(c[:9].rjust(9) for c in COLS))
    for r in rows:
        print(r["file"].split("/")[-1][:27].ljust(28) + " ".join(str(r.get(c, "")).rjust(9) for c in COLS))
    if a.json:
        json.dump(rows, open(a.json, "w"), indent=1)
