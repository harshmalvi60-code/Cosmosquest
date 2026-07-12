import { $ } from './dom.js';

/**
 * World-completion celebration: a Three.js confetti-style particle burst in
 * the scene plus a full-screen title (e.g. "Ocean Master 🌊"). Everything is
 * procedurally generated — no assets. Self-cleans after the burst.
 */
export function celebrateWorld(engine, { title, subtitle, colors }) {
  $('cvTitle').textContent = title;
  $('cvSub').textContent = subtitle || '';
  $('celebrate').classList.add('open');
  $('cvBtn').onclick = () => $('celebrate').classList.remove('open');

  const THREE = engine.THREE;
  const N = 260;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const vel = [];
  const origin = engine.controls.target.clone();
  const palette = (colors && colors.length ? colors : [0xFFC93C, 0x4DE3FF, 0xB26CFF, 0x5BF0A5, 0xFF6B81]);

  for (let i = 0; i < N; i++) {
    pos[i * 3] = origin.x; pos[i * 3 + 1] = origin.y; pos[i * 3 + 2] = origin.z;
    const c = new THREE.Color(palette[i % palette.length]);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.2, Math.random() - 0.5).normalize();
    vel.push(dir.multiplyScalar(14 + Math.random() * 22));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 1.8, vertexColors: true, transparent: true, opacity: 1 });
  const burst = new THREE.Points(geo, mat);
  engine.scene.add(burst);

  let t = 0;
  const clock = new THREE.Clock();
  (function animate() {
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    const p = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      vel[i].y -= dt * 12; // gravity
      p[i * 3] += vel[i].x * dt;
      p[i * 3 + 1] += vel[i].y * dt;
      p[i * 3 + 2] += vel[i].z * dt;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = Math.max(0, 1 - t / 2.6);
    if (t < 2.8) requestAnimationFrame(animate);
    else { engine.scene.remove(burst); geo.dispose(); mat.dispose(); }
  })();
}
