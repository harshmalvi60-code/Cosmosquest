import { $ } from './dom.js';
import { rankFor } from '../game/ranks.js';
import { displayStreak, activeTitle } from '../game/profile.js';

/** Refresh the shared top HUD from the profile — rank, XP bar, stars, streak, title. */
export function refreshHUD(state) {
  const { rank, index, next, isMax, pct, total } = rankFor(state.xp);
  $('rankIcon').textContent = rank[2];
  $('rankName').textContent = rank[1];
  $('rankSub').textContent = `Rank ${index} of ${total}`;
  $('xpFill').style.width = pct + '%';
  $('xpLabel').textContent = isMax ? `XP ${state.xp} · MAX RANK 👑` : `XP ${state.xp} / ${next}`;
  $('starCount').textContent = state.stars;

  const streak = displayStreak(state);
  $('streakCount').textContent = streak;
  $('streakChip').style.display = streak > 1 ? 'flex' : 'none';

  const title = activeTitle(state);
  $('titleText').textContent = title || '';
  $('titleChip').style.display = title ? 'flex' : 'none';
}
