import type { Vowel } from '../levels';

export interface Word {
  /** Written with niqqud, as shown to the child. */
  nikud: string;
  emoji: string;
}

/** Short words a kindergartner knows, each with a clear emoji. Plain spelling is derived from the niqqud. */
export const WORDS: Word[] = [
  { nikud: 'דָּג', emoji: '🐟' },
  { nikud: 'צָב', emoji: '🐢' },
  { nikud: 'עֵץ', emoji: '🌳' },
  { nikud: 'לֵב', emoji: '❤️' },
  { nikud: 'יָם', emoji: '🌊' },
  { nikud: 'יָד', emoji: '✋' },
  { nikud: 'אַף', emoji: '👃' },
  { nikud: 'פֶּה', emoji: '👄' },
  { nikud: 'אֵשׁ', emoji: '🔥' },
  { nikud: 'שֵׁן', emoji: '🦷' },
  { nikud: 'סוּס', emoji: '🐴' },
  { nikud: 'תּוּת', emoji: '🍓' },
  { nikud: 'פִּיל', emoji: '🐘' },
  { nikud: 'קוֹף', emoji: '🐒' },
  { nikud: 'בַּיִת', emoji: '🏠' },
  { nikud: 'עַיִן', emoji: '👁️' },
  { nikud: 'גֶּשֶׁם', emoji: '🌧️' },
  { nikud: 'חָלָב', emoji: '🥛' },
  { nikud: 'גֶּזֶר', emoji: '🥕' },
  { nikud: 'כֶּלֶב', emoji: '🐶' },
  { nikud: 'סֵפֶר', emoji: '📖' },
  { nikud: 'שֶׁמֶשׁ', emoji: '☀️' },
  { nikud: 'נָחָשׁ', emoji: '🐍' },
  { nikud: 'פֶּרַח', emoji: '🌸' },
  { nikud: 'פָּרָה', emoji: '🐄' },
  { nikud: 'יָרֵחַ', emoji: '🌙' },
  { nikud: 'גָּמָל', emoji: '🐫' },
  { nikud: 'לֶחֶם', emoji: '🍞' },
  { nikud: 'עָנָן', emoji: '☁️' },
  { nikud: 'זְאֵב', emoji: '🐺' },
  { nikud: 'דֶּלֶת', emoji: '🚪' },
  { nikud: 'רֶגֶל', emoji: '🦶' },
  { nikud: 'מֶלֶךְ', emoji: '👑' },
  { nikud: 'נַעַל', emoji: '👟' },
  { nikud: 'עוּגָה', emoji: '🎂' },
  { nikud: 'חָתוּל', emoji: '🐱' },
  { nikud: 'כַּדּוּר', emoji: '⚽' },
  { nikud: 'מָטוֹס', emoji: '✈️' },
  { nikud: 'סִירָה', emoji: '⛵' },
  { nikud: 'כּוֹכָב', emoji: '⭐' },
  { nikud: 'פִּיצָה', emoji: '🍕' },
  { nikud: 'בֵּיצָה', emoji: '🥚' },
  { nikud: 'בָּלוֹן', emoji: '🎈' },
  { nikud: 'כּוֹבַע', emoji: '🎩' },
  { nikud: 'שָׁעוֹן', emoji: '⌚' },
  { nikud: 'עַכְבָּר', emoji: '🐭' },
  { nikud: 'נְמָלָה', emoji: '🐜' },
  { nikud: 'פַּרְפַּר', emoji: '🦋' },
  { nikud: 'תַּפּוּחַ', emoji: '🍎' },
  { nikud: 'בָּנָנָה', emoji: '🍌' },
  { nikud: 'גְּלִידָה', emoji: '🍦' },
  { nikud: 'אַרְיֵה', emoji: '🦁' },
  { nikud: 'רַכֶּבֶת', emoji: '🚂' },
  { nikud: 'דְּבוֹרָה', emoji: '🐝' },
  { nikud: 'זֶבְּרָה', emoji: '🦓' },
  { nikud: 'מַתָּנָה', emoji: '🎁' },
  { nikud: 'יַנְשׁוּף', emoji: '🦉' },
  { nikud: 'מַפְתֵּחַ', emoji: '🔑' },
  { nikud: 'תִּינוֹק', emoji: '👶' },
  { nikud: 'עֲנָבִים', emoji: '🍇' },
  { nikud: 'מְכוֹנִית', emoji: '🚗' },
  { nikud: 'אֲבַטִּיחַ', emoji: '🍉' },
  { nikud: 'צְפַרְדֵּעַ', emoji: '🐸' },
];

