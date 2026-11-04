import { describe, expect, it } from 'vitest';
import { challengeDifficulty, challengeOpen, pickChallengeLevel, trophiesFor } from './challenge';
import { levelsOf, type World } from './levels';

const WORLDS: World[] = ['math', 'reading', 'english'];

describe('endless challenge', () => {
  it('opens only after the last level is passed', () => {
    for (const world of WORLDS) {
      const levels = levelsOf(world);
      const last = levels[levels.length - 1].id;
      expect(challengeOpen(world, () => false)).toBe(false);
      expect(challengeOpen(world, (id) => id === last)).toBe(true);
    }
  });

  it('gets harder with every stage, up to the top', () => {
    expect(challengeDifficulty(1)).toBeCloseTo(0.3);
    expect(challengeDifficulty(5)).toBeGreaterThan(challengeDifficulty(4));
    expect(challengeDifficulty(1000)).toBe(1);
  });

  it('mixes levels of the same world and drops the easiest ones later on', () => {
    for (const world of WORLDS) {
      const levels = levelsOf(world);
      const seen = (stage: number) => new Set(Array.from({ length: 2000 }, () => pickChallengeLevel(world, stage).id));
      expect(seen(1).size).toBe(levels.length);
      const late = seen(500);
      expect(late.has(levels[0].id)).toBe(false);
      expect(late.has(levels[levels.length - 1].id)).toBe(true);
      for (const id of late) expect(levels.map((l) => l.id)).toContain(id);
    }
  });

  it('gives a trophy every five stages', () => {
    expect(trophiesFor(4)).toBe(0);
    expect(trophiesFor(5)).toBe(1);
    expect(trophiesFor(12)).toBe(2);
  });
});

describe('dinosaurs', () => {
  it('hatch from every level, one each', async () => {
    const { DINOS } = await import('../components/dinos');
    const { ALL_LEVELS } = await import('./levels');
    expect(DINOS.map((d) => d.levelId).sort()).toEqual(ALL_LEVELS.map((l) => l.id).sort());
  });
});
