#!/usr/bin/env python3
"""Voiceover for the four explainer films -> remotion/voice/<film>.mp3.

Each line is spoken by en-IN-PrabhatNeural (edge-tts, needs internet), placed
at its scene's start second, and the lines are mixed into one mono track the
length of the film. A line that would run into the next one is sped up
(atempo, max 1.18) and the script fails if it still does not fit.

  pip install edge-tts   # once
  python3 scripts/make-voice.py           # all films
  python3 scripts/make-voice.py ops       # one film

Seconds are the on-screen scene starts from remotion/explainers/*.jsx at
30 fps; if a scene moves, change its second here and re-run.
"""
import asyncio, subprocess, sys, tempfile, pathlib
import edge_tts

VOICE, RATE = "en-IN-PrabhatNeural", "+12%"
OUT = pathlib.Path(__file__).resolve().parent.parent / "remotion" / "voice"

FILMS = {
  "brand": (57.5, [
    (0.3, "Your business runs on… WhatsApp? Spreadsheets? Sticky notes? Memory?"),
    (8.0, "Every enquiry, re-typed by hand. Hours gone. Leads gone cold. So… what if it ran itself?"),
    (17.0, "Picture this. A message lands. It's sorted, answered, and on your calendar. In seconds. While you sleep."),
    (29.5, "And these aren't mock-ups. One shared inbox. Consent forms, signed and sealed. Leads, scored and tracked. Real screens, running real businesses."),
    (42.3, "Twelve hundred clients. Eleven therapists. Five live systems."),
    (48.0, "Want your business to run itself? Book a free call."),
  ]),
  "ops-sprint": (30.4, [
    (0.2, "Eleven oh four. New enquiry. Team asleep."),
    (4.0, "A lead fills in your form. Boom, a WhatsApp reply goes out. Instantly."),
    (11.2, "They land in your client list. Your team gets a heads-up."),
    (16.3, "Next morning, a gentle reminder. Then day three, day seven. It stops when they book."),
    (25.3, "Zero chasing. Book a free call."),
  ]),
  "ai-assistant": (30.0, [
    (0.2, "Same questions. Every single day."),
    (3.1, "A question comes in. The assistant reads your own documents, then drafts the answer."),
    (13.4, "But it never sends alone. You approve with one tap."),
    (17.9, "Sent. Your words. Your say-so."),
    (23.5, "AI that helps, never takes over. Book a free call."),
  ]),
  "internal-tool": (30.1, [
    (0.3, "Still running on a spreadsheet?"),
    (3.2, "Final, version seven. Everyone edits it. Nobody trusts it."),
    (9.9, "Who changed this?!"),
    (12.2, "Now turn that mess into one clean tool. One source of truth."),
    (18.4, "Everyone sees exactly what they need."),
    (24.0, "No more guessing. Book a free call."),
  ]),
}

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))

async def tts(text, path):
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(path))

def trim(p):
    """Cut the silence edge-tts leaves at both ends of a clip."""
    q = p.with_name(p.stem + "-t.wav")
    cut = "silenceremove=start_periods=1:start_threshold=-45dB"
    subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", str(p), "-af", f"{cut},areverse,{cut},areverse", str(q)])
    return q

def build(name, total, lines, tmp):
    inputs, filt, ok = [], [], True
    for i, (start, text) in enumerate(lines):
        raw = tmp / f"{name}-{i}.mp3"
        asyncio.run(tts(text, raw))
        raw = trim(raw)
        room = (lines[i + 1][0] if i + 1 < len(lines) else total - 0.4) - start - 0.15
        d, tempo = dur(raw), 1.0
        if d > room:
            tempo = d / room
        status = "ok" if tempo == 1.0 else f"atempo {tempo:.2f}"
        if tempo > 1.18:
            ok = False; status += "  TOO LONG"
        print(f"  {name} {start:5.1f}s  {d:4.1f}s in {room:4.1f}s  {status}")
        inputs += ["-i", str(raw)]
        chain = f"atempo={tempo:.3f}," if tempo > 1.0 else ""
        filt.append(f"[{i}:a]{chain}aresample=48000,adelay={int(start*1000)}:all=1[a{i}]")
    n = len(lines)
    graph = ";".join(filt) + ";" + "".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,loudnorm=I=-16:TP=-2:LRA=7,apad=whole_dur={total}[o]"
    OUT.mkdir(parents=True, exist_ok=True)
    subprocess.check_call(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[o]", "-t", str(total), "-ac", "1", "-ar", "48000", "-b:a", "96k", str(OUT / f"{name}.mp3")])
    return ok

if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    good = True
    with tempfile.TemporaryDirectory() as t:
        for name, (total, lines) in FILMS.items():
            if only and only not in name: continue
            good &= build(name, total, lines, pathlib.Path(t))
    sys.exit(0 if good else 1)
