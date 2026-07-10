import { $ } from './dom.js';
import { sfx, isMuted } from '../game/audio.js';

/**
 * "For Grown-ups" panel — the trust surface a parent looks for before handing
 * a phone to their kid: what the game is, the safety promises (no ads, no
 * purchases, offline, kid-safe), a sound switch, and a guarded reset.
 * Everything here is informational + local; nothing leaves the device.
 */
export function openSettings(state, { onToggleSound, onReset } = {}) {
  const badges = state.badges.length;
  const stars = state.stars;
  const worlds = Object.keys(state.done || {}).length;

  $('setStat').innerHTML = `
    <div class="setStatCell"><b>${stars}</b><span>Stars earned</span></div>
    <div class="setStatCell"><b>${badges}</b><span>Badges</span></div>
    <div class="setStatCell"><b>${worlds}</b><span>Worlds started</span></div>`;

  const sound = $('setSound');
  const paint = () => { sound.textContent = isMuted() ? '🔇 Sound is OFF' : '🔊 Sound is ON'; sound.classList.toggle('off', isMuted()); };
  paint();
  sound.onclick = () => { onToggleSound && onToggleSound(); paint(); };

  // Two-step reset so a stray tap can't wipe a child's progress.
  const reset = $('setReset');
  reset.className = 'setBtn danger';
  reset.textContent = '↺ Reset all progress';
  reset.onclick = () => {
    if (reset.dataset.armed !== '1') {
      reset.dataset.armed = '1';
      reset.textContent = 'Tap again to confirm — this erases everything';
      reset.classList.add('armed');
      clearTimeout(reset._t);
      reset._t = setTimeout(() => { reset.dataset.armed = '0'; reset.textContent = '↺ Reset all progress'; reset.classList.remove('armed'); }, 4000);
      return;
    }
    reset.dataset.armed = '0';
    onReset && onReset();
  };

  $('settings').classList.add('open');
  sfx.open();
}

export function closeSettings() {
  const reset = $('setReset');
  if (reset) { reset.dataset.armed = '0'; clearTimeout(reset._t); }
  $('settings').classList.remove('open');
}
