/**
 * Shared 3D building blocks for worlds. Every world reuses these so subjects
 * look and behave consistently: a pulsing glow-ring marker (gold = to do,
 * green = done), camera-facing billboarding, and simple layout maths.
 */

/** Attach a billboarded glow ring that signals "tap me" / "done". */
export function attachMarker(THREE, mesh, done, radius) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.35, 1.55, 40),
    new THREE.MeshBasicMaterial({ color: done ? 0x5BF0A5 : 0xFFC93C, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
  );
  ring.scale.setScalar(radius);
  mesh.add(ring);
  mesh.userData.marker = ring;
  mesh.userData.markerRadius = radius;
  return ring;
}

/** Billboard + gently pulse every subject marker. Call from world.update. */
export function updateMarkers(clickables, camera, t) {
  clickables.forEach((m) => {
    const ring = m.userData.marker;
    if (!ring) return;
    ring.lookAt(camera.position);
    const pulse = 1 + Math.sin(t * 3 + (m.userData.phase || 0)) * 0.06;
    ring.scale.setScalar((m.userData.markerRadius || 3) * pulse);
  });
}

/** A faint orbit ring on the ground plane (used by the solar system). */
export function orbitLine(THREE, dist, color = 0x4DE3FF, opacity = 0.14) {
  const pts = [];
  for (let i = 0; i <= 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * dist, 0, Math.sin(a) * dist));
  }
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

/** Evenly place N subjects around a circle (default layout for non-orbit worlds). */
export function ringPosition(index, count, radius, yJitter = 0) {
  const a = (index / count) * Math.PI * 2;
  return {
    x: Math.cos(a) * radius,
    y: (Math.sin(index * 2.3) * yJitter),
    z: Math.sin(a) * radius,
    angle: a,
  };
}
