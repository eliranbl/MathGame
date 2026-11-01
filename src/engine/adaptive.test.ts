import { describe, expect, it } from 'vitest';
import { isPassed, nextDifficulty, pushRecent } from './adaptive';
import { pointsFor, starsFor } from './scoring';

describe('nextDifficulty', () => {
  it('rises after every second correct answer in a row', () => {
    expect(nextDifficulty(0.5, true, 1)).toBe(0.5);
    expect(nextDifficulty(0.5, true, 2)).toBeCloseTo(0.65);
  });

  it('drops after a mistake and stays within 0..1', () => {
    expect(nextDifficulty(0.5, false, 0)).toBeCloseTo(0.3);
    expect(nextDifficulty(0.1, false, 0)).toBe(0);
    expect(nextDifficulty(0.95, true, 4)).toBe(1);
  });
});

describe('isPassed', () => {
  it('requires 70% first-try answers', () => {
    expect(isPassed(7, 10)).toBe(true);
    expect(isPassed(6, 10)).toBe(false);
    expect(isPassed(4, 5)).toBe(true);
    expect(isPassed(3, 5)).toBe(false);
  });
});

describe('pushRecent', () => {
  it('keeps the last five keys', () => {
    expect(pushRecent(['a', 'b', 'c', 'd', 'e'], 'f')).toEqual(['b', 'c', 'd', 'e', 'f']);
  });
});

describe('scoring', () => {
  it('awards points and streak bonus', () => {
    expect(pointsFor(true, 1)).toBe(10);
    expect(pointsFor(true, 3)).toBe(15);
    expect(pointsFor(false, 0)).toBe(5);
  });

  it('gives at least one star', () => {
    expect(starsFor(10, 10)).toBe(3);
    expect(starsFor(8, 10)).toBe(2);
    expect(starsFor(0, 10)).toBe(1);
  });
});
