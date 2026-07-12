import * as THREE from 'three';
import { createStage } from './scene.js';
import { createControls } from './controls.js';
import { createPicker } from './raycast.js';
import { createAmbience, WORLD_WEATHER } from './ambience.js';

/**
 * The Engine owns the reusable 3D stage and swaps whole worlds in and out.
 * Worlds are data + a build() function (see src/worlds/*). The Engine stays
 * world-agnostic: it knows nothing about planets, animals or the game rules —
 * it just renders whatever Group a world hands back and forwards taps.
 */
export function createEngine(container, { onPick } = {}) {
  const stage = createStage(container);
  const { renderer, scene, camera } = stage;
  const controls = createControls(renderer.domElement, camera);
  const ambience = createAmbience(THREE, scene);

  let current = null;      // { group, clickables, update }
  let clickables = [];

  // Expanding shock-ring where the child tapped — makes every tap feel physical.
  const ripples = [];
  function spawnRipple(mesh) {
    const wp = new THREE.Vector3();
    mesh.getWorldPosition(wp);
    const r = mesh.userData.markerRadius || boundingRadius(mesh) || 3;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1, 1.16, 40),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.position.copy(wp);
    ring.scale.setScalar(r);
    ring.userData = { life: 0, base: r };
    scene.add(ring);
    ripples.push(ring);
  }

  createPicker(renderer.domElement, camera, () => clickables, (key, mesh) => {
    // Flag the picked subject so worlds can react (e.g. Plants grows on tap).
    clickables.forEach((c) => { c.userData.selected = c.userData.key === key; });
    spawnRipple(mesh);
    if (current && current.onSelect) current.onSelect(key, mesh);
    if (onPick) onPick(key, mesh);
  });

  /** Tear down the previous world and stand up a new one. */
  function loadWorld(world, { isDone } = {}) {
    if (current) {
      scene.remove(current.group);
      disposeGroup(current.group);
    }
    const built = world.build({ THREE, isDone: isDone || (() => false) });
    scene.add(built.group);
    current = built;
    clickables = built.clickables;

    // Game-map pins: float each subject's emoji above its mesh so every
    // subject is instantly recognisable (no two tap-targets look alike).
    clickables.forEach((m, i) => {
      const subj = world.subjects && world.subjects[m.userData.key];
      if (!subj || !subj.emoji || m.userData.pin) return;
      const pin = makeEmojiPin(subj.emoji);
      const r = m.userData.markerRadius || boundingRadius(m) || 3;
      pin.position.y = r * 2.1;
      pin.scale.setScalar(r * 1.5);
      pin.userData.baseY = pin.position.y;
      pin.userData.phase = i * 1.7;
      m.add(pin);
      m.userData.pin = pin;
    });

    // Per-world background + lighting tint + atmosphere (sky, motes, rim light).
    const theme = world.theme || {};
    scene.background = new THREE.Color(theme.bg ?? 0x070B1F);
    if (theme.light != null) stage.keyLight.color.set(theme.light);
    if (theme.ambient != null) stage.ambient.color.set(theme.ambient);
    stage.applyAtmosphere(theme);
    // Ambient weather (leaves / snow / embers / bubbles / code-rain…) + a hint
    // of depth fog in the world's own colour so far objects recede naturally.
    ambience.set(world.ambience || WORLD_WEATHER[world.key]);
    scene.fog = new THREE.FogExp2(theme.bg ?? 0x070B1F, 0.0007); // just a whisper of depth

    const home = built.home || { radius: 118 };
    controls.target.set(0, 0, 0);
    controls.radius = home.radius;
    controls.autoSpin = true;
    controls.apply();
  }

  /** Glide the camera to frame a tapped subject mesh. */
  function focusOn(mesh) {
    const wp = new THREE.Vector3();
    mesh.getWorldPosition(wp);
    const r = mesh.userData.focusRadius || boundingRadius(mesh);
    controls.focusTo(wp, Math.max(14, r * 5));
  }

  function resetView() {
    const home = (current && current.home) || { radius: 118 };
    controls.focusTo(new THREE.Vector3(0, 0, 0), home.radius);
  }

  /** Recolour a subject's marker ring to the "done" (green) state. */
  function markDone(key) {
    const m = clickables.find((c) => c.userData.key === key);
    if (m && m.userData.marker) m.userData.marker.material.color.set(0x5BF0A5);
  }

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (current && current.update) current.update(dt, t, camera);
    // Bob the emoji pins so they read as living map markers.
    clickables.forEach((m) => {
      const p = m.userData.pin;
      if (p) p.position.y = p.userData.baseY * (1 + Math.sin(t * 1.8 + p.userData.phase) * 0.07);
    });
    // Tap shock-rings: billboard, expand and fade, then clean up.
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ring = ripples[i];
      ring.userData.life += dt;
      const p = ring.userData.life / 0.55;
      ring.lookAt(camera.position);
      ring.scale.setScalar(ring.userData.base * (1 + p * 2.4));
      ring.material.opacity = 0.9 * (1 - p);
      if (p >= 1) {
        scene.remove(ring);
        ring.geometry.dispose();
        ring.material.dispose();
        ripples.splice(i, 1);
      }
    }
    // Ambient life: weather particles, drifting glow motes, slowly turning sky.
    ambience.update(dt, t);
    if (stage.motes) { stage.motes.rotation.y += dt * 0.03; stage.motes.position.y = Math.sin(t * 0.3) * 3; stage.motes.material.opacity = 0.4 + Math.sin(t * 0.8) * 0.12; }
    if (stage.sky) stage.sky.rotation.y += dt * 0.006;
    controls.update(dt);
    renderer.render(scene, camera);
  }
  tick();

  return { scene, camera, controls, loadWorld, focusOn, resetView, markDone, THREE };
}

/** A billboarded sprite: the subject's emoji on a soft dark chip, game-pin style. */
function makeEmojiPin(emoji) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  // soft round chip behind the emoji so it pops on any backdrop
  const grad = g.createRadialGradient(64, 64, 18, 64, 64, 60);
  grad.addColorStop(0, 'rgba(8,12,34,.78)');
  grad.addColorStop(0.75, 'rgba(8,12,34,.55)');
  grad.addColorStop(1, 'rgba(8,12,34,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  g.font = '72px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(emoji, 64, 70);
  const tex = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  return sprite;
}

function boundingRadius(mesh) {
  if (mesh.geometry) {
    if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
    if (mesh.geometry.boundingSphere) return mesh.geometry.boundingSphere.radius * Math.max(...mesh.scale.toArray());
  }
  return 3;
}

function disposeGroup(group) {
  group.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
    }
  });
}
