import { $ } from './dom.js';
import { rankFor, RANKS } from '../game/ranks.js';
import { worldProgress, isWorldUnlocked, isWorldComplete, canAfford } from '../game/profile.js';
import { displayStreak } from '../game/profile.js';
import { ACHIEVEMENTS, hasAchievement } from '../game/achievements.js';

function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }

/**
 * "My Journey" — the big-picture progress screen. One glance shows how far a
 * child has come: overall % of all subjects explored, rank and how close the
 * next rank is, headline stats, the next world waiting to be unlocked, and a
 * map of all 20 worlds with their individual completion.
 */
export function renderJourney(state, worlds) {
  // Overall subject completion across every world.
  let doneAll = 0, totalAll = 0;
  const rows = worlds.map((w) => {
    const p = worldProgress(state, w);
    doneAll += p.done; totalAll += p.total;
    return { world: w, prog: p };
  });
  const pct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;

  const r = rankFor(state.xp);
  const nextRank = RANKS[r.index] || null; // r.index is 1-based count of ranks reached
  const worldsDone = rows.filter((x) => isWorldComplete(state, x.world)).length;
  const unlockedCount = worlds.filter((w) => !w.comingSoon && isWorldUnlocked(state, w)).length;

  // The cheapest world the kid hasn't unlocked yet — the natural next goal.
  const nextLocked = worlds
    .filter((w) => !w.comingSoon && !isWorldUnlocked(state, w))
    .sort((a, b) => a.unlockCost - b.unlockCost)[0];

  const acc = 'var(--accent)';
  let nextGoal;
  if (nextLocked) {
    const canGo = canAfford(state, nextLocked);
    const need = Math.max(0, nextLocked.unlockCost - state.stars);
    nextGoal = canGo
      ? `<b>${nextLocked.icon} ${nextLocked.name}</b> is ready to unlock — go for it!`
      : `<b>${nextLocked.icon} ${nextLocked.name}</b> unlocks in <b>${need} ⭐</b>`;
  } else {
    nextGoal = `Every world unlocked — you're a true explorer! 🌟`;
  }

  const rankLine = r.isMax
    ? `You've reached the top rank — ${r.rank[2]} ${r.rank[1]}!`
    : `${r.rank[2]} ${r.rank[1]} · ${nextRank[0] - state.xp} XP to ${nextRank[2]} ${nextRank[1]}`;

  const body = $('jrnBody');
  body.innerHTML = `
    <div class="jrnHero">
      <div class="jrnRing" style="--p:${pct}"><div class="jrnRingIn"><b>${pct}%</b><span>explored</span></div></div>
      <div class="jrnHeroMain">
        <div class="jrnBig">${doneAll} <small>/ ${totalAll} subjects</small></div>
        <div class="jrnRank">${rankLine}</div>
        <div class="jrnXp"><div class="jrnXpFill" style="width:${r.pct}%"></div></div>
      </div>
    </div>

    <div class="jrnStats">
      <div class="jrnStat"><b>⭐ ${state.stars}</b><span>Stars</span></div>
      <div class="jrnStat"><b>🏅 ${state.badges.length}</b><span>Badges</span></div>
      <div class="jrnStat"><b>🏆 ${worldsDone}</b><span>Mastered</span></div>
      <div class="jrnStat"><b>🔓 ${unlockedCount}/${worlds.length}</b><span>Unlocked</span></div>
      <div class="jrnStat"><b>🔥 ${displayStreak(state)}</b><span>Day streak</span></div>
      <div class="jrnStat"><b>👑 ${state.titles.length}</b><span>Titles</span></div>
    </div>

    <div class="jrnGoal">🎯 ${nextGoal}</div>

    <div class="jrnMapLabel">Achievements <span style="font-family:'Nunito';font-size:12px;color:var(--dim)">
      ${(state.achievements || []).length}/${ACHIEVEMENTS.length}</span></div>
    <div class="jrnAchGrid"></div>

    <div class="jrnMapLabel">Your 20 worlds</div>
    <div class="jrnMap"></div>
  `;

  const achGrid = body.querySelector('.jrnAchGrid');
  ACHIEVEMENTS.forEach((a) => {
    const got = hasAchievement(state, a.id);
    const cell = document.createElement('div');
    cell.className = 'jrnAch' + (got ? ' got' : '');
    cell.innerHTML = `<div class="aIco">${a.icon}</div>
      <div><div class="aNm">${got ? a.name : '???'}</div><div class="aDs">${a.desc}</div></div>`;
    achGrid.appendChild(cell);
  });

  const map = body.querySelector('.jrnMap');
  rows.forEach(({ world, prog }) => {
    const unlocked = !world.comingSoon && isWorldUnlocked(state, world);
    const complete = isWorldComplete(state, world);
    const c1 = hex(world.theme.primary);
    const cell = document.createElement('div');
    cell.className = 'jrnWorld' + (unlocked ? '' : ' locked') + (complete ? ' done' : '');
    cell.innerHTML = `
      <div class="jrnWIco">${unlocked ? world.icon : '🔒'}</div>
      <div class="jrnWName">${world.name}</div>
      <div class="jrnWBar"><div style="width:${unlocked ? prog.pct : 0}%;background:${c1}"></div></div>
      <div class="jrnWNum">${complete ? '🏆 Mastered' : unlocked ? `${prog.done}/${prog.total}` : `${world.unlockCost} ⭐`}</div>
    `;
    map.appendChild(cell);
  });

  $('journey').classList.add('open');
}

export function closeJourney() { $('journey').classList.remove('open'); }
