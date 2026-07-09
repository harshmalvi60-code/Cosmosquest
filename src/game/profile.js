import { rankFor } from './ranks.js';
import { today, daysBetween } from './state.js';

/** A subject "passes" with a clear majority right — winnable but real. */
export function passThreshold(total) { return Math.max(1, Math.ceil(total * 0.6)); }

export function isSubjectDone(state, worldKey, subjectKey) {
  return !!(state.done[worldKey] && state.done[worldKey][subjectKey]);
}
export function subjectScore(state, worldKey, subjectKey) {
  return (state.done[worldKey] && state.done[worldKey][subjectKey]) || 0;
}
export function badgeId(worldKey, subjectKey) { return `${worldKey}:${subjectKey}`; }
export function hasBadge(state, worldKey, subjectKey) {
  return state.badges.includes(badgeId(worldKey, subjectKey));
}

/** How many subjects in a world have been passed. */
export function worldProgress(state, world) {
  const keys = Object.keys(world.subjects);
  const done = keys.filter((k) => isSubjectDone(state, world.key, k)).length;
  return { done, total: keys.length, pct: keys.length ? Math.round((done / keys.length) * 100) : 0 };
}

export function isWorldComplete(state, world) {
  const { done, total } = worldProgress(state, world);
  return total > 0 && done === total;
}

export function isWorldUnlocked(state, world) {
  return world.unlockCost === 0 || !!state.unlocked[world.key];
}
export function canAfford(state, world) {
  return state.stars >= world.unlockCost;
}
/** Unlocking is a progression gate, not a purchase — stars are NOT spent,
 *  so the profile's star total keeps climbing toward ranks. */
export function unlockWorld(state, world) {
  state.unlocked[world.key] = true;
}

/**
 * Update the consecutive-day streak — counts calendar days on which at least
 * one mission was completed. Call once per finished mission.
 */
export function bumpStreak(state) {
  const t = today();
  const gap = daysBetween(state.streak.lastDate, t);
  if (gap === 0) return state.streak;      // already counted today
  if (gap === 1) state.streak.count += 1;  // consecutive day
  else state.streak.count = 1;             // first play or a missed day
  state.streak.lastDate = t;
  return state.streak;
}

/** Streak to display: stale if the last active day was before yesterday. */
export function displayStreak(state) {
  const gap = daysBetween(state.streak.lastDate, today());
  return gap <= 1 ? state.streak.count : 0;
}

/** Cosmetic title to show beside the rank (the most recently earned). */
export function activeTitle(state) {
  return state.titles.length ? state.titles[state.titles.length - 1] : null;
}

/**
 * Apply a finished mission to the shared profile. Returns a summary the UI
 * uses for rewards, rank-ups, new badges, streaks and world-master titles.
 */
export function recordMission(state, world, subjectKey, correct, total, { bonusStars = 0 } = {}) {
  const wasDone = isSubjectDone(state, world.key, subjectKey);
  const passed = correct >= passThreshold(total);
  const perfect = correct === total;

  let xpGain = correct * 10 + (perfect ? 10 : 0);
  if (wasDone) xpGain = Math.floor(xpGain / 2);
  // Daily-challenge bonus stars are awarded on a passing run only.
  const starGain = (wasDone ? (passed ? 1 : 0) : correct) + (passed ? bonusStars : 0);

  const before = rankFor(state.xp).index;
  state.xp += xpGain;
  state.stars += starGain;
  const after = rankFor(state.xp);

  if (passed) {
    state.done[world.key] = state.done[world.key] || {};
    state.done[world.key][subjectKey] = Math.max(subjectScore(state, world.key, subjectKey), correct);
  }

  let newBadge = null;
  if (perfect && !hasBadge(state, world.key, subjectKey)) {
    const subj = world.subjects[subjectKey];
    state.badges.push(badgeId(world.key, subjectKey));
    newBadge = { emoji: subj.emoji, name: subj.badge || `${subj.name} Expert` };
  }

  // World mastery: first time every subject is passed, grant the cosmetic title.
  let worldComplete = false, newTitle = null;
  const title = world.masterTitle || `${world.name} Master`;
  if (isWorldComplete(state, world) && !state.titles.includes(title)) {
    state.titles.push(title);
    worldComplete = true;
    newTitle = title;
  }

  bumpStreak(state);

  return {
    passed, perfect, xpGain, starGain, wasDone, newBadge, worldComplete, newTitle,
    rankUp: after.index > before ? after.rank : null,
  };
}

/**
 * Pick today's daily-challenge subject deterministically (same all day) from
 * the subjects of unlocked worlds. Bonus stars, once per calendar day.
 */
export function dailyChallenge(state, worlds) {
  const t = today();
  const pool = [];
  worlds.forEach((w) => {
    if (w.comingSoon || !isWorldUnlocked(state, w)) return;
    Object.keys(w.subjects).forEach((k) => pool.push({ world: w, subjectKey: k }));
  });
  if (!pool.length) return null;

  let seed = 0;
  for (const ch of t) seed = (seed * 31 + ch.charCodeAt(0)) & 0xffffffff;
  const pick = pool[Math.abs(seed) % pool.length];
  const doneToday = state.dailyChallenge.completedDate === t;
  return { world: pick.world, subjectKey: pick.subjectKey, doneToday, date: t };
}

export function markDailyDone(state, worldKey, subjectKey) {
  state.dailyChallenge = { worldKey, subjectKey, completedDate: today() };
}
