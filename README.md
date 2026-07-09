# 🚀 CosmosQuest — Play the Universe

A 3D play-and-learn universe explorer for kids (ages 6–12). The solar system is the game board: fly through real 3D space, tap planets, complete quiz missions, earn ⭐ stars and XP, rank up, and unlock the Deep Space zone.

## What's inside
- **13 explorable worlds** — Sun + 8 planets (with Earth's Moon, Saturn's rings) + 4 Deep Space mysteries (Black Hole with spinning accretion disk, spiral Milky Way, glowing Nebula, Comet with tail)
- **39 quiz questions** across 13 missions, all written kid-friendly
- **Play & Earn system** — 3 ⭐ per perfect mission, XP with a perfect-score bonus, 4 ranks: Space Cadet → Star Explorer → Galaxy Ranger → Cosmic Legend
- **Deep Space unlock** at 15 ⭐ (5 perfect missions)
- **Progress auto-saves** in the browser (localStorage, with a safe in-memory fallback)
- Full touch support: drag to orbit, pinch to zoom, tap to select. Works on phones.

## Tech
Single `index.html`. Zero build step. Three.js r128 via CDN. No backend, no API keys, no costs.

## Deploy (2 minutes)
1. Push this folder to a GitHub repo
2. Import the repo in Vercel → Framework preset: **Other** → Deploy
That's it — it's a static file.

## Easy tweaks (no coding needed)
Open `index.html` and search for:
- `WORLDS` / `DEEP` — all facts, stats, and quiz questions live here as plain text
- `DEEP_UNLOCK_STARS` — change how many stars unlock Deep Space
- `RANKS` — rename ranks or change XP thresholds
