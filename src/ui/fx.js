/**
 * Juice — the little bursts of delight that make a game feel alive: DOM
 * confetti, floating score pops, a screen flash, a quick shake, and haptic
 * buzzes. All pure CSS/DOM + rAF, no assets. A single fixed overlay hosts them.
 */
let layer = null;
function fxLayer() {
  if (layer) return layer;
  layer = document.createElement('div');
  layer.id = 'fxLayer';
  document.body.appendChild(layer);
  return layer;
}

const PALETTE = ['#FFC93C', '#4DE3FF', '#B26CFF', '#5BF0A5', '#FF6B81', '#FF9F5B', '#F6E15A'];

/** A shower of confetti bits bursting from (x,y) — screen coords. */
export function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 34, colors = PALETTE) {
  const host = fxLayer();
  const bits = [];
  for (let i = 0; i < count; i++) {
    const b = document.createElement('i');
    b.className = 'confBit';
    const c = colors[Math.floor(Math.random() * colors.length)];
    b.style.background = typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c;
    if (Math.random() < 0.4) b.style.borderRadius = '50%';
    host.appendChild(b);
    const ang = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    bits.push({ el: b, x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed - 6, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 40, life: 0 });
  }
  const dur = 1300;
  const t0 = performance.now();
  function step(now) {
    const p = now - t0;
    bits.forEach((o) => {
      o.vy += 0.35; o.x += o.vx; o.y += o.vy; o.rot += o.vr;
      o.el.style.transform = `translate(${o.x}px,${o.y}px) rotate(${o.rot}deg)`;
      o.el.style.opacity = String(Math.max(0, 1 - p / dur));
    });
    if (p < dur) requestAnimationFrame(step);
    else bits.forEach((o) => o.el.remove());
  }
  requestAnimationFrame(step);
}

/** A floating "+3 ⭐" style label that rises and fades from (x,y). */
export function scorePop(text, x = window.innerWidth / 2, y = window.innerHeight / 2, color = '#FFC93C') {
  const host = fxLayer();
  const el = document.createElement('div');
  el.className = 'scorePop';
  el.textContent = text;
  el.style.color = color;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  host.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

/** A quick full-screen colour flash (correct = green, wrong = red…). */
export function flash(color = 'rgba(91,240,165,.25)') {
  const host = fxLayer();
  const el = document.createElement('div');
  el.className = 'fxFlash';
  el.style.background = color;
  host.appendChild(el);
  setTimeout(() => el.remove(), 360);
}

/** Shake a DOM element briefly (wrong answer feedback). */
export function shake(el) {
  if (!el) return;
  el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

/** Gentle haptic buzz on supporting devices. */
export function haptic(pattern = 15) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch { /* ignore */ }
}
