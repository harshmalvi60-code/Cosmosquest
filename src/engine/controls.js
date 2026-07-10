import * as THREE from 'three';

/**
 * Hand-rolled orbit controls — mobile-first: one-finger drag to orbit,
 * two-finger pinch to zoom, wheel to zoom on desktop. Kept dependency-free
 * so it stays tiny and predictable on mid-range phones. Also drives a gentle
 * auto-spin until the player first interacts, and animated camera focus.
 */
export function createControls(domEl, camera) {
  const ctrl = {
    theta: 0.55, phi: 1.12, radius: 118,
    target: new THREE.Vector3(),
    minR: 26, maxR: 260, drag: false, px: 0, py: 0, pinch: 0, autoSpin: true,
    focus: null,
  };

  function apply() {
    ctrl.phi = Math.max(0.25, Math.min(1.45, ctrl.phi));
    ctrl.radius = Math.max(ctrl.minR, Math.min(ctrl.maxR, ctrl.radius));
    camera.position.set(
      ctrl.target.x + ctrl.radius * Math.sin(ctrl.phi) * Math.sin(ctrl.theta),
      ctrl.target.y + ctrl.radius * Math.cos(ctrl.phi),
      ctrl.target.z + ctrl.radius * Math.sin(ctrl.phi) * Math.cos(ctrl.theta),
    );
    camera.lookAt(ctrl.target);
  }

  domEl.addEventListener('pointerdown', (e) => {
    ctrl.drag = true; ctrl.autoSpin = false; ctrl.px = e.clientX; ctrl.py = e.clientY;
  });
  window.addEventListener('pointerup', () => { ctrl.drag = false; });
  window.addEventListener('pointermove', (e) => {
    if (!ctrl.drag) return;
    ctrl.theta -= (e.clientX - ctrl.px) * 0.005;
    ctrl.phi -= (e.clientY - ctrl.py) * 0.004;
    ctrl.px = e.clientX; ctrl.py = e.clientY;
  });
  domEl.addEventListener('wheel', (e) => {
    e.preventDefault(); ctrl.autoSpin = false;
    ctrl.radius *= e.deltaY > 0 ? 1.08 : 0.92;
  }, { passive: false });
  domEl.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      ctrl.pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  }, { passive: true });
  domEl.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      ctrl.radius *= ctrl.pinch / d; ctrl.pinch = d; ctrl.drag = false;
    }
  }, { passive: true });

  /** Smoothly glide the camera pivot + zoom to a new target. */
  ctrl.focusTo = (target, radius) => {
    ctrl.focus = { t0: ctrl.target.clone(), t1: target.clone(), r0: ctrl.radius, r1: radius, p: 0 };
  };

  /** Advance per-frame animation (auto-spin + idle drift + focus lerp). */
  let idleT = 0;
  ctrl.update = (dt) => {
    if (ctrl.autoSpin) {
      // Cinematic idle: slow spin plus a gentle bob and zoom "breath" so the
      // scene feels alive before the first touch. The deltas are derivatives
      // of bounded sine waves, so the drift never wanders off.
      idleT += dt;
      ctrl.theta += dt * 0.05;
      ctrl.phi += Math.cos(idleT * 0.45) * 0.016 * dt;
      ctrl.radius += Math.cos(idleT * 0.3) * 0.9 * dt;
    }
    if (ctrl.focus) {
      ctrl.focus.p = Math.min(1, ctrl.focus.p + dt * 2.2);
      const e = 1 - Math.pow(1 - ctrl.focus.p, 3);
      ctrl.target.lerpVectors(ctrl.focus.t0, ctrl.focus.t1, e);
      ctrl.radius = ctrl.focus.r0 + (ctrl.focus.r1 - ctrl.focus.r0) * e;
      if (ctrl.focus.p >= 1) ctrl.focus = null;
    }
    apply();
  };

  ctrl.apply = apply;
  return ctrl;
}
