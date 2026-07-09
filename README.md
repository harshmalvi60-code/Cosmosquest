# 🧭 ExploraQuest — Discover Every World

A 3D play-and-learn discovery game for curious kids (ages 7–11). Explore a
world's 3D scene, tap a glowing subject, read fun facts, complete a quiz
mission, earn ⭐ stars, XP and 🏅 badges, rank up, and become a **Master
Explorer**. Built as a proper modular codebase (Vite + vanilla JS + Three.js)
so new worlds are data + one build function — not edits to a giant file.

ExploraQuest is the evolution of the original single-file **CosmosQuest**
prototype (preserved at [`cosmosquest-prototype.html`](./cosmosquest-prototype.html));
the solar system is now simply **World 1**.

## Worlds
| World | Status | Unlock |
|------|--------|--------|
| 🪐 Universe | ✅ Complete (Sun, 8 planets, 4 deep-space objects) | Free |
| 🌿 Nature | ✅ Complete (9 ecosystems) | 12 ⭐ |
| 🦁 Animal Kingdom | 🔨 Coming soon | 24 ⭐ |
| 🐬 Ocean Life | 🔨 Coming soon | 40 ⭐ |
| 🫀 Human Body | 🔨 Coming soon | 60 ⭐ |
| 🦖 Dinosaurs | 🔨 Coming soon | 84 ⭐ |

One shared player profile (XP, stars, rank, badges, streak) carries across
every world; each world also tracks its own completion (e.g. "6/9 Nature").

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
- **Daily Challenge** — one bonus-star mission per day to bring kids back.
- **Streak counter** — consecutive days played, shown in the HUD.
- **World-complete celebration** — a Three.js confetti burst + master title
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
    universe.js      World 1
    nature.js        World 2
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
