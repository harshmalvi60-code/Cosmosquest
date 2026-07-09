import { $ } from './dom.js';
import { rankFor } from '../game/ranks.js';

/** Refresh the shared top HUD from the profile — rank, XP bar, stars, streak. */
export function refreshHUD(state) {
  const { rank, index, next, isMax, pct, total } = rankFor(state.xp);
  $('rankIcon').textContent = rank[2];
  $('rankName').textContent = rank[1];
  $('rankSub').textContent = `Rank ${index} of ${total}`;
  $('xpFill').style.width = pct + '%';
  $('xpLabel').textContent = isMax ? `XP ${state.xp} · MAX RANK 👑` : `XP ${state.xp} / ${next}`;
  $('starCount').textContent = state.stars;
  $('streakCount').textContent = state.streak.count;
  $('streakChip').style.display = state.streak.count > 1 ? 'flex' : 'none';
}
