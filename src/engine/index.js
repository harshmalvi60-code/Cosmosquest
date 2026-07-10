import * as THREE from 'three';
import { createStage } from './scene.js';
import { createControls } from './controls.js';
import { createPicker } from './raycast.js';

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

  let current = null;      // { group, clickables, update }
  let clickables = [];

  createPicker(renderer.domElement, camera, () => clickables, (key, mesh) => {
    // Flag the picked subject so worlds can react (e.g. Plants grows on tap).
    clickables.forEach((c) => { c.userData.selected = c.userData.key === key; });
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

    // Per-world background + lighting tint.
    const theme = world.theme || {};
    scene.background = new THREE.Color(theme.bg ?? 0x070B1F);
    if (theme.light != null) stage.keyLight.color.set(theme.light);
    if (theme.ambient != null) stage.ambient.color.set(theme.ambient);

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
    controls.update(dt);
    renderer.render(scene, camera);
  }
  tick();

  return { scene, camera, controls, loadWorld, focusOn, resetView, markDone, THREE };
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
      mats.forEach((m) => m.dispose());
    }
  });
}
