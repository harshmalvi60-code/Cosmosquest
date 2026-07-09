/**
 * Tiny idle-animation helper so procedural creatures read as *alive* without a
 * skeleton or assets. Tag a mesh with an idle motion, collect the tagged parts
 * of a creature once, then drive them each frame.
 *
 *   idle(wing, 'flap', 0.5, 8, 'z')   // rotate ±0.5rad on z at speed 8
 *   idle(body, 'breathe', 0.05, 2)    // scale pulse ±5%
 *   const parts = collectIdle(group)
 *   ...in update: runIdle(parts, t)
 */
export function idle(mesh, type, amp, speed, axis = 'z') {
  mesh.userData.idle = {
    type, amp, speed, axis,
    phase: Math.random() * Math.PI * 2,
    base: mesh.rotation[axis] || 0,
    baseScale: mesh.scale.x || 1,
    baseY: mesh.position.y || 0,
  };
  return mesh;
}

export function collectIdle(group) {
  const list = [];
  group.traverse((o) => { if (o.userData && o.userData.idle) list.push(o); });
  return list;
}

export function runIdle(list, t) {
  for (const o of list) {
    const s = o.userData.idle;
    const w = Math.sin(t * s.speed + s.phase);
    if (s.type === 'breathe') o.scale.setScalar(s.baseScale * (1 + w * s.amp));
    else if (s.type === 'bobY') o.position.y = s.baseY + w * s.amp;
    else o.rotation[s.axis] = s.base + w * s.amp; // flap / sway / wiggle
  }
}
