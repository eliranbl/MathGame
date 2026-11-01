export type QuestionKind = 'count' | 'compare' | 'add' | 'sub' | 'missing';
export type AnswerMode = 'choice' | 'pad';

export type World = 'math' | 'reading';

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
  /** Prefer exercises that cross ten (8 + 5, 13 - 6) at higher difficulty. */
  crossTen?: boolean;
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
];

export type ReadingKind =
  | 'findLetter'
  | 'similarLetter'
  | 'firstLetter'
  | 'letterToPicture'
  | 'syllable'
  | 'readWord'
  | 'findWord'
  | 'spell';

export type Vowel = 'a' | 'i' | 'e' | 'o' | 'u';

export interface ReadingLevelDef {
  id: number;
  name: string;
  world: 'reading';
  kind: ReadingKind;
  /** Number of answer choices at low / high difficulty. */
  choicesEasy: number;
  choicesHard: number;
  /** Syllable levels: the vowels being taught. */
  vowels?: Vowel[];
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
];

export type LevelDef = MathLevelDef | ReadingLevelDef;

export const ALL_LEVELS: LevelDef[] = [...LEVELS, ...READING_LEVELS];

export function levelsOf(world: World): LevelDef[] {
  return world === 'math' ? LEVELS : READING_LEVELS;
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
