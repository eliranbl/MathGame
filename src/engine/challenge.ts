import { levelsOf, type LevelDef, type World } from './levels';
import { pick, type Rng } from './random';

/** A trophy every this many stages passed. */
export const TROPHY_EVERY = 5;

/** The challenge opens once the world's last level is passed. */
export const challengeOpen = (world: World, completed: (levelId: number) => boolean) => {
  const levels = levelsOf(world);
  return completed(levels[levels.length - 1].id);
};

/** Starting difficulty of a stage: every stage starts a little harder, up to the top. */
export const challengeDifficulty = (stage: number) => Math.min(1, 0.3 + 0.07 * (stage - 1));

/**
 * The level one question of a stage is taken from. Every learned level is mixed in;
 * as stages go up the easiest levels drop out, until only the harder half is left.
 */
export function pickChallengeLevel(world: World, stage: number, rng: Rng = Math.random): LevelDef {
  const levels = levelsOf(world);
  const skip = Math.min(Math.floor(levels.length / 2), Math.floor(((stage - 1) * levels.length) / 20));
  return pick(rng, levels.slice(skip));
}

export const trophiesFor = (stagesPassed: number) => Math.floor(stagesPassed / TROPHY_EVERY);
