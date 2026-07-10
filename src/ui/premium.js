import { $ } from './dom.js';
import { sfx } from '../game/audio.js';
import { confetti } from './fx.js';

/**
 * Premium shell touches that make the game feel bought-not-borrowed: a friendly
 * explorer-avatar picker on first run, gentle onboarding coach-marks so a child
 * always knows what to do next, and a big celebratory Level-Up moment.
 */

const AVATARS = ['🧑‍🚀', '🦊', '🐯', '🐼', '🦉', '🐧', '🦕', '🤖', '🦄', '🐙', '🐨', '🦁'];

/** First-run: choose an explorer buddy. Calls onDone(avatar) when picked. */
export function showAvatarPicker(state, onDone) {
  const grid = $('apGrid');
  grid.innerHTML = '';
  let chosen = state.avatar || AVATARS[0];
  AVATARS.forEach((a) => {
    const b = document.createElement('button');
    b.className = 'apCell' + (a === chosen ? ' on' : '');
    b.textContent = a;
    b.onclick = () => {
      chosen = a; sfx.select();
      [...grid.children].forEach((c) => c.classList.toggle('on', c.textContent === a));
    };
    grid.appendChild(b);
  });
  $('avatarPick').classList.add('open');
  $('apBtn').onclick = () => {
    sfx.reward();
    confetti(window.innerWidth / 2, window.innerHeight / 2, 40);
    $('avatarPick').classList.remove('open');
    onDone(chosen);
  };
}

/* ---------------- onboarding coach-marks ---------------- */
let coachTimer = null;
export function coach(text, targetSel, { placement = 'bottom' } = {}) {
  const overlay = $('coach');
  const bubble = $('coachBubble');
  bubble.innerHTML = `${text}<div class="coachGot">Tap to continue</div>`;
  overlay.classList.add('open');

  // Position the bubble near the target (or centre if absent) and highlight it.
  document.querySelectorAll('.coachHi').forEach((e) => e.classList.remove('coachHi'));
  const target = targetSel && document.querySelector(targetSel);
  bubble.classList.remove('top', 'bottom', 'centre');
  if (target) {
    target.classList.add('coachHi');
    target.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = target.getBoundingClientRect();
    const below = placement === 'bottom' && r.bottom + 130 < window.innerHeight;
    bubble.classList.add(below ? 'bottom' : 'top');
    bubble.style.left = Math.min(Math.max(r.left + r.width / 2, 130), window.innerWidth - 130) + 'px';
    bubble.style.top = (below ? r.bottom + 14 : r.top - 14) + 'px';
  } else {
    bubble.classList.add('centre');
    bubble.style.left = '50%';
    bubble.style.top = '58%';
  }
}
export function coachHide() {
  $('coach').classList.remove('open');
  document.querySelectorAll('.coachHi').forEach((e) => e.classList.remove('coachHi'));
  clearTimeout(coachTimer);
}

/* ---------------- achievement banners ---------------- */
let achQueue = [], achBusy = false, achDone = null;
/** Queue one or more earned achievements to slide in one at a time. */
export function showAchievements(list, onAllDone) {
  if (list && list.length) achQueue.push(...list);
  if (onAllDone) achDone = onAllDone;
  if (!achBusy) nextAchievement();
}
function nextAchievement() {
  const banner = $('achv');
  if (!achQueue.length) {
    achBusy = false;
    const done = achDone; achDone = null;
    done && done();
    return;
  }
  achBusy = true;
  const a = achQueue.shift();
  $('achvIcon').textContent = a.icon;
  $('achvName').textContent = a.name;
  banner.classList.add('show');
  sfx.unlock();
  confetti(window.innerWidth / 2, 70, 26);
  setTimeout(() => {
    banner.classList.remove('show');
    setTimeout(nextAchievement, 450);
  }, 2100);
}

/* ---------------- level-up moment ---------------- */
export function showLevelUp(rank, onClose) {
  $('luIcon').textContent = rank[2];
  $('luName').textContent = rank[1];
  $('levelup').classList.add('open');
  sfx.rankup();
  confetti(window.innerWidth / 2, window.innerHeight / 2 - 40, 70);
  $('luBtn').onclick = () => { sfx.tap(); $('levelup').classList.remove('open'); onClose && onClose(); };
}
