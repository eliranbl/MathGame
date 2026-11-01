import { describe, expect, it } from 'vitest';
import { generateQuestion } from '../engine/generator';
import { ALL_LEVELS } from '../engine/levels';
import { generateReadingQuestion } from '../engine/reading/generator';
import { allClips } from './catalog';
import { clipId } from './clipId';
import { toClips, type Speech } from './speech';

describe('voice clips', () => {
  const clips = new Set(allClips());

  it('covers everything the generators say', () => {
    const check = (speech: Speech) =>
      toClips(speech).forEach((c) => typeof c === 'string' && expect(clips.has(c), c).toBe(true));
    for (const level of ALL_LEVELS) {
      for (let i = 0; i < 500; i++) {
        const d = Math.random();
        const q = level.world === 'math' ? generateQuestion(level, d) : generateReadingQuestion(level, d);
        check(q.speak);
        check(q.revealSpeak);
        if (q.world === 'reading') check(q.hintSpeak);
      }
    }
  });

  it('has a recorded file for every clip', () => {
    const files = new Set(Object.keys(import.meta.glob('/public/audio/*.mp3')));
    const missing = [...clips].filter((c) => !files.has(`/public/audio/${clipId(c)}.mp3`));
    expect(missing).toEqual([]);
  });

  it('gives every clip its own file name', () => {
    expect(new Set([...clips].map(clipId)).size).toBe(clips.size);
  });
});
