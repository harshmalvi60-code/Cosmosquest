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
import weather from './weather.js';
import cultures from './cultures.js';
import ancient from './ancient.js';
import disasters from './disasters.js';
import spaceexplorers from './space-explorers.js';
import mind from './mind.js';
import physics from './physics.js';
import chemistry from './chemistry.js';
import digital from './digital.js';
import machines from './machines.js';

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
  // Batch 2 — Earth & Sky + People & Places expansion
  weather,
  cultures,
  ancient,
  disasters,
  // Batch 3 — Science & Space + Mind expansion
  spaceexplorers,
  mind,
  physics,
  // Batch 4 — Science + Ideas & Machines (completes all 20 worlds)
  chemistry,
  digital,
  machines,
];

export const WORLD_MAP = Object.fromEntries(WORLDS.map((w) => [w.key, w]));
