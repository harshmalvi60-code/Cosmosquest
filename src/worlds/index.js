import universe from './universe.js';
import nature from './nature.js';
import animals from './animals.js';
import ocean from './ocean.js';
import humanbody from './human-body.js';
import dinosaurs from './dinosaurs.js';

/**
 * The world registry, in hub display order. All six worlds are complete and
 * playable; unlock costs form the star-progression ladder across the game.
 */
export const WORLDS = [
  universe,
  nature,
  animals,
  ocean,
  humanbody,
  dinosaurs,
];

export const WORLD_MAP = Object.fromEntries(WORLDS.map((w) => [w.key, w]));
