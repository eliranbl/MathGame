export const FIRST_TRY_POINTS = 10;
export const SECOND_TRY_POINTS = 5;
export const STREAK_BONUS = 5;

/** Points for a correct answer. `streak` already includes this answer. */
export function pointsFor(firstTry: boolean, streak: number): number {
  const base = firstTry ? FIRST_TRY_POINTS : SECOND_TRY_POINTS;
  const bonus = firstTry && streak > 0 && streak % 3 === 0 ? STREAK_BONUS : 0;
  return base + bonus;
}

/** Every finished round earns at least one star. */
export function starsFor(correctFirstTry: number, total: number): 1 | 2 | 3 {
  if (total > 0 && correctFirstTry === total) return 3;
  if (correctFirstTry >= Math.ceil(total * 0.8)) return 2;
  return 1;
}
