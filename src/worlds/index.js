import universe from './universe.js';
import nature from './nature.js';

/**
 * The world registry, in hub display order. Universe and Nature are complete
 * and playable; the remaining four are placeholders shown as "coming soon"
 * cards in the hub until their content modules land (Phase 2). Placeholders
 * carry no subjects so they contribute nothing to badges/daily/progress.
 */
function placeholder(key, name, icon, blurb, unlockCost, theme) {
  return { key, name, icon, blurb, unlockCost, theme, comingSoon: true, subjects: {}, build: null };
}

export const WORLDS = [
  universe,
  nature,
  placeholder('animals', 'Animal Kingdom', '🦁', 'Lions, whales, eagles & the champions of the animal world.', 24,
    { primary: 0xF2A93B, secondary: 0xE0552B, bg: 0x1a1207 }),
  placeholder('ocean', 'Ocean Life', '🐬', 'Dive with sharks, turtles, jellyfish & the deep-sea deep.', 40,
    { primary: 0x2FB6D6, secondary: 0x2560C0, bg: 0x061523 }),
  placeholder('humanbody', 'Human Body', '🫀', 'Heart, brain, lungs & the amazing machine that is you.', 60,
    { primary: 0xFF6B81, secondary: 0xB26CFF, bg: 0x1a0a12 }),
  placeholder('dinosaurs', 'Dinosaurs', '🦖', 'T-Rex, Triceratops & the giants of the ancient world.', 84,
    { primary: 0x8BBE3D, secondary: 0x9A6A2F, bg: 0x14170a }),
];

export const WORLD_MAP = Object.fromEntries(WORLDS.map((w) => [w.key, w]));
