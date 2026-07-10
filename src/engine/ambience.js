/**
 * Per-world ambient weather — an engine-level particle layer that makes every
 * scene feel alive and physical: leaves drift through Nature, snow falls over
 * Polar, embers rise from the Dinosaur volcano, bubbles climb through Ocean,
 * code-rain streams down the Digital world… All procedural Points; one system
 * is recycled between worlds so the cost stays flat on mid-range phones.
 */

/* Motion recipes. vy: fall/rise speed range; sway: horizontal wander; size,
   opacity, additive: look; twinkle: global opacity pulse (sparkle feel). */
const KINDS = {
  snow:      { vy: [-4, -9],  sway: 5,  swaySpeed: 0.7, size: 2.2, opacity: 0.85, additive: false, twinkle: false },
  leaves:    { vy: [-2, -5],  sway: 11, swaySpeed: 1.1, size: 2.6, opacity: 0.8,  additive: false, twinkle: false },
  pollen:    { vy: [-1, -2.5], sway: 8, swaySpeed: 0.5, size: 1.8, opacity: 0.6,  additive: true,  twinkle: true },
  embers:    { vy: [4, 10],   sway: 4,  swaySpeed: 1.4, size: 2.0, opacity: 0.8,  additive: true,  twinkle: true },
  bubbles:   { vy: [5, 11],   sway: 6,  swaySpeed: 1.8, size: 2.4, opacity: 0.55, additive: true,  twinkle: false },
  rain:      { vy: [-46, -70], sway: 0, swaySpeed: 0,   size: 1.5, opacity: 0.45, additive: true,  twinkle: false },
  sparkles:  { vy: [-0.6, 0.6], sway: 3, swaySpeed: 0.3, size: 2.0, opacity: 0.7, additive: true,  twinkle: true },
  fireflies: { vy: [-1.5, 1.5], sway: 10, swaySpeed: 0.8, size: 2.6, opacity: 0.9, additive: true, twinkle: true },
};

/* What falls/rises/floats in each world (kind + tint). */
export const WORLD_WEATHER = {
  universe:       { kind: 'sparkles',  color: 0xFFFFFF },
  nature:         { kind: 'leaves',    color: 0x8FDB6A },
  animals:        { kind: 'pollen',    color: 0xF2D98C },
  ocean:          { kind: 'bubbles',   color: 0xA8E4FF },
  humanbody:      { kind: 'sparkles',  color: 0xFF9FB2 },
  dinosaurs:      { kind: 'embers',    color: 0xFF9250 },
  bugs:           { kind: 'fireflies', color: 0xFFE96A },
  plants:         { kind: 'pollen',    color: 0xC9F27E },
  farm:           { kind: 'pollen',    color: 0xFFE9A0 },
  polar:          { kind: 'snow',      color: 0xF4FBFF },
  weather:        { kind: 'rain',      color: 0xA8D8FF },
  cultures:       { kind: 'sparkles',  color: 0xFFD27E },
  ancient:        { kind: 'pollen',    color: 0xE8C77E },
  disasters:      { kind: 'embers',    color: 0xFF8A6A },
  spaceexplorers: { kind: 'sparkles',  color: 0xBFE8FF },
  mind:           { kind: 'sparkles',  color: 0xD9A8FF },
  physics:        { kind: 'sparkles',  color: 0x8FE8FF },
  chemistry:      { kind: 'bubbles',   color: 0xA5F2C0 },
  digital:        { kind: 'rain',      color: 0x5CF2E0 },
  machines:       { kind: 'embers',    color: 0xFFC46A },
};

const COUNT = 320;
const BOX = { r: 150, yMin: -20, yMax: 95 };

/** Soft round sprite so particles read as flakes/orbs, not hard squares. */
export function discTexture(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,.75)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function createAmbience(THREE, scene) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 2.2, transparent: true, opacity: 0.8, depthWrite: false, sizeAttenuation: true,
    map: discTexture(THREE),
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  // Per-particle motion state (plain JS arrays — cheap and GC-free after init).
  const vy = new Float32Array(COUNT);
  const phase = new Float32Array(COUNT);
  const baseX = new Float32Array(COUNT);
  const baseZ = new Float32Array(COUNT);
  let spec = KINDS.sparkles;

  function seed(i) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * BOX.r;
    baseX[i] = Math.cos(a) * r;
    baseZ[i] = Math.sin(a) * r;
    pos[i * 3] = baseX[i];
    pos[i * 3 + 1] = BOX.yMin + Math.random() * (BOX.yMax - BOX.yMin);
    pos[i * 3 + 2] = baseZ[i];
    vy[i] = spec.vy[0] + Math.random() * (spec.vy[1] - spec.vy[0]);
    phase[i] = Math.random() * Math.PI * 2;
  }

  /** Switch the weather to a world's recipe (kind + tint). */
  function set(weather) {
    const w = weather || { kind: 'sparkles', color: 0xFFFFFF };
    spec = KINDS[w.kind] || KINDS.sparkles;
    mat.color.set(w.color ?? 0xFFFFFF);
    mat.size = spec.size;
    mat.opacity = spec.opacity;
    mat.blending = spec.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    mat.needsUpdate = true;
    for (let i = 0; i < COUNT; i++) seed(i);
    geo.attributes.position.needsUpdate = true;
  }

  function update(dt, t) {
    for (let i = 0; i < COUNT; i++) {
      let y = pos[i * 3 + 1] + vy[i] * dt;
      // Wrap vertically so the fall/rise never runs out.
      if (y < BOX.yMin) y = BOX.yMax;
      else if (y > BOX.yMax) y = BOX.yMin;
      pos[i * 3 + 1] = y;
      if (spec.sway) {
        pos[i * 3] = baseX[i] + Math.sin(t * spec.swaySpeed + phase[i]) * spec.sway;
        pos[i * 3 + 2] = baseZ[i] + Math.cos(t * spec.swaySpeed * 0.8 + phase[i]) * spec.sway * 0.7;
      }
    }
    geo.attributes.position.needsUpdate = true;
    if (spec.twinkle) mat.opacity = spec.opacity * (0.7 + 0.3 * Math.sin(t * 2.2));
  }

  set();
  return { set, update, points };
}
