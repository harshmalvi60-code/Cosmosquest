import { $ } from './dom.js';
import { hasBadge } from '../game/profile.js';

/**
 * "My Collection" — every subject that can earn a perfect-score badge, across
 * all worlds, shown earned vs. locked so kids see what's left to collect.
 */
export function renderCollection(state, worlds) {
  const totalBadges = worlds.reduce((n, w) => n + Object.keys(w.subjects).length, 0);
  const earned = state.badges.length;
  $('colCount').textContent = `${earned} of ${totalBadges} badges earned — perfect a mission to collect its badge!`;

  const body = $('colBody');
  body.innerHTML = '';
  worlds.forEach((world) => {
    const section = document.createElement('div');
    section.className = 'colWorld';
    const keys = Object.keys(world.subjects);
    const got = keys.filter((k) => hasBadge(state, world.key, k)).length;
    section.innerHTML = `<div class="colWorldName">${world.icon} ${world.name} <span style="color:var(--dim);font-family:'Nunito';font-size:13px">(${got}/${keys.length})</span></div>`;

    const grid = document.createElement('div');
    grid.className = 'badgeGrid';
    keys.forEach((k) => {
      const subj = world.subjects[k];
      const has = hasBadge(state, world.key, k);
      const cell = document.createElement('div');
      cell.className = 'badge' + (has ? ' earned' : '');
      cell.innerHTML = `<div class="bIco">${has ? subj.emoji : '❓'}</div><div class="bNm">${has ? (subj.badge || subj.name + ' Expert') : '???'}</div>`;
      grid.appendChild(cell);
    });
    section.appendChild(grid);
    body.appendChild(section);
  });

  $('collection').classList.add('open');
  $('colClose').onclick = () => $('collection').classList.remove('open');
}