/** Removes niqqud and dagesh marks, leaving bare letters. */
export const stripNikud = (s: string) => s.replace(/[֑-ׇ]/g, '');

export const plainOf = (w: Word) => stripNikud(w.nikud);

/** First letter of a word, without marks. */
export const firstLetterOf = (w: Word) => plainOf(w)[0];

/** Base letters taught on their own (no final forms). */
export const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];

/** Letter names with niqqud so the speech engine says "בֵּית" and not "בַּיִת". */
export const LETTER_NAMES: Record<string, string> = {
  א: 'אָלֶף',
  ב: 'בֵּית',
  ג: 'גִּימֶל',
  ד: 'דָּלֶת',
  ה: 'הֵא',
  ו: 'וָו',
  ז: 'זַיִן',
  ח: 'חֵית',
  ט: 'טֵית',
  י: 'יוֹד',
  כ: 'כַּף',
  ל: 'לָמֶד',
  מ: 'מֵם',
  נ: 'נוּן',
  ס: 'סָמֶךְ',
  ע: 'עַיִן',
  פ: 'פֵּא',
  צ: 'צָדִי',
  ק: 'קוֹף',
  ר: 'רֵישׁ',
  ש: 'שִׁין',
  ת: 'תָּו',
};

/** Letters that look alike — used as tricky distractors. */
const LOOK_ALIKE: string[][] = [
  ['ב', 'כ', 'פ'],
  ['ד', 'ר'],
  ['ה', 'ח', 'ת'],
  ['ו', 'ז', 'י'],
  ['ג', 'נ'],
  ['ע', 'צ'],
  ['ט', 'מ', 'ס'],
];

/** Letters that can sound alike — never offered together when the child picks by sound. */
const SOUND_ALIKE: string[][] = [
  ['כ', 'ק', 'ח'],
  ['ט', 'ת'],
  ['א', 'ע', 'ה'],
  ['ס', 'ש'],
  ['ב', 'ו'],
  ['פ', 'ף'],
];

const related = (groups: string[][], letter: string) =>
  [...new Set(groups.filter((g) => g.includes(letter)).flat())].filter((l) => l !== letter);

export const lookAlikes = (letter: string) => related(LOOK_ALIKE, letter);
export const soundAlikes = (letter: string) => related(SOUND_ALIKE, letter);

/** Consonants used for syllables, with dagesh where it changes the sound (בּ = b). Sound-alikes are left out. */
export const SYLLABLE_CONSONANTS = ['בּ', 'ג', 'ד', 'ז', 'ל', 'מ', 'נ', 'ס', 'פּ', 'ר', 'שׁ', 'ת'];

const VOWEL_MARK: Record<Vowel, { show: (c: string) => string; say: (c: string) => string }> = {
  a: { show: (c) => `${c}ָ`, say: (c) => `${c}ָה` },
  i: { show: (c) => `${c}ִ`, say: (c) => `${c}ִי` },
  e: { show: (c) => `${c}ֵ`, say: (c) => `${c}ֵה` },
  o: { show: (c) => `${c}וֹ`, say: (c) => `${c}וֹ` },
  u: { show: (c) => `${c}וּ`, say: (c) => `${c}וּ` },
};

export interface Syllable {
  consonant: string;
  vowel: Vowel;
  /** Shown on screen, e.g. "מָ". */
  text: string;
  /** Spelling handed to the speech engine, e.g. "מָה". */
  spoken: string;
}

export function syllable(consonant: string, vowel: Vowel): Syllable {
  const v = VOWEL_MARK[vowel];
  return { consonant, vowel, text: v.show(consonant), spoken: v.say(consonant) };
}

/** Example word for a letter, for hints ("בֵּית, כמו בַּיִת"). */
export function exampleWord(letter: string): Word | undefined {
  return WORDS.find((w) => firstLetterOf(w) === letter);
}
