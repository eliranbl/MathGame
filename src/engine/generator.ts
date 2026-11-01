import type { Speech } from '../audio/speech';
import { numberWord } from './hebrew';
import type { AnswerMode, MathLevelDef, QuestionKind } from './levels';
import { pick, randInt, shuffle, type Rng } from './random';

export type { Rng } from './random';

export type ItemType = 'egg' | 'bone' | 'leaf' | 'foot';

export const ITEM_NAMES: Record<ItemType, string> = {
  egg: 'ביצים',
  bone: 'עצמות',
  leaf: 'עלים',
  foot: 'עקבות',
};

export interface Question {
  world: 'math';
  /** Identifies the exercise, used to avoid repeats and to track mistakes. */
  key: string;
  kind: QuestionKind;
  /**
   * count:   a = number of items
   * compare: a, b = sizes of the two groups
   * add/sub: a op b = answer
   * missing: a op ? = total, answer = b
   */
  a: number;
  b: number;
  op: '+' | '-' | null;
  answer: number;
  total: number;
  /** Expression shown on screen; '?' is the blank. Empty for count/compare. */
  tokens: string[];
  item: ItemType;
  pictures: boolean;
  mode: AnswerMode;
  choices: number[];
  speak: Speech;
  /** Said when the answer is revealed. */
  revealSpeak: Speech;
}

export function maxForDifficulty(level: MathLevelDef, difficulty: number): number {
  const d = Math.min(1, Math.max(0, difficulty));
  return Math.round(level.maxEasy + (level.maxHard - level.maxEasy) * d);
}

/** Lowest result to aim for: harder rounds push answers toward the top of the range. */
const lowFloor = (max: number, difficulty: number, min: number) =>
  Math.max(min, Math.min(max, Math.round(max * (0.4 + 0.3 * difficulty))));

interface Core {
  kind: QuestionKind;
  a: number;
  b: number;
  op: '+' | '-' | null;
  answer: number;
  total: number;
}

function makeAdd(rng: Rng, max: number, difficulty: number, crossTen: boolean): Core {
  if (crossTen && max >= 12 && rng() < difficulty) {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, Math.max(11 - a, 2), Math.min(9, max - a));
    return { kind: 'add', a, b, op: '+', answer: a + b, total: a + b };
  }
  const sum = randInt(rng, lowFloor(max, difficulty, 2), max);
  const a = randInt(rng, 1, sum - 1);
  return { kind: 'add', a, b: sum - a, op: '+', answer: sum, total: sum };
}

function makeSub(rng: Rng, max: number, difficulty: number, crossTen: boolean): Core {
  if (crossTen && max >= 12 && rng() < difficulty) {
    const a = randInt(rng, 11, Math.min(18, max));
    const b = randInt(rng, (a % 10) + 1, 9);
    return { kind: 'sub', a, b, op: '-', answer: a - b, total: a };
  }
  const a = randInt(rng, lowFloor(max, difficulty, 2), max);
  const b = randInt(rng, 1, a - 1);
  return { kind: 'sub', a, b, op: '-', answer: a - b, total: a };
}

function makeCore(rng: Rng, level: MathLevelDef, kind: QuestionKind, difficulty: number): Core {
  const max = maxForDifficulty(level, difficulty);
  switch (kind) {
    case 'count': {
      const n = randInt(rng, 1, max);
      return { kind, a: n, b: 0, op: null, answer: n, total: n };
    }
    case 'compare': {
      // Easy rounds have an obvious difference, harder ones differ by just 1-2.
      const minGap = difficulty < 0.4 ? 3 : 1;
      const maxGap = difficulty < 0.7 ? Math.max(minGap, max - 1) : 2;
      const gap = randInt(rng, minGap, Math.min(maxGap, max - 1));
      const big = randInt(rng, gap + 1, max);
      const small = big - gap;
      const bigFirst = rng() < 0.5;
      const a = bigFirst ? big : small;
      const b = bigFirst ? small : big;
      return { kind, a, b, op: null, answer: big, total: big };
    }
    case 'add':
      return makeAdd(rng, max, difficulty, !!level.crossTen);
    case 'sub':
      return makeSub(rng, max, difficulty, !!level.crossTen);
    case 'missing': {
      // a + ? = total   or   total - ? = a
      const total = randInt(rng, lowFloor(max, difficulty, 3), max);
      const a = randInt(rng, 1, total - 1);
      const op = rng() < 0.5 ? '+' : '-';
      return { kind, a, b: total - a, op, answer: total - a, total };
    }
  }
}

