import { ENGLISH_LETTERS, ENGLISH_WORDS, englishLetterName, englishLookAlikes, englishSoundAlikes } from './english';
import { LETTER_NAMES, LETTERS, WORDS, lookAlikes, plainOf, soundAlikes, type Word } from './words';

/** Everything the reading exercises need to know about one language's letters and words. */
export interface Alphabet {
  lang: 'he' | 'en';
  letters: string[];
  words: Word[];
  /** Spelling handed to the voice for the letter's name. */
  letterName: (letter: string) => string;
  lookAlikes: (letter: string) => string[];
  soundAlikes: (letter: string) => string[];
  /** Bare letters of the word, as the child spells it. */
  plain: (w: Word) => string;
}

export const firstLetter = (abc: Alphabet, w: Word) => abc.plain(w)[0];

/** Example word for a letter, for hints ("בֵּית, כמו בַּיִת"). */
export const exampleWord = (abc: Alphabet, letter: string) =>
  abc.words.find((w) => firstLetter(abc, w).toLowerCase() === letter.toLowerCase());

export const HEBREW: Alphabet = {
  lang: 'he',
  letters: LETTERS,
  words: WORDS,
  letterName: (l) => LETTER_NAMES[l] ?? l,
  lookAlikes,
  soundAlikes,
  plain: plainOf,
};

export const ENGLISH: Alphabet = {
  lang: 'en',
  letters: ENGLISH_LETTERS,
  words: ENGLISH_WORDS,
  letterName: englishLetterName,
  lookAlikes: englishLookAlikes,
  soundAlikes: englishSoundAlikes,
  plain: (w) => w.text.replace(/[^a-z]/g, ''),
};
