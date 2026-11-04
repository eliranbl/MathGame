"""Records every clip in scripts/clips.json into public/audio/: Hebrew sentences with a Hebrew voice, English letters and words with an English one.

Needs: pip install edge-tts. Existing files are kept, so only new sentences are recorded.
"""
import asyncio
import json
import os
import re

import edge_tts

VOICE = "he-IL-HilaNeural"
ENGLISH_VOICE = "en-US-AnaNeural"
# A lone English letter is over in a blink; a slower, clearer voice keeps B, V and M apart.
LETTER_VOICE = "en-US-AriaNeural"
LETTER_RATE = "-30%"
RATE = "-10%"
OUT = "public/audio"


async def record(clip, sem):
    path = os.path.join(OUT, f"{clip['id']}.mp3")
    if os.path.exists(path):
        return False
    async with sem:
        for attempt in range(3):
            try:
                text = clip["text"]
                if re.fullmatch("[A-Z]", text):
                    voice, rate = LETTER_VOICE, LETTER_RATE
                else:
                    voice, rate = (VOICE if re.search("[֐-׿]", text) else ENGLISH_VOICE), RATE
                await edge_tts.Communicate(text, voice, rate=rate).save(path)
                return True
            except Exception as e:  # network hiccups: retry
                if attempt == 2:
                    print("failed:", clip["text"], e)


async def main():
    os.makedirs(OUT, exist_ok=True)
    with open("scripts/clips.json", encoding="utf-8") as f:
        clips = json.load(f)
    wanted = {f"{c['id']}.mp3" for c in clips}
    for name in os.listdir(OUT):
        if name not in wanted:
            os.remove(os.path.join(OUT, name))
    sem = asyncio.Semaphore(6)
    made = await asyncio.gather(*(record(c, sem) for c in clips))
    print(f"recorded {sum(1 for m in made if m)} new, {len(clips)} total")


asyncio.run(main())
