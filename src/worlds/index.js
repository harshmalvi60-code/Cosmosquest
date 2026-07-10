import universe from './universe.js';
import nature from './nature.js';
import animals from './animals.js';
import ocean from './ocean.js';
import humanbody from './human-body.js';
import dinosaurs from './dinosaurs.js';
import bugs from './bugs.js';
import plants from './plants.js';
import farm from './farm.js';
import polar from './polar.js';

/**
 * The world registry, in hub display order. Worlds self-declare their category
 * (used to group them in the hub) and unlockCost (the star-progression ladder).
 * Badges, streak and the daily challenge iterate this list, so every new world
 * is automatically included with no extra wiring.
 */
export const WORLDS = [
  universe,
  nature,
  animals,
  ocean,
  humanbody,
  dinosaurs,
  // Batch 1 — Nature & Life expansion
  bugs,
  plants,
  farm,
  polar,
];

export const WORLD_MAP = Object.fromEntries(WORLDS.map((w) => [w.key, w]));
