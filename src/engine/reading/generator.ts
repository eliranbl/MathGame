import type { Speech } from '../../audio/speech';
import type { ReadingKind, ReadingLevelDef, Vowel } from '../levels';
import { pick, shuffle, type Rng } from '../random';
import {
  LETTER_NAMES,
  LETTERS,
  SYLLABLE_CONSONANTS,
  WORDS,
  exampleWord,
  firstLetterOf,
  lookAlikes,
  plainOf,
  soundAlikes,
  syllable,
  type Word,
} from './words';

export type ChoiceStyle = 'letter' | 'emoji' | 'word' | 'syllable';

export interface ReadingQuestion {
  world: 'reading';
  /** Identifies the exercise, used to avoid repeats and to track mistakes. */
  key: string;
  kind: ReadingKind;
  /** What is shown. `listen` means the question is only heard (with a big replay button). */
  prompt: { letter?: string; word?: string; emoji?: string; listen?: boolean };
  answer: string;
  choices: string[];
  choiceStyle: ChoiceStyle;
  /** Spelling level: the letters in order and the shuffled tiles (may include extra letters). */
  spell?: { letters: string[]; tiles: string[] };
  speak: Speech;
  /** Said after the first mistake. */
  hintSpeak: Speech;
  /** Said when the answer is revealed. */
  revealSpeak: Speech;
}

const VOWEL_ORDER: Vowel[] = ['a', 'i', 'e', 'o', 'u'];

const nameOf = (letter: string) => LETTER_NAMES[letter] ?? letter;

/** Longest word (in letters) for the difficulty. */
const maxWordLength = (difficulty: number) => (difficulty < 0.35 ? 3 : difficulty < 0.7 ? 4 : 6);

const wordsUpTo = (difficulty: number, cap = 6) =>
  WORDS.filter((w) => plainOf(w).length <= Math.min(cap, maxWordLength(difficulty)));

/** `answer` plus `count - 1` distractors: preferred ones first, then the rest of the pool. */
function withDistractors(rng: Rng, answer: string, count: number, preferred: string[], pool: string[]): string[] {
  const chosen = [answer];
  for (const candidate of [...shuffle(rng, preferred), ...shuffle(rng, pool)]) {
    if (chosen.length >= count) break;
    if (!chosen.includes(candidate)) chosen.push(candidate);
  }
  return shuffle(rng, chosen);
}

type Maker = (rng: Rng, level: ReadingLevelDef, difficulty: number, count: number) => Omit<ReadingQuestion, 'world' | 'kind'>;