function tokensFor(c: Core): string[] {
  switch (c.kind) {
    case 'count':
    case 'compare':
      return [];
    case 'add':
    case 'sub':
      return [String(c.a), c.op!, String(c.b), '=', '?'];
    case 'missing':
      return c.op === '+'
        ? [String(c.a), '+', '?', '=', String(c.total)]
        : [String(c.total), '-', '?', '=', String(c.a)];
  }
}

/** Clips for the question; numbers are separate clips so every exercise can be said. */
function speakFor(c: Core, item: ItemType): Speech {
  const w = numberWord;
  switch (c.kind) {
    case 'count':
      return `כמה ${ITEM_NAMES[item]} יש?`;
    case 'compare':
      return `איפה יש יותר ${ITEM_NAMES[item]}?`;
    case 'add':
      return [`${w(c.a)} ועוד`, w(c.b), 'כמה זה?'];
    case 'sub':
      return [`${w(c.a)} פחות`, w(c.b), 'כמה זה?'];
    case 'missing':
      return c.op === '+'
        ? [`${w(c.a)} ועוד`, 'כמה זה', w(c.total)]
        : [`${w(c.total)} פחות`, 'כמה זה', w(c.a)];
  }
}

export function makeChoices(rng: Rng, c: Core, count: number, max: number): number[] {
  if (c.kind === 'compare') return [c.a, c.b];
  const minValue = c.kind === 'sub' ? 0 : 1;
  const upper = Math.max(max, c.answer) + 2;
  const candidates = new Set<number>([c.answer - 1, c.answer + 1, c.answer - 2, c.answer + 2]);
  // Common slip: using the opposite operation.
  if (c.kind === 'add') candidates.add(Math.abs(c.a - c.b));
  if (c.kind === 'sub') candidates.add(c.a + c.b);
  const valid = shuffle(rng, [...candidates].filter((n) => n >= minValue && n <= upper && n !== c.answer));
  const chosen = new Set<number>([c.answer, ...valid.slice(0, count - 1)]);
  while (chosen.size < count) chosen.add(randInt(rng, minValue, upper));
  return [...chosen].sort((x, y) => x - y);
}

export function generateQuestion(
  level: MathLevelDef,
  difficulty: number,
  recentKeys: readonly string[] = [],
  rng: Rng = Math.random,
): Question {
  let core: Core | undefined;
  let key = '';
  for (let attempt = 0; attempt < 40; attempt++) {
    const candidate = makeCore(rng, level, pick(rng, level.kinds), difficulty);
    key = keyFor(candidate);
    core = candidate;
    if (!recentKeys.includes(key)) break;
  }
  const c = core!;
  const item = pick(rng, Object.keys(ITEM_NAMES) as ItemType[]);
  const max = maxForDifficulty(level, difficulty);
  return {
    world: 'math',
    key,
    ...c,
    tokens: tokensFor(c),
    item,
    pictures: level.pictures,
    mode: level.mode,
    choices: level.mode === 'choice' ? makeChoices(rng, c, level.choiceCount ?? 3, max) : [],
    speak: speakFor(c, item),
    revealSpeak: ['התשובה היא', numberWord(c.answer)],
  };
}

function keyFor(c: Core): string {
  switch (c.kind) {
    case 'count':
      return `count:${c.a}`;
    case 'compare':
      return `${c.a}?${c.b}`;
    default:
      return tokensFor(c).join(' ');
  }
}
