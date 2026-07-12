import { $ } from './dom.js';
import { shuffle } from '../game/quiz.js';
import { sfx } from '../game/audio.js';
import { confetti, flash, shake, haptic } from './fx.js';

/**
 * Mission briefing — a short, playful "objective" line shown before the quiz
 * so it feels like a game mission, not a pop quiz.
 */
export function showBriefing(subject, onStart) {
  $('bEmoji').textContent = subject.emoji;
  $('bText').textContent = subject.mission || `Ready to become a ${subject.name} expert?`;
  $('brief').classList.add('open');
  $('bBtn').onclick = () => {
    sfx.start();
    $('brief').classList.remove('open');
    onStart();
  };
}

const KIND_LABEL = { mc: 'Multiple Choice', tf: 'True or False?', pic: 'Which One Is It?' };
const RIGHT_MSGS = ['🎉 Correct! You\'re a natural explorer!', '⭐ Nailed it!', '✅ Spot on, Explorer!', '🌟 Brilliant!', '🚀 Genius!', '💯 Amazing!'];
const HAPPY = ['🥳', '😄', '🤩', '😎'];
const OOPS = ['😅', '🤔', '🙈'];
function buddy(face, cls) { const b = $('qBuddy'); if (!b) return; b.textContent = face; b.className = 'qBuddy ' + cls; void b.offsetWidth; }

/**
 * Run a quiz to completion. Handles multiple-choice, true/false and
 * picture (shape) questions, shows per-question feedback, then reports the
 * score via onComplete(correct, total).
 */
export function runQuiz({ title, questions, onComplete }) {
  let idx = 0, correct = 0, combo = 0;
  const results = [];

  $('qTitle').textContent = title;
  $('qCombo').textContent = '';
  buildDots(questions.length);
  $('quiz').classList.add('open');
  render();

  function buildDots(n) {
    const dots = $('qDots');
    dots.innerHTML = '';
    for (let i = 0; i < n; i++) { const d = document.createElement('i'); dots.appendChild(d); }
  }
  function paintDots() {
    [...$('qDots').children].forEach((d, i) => {
      d.className = i === idx ? 'on' : (results[i] === true ? 'ok' : results[i] === false ? 'no' : '');
    });
  }

  function render() {
    const q = questions[idx];
    paintDots();
    $('qKind').textContent = KIND_LABEL[q.kind] || '';
    $('qQ').textContent = q.q;
    $('qFeed').textContent = '';
    buddy('🤔', 'think');
    const box = $('qOpts');
    box.innerHTML = '';

    if (q.kind === 'tf') renderTF(q, box);
    else if (q.kind === 'pic') renderPic(q, box);
    else renderMC(q, box);
  }

  function finish(isRight, feedbackWrong) {
    results[idx] = isRight;
    if (isRight) {
      correct++; combo++;
      sfx.correct(combo); haptic(14);
      flash('rgba(91,240,165,.22)');
      buddy(HAPPY[Math.floor(Math.random() * HAPPY.length)], 'happy');
      const b = $('qBuddy').getBoundingClientRect();
      confetti(b.left + b.width / 2, b.top + b.height / 2, combo >= 3 ? 44 : 26);
      $('qCombo').textContent = combo >= 2 ? `🔥 ${combo} in a row!` : '';
    } else {
      combo = 0;
      sfx.wrong(); haptic([18, 40, 18]);
      flash('rgba(255,107,129,.18)');
      shake(document.querySelector('.qCard'));
      buddy(OOPS[Math.floor(Math.random() * OOPS.length)], 'oops');
      $('qCombo').textContent = '';
    }
    paintDots();
    $('qFeed').style.color = isRight ? 'var(--green)' : 'var(--red)';
    $('qFeed').textContent = isRight
      ? RIGHT_MSGS[Math.floor(Math.random() * RIGHT_MSGS.length)]
      : (feedbackWrong || 'Almost! The glowing one is the answer ✨');
    setTimeout(() => {
      idx++;
      if (idx < questions.length) render();
      else { $('quiz').classList.remove('open'); onComplete(correct, questions.length); }
    }, 1350);
  }

  function renderMC(q, box) {
    const opts = shuffle(q.options.map((o, i) => [o, i]));
    opts.forEach(([label, i]) => {
      const b = document.createElement('button');
      b.className = 'qOpt';
      b.textContent = label;
      b.onclick = () => {
        [...box.children].forEach((x) => (x.disabled = true));
        if (i === q.answer) b.classList.add('right');
        else {
          b.classList.add('wrong');
          [...box.children].find((x) => x.textContent === q.options[q.answer]).classList.add('right');
        }
        finish(i === q.answer);
      };
      box.appendChild(b);
    });
  }

  function renderTF(q, box) {
    const row = document.createElement('div');
    row.className = 'tfRow';
    [['✅ True', true], ['❌ False', false]].forEach(([label, val]) => {
      const b = document.createElement('button');
      b.className = 'tfBtn';
      b.textContent = label;
      b.onclick = () => {
        [...row.children].forEach((x) => (x.disabled = true));
        const right = val === q.answer;
        b.classList.add(right ? 'right' : 'wrong');
        if (!right) row.children[q.answer ? 0 : 1].classList.add('right');
        finish(right, 'Not quite — read the fun facts again! 📖');
      };
      row.appendChild(b);
    });
    box.appendChild(row);
  }

  function renderPic(q, box) {
    const row = document.createElement('div');
    row.className = 'picRow';
    const opts = shuffle(q.options.map((o, i) => [o, i]));
    opts.forEach(([opt, i]) => {
      const b = document.createElement('button');
      b.className = 'picBtn';
      const scale = opt.size ? ` style="transform:scale(${opt.size})"` : '';
      b.innerHTML = `<div class="picShape"${scale}>${shapeSVG(opt.shape, opt.color)}</div>${opt.label ? `<div class="picLabel">${opt.label}</div>` : ''}`;
      b.onclick = () => {
        [...row.children].forEach((x) => (x.disabled = true));
        const right = i === q.answer;
        b.classList.add(right ? 'right' : 'wrong');
        if (!right) [...row.children][opts.findIndex(([, j]) => j === q.answer)].classList.add('right');
        finish(right, 'Look closely at the shapes! 🔍');
      };
      row.appendChild(b);
    });
    box.appendChild(row);
  }
}

