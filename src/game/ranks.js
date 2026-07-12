/**
 * Shared player ranks, earned by total XP across every world. Kept generic
 * ("Explorer") so they read well whether you're in space, the ocean, or the
 * age of dinosaurs. [minXP, name, icon]
 */
export const RANKS = [
  [0, 'Junior Explorer', '🧭'],
  [80, 'Field Scout', '🔎'],
  [200, 'Expedition Leader', '🎒'],
  [380, 'World Ranger', '🛰️'],
  [620, 'Master Explorer', '👑'],
];

export function rankFor(xp) {
  let rank = RANKS[0], index = 1;
  RANKS.forEach((rk, i) => { if (xp >= rk[0]) { rank = rk; index = i + 1; } });
  const next = RANKS[index] ? RANKS[index][0] : rank[0];
  const isMax = index >= RANKS.length;
  const pct = isMax ? 100 : Math.min(100, ((xp - rank[0]) / (next - rank[0])) * 100);
  return { rank, index, next, isMax, pct, total: RANKS.length };
}
