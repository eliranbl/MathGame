import { toClips } from '../../audio/speech';
import { describe, expect, it } from 'vitest';
import { ENGLISH_LEVELS, READING_LEVELS } from '../levels';
import { ENGLISH, HEBREW, exampleWord, firstLetter } from './alphabet';
import { alphabetOf, generateReadingQuestion } from './generator';
import { LETTER_NAMES, LETTERS, stripNikud } from './words';

const DIFFICULTIES = [0, 0.3, 0.6, 1];

describe('word banks', () => {
  for (const abc of [HEBREW, ENGLISH]) {
    it(`${abc.lang}: has unique words and emoji`, () => {
      expect(new Set(abc.words.map(abc.plain)).size).toBe(abc.words.length);
      expect(new Set(abc.words.map((w) => w.emoji)).size).toBe(abc.words.length);
    });

    it(`${abc.lang}: starts every word with a known letter`, () => {
      for (const w of abc.words) expect(abc.letters).toContain(firstLetter(abc, w));
    });
  }

  it('has a name for every Hebrew letter', () => {
    for (const l of LETTERS) expect(stripNikud(LETTER_NAMES[l])[0]).toBe(l);
  });

  it('gives every English word a Hebrew meaning', () => {
    for (const w of ENGLISH.words) expect(w.meaning).toMatch(/[א-ת]/);
  });

  it('has an English example word for almost every letter', () => {
    const missing = ENGLISH.letters.filter((l) => !exampleWord(ENGLISH, l));
    expect(missing.length).toBeLessThanOrEqual(1);
  });
});

describe('generateReadingQuestion', () => {
  for (const level of [...READING_LEVELS, ...ENGLISH_LEVELS]) {
    const abc = alphabetOf(level);
    const findWord = (emoji: string) => abc.words.find((w) => w.emoji === emoji)!;

    it(`level ${level.id} (${level.kind}) produces valid questions`, () => {
      for (const difficulty of DIFFICULTIES) {
        const count = difficulty >= 0.5 ? level.choicesHard : level.choicesEasy;
        for (let i = 0; i < 1000; i++) {
          const q = generateReadingQuestion(level, difficulty);
          expect(q.kind).toBe(level.kind);
          expect(q.lang).toBe(abc.lang);
          expect(toClips(q.speak).length).toBeGreaterThan(0);

          if (q.spell) {
            expect(q.spell.letters.join('')).toBe(q.answer);
            for (const l of q.spell.letters) expect(q.spell.tiles).toContain(l);
            expect(q.spell.tiles.length).toBeGreaterThanOrEqual(q.spell.letters.length);
            expect(abc.words.map(abc.plain)).toContain(q.answer);
            continue;
          }

          expect(q.choices).toContain(q.answer);
          expect(q.choices.length).toBe(count);
          expect(new Set(q.choices).size).toBe(q.choices.length);

          if (q.kind === 'findLetter') {
            if (level.letters) expect(level.letters).toContain(q.answer);
            // Capital and small letters are never mixed in one question.
            const capital = q.answer !== q.answer.toLowerCase();
            for (const c of q.choices) expect(c !== c.toLowerCase()).toBe(capital);
          }
          if (q.kind === 'matchCase') {
            expect(q.prompt.letter).toBe(q.answer.toUpperCase());
            for (const c of q.choices) expect(c).toBe(c.toLowerCase());
          }
          if (q.kind === 'firstLetter') {
            expect(firstLetter(abc, findWord(q.prompt.emoji!))).toBe(q.answer);
            // No choice may sound like the right answer.
            for (const c of q.choices) if (c !== q.answer) expect(abc.soundAlikes(q.answer)).not.toContain(c);
          }
          if (q.kind === 'letterToPicture') {
            expect(firstLetter(abc, findWord(q.answer))).toBe(q.prompt.letter);
            for (const c of q.choices) {
              if (c === q.answer) continue;
              const first = firstLetter(abc, findWord(c));
              expect(first).not.toBe(q.prompt.letter);
              expect(abc.soundAlikes(q.prompt.letter!)).not.toContain(first);
            }
          }
          if (q.kind === 'similarLetter') {
            const tricky = q.choices.filter((c) => abc.lookAlikes(q.answer).includes(c));
            expect(tricky.length).toBeGreaterThan(0);
          }
          if (q.kind === 'listenWord') {
            expect(toClips(q.speak)).toContain(findWord(q.answer).text);
          }
          if (q.kind === 'readWord') {
            expect(abc.words.find((w) => w.text === q.prompt.word)!.emoji).toBe(q.answer);
          }
          if (q.kind === 'sayWord') {
            const word = abc.words.find((w) => w.text === q.prompt.word)!;
            expect(word.emoji).toBe(q.answer);
            expect(q.say).toBe(abc.plain(word));
          }
          if (q.kind === 'findWord') {
            expect(findWord(q.prompt.emoji!).text).toBe(q.answer);
          }
          if (q.kind === 'syllable') {
            for (const c of q.choices) expect(stripNikud(c).length).toBeLessThanOrEqual(2);
          }
        }
      }
    });
  }

  it('reaches the longest words on hard rounds', () => {
    for (const level of [...READING_LEVELS, ...ENGLISH_LEVELS].filter((l) => l.kind === 'readWord')) {
      const abc = alphabetOf(level);
      const longest = Math.max(...abc.words.map((w) => abc.plain(w).length));
      const seen = Array.from({ length: 2000 }, () => generateReadingQuestion(level, 1).prompt.word!);
      expect(Math.max(...seen.map((t) => abc.plain(abc.words.find((w) => w.text === t)!).length))).toBe(longest);
    }
  });

  it('keeps short words for easy rounds', () => {
    for (const level of [...READING_LEVELS, ...ENGLISH_LEVELS].filter((l) => l.kind === 'readWord')) {
      const abc = alphabetOf(level);
      for (let i = 0; i < 300; i++) {
        const q = generateReadingQuestion(level, 0);
        expect(abc.plain(abc.words.find((w) => w.text === q.prompt.word)!).length).toBeLessThanOrEqual(3);
      }
    }
  });

  it('avoids recently seen questions', () => {
    for (const level of [...READING_LEVELS, ...ENGLISH_LEVELS]) {
      for (let i = 0; i < 100; i++) {
        const recent = Array.from({ length: 5 }, () => generateReadingQuestion(level, 0.5).key);
        expect(recent).not.toContain(generateReadingQuestion(level, 0.5, recent).key);
      }
    }
  });
});
