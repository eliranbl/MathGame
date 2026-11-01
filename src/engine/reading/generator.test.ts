import { toClips } from '../../audio/speech';
import { describe, expect, it } from 'vitest';
import { READING_LEVELS } from '../levels';
import { generateReadingQuestion } from './generator';
import { LETTER_NAMES, LETTERS, WORDS, firstLetterOf, lookAlikes, plainOf, soundAlikes, stripNikud } from './words';

const DIFFICULTIES = [0, 0.3, 0.6, 1];

describe('word bank', () => {
  it('has unique words and emoji', () => {
    expect(new Set(WORDS.map(plainOf)).size).toBe(WORDS.length);
    expect(new Set(WORDS.map((w) => w.emoji)).size).toBe(WORDS.length);
  });

  it('starts every word with a known letter', () => {
    for (const w of WORDS) expect(LETTERS).toContain(firstLetterOf(w));
  });

  it('has a name for every letter', () => {
    for (const l of LETTERS) expect(stripNikud(LETTER_NAMES[l])[0]).toBe(l);
  });
});

describe('generateReadingQuestion', () => {
  for (const level of READING_LEVELS) {
    it(`level ${level.id} (${level.kind}) produces valid questions`, () => {
      for (const difficulty of DIFFICULTIES) {
        const count = difficulty >= 0.5 ? level.choicesHard : level.choicesEasy;
        for (let i = 0; i < 1000; i++) {
          const q = generateReadingQuestion(level, difficulty);
          expect(q.kind).toBe(level.kind);
          expect(toClips(q.speak).length).toBeGreaterThan(0);

          if (q.spell) {
            expect(q.spell.letters.join('')).toBe(q.answer);
            for (const l of q.spell.letters) expect(q.spell.tiles).toContain(l);
            expect(q.spell.tiles.length).toBeGreaterThanOrEqual(q.spell.letters.length);
            expect(WORDS.map(plainOf)).toContain(q.answer);
            continue;
          }

          expect(q.choices).toContain(q.answer);
          expect(q.choices.length).toBe(count);
          expect(new Set(q.choices).size).toBe(q.choices.length);

          if (q.kind === 'firstLetter') {
            const word = WORDS.find((w) => w.emoji === q.prompt.emoji)!;
            expect(firstLetterOf(word)).toBe(q.answer);
            // No choice may sound like the right answer.
            for (const c of q.choices) if (c !== q.answer) expect(soundAlikes(q.answer)).not.toContain(c);
          }
          if (q.kind === 'letterToPicture') {
            const word = WORDS.find((w) => w.emoji === q.answer)!;
            expect(firstLetterOf(word)).toBe(q.prompt.letter);
            for (const c of q.choices) {
              if (c === q.answer) continue;
              const first = firstLetterOf(WORDS.find((w) => w.emoji === c)!);
              expect(first).not.toBe(q.prompt.letter);
              expect(soundAlikes(q.prompt.letter!)).not.toContain(first);
            }
          }
          if (q.kind === 'similarLetter') {
            const tricky = q.choices.filter((c) => lookAlikes(q.answer).includes(c));
            expect(tricky.length).toBeGreaterThan(0);
          }
          if (q.kind === 'readWord') {
            expect(WORDS.find((w) => w.nikud === q.prompt.word)!.emoji).toBe(q.answer);
          }
          if (q.kind === 'findWord') {
            expect(WORDS.find((w) => w.emoji === q.prompt.emoji)!.nikud).toBe(q.answer);
          }
          if (q.kind === 'syllable') {
            for (const c of q.choices) expect(stripNikud(c).length).toBeLessThanOrEqual(2);
          }
        }
      }
    });
  }

  it('keeps short words for easy rounds', () => {
    const level = READING_LEVELS.find((l) => l.kind === 'readWord')!;
    for (let i = 0; i < 300; i++) {
      const q = generateReadingQuestion(level, 0);
      expect(stripNikud(q.prompt.word!).length).toBeLessThanOrEqual(3);
    }
  });

  it('avoids recently seen questions', () => {
    for (const level of READING_LEVELS) {
      for (let i = 0; i < 100; i++) {
        const recent = Array.from({ length: 5 }, () => generateReadingQuestion(level, 0.5).key);
        expect(recent).not.toContain(generateReadingQuestion(level, 0.5, recent).key);
      }
    }
  });
});
