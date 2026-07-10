import * as THREE from 'three';

/**
 * Sets up the world-agnostic Three.js stage: renderer, scene, camera, shared
 * lighting, a twinkling starfield, a per-world gradient sky, drifting glow
 * "motes" and a coloured rim light. The atmosphere recolours per world via
 * applyAtmosphere() so every world instantly feels richer and more 3D without
 * per-world work.
 */
export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070B1F);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.set(0, 42, 110);

  // Gradient sky dome (recoloured per world).
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 32, 20),
    new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false }),
  );
  scene.add(sky);

  // Two-layer starfield — bright white specks + a sparse cyan haze for depth.
  const stars = new THREE.Group();
  stars.add(makePoints(2600, 1600, 0xffffff, 1.4, 0.85, true));
  stars.add(makePoints(600, 1200, 0x4DE3FF, 2.2, 0.5, false));
  scene.add(stars);

  // Drifting glow motes — soft floating dust that gives the scene life & depth.
  const motesMat = new THREE.PointsMaterial({ color: 0x4DE3FF, size: 2.6, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
  const mg = new THREE.BufferGeometry();
  const mn = 240, mp = new Float32Array(mn * 3);
  for (let i = 0; i < mn; i++) { const r = 40 + Math.random() * 130; const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1); mp[i * 3] = r * Math.sin(b) * Math.cos(a); mp[i * 3 + 1] = r * Math.cos(b) * 0.5 + 20; mp[i * 3 + 2] = r * Math.sin(b) * Math.sin(a); }
  mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, motesMat);
  scene.add(motes);

  const ambient = new THREE.AmbientLight(0x445588, 0.75);
  scene.add(ambient);
  const keyLight = new THREE.PointLight(0xFFDFAA, 2.2, 600);
  keyLight.position.set(60, 90, 60);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xB26CFF, 0.6);
  rimLight.position.set(-80, 40, -60);
  scene.add(rimLight);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /** Recolour the sky, motes and rim light to a world's theme. */
  function applyAtmosphere(theme = {}) {
    const bg = theme.bg ?? 0x070B1F;
    const top = mix(bg, theme.primary ?? 0x4DE3FF, 0.28);
    const bottom = shade(bg, 0.6);
    if (sky.material.map) sky.material.map.dispose();
    sky.material.map = gradientTexture(THREE, hex(top), hex(bottom));
    sky.material.color.set(0xffffff);
    sky.material.needsUpdate = true;
    motesMat.color.set(theme.primary ?? 0x4DE3FF);
    rimLight.color.set(theme.secondary ?? 0xB26CFF);
  }

  return { renderer, scene, camera, ambient, keyLight, rimLight, stars, motes, sky, applyAtmosphere, THREE };
}

function makePoints(count, spread, color, size, opacity, attenuate) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * spread;
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: attenuate, transparent: true, opacity }));
}

/* ---- small colour helpers (operate on 0xRRGGBB ints) ---- */
function hex(n) { return '#' + (n & 0xffffff).toString(16).padStart(6, '0'); }
function shade(c, f) { const r = ((c >> 16) & 255) * f, g = ((c >> 8) & 255) * f, b = (c & 255) * f; return (r << 16) | (g << 8) | b; }
function mix(a, b, t) {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return ((ar + (br - ar) * t) << 16) | ((ag + (bg - ag) * t) << 8) | (ab + (bb - ab) * t);
}
function gradientTexture(THREE, top, bottom) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, top); grad.addColorStop(1, bottom);
  g.fillStyle = grad; g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter;
  return tex;
}
