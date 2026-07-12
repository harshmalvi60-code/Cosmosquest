import { $ } from './dom.js';
import { normalizeQuestion, shuffle } from '../game/quiz.js';
import { sfx } from '../game/audio.js';
import { confetti, flash, haptic } from './fx.js';

/**
 * ⚡ Lightning Round — a 45-second quick-fire review mini-game. Questions are
 * drawn only from subjects the child has already passed (spaced repetition in
 * disguise), answers advance instantly, and every correct answer pays a star.
 */
const DURATION = 45;

/** All MC/TF questions from passed subjects (fast to render, fast to answer). */
export function lightningPool(state, worlds) {
  const pool = [];
  worlds.forEach((w) => {
    const done = state.done[w.key] || {};
    Object.keys(done).forEach((sk) => {
      const subj = w.subjects[sk];
      if (!subj) return;
      subj.quiz.forEach((raw) => {
        const q = normalizeQuestion(raw);
        if (q.kind === 'mc' || q.kind === 'tf') pool.push({ ...q, emoji: subj.emoji });
      });
    });
  });
  return pool;
}

export function runLightning(state, worlds, { onCollect }) {
  const pool = shuffle(lightningPool(state, worlds));
  let idx = 0, correct = 0, answered = 0, over = false, left = DURATION, locked = false;

  $('lightning').classList.add('open');
  $('lgPlay').style.display = 'block';
  $('lgEnd').style.display = 'none';
  $('lgEnd').innerHTML = '';
  $('lgScore').textContent = '⭐ 0';
  $('lgTimer').style.width = '100%';
  sfx.start();

  const iv = setInterval(() => {
    if (over) return;
    left -= 0.1;
    $('lgTimer').style.width = Math.max(0, (left / DURATION) * 100) + '%';
    if (left <= 0) finish();
  }, 100);

  function quit() {
    over = true;
    clearInterval(iv);
    $('lightning').classList.remove('open');
  }
  $('lgClose').onclick = () => { sfx.tap(); quit(); };

  function next() {
    if (over) return;
    locked = false;
    const q = pool[idx % pool.length];
    idx++;
    $('lgKind').textContent = q.emoji + '  quick!';
    $('lgQ').textContent = q.q;
    const box = $('lgOpts');
    box.innerHTML = '';
    if (q.kind === 'tf') {
      const row = document.createElement('div');
      row.className = 'tfRow';
      [['✅ True', true], ['❌ False', false]].forEach(([label, val]) => {
        const b = document.createElement('button');
        b.className = 'tfBtn sm';
        b.textContent = label;
        b.onclick = () => grade(val === q.answer, b, row);
        row.appendChild(b);
      });
      box.appendChild(row);
    } else {
      shuffle(q.options.map((o, i) => [o, i])).forEach(([label, i]) => {
        const b = document.createElement('button');
        b.className = 'qOpt sm';
        b.textContent = label;
        b.onclick = () => grade(i === q.answer, b, box);
        box.appendChild(b);
      });
    }
  }

  function grade(right, btn, box) {
    if (over || locked) return;
    locked = true;
    box.querySelectorAll('button').forEach((x) => (x.disabled = true));
    answered++;
    btn.classList.add(right ? 'right' : 'wrong');
    if (right) {
      correct++;
      sfx.correct(1); haptic(12);
      $('lgScore').textContent = `⭐ ${correct}`;
    } else {
      sfx.wrong();
      flash('rgba(255,107,129,.14)');
    }
    setTimeout(next, right ? 260 : 480);
  }

  function finish() {
    over = true;
    clearInterval(iv);
    sfx.celebrate();
    confetti(window.innerWidth / 2, window.innerHeight / 3, 50);
    $('lgPlay').style.display = 'none';
    const end = $('lgEnd');
    end.style.display = 'block';
    end.innerHTML = `
      <div class="lgEndBig">⚡</div>
      <div class="lgEndTitle">Time's up!</div>
      <div class="lgEndScore">${correct} / ${answered} correct</div>
      <div class="lgEndGain">+${correct} ⭐ &nbsp; +${correct * 4} XP</div>
      <button class="rBtn" id="lgCollect">Collect →</button>`;
    $('lgCollect').onclick = () => {
      sfx.reward();
      $('lightning').classList.remove('open');
      onCollect && onCollect(correct, answered);
    };
  }

  next();
  return { quit };
}
