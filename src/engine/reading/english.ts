import type { Word } from './words';

/** Lowercase letters; capital letters are asked about too, by the letter levels. */
export const ENGLISH_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

/** Simple words a beginner can picture, with the Hebrew meaning said in hints. */
export const ENGLISH_WORDS: Word[] = [
  { text: 'ant', emoji: '🐜', meaning: 'נְמָלָה' },
  { text: 'bee', emoji: '🐝', meaning: 'דְּבוֹרָה' },
  { text: 'bed', emoji: '🛏️', meaning: 'מִטָּה' },
  { text: 'box', emoji: '📦', meaning: 'קֻפְסָה' },
  { text: 'bus', emoji: '🚌', meaning: 'אוֹטוֹבּוּס' },
  { text: 'car', emoji: '🚗', meaning: 'מְכוֹנִית' },
  { text: 'cat', emoji: '🐱', meaning: 'חָתוּל' },
  { text: 'cow', emoji: '🐄', meaning: 'פָּרָה' },
  { text: 'cup', emoji: '☕', meaning: 'כּוֹס' },
  { text: 'dog', emoji: '🐶', meaning: 'כֶּלֶב' },
  { text: 'egg', emoji: '🥚', meaning: 'בֵּיצָה' },
  { text: 'fox', emoji: '🦊', meaning: 'שׁוּעָל' },
  { text: 'hat', emoji: '🎩', meaning: 'כּוֹבַע' },
  { text: 'ice', emoji: '🧊', meaning: 'קֶרַח' },
  { text: 'leg', emoji: '🦵', meaning: 'רֶגֶל' },
  { text: 'owl', emoji: '🦉', meaning: 'יַנְשׁוּף' },
  { text: 'pen', emoji: '🖊️', meaning: 'עֵט' },
  { text: 'pig', emoji: '🐷', meaning: 'חֲזִיר' },
  { text: 'sun', emoji: '☀️', meaning: 'שֶׁמֶשׁ' },
  { text: 'van', emoji: '🚐', meaning: 'מִסְחָרִית' },
  { text: 'web', emoji: '🕸️', meaning: 'קוּרֵי עַכָּבִישׁ' },
  { text: 'bird', emoji: '🐦', meaning: 'צִפּוֹר' },
  { text: 'book', emoji: '📖', meaning: 'סֵפֶר' },
  { text: 'cake', emoji: '🎂', meaning: 'עוּגָה' },
  { text: 'duck', emoji: '🦆', meaning: 'בַּרְוָז' },
  { text: 'fish', emoji: '🐟', meaning: 'דָּג' },
  { text: 'frog', emoji: '🐸', meaning: 'צְפַרְדֵּעַ' },
  { text: 'goat', emoji: '🐐', meaning: 'עֵז' },
  { text: 'hand', emoji: '✋', meaning: 'יָד' },
  { text: 'kite', emoji: '🪁', meaning: 'עֲפִיפוֹן' },
  { text: 'lion', emoji: '🦁', meaning: 'אַרְיֵה' },
  { text: 'milk', emoji: '🥛', meaning: 'חָלָב' },
  { text: 'moon', emoji: '🌙', meaning: 'יָרֵחַ' },
  { text: 'nose', emoji: '👃', meaning: 'אַף' },
  { text: 'rain', emoji: '🌧️', meaning: 'גֶּשֶׁם' },
  { text: 'star', emoji: '⭐', meaning: 'כּוֹכָב' },
  { text: 'tree', emoji: '🌳', meaning: 'עֵץ' },
  { text: 'yarn', emoji: '🧶', meaning: 'צֶמֶר' },
  { text: 'apple', emoji: '🍎', meaning: 'תַּפּוּחַ' },
  { text: 'juice', emoji: '🧃', meaning: 'מִיץ' },
  { text: 'queen', emoji: '👸', meaning: 'מַלְכָּה' },
  { text: 'zebra', emoji: '🦓', meaning: 'זֶבְּרָה' },
  { text: 'umbrella', emoji: '☂️', meaning: 'מִטְרִיָּה' },
];

/** The voice reads a lone capital as the letter's name ("B" → "bee"); both cases share one clip. */
export const englishLetterName = (letter: string) => letter.toUpperCase();

/** Letters that look alike — used as tricky distractors. */
const LOOK_ALIKE: string[][] = [
  ['b', 'd', 'p', 'q'],
  ['m', 'n', 'u', 'h'],
  ['v', 'w', 'y'],
  ['i', 'l', 'j', 't'],
  ['E', 'F', 'L'],
  ['O', 'Q', 'C', 'G'],
  ['M', 'N', 'W'],
  ['P', 'R', 'B'],
  ['I', 'T', 'L'],
];

/** Letters that can make the same sound — never offered together when the child picks by sound. */
const SOUND_ALIKE: string[][] = [
  ['c', 'k', 's', 'q'],
  ['g', 'j'],
];

const related = (groups: string[][], letter: string) =>
  [...new Set(groups.filter((g) => g.includes(letter)).flat())].filter((l) => l !== letter);

export const englishLookAlikes = (letter: string) => related(LOOK_ALIKE, letter);

export const englishSoundAlikes = (letter: string) => {
  const lower = related(SOUND_ALIKE, letter.toLowerCase());
  return letter === letter.toLowerCase() ? lower : lower.map((l) => l.toUpperCase());
};
