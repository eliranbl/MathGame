export type QuestionKind = 'count' | 'compare' | 'add' | 'sub' | 'missing' | 'double' | 'half' | 'mul' | 'div' | 'divRem' | 'divMissing' | 'longDiv';
export type AnswerMode = 'choice' | 'pad';

export type World = 'math' | 'reading' | 'english';

export interface MathLevelDef {
  id: number;
  name: string;
  world: 'math';
  kinds: QuestionKind[];
  /** Largest number used at difficulty 0. */
  maxEasy: number;
  /** Largest number used at difficulty 1. */
  maxHard: number;
  pictures: boolean;
  mode: AnswerMode;
  /**
   * Prefer exercises that cross ten (8 + 5, 13 - 6) at higher difficulty.
   * Above 20, also means carrying and borrowing; without it, two-digit exercises never carry (34 + 5).
   */
  crossTen?: boolean;
  /** Every number is a multiple of this (10 for "30 + 20"). */
  step?: number;
  /** Multiplication: one factor is taken from these tables. Division: the divisor is. */
  tables?: number[];
  choiceCount?: number;
}

export const LEVELS: MathLevelDef[] = [
  { world: 'math', id: 1, name: 'סופרים ביצים', kinds: ['count'], maxEasy: 3, maxHard: 5, pictures: true, mode: 'choice', choiceCount: 3 },
  { world: 'math', id: 2, name: 'עוד ספירה', kinds: ['count'], maxEasy: 6, maxHard: 10, pictures: true, mode: 'choice', choiceCount: 3 },
  { world: 'math', id: 3, name: 'איפה יש יותר?', kinds: ['compare'], maxEasy: 6, maxHard: 10, pictures: true, mode: 'choice' },
  { world: 'math', id: 4, name: 'חיבור עם תמונות', kinds: ['add'], maxEasy: 4, maxHard: 5, pictures: true, mode: 'choice', choiceCount: 3 },
  { world: 'math', id: 5, name: 'חיבור עד עשר', kinds: ['add'], maxEasy: 7, maxHard: 10, pictures: true, mode: 'choice', choiceCount: 4 },
  { world: 'math', id: 6, name: 'חיסור עם תמונות', kinds: ['sub'], maxEasy: 4, maxHard: 5, pictures: true, mode: 'choice', choiceCount: 3 },
  { world: 'math', id: 7, name: 'חיסור עד עשר', kinds: ['sub'], maxEasy: 7, maxHard: 10, pictures: true, mode: 'choice', choiceCount: 4 },
  { world: 'math', id: 8, name: 'חיבור במספרים', kinds: ['add'], maxEasy: 7, maxHard: 10, pictures: false, mode: 'pad' },
  { world: 'math', id: 9, name: 'חיבור וחיסור', kinds: ['add', 'sub'], maxEasy: 8, maxHard: 10, pictures: false, mode: 'pad' },
  { world: 'math', id: 10, name: 'המספר החסר', kinds: ['missing'], maxEasy: 7, maxHard: 10, pictures: false, mode: 'pad' },
  { world: 'math', id: 11, name: 'מספרים גדולים', kinds: ['add', 'sub'], maxEasy: 14, maxHard: 20, pictures: false, mode: 'pad' },
  { world: 'math', id: 12, name: 'מאסטר דינו', kinds: ['add', 'sub', 'missing'], maxEasy: 16, maxHard: 20, pictures: false, mode: 'pad', crossTen: true },
  { world: 'math', id: 13, name: 'כפולים', kinds: ['double'], maxEasy: 10, maxHard: 20, pictures: true, mode: 'choice', choiceCount: 3 },
  { world: 'math', id: 14, name: 'כפולים וחצאים', kinds: ['double', 'half'], maxEasy: 12, maxHard: 20, pictures: false, mode: 'pad' },
  { world: 'math', id: 15, name: 'קופצים בעשרות', kinds: ['add', 'sub'], maxEasy: 50, maxHard: 100, pictures: true, mode: 'choice', choiceCount: 3, step: 10 },
  { world: 'math', id: 16, name: 'עשרות במספרים', kinds: ['add', 'sub'], maxEasy: 60, maxHard: 100, pictures: false, mode: 'pad', step: 10 },
  { world: 'math', id: 17, name: 'חיבור עד מאה', kinds: ['add'], maxEasy: 50, maxHard: 99, pictures: false, mode: 'pad' },
  { world: 'math', id: 18, name: 'חיבור וחיסור עד מאה', kinds: ['add', 'sub'], maxEasy: 60, maxHard: 99, pictures: false, mode: 'pad', crossTen: true },
  { world: 'math', id: 19, name: 'קבוצות שוות', kinds: ['mul'], maxEasy: 12, maxHard: 25, pictures: true, mode: 'choice', choiceCount: 3 },
  { world: 'math', id: 20, name: 'לוח הכפל', kinds: ['mul'], maxEasy: 50, maxHard: 100, pictures: false, mode: 'pad', tables: [2, 5, 10] },
  { world: 'math', id: 21, name: 'מחלקים שווה בשווה', kinds: ['div'], maxEasy: 10, maxHard: 20, pictures: true, mode: 'choice', choiceCount: 3, tables: [2, 3, 4, 5] },
  { world: 'math', id: 22, name: 'חילוק ב־2, 5 ו־10', kinds: ['div'], maxEasy: 50, maxHard: 100, pictures: false, mode: 'pad', tables: [2, 5, 10] },
  { world: 'math', id: 23, name: 'לוח החילוק', kinds: ['div'], maxEasy: 50, maxHard: 100, pictures: false, mode: 'pad', tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { world: 'math', id: 24, name: 'חילוק עם שארית', kinds: ['divRem'], maxEasy: 30, maxHard: 89, pictures: false, mode: 'pad', tables: [2, 3, 4, 5, 6, 7, 8, 9] },
  { world: 'math', id: 25, name: 'המספר החסר בחילוק', kinds: ['divMissing', 'div'], maxEasy: 50, maxHard: 100, pictures: false, mode: 'pad', tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { world: 'math', id: 26, name: 'חילוק ארוך', kinds: ['longDiv'], maxEasy: 99, maxHard: 999, pictures: false, mode: 'pad', tables: [2, 3, 4, 5, 6, 7, 8, 9] },
];

export type ReadingKind =
  | 'findLetter'
  | 'similarLetter'
  | 'firstLetter'
  | 'letterToPicture'
  | 'syllable'
  | 'readWord'
  | 'findWord'
  | 'spell'
  | 'matchCase'
  | 'listenWord'
  | 'sayWord';

export type Vowel = 'a' | 'i' | 'e' | 'o' | 'u';

export interface ReadingLevelDef {
  id: number;
  name: string;
  world: 'reading' | 'english';
  kind: ReadingKind;
  /** Number of answer choices at low / high difficulty. */
  choicesEasy: number;
  choicesHard: number;
  /** Syllable levels: the vowels being taught. */
  vowels?: Vowel[];
  /** Letter levels: only these letters are asked about. */
  letters?: string[];
}

export const READING_LEVELS: ReadingLevelDef[] = [
  { world: 'reading', id: 101, name: 'איפה האות?', kind: 'findLetter', choicesEasy: 3, choicesHard: 4 },
  { world: 'reading', id: 102, name: 'אותיות דומות', kind: 'similarLetter', choicesEasy: 3, choicesHard: 4 },
  { world: 'reading', id: 103, name: 'במה זה מתחיל?', kind: 'firstLetter', choicesEasy: 3, choicesHard: 4 },
  { world: 'reading', id: 104, name: 'מה מתחיל באות?', kind: 'letterToPicture', choicesEasy: 3, choicesHard: 4 },
  { world: 'reading', id: 105, name: 'הברות עם קמץ', kind: 'syllable', choicesEasy: 3, choicesHard: 4, vowels: ['a'] },
  { world: 'reading', id: 106, name: 'הברות עם חיריק וצירה', kind: 'syllable', choicesEasy: 3, choicesHard: 4, vowels: ['i', 'e'] },
  { world: 'reading', id: 107, name: 'הברות עם חולם ושורוק', kind: 'syllable', choicesEasy: 3, choicesHard: 4, vowels: ['o', 'u'] },
  { world: 'reading', id: 108, name: 'קוראים מילה', kind: 'readWord', choicesEasy: 3, choicesHard: 3 },
  { world: 'reading', id: 109, name: 'מוצאים מילה', kind: 'findWord', choicesEasy: 3, choicesHard: 3 },
  { world: 'reading', id: 110, name: 'בונים מילה', kind: 'spell', choicesEasy: 0, choicesHard: 2 },
  { world: 'reading', id: 111, name: 'קוראים בקול', kind: 'sayWord', choicesEasy: 3, choicesHard: 3 },
];

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const ENGLISH_LEVELS: ReadingLevelDef[] = [
  { world: 'english', id: 201, name: 'אותיות גדולות', kind: 'findLetter', choicesEasy: 3, choicesHard: 4, letters: UPPER.slice(0, 13) },
  { world: 'english', id: 202, name: 'עוד אותיות גדולות', kind: 'findLetter', choicesEasy: 3, choicesHard: 4, letters: UPPER.slice(13) },
  { world: 'english', id: 203, name: 'אותיות קטנות', kind: 'findLetter', choicesEasy: 3, choicesHard: 4, letters: UPPER.map((l) => l.toLowerCase()) },
  { world: 'english', id: 204, name: 'גדולה וקטנה', kind: 'matchCase', choicesEasy: 3, choicesHard: 4 },
  { world: 'english', id: 205, name: 'מילים ראשונות', kind: 'listenWord', choicesEasy: 3, choicesHard: 4 },
  { world: 'english', id: 206, name: 'במה זה מתחיל באנגלית?', kind: 'firstLetter', choicesEasy: 3, choicesHard: 4 },
  { world: 'english', id: 207, name: 'מה מתחיל באות באנגלית?', kind: 'letterToPicture', choicesEasy: 3, choicesHard: 4 },
  { world: 'english', id: 208, name: 'קוראים באנגלית', kind: 'readWord', choicesEasy: 3, choicesHard: 3 },
  { world: 'english', id: 209, name: 'מוצאים מילה באנגלית', kind: 'findWord', choicesEasy: 3, choicesHard: 3 },
  { world: 'english', id: 210, name: 'כותבים באנגלית', kind: 'spell', choicesEasy: 0, choicesHard: 2 },
  { world: 'english', id: 211, name: 'קוראים בקול באנגלית', kind: 'sayWord', choicesEasy: 3, choicesHard: 3 },
];

export type LevelDef = MathLevelDef | ReadingLevelDef;

export const ALL_LEVELS: LevelDef[] = [...LEVELS, ...READING_LEVELS, ...ENGLISH_LEVELS];

const BY_WORLD: Record<World, LevelDef[]> = { math: LEVELS, reading: READING_LEVELS, english: ENGLISH_LEVELS };

export function levelsOf(world: World): LevelDef[] {
  return BY_WORLD[world];
}

export function getLevel(id: number): LevelDef {
  const level = ALL_LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown level ${id}`);
  return level;
}

/** The level after `id` in the same world, or null for the last one. */
export function nextLevelId(id: number): number | null {
  const list = levelsOf(getLevel(id).world);
  return list[list.findIndex((l) => l.id === id) + 1]?.id ?? null;
}
