import { $ } from './dom.js';
import { rankFor } from '../game/ranks.js';
import { worldProgress, isWorldUnlocked, canAfford, isWorldComplete, isWorldNew, dailyChallenge } from '../game/profile.js';

/** Convert a 0xRRGGBB int to a CSS hex string. */
function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }

/**
 * Category order for the hub. Worlds self-declare their `category`, so new
 * worlds slot into the right section automatically — no per-world wiring here.
 * Categories with no built worlds are simply skipped.
 */
const CATEGORY_ORDER = [
  'Nature & Life',
  'Earth & Sky',
  'People & Places',
  'Science & Space',
  'Ideas & Machines',
];
const UNCATEGORIZED = 'More Worlds';

/**
 * Render the World Hub — the home shelf after "Start Exploring". Worlds are
 * grouped into labelled category sections within one scroll. Each card keeps
 * the same icon/name/description/cost pattern; only the grouping is new.
 */
export function renderHub(state, worlds, { onEnter, onLockedTap } = {}) {
  const { rank } = rankFor(state.xp);
  $('hubRank').innerHTML = `${rank[2]} <span>${rank[1].split(' ')[0]}</span>`;
  $('hubStars').textContent = state.stars;
  $('hubStreak').textContent = state.streak.count;
  $('hubBadges').textContent = state.badges.length;

  const unlockedCount = worlds.filter((w) => !w.comingSoon && isWorldUnlocked(state, w)).length;
  $('worldCount').textContent = `${unlockedCount} of ${worlds.length} worlds unlocked`;

  renderDaily(state, worlds);

  // Group worlds by category, preserving registry order within each group.
  const groups = new Map();
  worlds.forEach((w) => {
    const cat = w.category || UNCATEGORIZED;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(w);
  });

  const container = $('worldSections');
  container.innerHTML = '';

  // "Continue" rail — surface what the kid can act on right now so a fresh
  // player taps straight into a world instead of hunting through categories:
  // unlocked-but-unfinished worlds first, then any they can afford to unlock.
  const playable = worlds.filter((w) => !w.comingSoon && isWorldUnlocked(state, w) && !isWorldComplete(state, w));
  const affordable = worlds.filter((w) => !w.comingSoon && !isWorldUnlocked(state, w) && canAfford(state, w));
  const rail = [...playable, ...affordable];
  if (rail.length) {
    const section = document.createElement('div');
    section.className = 'worldSection railSection';
    section.innerHTML = `<div class="worldSectionLabel rail">▶ Ready to Explore <span>tap to play now</span></div>`;
    const grid = document.createElement('div');
    grid.className = 'worldGrid';
    rail.forEach((w) => grid.appendChild(makeCard(state, w, { onEnter, onLockedTap })));
    section.appendChild(grid);
    container.appendChild(section);
  }

  const order = [...CATEGORY_ORDER, ...[...groups.keys()].filter((c) => !CATEGORY_ORDER.includes(c))];
  order.forEach((cat) => {
    const list = groups.get(cat);
    if (!list || !list.length) return;
    const section = document.createElement('div');
    section.className = 'worldSection';
    const gotHere = list.filter((w) => !w.comingSoon && isWorldUnlocked(state, w)).length;
    section.innerHTML = `<div class="worldSectionLabel">${cat} <span>${gotHere}/${list.length}</span></div>`;
    const grid = document.createElement('div');
    grid.className = 'worldGrid';
    list.forEach((w) => grid.appendChild(makeCard(state, w, { onEnter, onLockedTap })));
    section.appendChild(grid);
    container.appendChild(section);
  });
}

function renderDaily(state, worlds) {
  const daily = dailyChallenge(state, worlds);
  const card = $('dailyCard');
  if (!daily) {
    $('dcTitle').textContent = 'Unlock a world to play the daily!';
    $('dcIcon').textContent = '🔒';
    card.className = 'dailyCard done';
    return;
  }
  const subj = daily.world.subjects[daily.subjectKey];
  $('dcIcon').textContent = subj.emoji;
  if (daily.doneToday) {
    $('dcTitle').textContent = 'Done! Come back tomorrow for a new one 🌙';
    $('dcStatus').textContent = '✓';
    card.className = 'dailyCard done';
  } else {
    $('dcTitle').textContent = `${subj.name} — ${daily.world.name}`;
    $('dcStatus').textContent = '▶';
    card.className = 'dailyCard ready';
  }
}

function makeCard(state, world, { onEnter, onLockedTap }) {
  const soon = !!world.comingSoon;
  const unlocked = !soon && isWorldUnlocked(state, world);
  const prog = worldProgress(state, world);
  const complete = !soon && isWorldComplete(state, world);
  const c1 = hex(world.theme.primary);
  const c2 = hex(world.theme.secondary ?? world.theme.primary);

  const card = document.createElement('button');
  card.className = 'worldCard' + (unlocked ? '' : ' locked');
  card.style.background = `linear-gradient(150deg, ${c1}33, ${c2}22), var(--space2)`;
  card.style.borderColor = c1 + '66';

  let lock = '';
  if (soon) {
    lock = `<div class="wLock"><div style="font-size:30px">🔨</div>
      <div class="lockCost">Coming soon</div></div>`;
  } else if (!unlocked) {
    lock = `<div class="wLock"><div style="font-size:30px">🔒</div>
      <div class="lockCost ${canAfford(state, world) ? 'can' : ''}">${canAfford(state, world) ? 'Tap to unlock!' : `${world.unlockCost} ⭐ to unlock`}</div></div>`;
  }

  const isNew = !soon && !complete && isWorldNew(state, world);

  card.innerHTML = `
    ${complete ? '<div class="wDone">🏆</div>' : ''}
    ${isNew ? '<div class="wNew">NEW</div>' : ''}
    <div>
      <div class="wIcon">${world.icon}</div>
      <div class="wName">${world.name}</div>
      <div class="wBlurb">${world.blurb}</div>
    </div>
    <div class="wFoot">
      <div class="wProgBar"><div class="wProgFill" style="width:${prog.pct}%;background:${c1}"></div></div>
      <div class="wProgTxt">${soon ? '—' : `${prog.done}/${prog.total}`}</div>
    </div>
    ${lock}
  `;

  card.onclick = () => {
    if (soon || !unlocked) onLockedTap && onLockedTap(world);
    else onEnter && onEnter(world);
  };
  return card;
}

export function showHub() {
  $('hub').classList.add('open');
  document.body.classList.remove('playing');
  $('panel').classList.remove('open');
}
export function hideHub() {
  $('hub').classList.remove('open');
}
