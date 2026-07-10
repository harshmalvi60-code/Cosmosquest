/**
 * Procedural sound — a whole game soundtrack and SFX with ZERO downloaded
 * assets, synthesised live with the Web Audio API (keeps the "no paid assets"
 * rule). Gentle generative background music plus juicy blips, chimes and
 * fanfares. All wrapped in try/catch so it can never break the game, and gated
 * behind a mute toggle that is remembered.
 */
let ctx = null, master = null, musicGain = null, sfxGain = null;
let muted = false, musicTimer = null, started = false;
let scaleRoot = 261.63; // C4

try { muted = localStorage.getItem('eq_muted') === '1'; } catch { /* ignore */ }

// A warm major-pentatonic scale (ratios from the root) — always sounds happy.
const PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2];
// Per-world root notes so each world has its own musical mood.
const MOODS = {
  universe: 261.63, nature: 293.66, animals: 329.63, ocean: 246.94, humanbody: 349.23,
  dinosaurs: 220.0, bugs: 392.0, plants: 311.13, farm: 349.23, polar: 277.18,
  weather: 293.66, cultures: 329.63, ancient: 233.08, disasters: 207.65, spaceexplorers: 261.63,
  mind: 311.13, physics: 349.23, chemistry: 277.18, digital: 329.63, machines: 220.0,
};

function ensure() {
  if (ctx) return true;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.55; sfxGain.connect(master);
    return true;
  } catch { ctx = null; return false; }
}

/** One synth note with a soft attack/release envelope. */
function note(freq, dur, { type = 'sine', gain = 0.3, dest = sfxGain, glide = null, delay = 0 } = {}) {
  if (!ensure()) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(dest || sfxGain);
  osc.start(t); osc.stop(t + dur + 0.05);
}

/** Short filtered-noise burst (whooshes, wrong buzz). */
function noise(dur, { gain = 0.2, freq = 800, type = 'lowpass', delay = 0 } = {}) {
  if (!ensure()) return;
  const t = ctx.currentTime + delay;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filt = ctx.createBiquadFilter(); filt.type = type; filt.frequency.value = freq;
  const g = ctx.createGain(); g.gain.value = gain;
  src.connect(filt); filt.connect(g); g.connect(sfxGain);
  src.start(t);
}

function chord(freqs, dur, opts) { freqs.forEach((f, i) => note(f, dur, { ...opts, delay: (opts?.delay || 0) + i * 0.06 })); }

/* ---------------- named sound effects ---------------- */
export const sfx = {
  tap: () => note(660, 0.08, { type: 'triangle', gain: 0.18 }),
  select: () => { note(523, 0.12, { type: 'triangle', gain: 0.22, glide: 784 }); },
  open: () => note(392, 0.18, { type: 'sine', gain: 0.22, glide: 587 }),
  whoosh: () => noise(0.3, { gain: 0.15, freq: 1200 }),
  start: () => chord([392, 523, 659], 0.5, { type: 'triangle', gain: 0.28 }),
  correct: (combo = 0) => {
    const base = 523.25 * Math.pow(2, Math.min(combo, 5) / 12); // pitch climbs with a streak
    chord([base, base * 1.25, base * 1.5], 0.4, { type: 'triangle', gain: 0.3 });
  },
  wrong: () => { note(180, 0.28, { type: 'sawtooth', gain: 0.16, glide: 120 }); noise(0.18, { gain: 0.1, freq: 400 }); },
  star: () => { note(1046, 0.15, { type: 'sine', gain: 0.25, glide: 1568 }); note(1568, 0.2, { type: 'sine', gain: 0.18, delay: 0.08 }); },
  reward: () => chord([523, 659, 784, 1046], 0.55, { type: 'triangle', gain: 0.32 }),
  rankup: () => chord([392, 523, 659, 784, 1046], 0.7, { type: 'triangle', gain: 0.34 }),
  unlock: () => { chord([523, 784, 1046], 0.4, { type: 'sine', gain: 0.3 }); note(1568, 0.3, { type: 'sine', gain: 0.2, delay: 0.2 }); },
  celebrate: () => { chord([523, 659, 784, 1046, 1318], 0.9, { type: 'triangle', gain: 0.34 }); noise(0.5, { gain: 0.12, freq: 2000, delay: 0.1 }); },
  pop: () => note(880, 0.06, { type: 'square', gain: 0.12 }),
};

/* ---------------- gentle generative background music ---------------- */
function scheduleMusic() {
  if (muted || !ensure()) return;
  // soft pad drone
  note(scaleRoot / 2, 3.2, { type: 'sine', gain: 0.05, dest: musicGain });
  // a couple of sparkly pentatonic notes
  for (let i = 0; i < 2; i++) {
    const step = PENTA[Math.floor(Math.random() * PENTA.length)];
    note(scaleRoot * step * (Math.random() < 0.4 ? 2 : 1), 1.6, { type: 'triangle', gain: 0.06, dest: musicGain, delay: Math.random() * 1.2 });
  }
}

export function startMusic() {
  ensure();
  if (ctx && ctx.state === 'suspended') ctx.resume();
  if (started) return;
  started = true;
  scheduleMusic();
  musicTimer = setInterval(scheduleMusic, 2600);
}

export function setMood(worldKey) {
  scaleRoot = MOODS[worldKey] || 261.63;
}

/* ---------------- mute toggle ---------------- */
export function isMuted() { return muted; }
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('eq_muted', muted ? '1' : '0'); } catch { /* ignore */ }
  if (master) master.gain.value = muted ? 0 : 0.9;
  if (!muted) startMusic();
  return muted;
}

/** Call on the first real user gesture so browsers allow audio. */
export function unlockAudio() {
  ensure();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
