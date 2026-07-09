import { $ } from './dom.js';
import { isSubjectDone, hasBadge } from '../game/profile.js';

/**
 * The slide-in info panel for a tapped subject: quick stats, kid-friendly
 * facts, one WOW fact, an earned-badge tag, and the mission button.
 */
export function openPanel(state, world, subjectKey, { onMission } = {}) {
  const d = world.subjects[subjectKey];
  $('pEmoji').textContent = d.emoji;
  $('pName').textContent = d.name;
  $('pType').textContent = d.type;

  const earned = hasBadge(state, world.key, subjectKey);
  let html = earned ? `<div class="badgeTag">🏅 ${d.badge || d.name + ' Expert'} earned!</div>` : '';
  html += '<div class="statRow">' + d.stats.map((s) => `<div class="stat"><b>${s[0]}</b><i>${s[1]}</i></div>`).join('') + '</div>';
  html += d.facts.map((f) => {
    const sp = f.indexOf(' ');
    const emoji = f.slice(0, sp);
    return `<div class="factCard"><span>${emoji}</span><div>${f.slice(sp + 1)}</div></div>`;
  }).join('');
  html += `<div class="factCard funFact"><span>🤯</span><div><b style="color:var(--gold)">WOW FACT:</b> ${d.fun}</div></div>`;
  $('pBody').innerHTML = html;
  $('pBody').scrollTop = 0;

  const done = isSubjectDone(state, world.key, subjectKey);
  $('missionBtn').className = 'missionBtn' + (done ? ' done' : '');
  $('missionBtn').textContent = done ? '✅ Mission Complete — Replay' : '🎯 Start Mission';
  $('missionBtn').onclick = () => onMission && onMission();

  $('panel').classList.add('open');
}

export function closePanel() { $('panel').classList.remove('open'); }
