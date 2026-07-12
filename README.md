# 🧭 ExploraQuest — Discover Every World

A 3D play-and-learn discovery game for curious kids (ages 7–11). Explore a
world's 3D scene, tap a glowing subject, read fun facts, complete a quiz
mission, earn ⭐ stars, XP and 🏅 badges, rank up, and become a **Master
Explorer**. Built as a proper modular codebase (Vite + vanilla JS + Three.js)
so new worlds are data + one build function — not edits to a giant file.

ExploraQuest is the evolution of the original single-file **CosmosQuest**
prototype (preserved at [`cosmosquest-prototype.html`](./cosmosquest-prototype.html));
the solar system is now simply **World 1**.

## Worlds — all 20 complete 🎉
The Hub groups worlds into categories; new worlds slot in automatically by
declaring a `category`.

| World | Subjects | Visual language | Unlock | Category |
|------|--------|--------|--------|--------|
| 🪐 Universe | 13 (Sun, 8 planets, 4 deep-space) | Orbiting solar system | Free | Science & Space |
| 🌿 Nature | 9 ecosystems | Floating biome islands | 12 ⭐ | Nature & Life |
| 🦁 Animal Kingdom | 10 animals | Low-poly animals with idle animation | 24 ⭐ | Nature & Life |
| 🐬 Ocean Life | 8 sea creatures | Underwater scene: bubbles, caustics, sandy floor | 40 ⭐ | Nature & Life |
| 🫀 Human Body | 8 organs | Organs inside a rotatable body silhouette | 60 ⭐ | People & Places |
| 🦖 Dinosaurs | 8 (7 dinos + asteroid) | Prehistoric terrain with a smoking volcano | 84 ⭐ | Nature & Life |
| 🐝 Bugs & Insects | 8 mini-beasts | Bug-sized garden: giant grass, dew, leaf canopy | 112 ⭐ | Nature & Life |
| 🌱 Plants & Botany | 8 plants | Sprouts that grow to full form when tapped | 144 ⭐ | Nature & Life |
| 🌾 Farm to Table | 8 food subjects | Sunny farmland diorama (barn, sun, fences) | 180 ⭐ | Nature & Life |
| 🧊 Polar World | 8 frozen wonders | Tundra under a colour-shifting aurora | 220 ⭐ | Nature & Life |
| ⛈️ Weather & Sky | 8 (Water Cycle boss) | Sky diorama: rain/snow particles, lightning, tornado | 264 ⭐ | Earth & Sky |
| 🌍 World Cultures | 8 culture themes | Turning globe with symbolic culture objects | 312 ⭐ | People & Places |
| 🏺 Ancient Civilizations | 8 landmarks | Monuments placed at their real lat/long on a globe | 364 ⭐ | People & Places |
| 🌋 Natural Disasters | 8 events | Procedural event scenes; reassuring tone + safety tips | 420 ⭐ | Earth & Sky |
| 🚀 Space Explorers | 8 (ISS, rover…) | Orbit scene with procedural space tech | 480 ⭐ | Science & Space |
| 🧠 Mind & Senses | 8 (perception) | Friendly symbols for memory, dreams, emotions… | 544 ⭐ | People & Places |
| ⚡ Physics & Forces | 8 forces | Physics sandbox — each force demos on tap | 612 ⭐ | Science & Space |
| 🧪 Chemistry & Matter | 8 (matter/atoms) | Lab bench; particles morph solid→liquid→gas | 684 ⭐ | Science & Space |
| 💻 Digital World | 8 (code/AI/data) | Cyan blueprint-wireframe aesthetic | 760 ⭐ | Ideas & Machines |
| ⚙️ Machines & Inventions | 8 inventions | Amber workshop; parts assemble on tap | 840 ⭐ | Ideas & Machines |

**Totals:** 20 worlds · 168 subjects · 5 hub categories.

One shared player profile (XP, stars, rank, badges, streak, titles) carries
across every world; each world also tracks its own completion. Every subject
has 4 stats, 4 facts, a WOW fact, a story-mission briefing, a base quiz
(mixing multiple-choice, true/false and picture questions) and — for every
world except the preserved Universe — a harder two-step `quizHard` set that
scales in as the world is explored.

## A complete app
- **Installable PWA** — web-app manifest + procedural SVG icon; "Add to Home
  Screen" gives a standalone full-screen app, and a service worker caches the
  shell and assets so the game **really works offline** after the first visit.
- **App-shell navigation** — a bottom tab bar (Worlds / Journey / Badges /
  Grown-ups) on every non-3D screen, hidden during play.
- **Hardware back button** — browser/phone back peels the top-most layer
  (quiz → briefing → panel → world → hub) like a native app and stays
  trapped in-app at the hub. Every overlay also has its own ✕.
