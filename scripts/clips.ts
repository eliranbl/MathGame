// Writes the list of voice clips the game needs (id + text) for gen_audio.py.
import { writeFileSync } from 'node:fs';
import { allClips } from '../src/audio/catalog';
import { clipId } from '../src/audio/clipId';

const list = allClips().map((text) => ({ id: clipId(text), text }));
writeFileSync('scripts/clips.json', JSON.stringify(list, null, 1));
console.log(`${list.length} clips`);
