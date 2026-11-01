export const PASS_RATIO = 0.7;
export const RECENT_LIMIT = 5;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Difficulty inside a level: two first-try answers in a row push it up,
 * any mistake pulls it down.
 */
export function nextDifficulty(difficulty: number, correct: boolean, streak: number): number {
  if (!correct) return clamp(difficulty - 0.2);
  if (streak > 0 && streak % 2 === 0) return clamp(difficulty + 0.15);
  return difficulty;
}

export function isPassed(correctFirstTry: number, total: number): boolean {
  return total > 0 && correctFirstTry >= Math.ceil(total * PASS_RATIO);
}

export function pushRecent(recent: readonly string[], key: string): string[] {
  return [...recent, key].slice(-RECENT_LIMIT);
}
