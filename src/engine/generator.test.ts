import { describe, expect, it } from 'vitest';
import { generateQuestion, maxForDifficulty } from './generator';
import { LEVELS } from './levels';

const DIFFICULTIES = [0, 0.3, 0.6, 1];

describe('generateQuestion', () => {
  for (const level of LEVELS) {
    it(`level ${level.id} produces valid questions`, () => {
      for (const difficulty of DIFFICULTIES) {
        const max = maxForDifficulty(level, difficulty);
        for (let i = 0; i < 1000; i++) {
          const q = generateQuestion(level, difficulty);
          expect(level.kinds).toContain(q.kind);
          expect(q.answer).toBeGreaterThanOrEqual(q.kind === 'count' ? 1 : 0);
          expect(q.answer).toBeLessThanOrEqual(max);
          expect(q.a).toBeGreaterThanOrEqual(1);

          switch (q.kind) {
            case 'count':
              expect(q.answer).toBe(q.a);
              break;
            case 'compare':
              expect(q.a).not.toBe(q.b);
              expect(q.answer).toBe(Math.max(q.a, q.b));
              break;
            case 'add':
              expect(q.answer).toBe(q.a + q.b);
              break;
            case 'sub':
              expect(q.answer).toBe(q.a - q.b);
              expect(q.answer).toBeGreaterThanOrEqual(1);
              break;
            case 'missing':
              expect(q.a + q.answer).toBe(q.total);
              expect(q.answer).toBeGreaterThanOrEqual(1);
              expect(q.tokens).toContain('?');
              break;
          }

          if (level.mode === 'choice') {
            expect(q.choices).toContain(q.answer);
            expect(new Set(q.choices).size).toBe(q.choices.length);
            expect(q.choices.length).toBe(q.kind === 'compare' ? 2 : level.choiceCount ?? 3);
            for (const c of q.choices) {
              expect(c).toBeGreaterThanOrEqual(0);
              expect(c).toBeLessThanOrEqual(max + 2);
            }
          } else {
            expect(q.choices).toEqual([]);
          }
        }
      }
    });
  }

  it('avoids recently seen questions when possible', () => {
    const level = LEVELS.find((l) => l.id === 9)!;
    for (let i = 0; i < 200; i++) {
      const recent = Array.from({ length: 5 }, () => generateQuestion(level, 0.5).key);
      const q = generateQuestion(level, 0.5, recent);
      expect(recent).not.toContain(q.key);
    }
  });

  it('uses crossing-ten exercises in the master level', () => {
    const level = LEVELS.find((l) => l.id === 12)!;
    const crossing = Array.from({ length: 300 }, () => generateQuestion(level, 1)).filter(
      (q) => (q.kind === 'add' && (q.a % 10) + (q.b % 10) >= 10) || (q.kind === 'sub' && q.a % 10 < q.b),
    );
    expect(crossing.length).toBeGreaterThan(50);
  });
});
