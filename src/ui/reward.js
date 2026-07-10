import { $ } from './dom.js';
import { sfx } from '../game/audio.js';
import { confetti, scorePop, haptic } from './fx.js';

/**
 * Post-mission reward card. Reflects the actual score and shows any newly
 * earned collectible badge — now with a fanfare, a star pop and confetti for
 * that satisfying pay-off. `result` is the summary from recordMission().
 */
export function showReward({ correct, total, subject, result, onClose }) {
  $('rBig').textContent = result.perfect ? '🏆' : result.passed ? '🏅' : '💫';
  $('rTitle').textContent = result.perfect ? 'Perfect Mission!' : result.passed ? 'Mission Complete!' : 'Good Try, Explorer!';
  $('rSub').textContent = result.perfect
    ? `You aced all ${total} questions about ${subject.name}!`
    : result.passed
      ? `You got ${correct} of ${total} right. Replay for a perfect score and a badge!`
      : `Tricky one! Re-read the facts about ${subject.name} and try again.`;

  const bits = [];
  if (result.starGain) bits.push(`+${result.starGain} ⭐`);
  bits.push(`+${result.xpGain} XP`);
  $('rStars').textContent = bits.join('  ·  ');

  $('rBadgeWrap').innerHTML = result.newBadge
    ? `<div class="rBadge">🏅 New Badge: ${result.newBadge.emoji} ${result.newBadge.name}</div>`
    : '';

  $('reward').classList.add('open');

  // Sound + juice, scaled to how well it went.
  if (result.passed) {
    (result.perfect ? sfx.reward : sfx.star)();
    haptic(result.perfect ? [30, 40, 30] : 20);
    if (result.starGain) setTimeout(() => scorePop(`+${result.starGain} ⭐`, window.innerWidth / 2, window.innerHeight / 2 - 40), 250);
    if (result.perfect) setTimeout(() => confetti(window.innerWidth / 2, window.innerHeight / 2 - 60, 60), 150);
    if (result.newBadge) setTimeout(() => { sfx.unlock(); confetti(window.innerWidth / 2, window.innerHeight / 2 + 30, 30, ['#FFC93C', '#5BF0A5']); }, 650);
  } else {
    sfx.pop();
  }

  $('rBtn').onclick = () => { sfx.tap(); $('reward').classList.remove('open'); onClose && onClose(); };
}
