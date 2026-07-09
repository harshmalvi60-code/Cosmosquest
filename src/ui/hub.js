import { $ } from './dom.js';
import { rankFor } from '../game/ranks.js';
import { worldProgress, isWorldUnlocked, canAfford, isWorldComplete, dailyChallenge } from '../game/profile.js';

/** Convert a 0xRRGGBB int to a CSS hex string. */
function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }

/**
 * Render the World Hub — the home shelf of worlds after "Start Exploring".
 * Each card shows its theme colour, icon, progress and lock state.
 */
export function renderHub(state, worlds, { onEnter, onLockedTap } = {}) {
  const { rank } = rankFor(state.xp);
  $('hubRank').innerHTML = `${rank[2]} <span>${rank[1].split(' ')[0]}</span>`;
  $('hubStars').textContent = state.stars;
  $('hubStreak').textContent = state.streak.count;
  $('hubBadges').textContent = state.badges.length;

  // Daily challenge card.
  const daily = dailyChallenge(state, worlds);
  const card = $('dailyCard');
  if (!daily) {
    $('dcTitle').textContent = 'Unlock a world to play the daily!';
    $('dcIcon').textContent = '🔒';
    card.className = 'dailyCard done';
  } else {
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

  const grid = $('worldGrid');
  grid.innerHTML = '';

  worlds.forEach((world) => {
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

    card.innerHTML = `
      ${complete ? '<div class="wDone">🏆</div>' : ''}
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
      if (soon) onLockedTap && onLockedTap(world);
      else if (unlocked) onEnter && onEnter(world);
      else onLockedTap && onLockedTap(world);
    };
    grid.appendChild(card);
  });
}

export function showHub() {
  $('hub').classList.add('open');
  document.body.classList.remove('playing');
  $('panel').classList.remove('open');
}
export function hideHub() {
  $('hub').classList.remove('open');
}
