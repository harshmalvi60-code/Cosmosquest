/**
 * Save system — localStorage with a safe in-memory fallback (works in
 * private mode, embedded webviews, etc). One shared profile across worlds:
 *
 *   { xp, stars,
 *     done:     { worldKey: { subjectKey: bestScore } },  // best # correct on a passed mission
 *     badges:   [ "worldKey:subjectKey", ... ],           // perfect-score collectibles
 *     unlocked: { worldKey: true },                       // worlds opened (progression gate)
 *     streak:   { count, lastDate },                      // consecutive days with a mission done
 *     dailyChallenge: { subjectKey, worldKey, completedDate },
 *     titles:   [ "Nature Master 🌿", ... ],              // cosmetic world-master titles
 *     lastPlayed, flags }
 *
 * `done` stores the best score (a number) rather than a boolean so we can show
 * per-subject results; any entry present means the subject was passed.
 */
const KEY = 'exploraquest_save';
const LEGACY_KEY = 'cq_save';

const mem = {};
const store = {
  get(k) { try { return localStorage.getItem(k) ?? mem[k] ?? null; } catch { return mem[k] ?? null; } },
  set(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

function fresh() {
  return {
    xp: 0, stars: 0, done: {}, badges: [], unlocked: { universe: true },
    streak: { count: 0, lastDate: null },
    dailyChallenge: { subjectKey: null, worldKey: null, completedDate: null },
    titles: [], lastPlayed: null, flags: {},
    avatar: null, name: null, // chosen explorer buddy + name (set on first run)
    visited: {}, // worldKey -> true once opened, so we can show a "NEW" tag
  };
}

/** Pull an old single-world CosmosQuest save into the multi-world schema. */
function migrateLegacy(s) {
  try {
    const old = JSON.parse(store.get(LEGACY_KEY) || 'null');
    if (old && (old.xp || old.stars || old.done)) {
      s.xp = old.xp || 0;
      s.stars = old.stars || 0;
      s.done.universe = {};
      Object.keys(old.done || {}).forEach((k) => { s.done.universe[k] = 2; });
    }
  } catch { /* ignore */ }
  return s;
}

/** Bring any older ExploraQuest save up to the current schema without wiping. */
function migrateV1(s) {
  const badges = s.badges || [];
  // done: booleans -> best-score numbers.
  const done = {};
  Object.keys(s.done || {}).forEach((wk) => {
    done[wk] = {};
    Object.keys(s.done[wk] || {}).forEach((sk) => {
      const v = s.done[wk][sk];
      if (typeof v === 'number') done[wk][sk] = v;
      else if (v) done[wk][sk] = badges.includes(`${wk}:${sk}`) ? 3 : 2;
    });
  });
  // streak: {count,last} -> {count,lastDate}
  const streak = s.streak || {};
  const streakNew = { count: streak.count || 0, lastDate: streak.lastDate ?? streak.last ?? null };
  // daily: {date,ref,done} -> dailyChallenge:{subjectKey,worldKey,completedDate}
  let daily = s.dailyChallenge;
  if (!daily) {
    const old = s.daily || {};
    const [wk, sk] = (old.ref || ':').split(':');
    daily = { worldKey: wk || null, subjectKey: sk || null, completedDate: old.done ? (old.date || null) : null };
  }
  return Object.assign(fresh(), s, {
    done,
    badges,
    unlocked: Object.assign({ universe: true }, s.unlocked),
    streak: streakNew,
    dailyChallenge: daily,
    titles: s.titles || [],
    flags: s.flags || {},
  });
}

export function loadState() {
  let s;
  try { s = JSON.parse(store.get(KEY) || 'null'); } catch { s = null; }
  if (!s) return migrateLegacy(fresh());
  return migrateV1(s);
}

export function saveState(state) {
  store.set(KEY, JSON.stringify(state));
}

/** Local YYYY-MM-DD, used for streaks and the daily challenge. */
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Whole-day difference between two YYYY-MM-DD strings (b - a). */
export function daysBetween(a, b) {
  if (!a || !b) return Infinity;
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
}
