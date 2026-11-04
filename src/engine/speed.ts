import { randInt, type Rng } from './random';

export const SPEED_SECONDS = 60;

export interface Fact {
  a: number;
  b: number;
  op: '×' | '÷';
  answer: number;
}

/** A multiplication-table fact up to 10 × 10, or the division that undoes it. */
export function speedFact(rng: Rng = Math.random, previous?: Fact): Fact {
  for (;;) {
    const x = randInt(rng, 2, 10);
    const y = randInt(rng, 2, 10);
    const fact: Fact = rng() < 0.6 ? { a: x, b: y, op: '×', answer: x * y } : { a: x * y, b: x, op: '÷', answer: y };
    if (!previous || fact.a !== previous.a || fact.b !== previous.b || fact.op !== previous.op) return fact;
  }
}
