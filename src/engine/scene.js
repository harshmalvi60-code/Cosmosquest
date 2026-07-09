import * as THREE from 'three';

/**
 * Sets up the world-agnostic Three.js stage: renderer, scene, camera,
 * shared lighting and a twinkling starfield. Reused by every world — the
 * per-world content lives in a swappable Group added via setWorldGroup().
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

  // Two-layer starfield — bright white specks + a sparse cyan haze for depth.
  const stars = new THREE.Group();
  stars.add(makePoints(2600, 1600, 0xffffff, 1.4, 0.85, true));
  stars.add(makePoints(600, 1200, 0x4DE3FF, 2.2, 0.5, false));
  scene.add(stars);

  const ambient = new THREE.AmbientLight(0x445588, 0.7);
  scene.add(ambient);
  const keyLight = new THREE.PointLight(0xFFDFAA, 2.2, 600);
  scene.add(keyLight);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { renderer, scene, camera, ambient, keyLight, stars, THREE };
}

function makePoints(count, spread, color, size, opacity, attenuate) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * spread;
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({
    color, size, sizeAttenuation: attenuate, transparent: true, opacity,
  }));
}