const makers: Record<ReadingKind, Maker> = {
  findLetter(rng, _level, difficulty, count) {
    const letter = pick(rng, LETTERS);
    // Easy rounds avoid look-alike letters so the choice is about knowing the letter.
    const pool = LETTERS.filter((l) => l !== letter && (difficulty >= 0.5 || !lookAlikes(letter).includes(l)));
    const example = exampleWord(letter);
    return {
      key: `letter:${letter}`,
      prompt: { listen: true },
      answer: letter,
      choices: withDistractors(rng, letter, count, [], pool),
      choiceStyle: 'letter',
      speak: ['איפה האות', nameOf(letter)],
      hintSpeak: example ? ['האות', nameOf(letter), 'כמו', example.nikud] : ['האות', nameOf(letter)],
      revealSpeak: ['זאת האות', nameOf(letter)],
    };
  },

  similarLetter(rng, _level, _difficulty, count) {
    const letter = pick(rng, LETTERS.filter((l) => lookAlikes(l).length > 0));
    const example = exampleWord(letter);
    return {
      key: `similar:${letter}`,
      prompt: { listen: true },
      answer: letter,
      choices: withDistractors(rng, letter, count, lookAlikes(letter), LETTERS),
      choiceStyle: 'letter',
      speak: ['איפה האות', nameOf(letter)],
      hintSpeak: example ? ['האות', nameOf(letter), 'כמו', example.nikud] : ['האות', nameOf(letter)],
      revealSpeak: ['זאת האות', nameOf(letter)],
    };
  },

  firstLetter(rng, _level, difficulty, count) {
    const word = pick(rng, wordsUpTo(difficulty));
    const letter = firstLetterOf(word);
    // Letters that sound the same would make two answers right, so they are never offered.
    const banned = soundAlikes(letter);
    const pool = LETTERS.filter((l) => l !== letter && !banned.includes(l));
    const preferred = difficulty >= 0.5 ? lookAlikes(letter).filter((l) => !banned.includes(l)) : [];
    return {
      key: `first:${plainOf(word)}`,
      prompt: { emoji: word.emoji },
      answer: letter,
      choices: withDistractors(rng, letter, count, preferred, pool),
      choiceStyle: 'letter',
      speak: ['במה מתחילה המילה', word.nikud],
      hintSpeak: ['הקשב טוב', word.nikud],
      revealSpeak: [word.nikud, 'מתחילה באות', nameOf(letter)],
    };
  },

  letterToPicture(rng, _level, difficulty, count) {
    const word = pick(rng, wordsUpTo(difficulty));
    const letter = firstLetterOf(word);
    const banned = [letter, ...soundAlikes(letter)];
    const others = WORDS.filter((w) => !banned.includes(firstLetterOf(w)));
    const choices = withDistractors(rng, word.emoji, count, [], [...new Set(others.map((w) => w.emoji))]);
    const names = choices.map((e) => WORDS.find((w) => w.emoji === e)!.nikud);
    return {
      key: `picture:${plainOf(word)}`,
      prompt: { letter },
      answer: word.emoji,
      choices,
      choiceStyle: 'emoji',
      speak: ['מה מתחיל באות', nameOf(letter)],
      hintSpeak: ['בוא נשמע', ...names],
      revealSpeak: [word.nikud, 'מתחילה באות', nameOf(letter)],
    };
  },

  syllable(rng, level, difficulty, count) {
    const vowels = level.vowels ?? ['a'];
    const vowel = pick(rng, vowels);
    const consonant = pick(rng, SYLLABLE_CONSONANTS);
    const target = syllable(consonant, vowel);
    // All vowels learned so far, to mix "מִ" with "מָ" at higher difficulty.
    const known = VOWEL_ORDER.slice(0, Math.max(...vowels.map((v) => VOWEL_ORDER.indexOf(v))) + 1);
    const sameConsonant = known.filter((v) => v !== vowel).map((v) => syllable(consonant, v).text);
    const sameVowel = SYLLABLE_CONSONANTS.filter((c) => c !== consonant).map((c) => syllable(c, vowel).text);
    return {
      key: `syllable:${target.text}`,
      prompt: { listen: true },
      answer: target.text,
      choices: withDistractors(rng, target.text, count, difficulty >= 0.5 ? sameConsonant : [], sameVowel),
      choiceStyle: 'syllable',
      speak: ['איפה כתוב', target.spoken],
      hintSpeak: [target.spoken, target.spoken],
      revealSpeak: ['כאן כתוב', target.spoken],
    };
  },

  readWord(rng, _level, difficulty, count) {
    const word = pick(rng, wordsUpTo(difficulty));
    const letter = firstLetterOf(word);
    const others = WORDS.filter((w) => w !== word);
    // Harder rounds offer pictures whose word starts with the same letter, so guessing from the first letter fails.
    const preferred = difficulty >= 0.5 ? others.filter((w) => firstLetterOf(w) === letter).map((w) => w.emoji) : [];
    return {
      key: `read:${plainOf(word)}`,
      prompt: { word: word.nikud },
      answer: word.emoji,
      choices: withDistractors(rng, word.emoji, count, preferred, others.map((w) => w.emoji)),
      choiceStyle: 'emoji',
      speak: 'מה כתוב כאן?',
      hintSpeak: ['המילה מתחילה באות', nameOf(letter)],
      revealSpeak: ['כאן כתוב', word.nikud],
    };
  },

  findWord(rng, _level, difficulty, count) {
    const word = pick(rng, wordsUpTo(difficulty));
    const plain = plainOf(word);
    const others = WORDS.filter((w) => w !== word);
    const similar = (w: Word) => firstLetterOf(w) === plain[0] || Math.abs(plainOf(w).length - plain.length) === 0;
    const preferred = difficulty >= 0.5 ? others.filter(similar).map((w) => w.nikud) : [];
    return {
      key: `find:${plain}`,
      prompt: { emoji: word.emoji },
      answer: word.nikud,
      choices: withDistractors(rng, word.nikud, count, preferred, others.map((w) => w.nikud)),
      choiceStyle: 'word',
      speak: 'איזו מילה מתאימה לתמונה?',
      hintSpeak: ['זה', word.nikud],
      revealSpeak: ['כאן כתוב', word.nikud],
    };
  },

  spell(rng, level, difficulty) {
    const word = pick(rng, wordsUpTo(difficulty, 4));
    const letters = [...plainOf(word)];
    // Extra letters on hard rounds, so the last tile isn't a giveaway.
    const extras = difficulty >= 0.7 ? level.choicesHard : difficulty >= 0.4 ? 1 : level.choicesEasy;
    const spare = shuffle(rng, LETTERS.filter((l) => !letters.includes(l))).slice(0, extras);
    return {
      key: `spell:${letters.join('')}`,
      prompt: { emoji: word.emoji },
      answer: letters.join(''),
      choices: [],
      choiceStyle: 'letter',
      spell: { letters, tiles: shuffle(rng, [...letters, ...spare]) },
      speak: ['בוא נכתוב', word.nikud],
      hintSpeak: word.nikud,
      revealSpeak: ['כותבים', word.nikud],
    };
  },
};

export function generateReadingQuestion(
  level: ReadingLevelDef,
  difficulty: number,
  recentKeys: readonly string[] = [],
  rng: Rng = Math.random,
): ReadingQuestion {
  const count = difficulty >= 0.5 ? level.choicesHard : level.choicesEasy;
  let q = makers[level.kind](rng, level, difficulty, count);
  for (let attempt = 0; attempt < 40 && recentKeys.includes(q.key); attempt++) {
    q = makers[level.kind](rng, level, difficulty, count);
  }
  return { world: 'reading', kind: level.kind, ...q };
}
