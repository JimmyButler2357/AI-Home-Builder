// Elo with vote-count-decayed K (LOCKED):
//   K = 32 below 30 votes, 16 from 30-100, 8 above 100.
// Ties score 0.5 for both sides.

export function kFor(voteCount: number): number {
  if (voteCount < 30) return 32;
  if (voteCount <= 100) return 16;
  return 8;
}

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export type EloResult = { ratingA: number; ratingB: number };

/** scoreA: 1 = A won, 0 = B won, 0.5 = tie. K decays per item independently. */
export function eloUpdate(
  ratingA: number,
  ratingB: number,
  voteCountA: number,
  voteCountB: number,
  scoreA: number,
): EloResult {
  const eA = expectedScore(ratingA, ratingB);
  const eB = 1 - eA;
  const scoreB = 1 - scoreA;
  return {
    ratingA: ratingA + kFor(voteCountA) * (scoreA - eA),
    ratingB: ratingB + kFor(voteCountB) * (scoreB - eB),
  };
}
