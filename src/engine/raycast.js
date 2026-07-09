import * as THREE from 'three';

/**
 * Tap-to-select for the current world. A "tap" must be quick and still
 * (so it doesn't fire while the player is dragging to orbit). Walks up the
 * hit object's parents to find the one carrying a subject `key`, then calls
 * onPick(key, rootMesh).
 */
export function createPicker(domEl, camera, getClickables, onPick) {
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let downAt = 0, downX = 0, downY = 0;

  domEl.addEventListener('pointerdown', (e) => {
    downAt = Date.now(); downX = e.clientX; downY = e.clientY;
  });
  domEl.addEventListener('pointerup', (e) => {
    if (Date.now() - downAt > 320) return;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 10) return;

    ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(ptr, camera);

    const pool = getClickables().filter((m) => {
      let p = m;
      while (p.parent) { if (!p.visible) return false; p = p.parent; }
      return m.visible;
    });
    const hits = ray.intersectObjects(pool, true);
    if (!hits.length) return;
    let obj = hits[0].object;
    while (obj && !obj.userData.key) obj = obj.parent;
    if (obj) onPick(obj.userData.key, obj);
  });
}
