import type { Vowel } from '../levels';

export interface Word {
  /** As shown to the child: Hebrew with niqqud, English in lowercase. */
  text: string;
  emoji: string;
  /** English words: the Hebrew meaning, said in hints. */
  meaning?: string;
}

/** Short words a kindergartner knows, each with a clear emoji. Plain spelling is derived from the niqqud. */
export const WORDS: Word[] = [
  { text: 'דָּג', emoji: '🐟' },
  { text: 'צָב', emoji: '🐢' },
  { text: 'עֵץ', emoji: '🌳' },
  { text: 'לֵב', emoji: '❤️' },
  { text: 'יָם', emoji: '🌊' },
  { text: 'יָד', emoji: '✋' },
  { text: 'אַף', emoji: '👃' },
  { text: 'פֶּה', emoji: '👄' },
  { text: 'אֵשׁ', emoji: '🔥' },
  { text: 'שֵׁן', emoji: '🦷' },
  { text: 'סוּס', emoji: '🐴' },
  { text: 'תּוּת', emoji: '🍓' },
  { text: 'פִּיל', emoji: '🐘' },
  { text: 'קוֹף', emoji: '🐒' },
  { text: 'בַּיִת', emoji: '🏠' },
  { text: 'עַיִן', emoji: '👁️' },
  { text: 'גֶּשֶׁם', emoji: '🌧️' },
  { text: 'חָלָב', emoji: '🥛' },
  { text: 'גֶּזֶר', emoji: '🥕' },
  { text: 'כֶּלֶב', emoji: '🐶' },
  { text: 'סֵפֶר', emoji: '📖' },
  { text: 'שֶׁמֶשׁ', emoji: '☀️' },
  { text: 'נָחָשׁ', emoji: '🐍' },
  { text: 'פֶּרַח', emoji: '🌸' },
  { text: 'פָּרָה', emoji: '🐄' },
  { text: 'יָרֵחַ', emoji: '🌙' },
  { text: 'גָּמָל', emoji: '🐫' },
  { text: 'לֶחֶם', emoji: '🍞' },
  { text: 'עָנָן', emoji: '☁️' },
  { text: 'זְאֵב', emoji: '🐺' },
  { text: 'דֶּלֶת', emoji: '🚪' },
  { text: 'רֶגֶל', emoji: '🦶' },
  { text: 'מֶלֶךְ', emoji: '👑' },
  { text: 'נַעַל', emoji: '👟' },
  { text: 'עוּגָה', emoji: '🎂' },
  { text: 'חָתוּל', emoji: '🐱' },
  { text: 'כַּדּוּר', emoji: '⚽' },
  { text: 'מָטוֹס', emoji: '✈️' },
  { text: 'סִירָה', emoji: '⛵' },
  { text: 'כּוֹכָב', emoji: '⭐' },
  { text: 'פִּיצָה', emoji: '🍕' },
  { text: 'בֵּיצָה', emoji: '🥚' },
  { text: 'בָּלוֹן', emoji: '🎈' },
  { text: 'כּוֹבַע', emoji: '🎩' },
  { text: 'שָׁעוֹן', emoji: '⌚' },
  { text: 'עַכְבָּר', emoji: '🐭' },
  { text: 'נְמָלָה', emoji: '🐜' },
  { text: 'פַּרְפַּר', emoji: '🦋' },
  { text: 'תַּפּוּחַ', emoji: '🍎' },
  { text: 'בָּנָנָה', emoji: '🍌' },
  { text: 'גְּלִידָה', emoji: '🍦' },
  { text: 'אַרְיֵה', emoji: '🦁' },
  { text: 'רַכֶּבֶת', emoji: '🚂' },
  { text: 'דְּבוֹרָה', emoji: '🐝' },
  { text: 'זֶבְּרָה', emoji: '🦓' },
  { text: 'מַתָּנָה', emoji: '🎁' },
  { text: 'יַנְשׁוּף', emoji: '🦉' },
  { text: 'מַפְתֵּחַ', emoji: '🔑' },
  { text: 'תִּינוֹק', emoji: '👶' },
  { text: 'עֲנָבִים', emoji: '🍇' },
  { text: 'מְכוֹנִית', emoji: '🚗' },
  { text: 'אֲבַטִּיחַ', emoji: '🍉' },
  { text: 'צְפַרְדֵּעַ', emoji: '🐸' },
];

/** Removes niqqud and dagesh marks, leaving bare letters. */
export const stripNikud = (s: string) => s.replace(/[֑-ׇ]/g, '');

export const plainOf = (w: Word) => stripNikud(w.text);

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
