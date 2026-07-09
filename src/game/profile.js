import { rankFor } from './ranks.js';
import { today, daysBetween } from './state.js';

/** A subject "passes" with a clear majority right — keeps it winnable but real. */
export function passThreshold(total) { return Math.max(1, Math.ceil(total * 0.6)); }

export function isSubjectDone(state, worldKey, subjectKey) {
  return !!(state.done[worldKey] && state.done[worldKey][subjectKey]);
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
 * Apply a finished mission to the shared profile. Returns a summary the UI
 * uses to show rewards, rank-ups, new badges and world-completion moments.
 */
export function recordMission(state, world, subjectKey, correct, total, { bonus = 0 } = {}) {
  const wasDone = isSubjectDone(state, world.key, subjectKey);
  const passed = correct >= passThreshold(total);
  const perfect = correct === total;

  let xpGain = correct * 10 + (perfect ? 10 : 0) + bonus;
  if (wasDone) xpGain = Math.floor(xpGain / 2);
  const starGain = wasDone ? (passed ? 1 : 0) : correct;

  const before = rankFor(state.xp).index;
  state.xp += xpGain;
  state.stars += starGain;
  const after = rankFor(state.xp);

  if (passed) {
    state.done[world.key] = state.done[world.key] || {};
    state.done[world.key][subjectKey] = true;
  }

  let newBadge = null;
  if (perfect && !hasBadge(state, world.key, subjectKey)) {
    const subj = world.subjects[subjectKey];
    state.badges.push(badgeId(world.key, subjectKey));
    newBadge = { emoji: subj.emoji, name: subj.badge || `${subj.name} Expert` };
  }

  const flag = `world_done_${world.key}`;
  let worldComplete = false;
  if (isWorldComplete(state, world) && !state.flags[flag]) {
    state.flags[flag] = true;
    worldComplete = true;
  }

  return {
    passed, perfect, xpGain, starGain, wasDone, newBadge, worldComplete,
    rankUp: after.index > before ? after.rank : null,
  };
}

/** Update the consecutive-day streak. Call once when a session starts. */
export function touchStreak(state) {
  const t = today();
  const gap = daysBetween(state.streak.last, t);
  if (gap === 0) return state.streak; // already counted today
  if (gap === 1) state.streak.count += 1;
  else state.streak.count = 1; // reset (including first-ever play)
  state.streak.last = t;
  state.lastPlayed = t;
  return state.streak;
}

/**
 * Pick today's daily-challenge subject deterministically (same subject all
 * day) from the pool of subjects in unlocked worlds. Bonus stars, once daily.
 */
export function dailyChallenge(state, worlds) {
  const t = today();
  const pool = [];
  worlds.forEach((w) => {
    if (!isWorldUnlocked(state, w)) return;
    Object.keys(w.subjects).forEach((k) => pool.push({ world: w, subjectKey: k }));
  });
  if (!pool.length) return null;

  // Seed a stable index from the date so everyone gets the same daily.
  let seed = 0;
  for (const ch of t) seed = (seed * 31 + ch.charCodeAt(0)) & 0xffffffff;
  const pick = pool[Math.abs(seed) % pool.length];

  const ref = badgeId(pick.world.key, pick.subjectKey);
  const doneToday = state.daily.date === t && state.daily.done;
  return { world: pick.world, subjectKey: pick.subjectKey, ref, doneToday, date: t };
}

export function markDailyDone(state, ref) {
  state.daily = { date: today(), ref, done: true };
}
