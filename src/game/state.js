/**
 * Save system — localStorage with a safe in-memory fallback (works in
 * private mode, embedded webviews, etc). The schema is shared across every
 * world so kids see one continuous profile:
 *
 *   { xp, stars,
 *     done:     { worldKey: { subjectKey: true } },   // passed a mission
 *     badges:   [ "worldKey:subjectKey", ... ],       // perfect-score collectibles
 *     unlocked: { worldKey: true },                   // worlds opened
 *     streak:   { count, last },                      // consecutive days
 *     daily:    { date, ref, done },                  // daily challenge gate
 *     lastPlayed, flags }
 */
const KEY = 'exploraquest_save';
const LEGACY_KEY = 'cq_save';

const mem = {};
const store = {
  get(k) { try { return localStorage.getItem(k) ?? mem[k] ?? null; } catch { return mem[k] ?? null; } },
  set(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

function fresh() {
  return { xp: 0, stars: 0, done: {}, badges: [], unlocked: { universe: true },
    streak: { count: 0, last: null }, daily: { date: null, ref: null, done: false },
    lastPlayed: null, flags: {} };
}

/** Pull an old single-world CosmosQuest save into the multi-world schema. */
function migrateLegacy(s) {
  try {
    const old = JSON.parse(store.get(LEGACY_KEY) || 'null');
    if (old && (old.xp || old.stars || old.done)) {
      s.xp = old.xp || 0;
      s.stars = old.stars || 0;
      s.done.universe = {};
      Object.keys(old.done || {}).forEach((k) => { s.done.universe[k] = true; });
    }
  } catch { /* ignore */ }
  return s;
}

export function loadState() {
  let s;
  try { s = JSON.parse(store.get(KEY) || 'null'); } catch { s = null; }
  if (!s) s = migrateLegacy(fresh());
  // Fill any keys added in later versions.
  return Object.assign(fresh(), s, {
    done: s.done || {},
    badges: s.badges || [],
    unlocked: Object.assign({ universe: true }, s.unlocked),
    streak: s.streak || { count: 0, last: null },
    daily: s.daily || { date: null, ref: null, done: false },
    flags: s.flags || {},
  });
}

export function saveState(state) {
  store.set(KEY, JSON.stringify(state));
}

/** Local YYYY-MM-DD, used for streaks and the daily challenge. */
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Whole-day difference between two YYYY-MM-DD strings. */
export function daysBetween(a, b) {
  if (!a || !b) return Infinity;
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
}
