import type { Speech } from '../../audio/speech';
import type { ReadingKind, ReadingLevelDef, Vowel } from '../levels';
import { pick, shuffle, type Rng } from '../random';
import { ENGLISH, HEBREW, exampleWord, firstLetter, type Alphabet } from './alphabet';
import { SYLLABLE_CONSONANTS, syllable, type Word } from './words';

export type ChoiceStyle = 'letter' | 'emoji' | 'word' | 'syllable';

export interface ReadingQuestion {
  world: 'reading';
  /** Identifies the exercise, used to avoid repeats and to track mistakes. */
  key: string;
  kind: ReadingKind;
  /** Language of the letters and words on screen. */
  lang: 'he' | 'en';
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

export const alphabetOf = (level: ReadingLevelDef): Alphabet => (level.world === 'english' ? ENGLISH : HEBREW);

const isCapital = (letter: string) => letter !== letter.toLowerCase();

/** The alphabet's letters in the same case as `letter` (Hebrew has no case). */
const lettersLike = (abc: Alphabet, letter: string) =>
  isCapital(letter) ? abc.letters.map((l) => l.toUpperCase()) : abc.letters;

/** Longest word (in letters) for the difficulty. */
const maxWordLength = (difficulty: number) => (difficulty < 0.35 ? 3 : difficulty < 0.7 ? 4 : 6);

const wordsUpTo = (abc: Alphabet, difficulty: number, cap = 6) =>
  abc.words.filter((w) => abc.plain(w).length <= Math.min(cap, maxWordLength(difficulty)));

/** `answer` plus `count - 1` distractors: preferred ones first, then the rest of the pool. */
function withDistractors(rng: Rng, answer: string, count: number, preferred: string[], pool: string[]): string[] {
  const chosen = [answer];
  for (const candidate of [...shuffle(rng, preferred), ...shuffle(rng, pool)]) {
    if (chosen.length >= count) break;
    if (!chosen.includes(candidate)) chosen.push(candidate);
  }
  return shuffle(rng, chosen);
}

/** "The letter B, like ball" — or just the letter when no word starts with it. */
function letterHint(abc: Alphabet, letter: string): Speech {
  const example = exampleWord(abc, letter);
  const name = abc.letterName(letter);
  return example ? ['האות', name, 'כמו', example.text] : ['האות', name];
}

type Maker = (
  rng: Rng,
  abc: Alphabet,
  level: ReadingLevelDef,
  difficulty: number,
  count: number,
) => Omit<ReadingQuestion, 'world' | 'kind' | 'lang'>;

const makers: Record<ReadingKind, Maker> = {
  findLetter(rng, abc, level, difficulty, count) {
    const letter = pick(rng, level.letters ?? abc.letters);
    // Easy rounds avoid look-alike letters so the choice is about knowing the letter.
    const pool = lettersLike(abc, letter).filter((l) => l !== letter && (difficulty >= 0.5 || !abc.lookAlikes(letter).includes(l)));
    return {
      key: `letter:${letter}`,
      prompt: { listen: true },
      answer: letter,
      choices: withDistractors(rng, letter, count, [], pool),
      choiceStyle: 'letter',
      speak: ['איפה האות', abc.letterName(letter)],
      hintSpeak: letterHint(abc, letter),
      revealSpeak: ['זאת האות', abc.letterName(letter)],
    };
  },

  similarLetter(rng, abc, _level, _difficulty, count) {
    const letter = pick(rng, abc.letters.filter((l) => abc.lookAlikes(l).length > 0));
    return {
      key: `similar:${letter}`,
      prompt: { listen: true },
      answer: letter,
      choices: withDistractors(rng, letter, count, abc.lookAlikes(letter), abc.letters),
      choiceStyle: 'letter',
      speak: ['איפה האות', abc.letterName(letter)],
      hintSpeak: letterHint(abc, letter),
      revealSpeak: ['זאת האות', abc.letterName(letter)],
    };
  },

  matchCase(rng, abc, _level, difficulty, count) {
    const letter = pick(rng, abc.letters);
    const capital = letter.toUpperCase();
    const name = abc.letterName(letter);
    return {
      key: `case:${capital}`,
      prompt: { letter: capital },
      answer: letter,
      choices: withDistractors(rng, letter, count, difficulty >= 0.5 ? abc.lookAlikes(letter) : [], abc.letters),
      choiceStyle: 'letter',
      speak: ['זאת האות', name, 'איפה האות הקטנה?'],
      hintSpeak: letterHint(abc, letter),
      revealSpeak: ['זאת האות', name, 'הקטנה'],
    };
  },

  firstLetter(rng, abc, _level, difficulty, count) {
    const word = pick(rng, wordsUpTo(abc, difficulty));
    const letter = firstLetter(abc, word);
    // Letters that sound the same would make two answers right, so they are never offered.
    const banned = abc.soundAlikes(letter);
    const pool = abc.letters.filter((l) => l !== letter && !banned.includes(l));
    const preferred = difficulty >= 0.5 ? abc.lookAlikes(letter).filter((l) => !banned.includes(l)) : [];
    return {
      key: `first:${abc.plain(word)}`,
      prompt: { emoji: word.emoji },
      answer: letter,
      choices: withDistractors(rng, letter, count, preferred, pool),
      choiceStyle: 'letter',
      speak: ['במה מתחילה המילה', word.text],
      hintSpeak: ['הקשב טוב', word.text],
      revealSpeak: [word.text, 'מתחילה באות', abc.letterName(letter)],
    };
  },

  letterToPicture(rng, abc, _level, difficulty, count) {
    const word = pick(rng, wordsUpTo(abc, difficulty));
    const letter = firstLetter(abc, word);
    const banned = [letter, ...abc.soundAlikes(letter)];
    const others = abc.words.filter((w) => !banned.includes(firstLetter(abc, w)));
    const choices = withDistractors(rng, word.emoji, count, [], [...new Set(others.map((w) => w.emoji))]);
    const names = choices.map((e) => abc.words.find((w) => w.emoji === e)!.text);
    return {
      key: `picture:${abc.plain(word)}`,
      prompt: { letter },
      answer: word.emoji,
      choices,
      choiceStyle: 'emoji',
      speak: ['מה מתחיל באות', abc.letterName(letter)],
      hintSpeak: ['בוא נשמע', ...names],
      revealSpeak: [word.text, 'מתחילה באות', abc.letterName(letter)],
    };
  },

  listenWord(rng, abc, _level, difficulty, count) {
    const word = pick(rng, wordsUpTo(abc, difficulty));
    const others = abc.words.filter((w) => w !== word).map((w) => w.emoji);
    // The Hebrew meaning teaches the word: "dog – זה כֶּלֶב".
    const meaning: Speech = word.meaning ? ['זה', word.meaning] : [];
    return {
      key: `listen:${word.text}`,
      prompt: { listen: true },
      answer: word.emoji,
      choices: withDistractors(rng, word.emoji, count, [], others),
      choiceStyle: 'emoji',
      speak: ['איפה', word.text],
      hintSpeak: [word.text, ...meaning],
      revealSpeak: [word.text, ...meaning],
    };
  },

  syllable(rng, _abc, level, difficulty, count) {
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

  readWord(rng, abc, _level, difficulty, count) {
    const word = pick(rng, wordsUpTo(abc, difficulty));
    const letter = firstLetter(abc, word);
    const others = abc.words.filter((w) => w !== word);
    // Harder rounds offer pictures whose word starts with the same letter, so guessing from the first letter fails.
    const preferred = difficulty >= 0.5 ? others.filter((w) => firstLetter(abc, w) === letter).map((w) => w.emoji) : [];
    return {
      key: `read:${abc.plain(word)}`,
      prompt: { word: word.text },
      answer: word.emoji,
      choices: withDistractors(rng, word.emoji, count, preferred, others.map((w) => w.emoji)),
      choiceStyle: 'emoji',
      speak: 'מה כתוב כאן?',
      hintSpeak: ['המילה מתחילה באות', abc.letterName(letter)],
      revealSpeak: ['כאן כתוב', word.text],
    };
  },

  findWord(rng, abc, _level, difficulty, count) {
    const word = pick(rng, wordsUpTo(abc, difficulty));
    const plain = abc.plain(word);
    const others = abc.words.filter((w) => w !== word);
    const similar = (w: Word) => firstLetter(abc, w) === plain[0] || abc.plain(w).length === plain.length;
    const preferred = difficulty >= 0.5 ? others.filter(similar).map((w) => w.text) : [];
    return {
      key: `find:${plain}`,
      prompt: { emoji: word.emoji },
      answer: word.text,
      choices: withDistractors(rng, word.text, count, preferred, others.map((w) => w.text)),
      choiceStyle: 'word',
      speak: 'איזו מילה מתאימה לתמונה?',
      hintSpeak: ['זה', word.text],
      revealSpeak: ['כאן כתוב', word.text],
    };
  },

  spell(rng, abc, level, difficulty) {
    const word = pick(rng, wordsUpTo(abc, difficulty, 4));
    const letters = [...abc.plain(word)];
    // Extra letters on hard rounds, so the last tile isn't a giveaway.
    const extras = difficulty >= 0.7 ? level.choicesHard : difficulty >= 0.4 ? 1 : level.choicesEasy;
    const spare = shuffle(rng, abc.letters.filter((l) => !letters.includes(l))).slice(0, extras);
    return {
      key: `spell:${letters.join('')}`,
      prompt: { emoji: word.emoji },
      answer: letters.join(''),
      choices: [],
      choiceStyle: 'letter',
      spell: { letters, tiles: shuffle(rng, [...letters, ...spare]) },
      speak: ['בוא נכתוב', word.text],
      hintSpeak: word.text,
      revealSpeak: ['כותבים', word.text],
    };
  },
};

export function generateReadingQuestion(
  level: ReadingLevelDef,
  difficulty: number,
  recentKeys: readonly string[] = [],
  rng: Rng = Math.random,
): ReadingQuestion {
  const abc = alphabetOf(level);
  const count = difficulty >= 0.5 ? level.choicesHard : level.choicesEasy;
  let q = makers[level.kind](rng, abc, level, difficulty, count);
  for (let attempt = 0; attempt < 40 && recentKeys.includes(q.key); attempt++) {
    q = makers[level.kind](rng, abc, level, difficulty, count);
  }
  return { world: 'reading', kind: level.kind, lang: abc.lang, ...q };
}
