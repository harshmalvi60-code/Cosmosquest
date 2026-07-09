import { $ } from './dom.js';

/**
 * Post-mission reward card. Reflects the actual score and shows any newly
 * earned collectible badge. `result` is the summary from recordMission().
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
  $('rBtn').onclick = () => { $('reward').classList.remove('open'); onClose && onClose(); };
}