/**
 * Copyright-safe illustrative shapes for picture questions — pure inline SVG,
 * no real images. Keeps the abstract, on-brand look.
 */
export function shapeSVG(shape, color) {
  const c = color || '#4DE3FF';
  const wrap = (inner) => `<svg viewBox="0 0 56 56" width="100%" height="100%">${inner}</svg>`;
  switch (shape) {
    case 'circle': return wrap(`<circle cx="28" cy="28" r="22" fill="${c}"/>`);
    case 'square': return wrap(`<rect x="7" y="7" width="42" height="42" rx="7" fill="${c}"/>`);
    case 'triangle': return wrap(`<polygon points="28,5 51,50 5,50" fill="${c}"/>`);
    case 'diamond': return wrap(`<polygon points="28,4 52,28 28,52 4,28" fill="${c}"/>`);
    case 'oval': return wrap(`<ellipse cx="28" cy="28" rx="24" ry="15" fill="${c}"/>`);
    case 'tall': return wrap(`<ellipse cx="28" cy="28" rx="13" ry="24" fill="${c}"/>`);
    case 'star': return wrap(`<polygon points="28,4 35,21 53,21 38,32 44,50 28,39 12,50 18,32 3,21 21,21" fill="${c}"/>`);
    case 'hexagon': return wrap(`<polygon points="28,4 49,16 49,40 28,52 7,40 7,16" fill="${c}"/>`);
    case 'crescent': return wrap(`<path d="M40 8 A22 22 0 1 0 40 48 A17 17 0 1 1 40 8Z" fill="${c}"/>`);
    case 'drop': return wrap(`<path d="M28 4 C40 24 46 32 46 38 A18 18 0 1 1 10 38 C10 32 16 24 28 4Z" fill="${c}"/>`);
    default: return wrap(`<circle cx="28" cy="28" r="22" fill="${c}"/>`);
  }
}
