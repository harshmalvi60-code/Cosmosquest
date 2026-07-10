import { rankFor } from './ranks.js';
import { worldProgress, isWorldComplete, isWorldUnlocked, displayStreak } from './profile.js';

/**
 * Milestones the game celebrates with a pop-up banner and collects on the
 * Journey screen. Each has a `test(ctx)` over a small computed snapshot so the
 * rules stay declarative. Order here is the display order in the collection.
 */
export const ACHIEVEMENTS = [
  { id: 'first_star',   icon: '⭐', name: 'First Star',       desc: 'Earn your very first star',            test: (c) => c.stars >= 1 },
  { id: 'first_badge',  icon: '🏅', name: 'Badge Collector',  desc: 'Earn your first badge',                test: (c) => c.badges >= 1 },
  { id: 'explorer_10',  icon: '🧭', name: 'Getting Curious',  desc: 'Explore 10 subjects',                  test: (c) => c.subjects >= 10 },
  { id: 'stars_25',     icon: '✨', name: 'Star Gatherer',    desc: 'Reach 25 stars',                       test: (c) => c.stars >= 25 },
  { id: 'streak_3',     icon: '🔥', name: 'On a Roll',        desc: 'Play 3 days in a row',                 test: (c) => c.streak >= 3 },
  { id: 'first_master', icon: '🏆', name: 'World Master',     desc: 'Master every subject in a world',      test: (c) => c.mastered >= 1 },
  { id: 'unlock_5',     icon: '🔓', name: 'Trailblazer',      desc: 'Unlock 5 worlds',                      test: (c) => c.unlocked >= 5 },
  { id: 'explorer_50',  icon: '🌍', name: 'Globe Trotter',    desc: 'Explore 50 subjects',                  test: (c) => c.subjects >= 50 },
  { id: 'badges_15',    icon: '🎖️', name: 'Ace Collector',    desc: 'Earn 15 badges',                       test: (c) => c.badges >= 15 },
  { id: 'stars_100',    icon: '💫', name: 'Star Captain',     desc: 'Reach 100 stars',                      test: (c) => c.stars >= 100 },
  { id: 'streak_7',     icon: '📆', name: 'Week Streak',      desc: 'Play 7 days in a row',                 test: (c) => c.streak >= 7 },
  { id: 'master_5',     icon: '👑', name: 'Grand Master',     desc: 'Master 5 whole worlds',                test: (c) => c.mastered >= 5 },
  { id: 'rank_max',     icon: '🚀', name: 'Master Explorer',  desc: 'Reach the top explorer rank',          test: (c) => c.maxRank },
  { id: 'explorer_120', icon: '🔭', name: 'Deep Explorer',    desc: 'Explore 120 subjects',                 test: (c) => c.subjects >= 120 },
  { id: 'unlock_all',   icon: '🗺️', name: 'Whole World',      desc: 'Unlock all 20 worlds',                 test: (c) => c.allUnlocked },
  { id: 'master_all',   icon: '🌟', name: 'Legend',           desc: 'Master every single world',            test: (c) => c.mastered >= c.worldCount },
];

/** Build the snapshot the tests run against. */
function snapshot(state, worlds) {
  let subjects = 0, mastered = 0;
  worlds.forEach((w) => { subjects += worldProgress(state, w).done; if (isWorldComplete(state, w)) mastered++; });
  const unlocked = worlds.filter((w) => !w.comingSoon && isWorldUnlocked(state, w)).length;
  const realWorlds = worlds.filter((w) => !w.comingSoon).length;
  return {
    stars: state.stars, badges: state.badges.length, subjects, mastered,
    unlocked, streak: displayStreak(state), maxRank: rankFor(state.xp).isMax,
    worldCount: realWorlds, allUnlocked: unlocked >= realWorlds,
  };
}

/**
 * Mark any newly-satisfied achievements as earned and return their metadata so
 * the UI can celebrate them. Safe to call after any progress event.
 */
export function checkAchievements(state, worlds) {
  state.achievements = state.achievements || [];
  const snap = snapshot(state, worlds);
  const fresh = [];
  ACHIEVEMENTS.forEach((a) => {
    if (!state.achievements.includes(a.id) && a.test(snap)) {
      state.achievements.push(a.id);
      fresh.push(a);
    }
  });
  return fresh;
}

export function hasAchievement(state, id) {
  return !!(state.achievements && state.achievements.includes(id));
}