- **Fully responsive** — portrait & landscape phones, tablets and desktop;
  overlay cards never overflow short screens.
- **For Grown-ups panel** — progress stats, sound switch, safety promises
  (no ads, no purchases, local-only data) and a two-tap-guarded reset.
- **My Journey** — overall % explored, rank progress, stat tiles, a next-goal
  banner, 16 collectable achievements and a 20-world progress map.

## Game feel (juice & sound)
- **Emoji map pins** — every subject floats its emoji above its 3D mesh, so no
  two tap targets look alike; pins bob gently and are extra tap area.
- **Per-world ambient weather** — snow over Polar, leaves through Nature,
  embers above Dinosaurs, bubbles in Ocean, code-rain in Digital and more,
  plus soft depth fog, a tap shock-ring and an idle cinematic camera drift.
- **Game-style UI** — chunky 3D press-down buttons, shine sweeps, XP shimmer,
  a 2-column level-select hub on phones, screen transitions, achievement
  banners and a full-screen Level-Up moment.
- **Procedural soundtrack** — generative background music and all SFX (taps,
  correct/wrong, star, badge, rank-up, unlock, celebration) are synthesised live
  with the Web Audio API. Zero downloaded audio; each world has its own musical
  mood. A 🔊/🔇 button in the HUD mutes and remembers the choice.
- **Reacting mascot** — a buddy in the quiz cheers correct answers and winces on
  misses; a **combo counter** rewards streaks ("🔥 3 in a row!").
- **Confetti, score pops, screen flash, shake and haptics** on correct answers,
  rewards, badges, unlocks and world completions.
- **Atmosphere on every world** — a per-world gradient sky, drifting glow motes
  and a coloured rim light give all 20 worlds depth and their own look.

## Game features
- **World Hub** — the home shelf of worlds, each with icon, colour theme, live
  progress and lock/unlock state.
- **Mission briefings** — a playful one-line objective before each quiz.
- **Question variety** — multiple-choice, true/false, and copyright-safe
  "which one is it?" picture questions (procedural SVG shapes).
- **Difficulty scaling** — later missions in a world ask harder, two-step
  questions as the kid progresses.
- **Badges & My Collection** — perfect a mission to collect its badge; browse
  all badges earned vs. available across every world.
- **Daily Challenge** — a glowing card on the hub: one random subject from your
  unlocked worlds each day, for bonus stars.
- **Streak counter** — consecutive days with a completed mission, shown quietly
  in the HUD (resets to 1 after a missed day).
- **World-complete celebration** — a Three.js confetti burst plus a cosmetic
  master **title** (e.g. "Ocean Master 🌊") shown next to your rank, unlocked
  when every subject in a world is passed.

## Project structure
```
src/
  main.js            App orchestrator (screen flow, mission loop)
  style.css          All styling
  engine/            World-agnostic Three.js (reused by every world)
    scene.js         Renderer, camera, lights, starfield
    controls.js      Mobile orbit/pinch controls + camera focus
    raycast.js       Tap-to-select
    index.js         Engine: swaps worlds in/out, animation loop
  game/              World-agnostic game rules
    state.js         Save/load (localStorage + in-memory fallback), schema
    ranks.js         Shared ranks
    profile.js       XP/stars/badges/streak/daily/unlock logic
    quiz.js          Question normalizing + difficulty selection
  ui/                Screens & overlays (start, hub, HUD, panel, quiz,
                     reward, collection, celebration)
  worlds/            One module per world = data + 3D build()
    helpers.js       Shared markers / layout
    anim.js          Idle-animation helper (breathing, flap, sway…)
    universe.js nature.js animals.js ocean.js human-body.js dinosaurs.js
    index.js         World registry
```

### Adding / editing a world
Each `src/worlds/<world>.js` exports the same shape:
```js
export default {
  key, name, icon, blurb, unlockCost, theme, masterTitle,
  subjects: { subjectKey: { name, type, emoji, badge, mission,
    stats, facts, fun, quiz, quizHard, mesh } },
  build({ THREE, isDone }) { return { group, clickables, update, home }; },
};
```
All facts, stats and quiz questions are plain text/data — no coding needed to
tweak content. Add the module to `src/worlds/index.js` to slot it into the hub.

## Run it
```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the build
```

## Deploy
`npm run build` outputs a static `dist/` folder. Import the repo in Vercel
(Framework preset: **Vite**) or drop `dist/` on any static host.

## Constraints kept
No paid assets or sounds — everything is emoji, CSS gradients and procedurally
generated Three.js geometry. No real images of real people/characters.
Mobile-first with touch drag/pinch and a responsive HUD. Copy stays short,
upbeat and one-idea-per-card for a curious 7–11 year old.
