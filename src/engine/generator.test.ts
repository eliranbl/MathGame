import { describe, expect, it } from 'vitest';
import { generateQuestion, maxForDifficulty } from './generator';
import { numberWord } from './hebrew';
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
            case 'double':
              expect(q.b).toBe(q.a);
              expect(q.answer).toBe(q.a * 2);
              break;
            case 'half':
              expect(q.total % 2).toBe(0);
              expect(q.answer * 2).toBe(q.total);
              expect(q.tokens).toEqual([String(q.total), '=', '?', '+', '?']);
              break;
            case 'mul':
              expect(q.answer).toBe(q.a * q.b);
              if (level.tables) expect(level.tables.includes(q.a) || level.tables.includes(q.b)).toBe(true);
              else expect(Math.max(q.a, q.b)).toBeLessThanOrEqual(5);
              break;
          }

          if (level.step) {
            for (const n of [q.a, q.b, q.answer]) expect(n % level.step).toBe(0);
          }
          // Two-digit levels without crossTen never carry or borrow.
          if (max > 20 && !level.crossTen && !level.step) {
            if (q.kind === 'add') expect((q.a % 10) + (q.b % 10)).toBeLessThan(10);
            if (q.kind === 'sub') expect(q.a % 10).toBeGreaterThanOrEqual(q.b % 10);
          }

          if (level.mode === 'choice') {
            expect(q.choices).toContain(q.answer);
            expect(new Set(q.choices).size).toBe(q.choices.length);
            expect(q.choices.length).toBe(q.kind === 'compare' ? 2 : level.choiceCount ?? 3);
            for (const c of q.choices) {
              expect(c).toBeGreaterThanOrEqual(0);
              expect(c).toBeLessThanOrEqual(max + 2 * (level.step ?? 1));
              if (level.step) expect(c % level.step).toBe(0);
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

  it('carries in two-digit exercises on hard rounds of level 18', () => {
    const level = LEVELS.find((l) => l.id === 18)!;
    const carrying = Array.from({ length: 300 }, () => generateQuestion(level, 1)).filter(
      (q) => (q.kind === 'add' && (q.a % 10) + (q.b % 10) >= 10) || (q.kind === 'sub' && q.a % 10 < q.b % 10),
    );
    expect(carrying.length).toBeGreaterThan(200);
  });

  it('says every number up to 100 in words', () => {
    expect(numberWord(20)).toBe('עשרים');
    expect(numberWord(23)).toBe('עשרים ושלוש');
    expect(numberWord(100)).toBe('מאה');
    for (let n = 0; n <= 100; n++) expect(numberWord(n)).not.toMatch(/\d/);
  });

  it('uses crossing-ten exercises in the master level', () => {
    const level = LEVELS.find((l) => l.id === 12)!;
    const crossing = Array.from({ length: 300 }, () => generateQuestion(level, 1)).filter(
      (q) => (q.kind === 'add' && (q.a % 10) + (q.b % 10) >= 10) || (q.kind === 'sub' && q.a % 10 < q.b),
    );
    expect(crossing.length).toBeGreaterThan(50);
  });
});
